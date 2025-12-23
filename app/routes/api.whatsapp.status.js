// app/routes/api.whatsapp-status.js (NOUVEAU)
import { json } from '@remix-run/node';
import { authenticate } from '../shopify.server';
import prisma from '../db.server';
import whatsappAPI from '../utils/whatsapp-business-api';

export async function loader({ request }) {
  try {
    const { session } = await authenticate.admin(request);
    const shopDomain = session.shop;

    // 1. Vérifier la config dans votre base
    const config = await prisma.whatsappConfig.findUnique({
      where: { shopDomain }
    });

    // 2. Tester la connexion à l'API WhatsApp
    // On peut tester en récupérant les infos du numéro
    const testResult = await whatsappAPI.client.get(`/${process.env.WHATSAPP_PHONE_NUMBER_ID}`);
    
    return json({
      ok: true,
      status: 'connected',
      shop: shopDomain,
      apiStatus: 'active',
      phoneNumberInfo: {
        displayNumber: testResult.data.display_phone_number,
        verifiedName: testResult.data.verified_name
      },
      config: config ? {
        enabled: config.enabled,
        autoConnect: config.autoConnect
      } : null
    });
    
  } catch (error) {
    console.error('[WhatsApp Status Check]', error.response?.data || error.message);
    return json({
      ok: false,
      status: 'disconnected',
      error: 'API WhatsApp non accessible'
    }, { status: 500 });
  }
}