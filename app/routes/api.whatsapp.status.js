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

    // 2. Vérification - AVEC LE BON NOM : whatsappConfig (w minuscule, a minuscule)
    console.log('[DEBUG] Checking Prisma model...');
    console.log('[DEBUG] prisma.whatsappConfig exists?', !!prisma.whatsappConfig);
    console.log('[DEBUG] prisma.whatsAppConfig exists?', !!prisma.whatsAppConfig);
    console.log('[DEBUG] All models:', Object.keys(prisma).filter(k => !k.startsWith('$')));
    
    if (!prisma || !prisma.whatsappConfig) {
      console.error('[ERROR] whatsappConfig model not found!');
      throw new Error("Prisma client or model is not properly initialized.");
    }

    const shopDomain = session.shop;

    // 3. Requête à la base - AVEC LE BON NOM
    console.log('[DEBUG] Querying for shop:', shopDomain);
    const config = await prisma.whatsappConfig.findUnique({
      where: { shopDomain }
    });

    console.log('[DEBUG] Config found:', !!config);
    if (config) {
      console.log('[SUCCESS] Config loaded:', {
        phone: config.phoneNumber,
        business: config.businessName,
        useToken: config.useToken
      });
    }

    // 4. Retournez la réponse
    return json({
      ok: true,
      status: config ? 'loaded' : 'no_config',
      shop: shopDomain,
      config: config || null
    });

  } catch (error) {
    console.error('[WhatsApp Status API Error - FINAL]', {
      message: error.message,
      stack: error.stack,
      shop: session?.shop || 'unknown',
      prismaKeys: Object.keys(prisma || {}).filter(k => !k.startsWith('$'))
    });
    
    return json({
      ok: false,
      status: 'error',
      error: 'Internal server error while loading configuration',
      shop: session?.shop || 'unknown',
      config: null
    }, { status: 500 });
  }
}