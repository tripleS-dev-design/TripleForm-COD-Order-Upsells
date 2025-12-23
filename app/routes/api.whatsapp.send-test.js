// app/routes/api.whatsapp-send-test.js (ADAPTÉ)
import { json } from '@remix-run/node';
import { authenticate } from '../shopify.server';
import whatsappAPI from '../utils/whatsapp.business.api.js';
import prisma from '../db.server';

export async function action({ request }) {
  try {
    const { session } = await authenticate.admin(request);
    const shopDomain = session.shop;
    
    const formData = await request.formData();
    const phoneNumber = formData.get('phone');
    const message = formData.get('message') || 'Test message from Shopify app';

    if (!phoneNumber) {
      return json({ ok: false, error: 'Phone number required' }, { status: 400 });
    }

    // Envoyer via la nouvelle API
    const result = await whatsappAPI.sendText(phoneNumber, message);

    if (result.success) {
      // Log dans votre base
      await prisma.whatsappMessage.create({
        data: {
          shopDomain,
          customerPhone: phoneNumber.replace(/\D/g, ''),
          message,
          type: 'test',
          status: 'sent',
          messageId: result.messageId,
          sentAt: new Date()
        }
      });

      return json({ 
        ok: true, 
        messageId: result.messageId 
      });
    } else {
      return json({ 
        ok: false, 
        error: result.error.message || 'Failed to send'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('[WhatsApp Send Test]', error);
    return json({ ok: false, error: error.message }, { status: 500 });
  }
}