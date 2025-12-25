import { json } from '@remix-run/node';
import { authenticate } from '../shopify.server';
import prisma from '../db.server'; 

export async function loader({ request }) {
  let session;
  try {
    // 1. Authentification
    const auth = await authenticate.admin(request);
    session = auth.session;
    if (!session?.shop) {
      return json({ 
        ok: false, 
        error: "Authentication failed or shop not found" 
      }, { status: 401 });
    }

    // 2. Vérification de Prisma (DEBUG)
    if (!prisma || !prisma.whatsAppConfig) {
      throw new Error("Prisma client or model is not properly initialized.");
    }

    const shopDomain = session.shop;

    // 3. Requête à la base
    const config = await prisma.whatsAppConfig.findUnique({
      where: { shopDomain }
    });

    return json({
      ok: true,
      status: config ? 'loaded' : 'no_config',
      shop: shopDomain,
      config // Retourne null si pas de config
    });

  } catch (error) {
    console.error('[WhatsApp Status API Error] Details:', error.message, error.stack);
    // Ne faites pas référence à 'session' ici si elle pourrait être undefined
    return json({
      ok: false,
      status: 'error',
      error: 'Internal server error while loading configuration',
      shop: session?.shop || 'unknown'
    }, { status: 500 });
  }
}