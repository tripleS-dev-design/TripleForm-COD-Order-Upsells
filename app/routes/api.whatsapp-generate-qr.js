// ===== File: /api/whatsapp/generate-qr.js =====
import { create } from 'qrcode';
import whatsappWeb from "whatsapp-web.js";
const { Client, LocalAuth } = whatsappWeb;
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Méthode non autorisée' });
  }

  try {
    const session = await getSession(req, res);
    if (!session) {
      return res.status(401).json({ ok: false, error: "Non autorisé" });
    }

    const shopId = session.shop;

    // Vérifier si une session existe déjà
    const existingSession = await prisma.whatsappStatus.findUnique({
      where: { shopId },
    });

    if (existingSession?.sessionId && existingSession.connectedAt) {
      // Vérifier si la session est toujours valide
      const sessionAge = Date.now() - new Date(existingSession.connectedAt).getTime();
      if (sessionAge < 24 * 60 * 60 * 1000) {
        return res.status(400).json({ 
          ok: false, 
          error: "Une session WhatsApp est déjà active" 
        });
      }
    }

    // Initialiser le client WhatsApp
    const client = new Client({
      authStrategy: new LocalAuth({
        clientId: `whatsapp_${shopId.replace('.myshopify.com', '')}`
      }),
      puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      }
    });

    // Générer et stocker le QR code
    client.on('qr', async (qr) => {
      try {
        // Convertir le QR code en base64
        const qrCodeDataURL = await create(qr, {
          errorCorrectionLevel: 'H',
          type: 'png',
          margin: 1,
          width: 300,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });

        // Sauvegarder dans la base de données
        await prisma.whatsappStatus.upsert({
          where: { shopId },
          update: {
            qrCode: qrCodeDataURL,
            sessionId: client.info?.wid?._serialized || `session_${Date.now()}`,
            status: 'waiting_qr',
            updatedAt: new Date()
          },
          create: {
            shopId,
            qrCode: qrCodeDataURL,
            sessionId: client.info?.wid?._serialized || `session_${Date.now()}`,
            status: 'waiting_qr'
          }
        });

        // Stocker le client en mémoire (dans un vrai projet, utiliser Redis)
        whatsappClients.set(shopId, client);
      } catch (error) {
        console.error("Error generating QR code:", error);
      }
    });

    // Gérer la connexion réussie
    client.on('ready', async () => {
      console.log('WhatsApp client is ready!');
      
      const phoneNumber = client.info.wid.user;
      
      await prisma.whatsappStatus.update({
        where: { shopId },
        data: {
          phoneNumber,
          connectedAt: new Date(),
          status: 'connected',
          qrCode: null
        }
      });
    });

    // Gérer les erreurs
    client.on('auth_failure', async (error) => {
      console.error('WhatsApp auth failure:', error);
      await prisma.whatsappStatus.update({
        where: { shopId },
        data: {
          status: 'auth_failure',
          lastError: error.message,
          qrCode: null
        }
      });
    });

    // Initialiser le client
    await client.initialize();

    // Retourner le QR code
    const updatedStatus = await prisma.whatsappStatus.findUnique({
      where: { shopId },
    });

    if (!updatedStatus?.qrCode) {
      return res.status(500).json({ ok: false, error: "Erreur de génération du QR code" });
    }

    res.json({
      ok: true,
      qrCode: updatedStatus.qrCode,
      message: "Scannez le QR code avec WhatsApp pour vous connecter"
    });

  } catch (error) {
    console.error("WhatsApp QR generation error:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
}