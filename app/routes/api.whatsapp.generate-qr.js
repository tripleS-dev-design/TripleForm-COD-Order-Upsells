// app/routes/api.whatsapp.generate-qr.js
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import QRCode from "qrcode";

export async function action({ request }) {
  try {
    console.log("WhatsApp QR - Début de l'authentification");
    
    // Authentification Shopify - version corrigée
    const { session } = await authenticate.admin(request);
    const shop = session.shop;
    
    console.log("WhatsApp QR - Authentifié pour:", shop);
    
    // QR code SIMPLE pour tester
    const qrData = `https://wa.me/212600000000?shop=${shop}`;
    const qrCode = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 1
    });
    
    console.log("WhatsApp QR - QR code généré");
    
    return json({ 
      ok: true, 
      qrCode,
      message: "QR code généré. Scannez avec WhatsApp."
    });
    
  } catch (error) {
    console.error("WhatsApp QR Error détaillé:", error);
    console.error("Stack trace:", error.stack);
    
    // Retourne un QR code de test même en cas d'erreur
    const testQR = await QRCode.toDataURL("https://wa.me/212600000000?text=Test", {
      width: 300,
      margin: 1
    });
    
    return json({ 
      ok: false, 
      qrCode: testQR,
      error: error.message,
      fallback: true
    }, { status: 500 });
  }
}