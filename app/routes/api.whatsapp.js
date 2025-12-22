// Ce fichier gère /api/whatsapp
export default function WhatsAppApiIndex() {
  return new Response(
    JSON.stringify({
      message: 'WhatsApp API endpoints',
      endpoints: [
        { method: 'GET', path: '/api/whatsapp/status', description: 'Get WhatsApp status' },
        { method: 'POST', path: '/api/whatsapp/generate-qr', description: 'Generate QR code' },
        { method: 'POST', path: '/api/whatsapp/send-test', description: 'Send test message' },
        { method: 'POST', path: '/api/whatsapp/send-order-message', description: 'Send order notification' },
        { method: 'POST', path: '/api/whatsapp/disconnect', description: 'Disconnect WhatsApp' },
        { method: 'POST', path: '/api/whatsapp/save-config', description: 'Save WhatsApp config' },
        { method: 'POST', path: '/api/whatsapp/send-recovery', description: 'Send recovery message' },
        { method: 'POST', path: '/api/whatsapp/test', description: 'Test connection' }
      ]
    }),
    { 
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      } 
    }
  );
}