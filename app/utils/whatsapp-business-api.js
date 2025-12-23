// app/lib/whatsapp-business-api.js
import axios from 'axios';

export class WhatsAppBusinessAPI {
  constructor() {
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN; // VOTRE NOUVEAU TOKEN PERMANENT
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID; // 928798933648532
    this.apiVersion = process.env.WHATSAPP_API_VERSION || 'v22.0';
    this.baseURL = `https://graph.facebook.com/${this.apiVersion}`;
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      }
    });
  }

  // ✅ ENVOYER UN MESSAGE TEXTE
  async sendText(to, message) {
    try {
      const response = await this.client.post(
        `/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: to.replace(/\D/g, ''), // Nettoyer le numéro
          type: 'text',
          text: {
            preview_url: false,
            body: message
          }
        }
      );
      
      return {
        success: true,
        messageId: response.data.messages?.[0]?.id,
        data: response.data
      };
    } catch (error) {
      console.error('[WhatsApp API Error]', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }

  // ✅ ENVOYER UN TEMPLATE (pour notifications automatiques)
  async sendTemplate(to, templateName, languageCode = 'fr_FR', components = []) {
    try {
      const response = await this.client.post(
        `/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: to.replace(/\D/g, ''),
          type: 'template',
          template: {
            name: templateName,
            language: { code: languageCode },
            components: components
          }
        }
      );
      
      return {
        success: true,
        messageId: response.data.messages?.[0]?.id,
        data: response.data
      };
    } catch (error) {
      console.error('[WhatsApp Template Error]', error.response?.data || error.message);
      return { success: false, error: error.response?.data?.error || error.message };
    }
  }

  // ✅ VERIFIER LE STATUT D'UN MESSAGE
  async getMessageStatus(messageId) {
    try {
      const response = await this.client.get(`/${messageId}`);
      return {
        success: true,
        status: response.data.status,
        data: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Export unique
export default new WhatsAppBusinessAPI();