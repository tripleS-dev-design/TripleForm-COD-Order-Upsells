import { json } from '@remix-run/node';
import { authenticate } from '../shopify.server';
import prisma from '../db.server';

export async function loader({ request }) {
  try {
    // 1. TOUJOURS essayer l'authentification Shopify d'abord
    const { session } = await authenticate.admin(request);
    const shopDomain = session.shop;
    
    if (!shopDomain) {
      return json({
        ok: false,
        error: 'Shop domain required',
        connected: false,
        config: null
      }, { status: 400 });
    }

    // 2. Vérifier Prisma
    if (!prisma || !prisma.whatsAppConfig) {
      console.error(`[ERROR] Prisma not available for ${shopDomain}`);
      return json({
        ok: true,
        connected: false,
        config: null,
        error: 'Database unavailable',
        shop: shopDomain
      });
    }

    // 3. Récupérer la config WhatsApp
    const config = await prisma.whatsAppConfig.findUnique({
      where: { shopDomain }
    });

    // 4. Récupérer le statut de connexion WhatsApp
    const whatsappStatus = await prisma.whatsappStatus.findUnique({
      where: { shopDomain }
    });

    // 5. Déterminer si WhatsApp est connecté
    const isConnected = !!(
      whatsappStatus && 
      whatsappStatus.status === 'connected' && 
      whatsappStatus.phoneNumber
    );

    // 6. Retourner la réponse structurée
    return json({
      ok: true,
      connected: isConnected,
      phoneNumber: whatsappStatus?.phoneNumber || config?.phoneNumber || '',
      qrCode: whatsappStatus?.qrCode || '',
      lastConnected: whatsappStatus?.connectedAt || null,
      messagesSent: 0,
      config: config || null,
      whatsappStatus: whatsappStatus || null,
      shop: shopDomain
    });

  } catch (error) {
    console.error(`[WhatsApp Status API ERROR]`, error);
    
    // EN PRODUCTION: Ne pas exposer d'infos sensibles
    return json({
      ok: false,
      connected: false,
      error: 'Unable to load WhatsApp status',
      config: null,
      shop: null
    }, { status: 500 });
  }
}