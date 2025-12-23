// app/routes/api.whatsapp-send-order-message.js (ADAPTÉ)
import { json } from '@remix-run/node';
import { authenticate } from '../shopify.server';
import whatsappAPI from '../lib/whatsapp-business-api';
import prisma from '../db.server';

export async function action({ request }) {
  try {
    const { session } = await authenticate.admin(request);
    const shopDomain = session.shop;
    
    const { order, customer } = await request.json();
    
    if (!order || !customer) {
      return json({ ok: false, error: 'Order and customer data required' }, { status: 400 });
    }

    // Récupérer la configuration
    const config = await prisma.whatsappConfig.findUnique({
      where: { shopDomain }
    });

    if (!config?.enabled) {
      return json({ ok: false, error: 'WhatsApp notifications disabled' }, { status: 400 });
    }

    const phoneNumber = customer.phone?.replace(/\D/g, '');
    if (!phoneNumber) {
      return json({ ok: false, error: 'Customer phone number required' }, { status: 400 });
    }

    // Créer le message personnalisé
    const message = config.messageTemplate
      .replace(/{orderId}/g, order.orderNumber || order.id)
      .replace(/{customerName}/g, customer.firstName || '')
      .replace(/{total}/g, order.totalPrice)
      .replace(/{items}/g, order.lineItems?.length || 0);

    const result = await whatsappAPI.sendText(phoneNumber, message);

    if (result.success) {
      // Sauvegarder dans la base et mettre à jour les stats
      await Promise.all([
        prisma.whatsappMessage.create({
          data: {
            shopDomain,
            orderId: order.id,
            customerPhone: phoneNumber,
            message,
            type: 'order_confirmation',
            status: 'sent',
            messageId: result.messageId,
            sentAt: new Date()
          }
        }),
        prisma.whatsappStats.upsert({
          where: { shopDomain },
          update: {
            ordersNotified: { increment: 1 },
            totalMessages: { increment: 1 },
            successful: { increment: 1 },
            lastMessageAt: new Date()
          },
          create: {
            shopDomain,
            ordersNotified: 1,
            totalMessages: 1,
            successful: 1,
            lastMessageAt: new Date()
          }
        })
      ]);

      return json({ ok: true, messageId: result.messageId });
    } else {
      // Log de l'erreur
      await prisma.whatsappMessage.create({
        data: {
          shopDomain,
          orderId: order.id,
          customerPhone: phoneNumber,
          message,
          type: 'order_confirmation',
          status: 'failed',
          error: result.error.message,
          sentAt: new Date()
        }
      });

      return json({ ok: false, error: result.error }, { status: 500 });
    }
  } catch (error) {
    console.error('[WhatsApp Order Message]', error);
    return json({ ok: false, error: error.message }, { status: 500 });
  }
}