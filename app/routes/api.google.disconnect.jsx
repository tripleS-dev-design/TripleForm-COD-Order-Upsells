import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const action = async ({ request }) => {
  const { shop } = await authenticate.admin(request);
  
  try {
    await prisma.shopGoogleSettings.deleteMany({
      where: { shopDomain: shop }
    });
    
    return json({ ok: true, message: "Google Sheets déconnecté" });
  } catch (error) {
    console.error("Google disconnect error:", error);
    return json({
      ok: false,
      error: error.message || "Erreur lors de la déconnexion"
    }, { status: 500 });
  }
};