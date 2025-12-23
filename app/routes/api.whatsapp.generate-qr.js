import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { create } from "qrcode";
import whatsappWeb from "whatsapp-web.js";

const { Client, LocalAuth } = whatsappWeb;

// mémoire (à remplacer par Redis si scaling)
const whatsappClients = global.whatsappClients || new Map();
global.whatsappClients = whatsappClients;

export async function action({ request }) {
  try {
    const { session } = await authenticate.admin(request);
    const shopDomain = session.shop; // Renommez shopId en shopDomain

    const existing = await prisma.whatsappStatus.findUnique({
      where: { shopDomain }, // Utilisez shopDomain ici
    });

    if (existing?.status === "connected") {
      return json(
        { ok: false, error: "WhatsApp déjà connecté" },
        { status: 400 }
      );
    }

    const client = new Client({
      authStrategy: new LocalAuth({
        clientId: `whatsapp_${shopDomain.replace(".myshopify.com", "")}`,
      }),
      puppeteer: { args: ["--no-sandbox", "--disable-setuid-sandbox"] },
    });

    client.on("qr", async (qr) => {
      try {
        const qrCodeDataURL = await create(qr, { type: "png", width: 300, margin: 1 });

        await prisma.whatsappStatus.upsert({
          where: { shopDomain }, // Utilisez shopDomain ici
          update: { qrCode: qrCodeDataURL, status: "waiting_qr", updatedAt: new Date() },
          create: { shopDomain, qrCode: qrCodeDataURL, status: "waiting_qr" },
        });

        whatsappClients.set(shopDomain, client);
      } catch (err) {
        console.error("QR generation error:", err);
      }
    });

    client.on("ready", async () => {
      const phoneNumber = client.info?.wid?.user || null;

      await prisma.whatsappStatus.update({
        where: { shopDomain }, // Utilisez shopDomain ici
        data: { phoneNumber, connectedAt: new Date(), status: "connected", qrCode: null },
      });

      console.log(`[WhatsApp] Connected for ${shopDomain}`);
    });

    client.on("auth_failure", async (error) => {
      console.error("Auth failure:", error);
      await prisma.whatsappStatus.update({
        where: { shopDomain }, // Utilisez shopDomain ici
        data: { status: "auth_failure", lastError: error.message, qrCode: null },
      });
    });

    await client.initialize();

    const status = await prisma.whatsappStatus.findUnique({ where: { shopDomain } });

    if (!status?.qrCode) {
      return json({ ok: false, error: "QR non généré" }, { status: 500 });
    }

    return json({ ok: true, status: "waiting_qr", qrCode: status.qrCode });
  } catch (error) {
    console.error("[WhatsApp Generate QR] Error:", error);
    return json({ ok: false, error: error.message }, { status: 500 });
  }
}