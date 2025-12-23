// app/utils/whatsapp-business-api.js
import axios from 'axios';

class WhatsAppBusinessAPI {
  constructor() {
    // Récupère les variables d'environnement
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    this.apiVersion = process.env.WHATSAPP_API_VERSION || 'v22.0';
    this.baseURL = `https://graph.facebook.com/${this.apiVersion}`;
    
    // Configure Axios avec l'authentification
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000 // 10 secondes timeout
    });
  }

  /**
   * Nettoie un numéro de téléphone (enlève +, espaces, etc.)
   */
  cleanPhoneNumber(phone) {
    if (!phone) return '';
    return phone.replace(/\D/g, ''); // Garde seulement les chiffres
  }

  /**
   * Envoie un message texte simple
   * @param {string} to - Numéro de téléphone du destinataire
   * @param {string} message - Contenu du message
   * @param {boolean} previewUrl - Afficher un aperçu des URLs
   */
  async sendText(to, message, previewUrl = false) {
    try {
      const cleanedNumber = this.cleanPhoneNumber(to);
      
      if (!cleanedNumber) {
        return {
          success: false,
          error: { message: 'Numéro de téléphone invalide' }
        };
      }

      const response = await this.client.post(
        `/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: cleanedNumber,
          type: 'text',
          text: {
            preview_url: previewUrl,
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
      console.error('[WhatsApp API Error - sendText]', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error || { message: error.message }
      };
    }
  }

  /**
   * Envoie un template prédéfini
   * @param {string} to - Numéro de téléphone
   * @param {string} templateName - Nom du template (ex: "hello_world")
   * @param {string} languageCode - Code langue (ex: "fr_FR")
   * @param {Array} components - Composants du template
   */
  async sendTemplate(to, templateName, languageCode = 'fr_FR', components = []) {
    try {
      const cleanedNumber = this.cleanPhoneNumber(to);
      
      const response = await this.client.post(
        `/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: cleanedNumber,
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
      console.error('[WhatsApp API Error - sendTemplate]', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.error || { message: error.message }
      };
    }
  }

  /**
   * Récupère le statut d'un message envoyé
   */
  async getMessageStatus(messageId) {
    try {
      const response = await this.client.get(`/${messageId}`);
      return {
        success: true,
        status: response.data.status,
        data: response.data
      };
    } catch (error) {
      return { 
        success: false, 
        error: { message: error.message }
      };
    }
  }

  /**
   * Vérifie la connexion à l'API WhatsApp
   */
  async checkConnection() {
    try {
      const response = await this.client.get(`/${this.phoneNumberId}`);
      return {
        success: true,
        phoneNumber: {
          id: response.data.id,
          displayNumber: response.data.display_phone_number,
          verifiedName: response.data.verified_name,
          qualityRating: response.data.quality_rating
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || { message: error.message }
      };
    }
  }
}

// Export une instance unique (singleton)
const whatsappAPI = new WhatsAppBusinessAPI();
export default whatsappAPI;