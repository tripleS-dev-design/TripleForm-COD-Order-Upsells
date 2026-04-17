import { json } from "@remix-run/node";
import prisma from "../db.server";

export const action = async ({ request }) => {
  try {
    // Vérifier si la colonne shopDomain existe dans la table Shop
    const result = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Shop' AND column_name = 'shopDomain'
    `;

    if (result.length === 0) {
      // Ajouter la colonne shopDomain
      await prisma.$executeRaw`
        ALTER TABLE "Shop" ADD COLUMN "shopDomain" TEXT UNIQUE;
      `;
      console.log("✅ Colonne shopDomain ajoutée à Shop");
    }

    // Même chose pour WhatsAppConfig
    const waResult = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'whatsapp_config' AND column_name = 'shopDomain'
    `;
    if (waResult.length === 0) {
      await prisma.$executeRaw`
        ALTER TABLE "whatsapp_config" ADD COLUMN "shopDomain" TEXT UNIQUE;
      `;
      console.log("✅ Colonne shopDomain ajoutée à whatsapp_config");
    }

    // Tu peux ajouter ici les autres modèles (WhatsappStatus, etc.)

    return json({ ok: true, message: "Base corrigée" });
  } catch (error) {
    console.error("Erreur correction DB:", error);
    return json({ ok: false, error: error.message }, { status: 500 });
  }
};
