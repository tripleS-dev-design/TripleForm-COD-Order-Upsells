// app/routes/api.whatsapp-status.js
import { json } from '@remix-run/node';
import { authenticate } from '../shopify.server';
import prisma from '../db.server';

export async function loader({ request }) {
  try {
    const { session } = await authenticate.admin(request);
    const shopDomain = session.shop;

    // 1. Vérifier la config dans votre base - CORRIGEZ LE NOM DE TABLE
    const config = await prisma.whatsAppConfig.findUnique({
      where: { shopDomain }
    });

    // 2. Si pas de config, retourner null
    if (!config) {
      return json({
        ok: true,
        status: 'no_config',
        shop: shopDomain,
        config: null
      });
    }

    // 3. Retourner TOUTE la configuration
    return json({
      ok: true,
      status: 'loaded',
      shop: shopDomain,
      config: {
        // TOUS les champs dont vous avez besoin dans l'interface
        phoneNumber: config.phoneNumber,
        businessName: config.businessName,
        orderMessage: config.orderMessage,
        sendAutomatically: config.sendAutomatically,
        useToken: config.useToken,
        permanentToken: config.permanentToken,
        mode: config.mode,
        autoConnect: config.autoConnect,
        sessionTimeout: config.sessionTimeout,
        enabled: config.enabled,
        buttonText: config.buttonText,
        messageTemplate: config.messageTemplate,
        sendDelay: config.sendDelay,
        buttonPosition: config.buttonPosition,
        buttonStyle: config.buttonStyle,
        recoveryEnabled: config.recoveryEnabled,
        recoveryMessage: config.recoveryMessage,
        recoveryDelay: config.recoveryDelay,
        recoveryDiscount: config.recoveryDiscount,
        recoveryCode: config.recoveryCode,
        enableAnalytics: config.enableAnalytics,
        enableReadReceipts: config.enableReadReceipts,
        enableTypingIndicator: config.enableTypingIndicator,
        maxRetries: config.maxRetries,
        retryInterval: config.retryInterval,
        businessHoursOnly: config.businessHoursOnly,
        businessHoursStart: config.businessHoursStart,
        businessHoursEnd: config.businessHoursEnd,
        enableMediaMessages: config.enableMediaMessages,
        mediaUrl: config.mediaUrl,
        enableButtons: config.enableButtons,
        button1Text: config.button1Text,
        button1Url: config.button1Url,
        button2Text: config.button2Text,
        button2Url: config.button2Url,
        // Ajoutez tous les autres champs que vous utilisez
      }
    });
    
  } catch (error) {
    console.error('[WhatsApp Status API Error]', error);
    return json({
      ok: false,
      status: 'error',
      error: error.message,
      shop: session?.shop || 'unknown'
    }, { status: 500 });
  }
}