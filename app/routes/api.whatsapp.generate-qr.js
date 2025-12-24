// api.whatsapp.generate-qr.js
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import QRCode from "qrcode";

export async function action({ request }) {
  try {
    // 1. Authentification
    const { session } = await authenticate.admin(request);
    const shopDomain = session.shop;
    
    // 2. SIMULATION QR (pour le moment)
    const testQR = await QRCode.toDataURL(`https://wa.me/212600000000?shop=${shopDomain}`, {
      width: 300,
      margin: 1
    });
    
    return json({ 
      ok: true, 
      qrCode: testQR,
      message: "QR code généré"
    });
    
  } catch (error) {
    console.error("[WhatsApp Generate QR] Error:", error);
    return json({ 
      ok: false, 
      error: "Erreur de génération" 
    }, { status: 500 });
  }
}