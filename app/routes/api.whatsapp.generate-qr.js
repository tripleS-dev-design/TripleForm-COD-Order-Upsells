import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import QRCode from "qrcode"; // <-- IMPORTANT: utiliser QRCode au lieu de create
import whatsappWeb from "whatsapp-web.js";

const { Client, LocalAuth } = whatsappWeb;

const whatsappClients = global.whatsappClients || new Map();
global.whatsappClients = whatsappClients;

export async function action({ request }) {
  let client = null;
  
  try {
    const { session } = await authenticate.public(request);
    const shopDomain = session.shop;

    // Vérifier si déjà connecté
    const existing = await prisma.whatsappStatus.findUnique({
      where: { shopDomain },
    });

    if (existing?.status === "connected") {
      return json(
        { ok: false, error: "WhatsApp déjà connecté" },
        { status: 400 }
      );
    }

    // Configuration optimisée
    client = new Client({
      authStrategy: new LocalAuth({
        clientId: `whatsapp_${shopDomain.replace(".myshopify.com", "")}`,
        dataPath: `/tmp/whatsapp-sessions/${shopDomain}`,
      }),
      puppeteer: {
        headless: true,
        executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--single-process',
          '--disable-gpu',
        ]
      },
      qrTimeout: 30000,
    });

    // Promesse pour attendre le QR
    let qrCodeDataURL = null;
    const qrPromise = new Promise((resolve, reject) => {
      client.on("qr", async (qr) => {
        try {
          console.log(`[WhatsApp] QR reçu pour ${shopDomain}`);
          
          // ✅ CORRECTION CRITIQUE ICI :
          // Le paramètre "qr" est un STRING, pas un objet complexe
          // WhatsApp Web.js retourne directement la string QR
          const qrString = qr; // C'est déjà une string !
          
          console.log(`QR string longueur: ${qrString.length}`);
          console.log(`QR début: ${qrString.substring(0, 50)}...`);
          
          // ✅ Générer le QR code image
          // Utiliser QRCode.toDataURL() au lieu de create()
          qrCodeDataURL = await QRCode.toDataURL(qrString, {
            width: 300,
            margin: 1,
            errorCorrectionLevel: 'M'
          });
          
          console.log(`QR Data URL généré (${qrCodeDataURL.length} chars)`);
          console.log(`Début Data URL: ${qrCodeDataURL.substring(0, 50)}...`);
          
          // ✅ Sauvegarder en base - C'EST BIEN UNE STRING !
          await prisma.whatsappStatus.upsert({
            where: { shopDomain },
            update: { 
              qrCode: qrCodeDataURL,
              status: "waiting_qr", 
              updatedAt: new Date() 
            },
            create: { 
              shopDomain, 
              qrCode: qrCodeDataURL,
              status: "waiting_qr" 
            },
          });
          
          whatsappClients.set(shopDomain, client);
          resolve(qrCodeDataURL);
        } catch (err) {
          console.error("QR generation error:", err);
          reject(err);
        }
      });
    });

    // Événement ready
    client.on("ready", async () => {
      console.log(`[WhatsApp] Client prêt pour ${shopDomain}`);
      const phoneNumber = client.info?.wid?.user || null;

      await prisma.whatsappStatus.update({
        where: { shopDomain },
        data: { 
          phoneNumber, 
          connectedAt: new Date(), 
          status: "connected", 
          qrCode: null 
        },
      });
    });

    // Gestion des erreurs
    client.on("auth_failure", async (error) => {
      console.error(`[WhatsApp] Auth failure:`, error);
      await prisma.whatsappStatus.update({
        where: { shopDomain },
        data: { 
          status: "auth_failure", 
          lastError: error.message, 
          qrCode: null 
        },
      });
    });

    // Démarrer
    console.log(`[WhatsApp] Initialisation pour ${shopDomain}`);
    await client.initialize();
    
    // Attendre le QR (max 30s)
    qrCodeDataURL = await Promise.race([
      qrPromise,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Timeout génération QR")), 30000)
      )
    ]);

    if (!qrCodeDataURL) {
      throw new Error("QR non généré");
    }

    return json({ 
      ok: true, 
      status: "waiting_qr", 
      qrCode: qrCodeDataURL 
    });

  } catch (error) {
    console.error("[WhatsApp Generate QR] Error:", error);
    
    // Nettoyer
    if (client) {
      try {
        await client.destroy();
      } catch (e) {
        console.error("Erreur nettoyage client:", e);
      }
    }
    
    return json({ 
      ok: false, 
      error: error.message 
    }, { status: 500 });
  }
}