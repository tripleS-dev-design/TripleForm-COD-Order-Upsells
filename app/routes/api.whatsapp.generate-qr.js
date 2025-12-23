import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { create } from "qrcode";
import whatsappWeb from "whatsapp-web.js";

const { Client, LocalAuth } = whatsappWeb;

// Stockage global des clients
const whatsappClients = global.whatsappClients || new Map();
global.whatsappClients = whatsappClients;

export async function action({ request }) {
  let client = null;
  
  try {
    const { session } = await authenticate.admin(request);
    const shopDomain = session.shop;

    // Vérifier si déjà connecté
    const existing = await prisma.whatsappStatus.findUnique({
      where: { shopDomain },
    });

    if (existing?.status === "connected") {
      return json(
        { ok: false, error: "WhatsApp déjà connecté" },
        { status: 400 }
      );
    }

    // Configuration optimisée pour Render
    client = new Client({
      authStrategy: new LocalAuth({
        clientId: `whatsapp_${shopDomain.replace(".myshopify.com", "")}`,
        dataPath: `/tmp/whatsapp-sessions/${shopDomain}`,
      }),
      puppeteer: {
        headless: true,
        executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process', // CRITIQUE pour économiser mémoire
          '--disable-gpu',
          '--disable-software-rasterizer',
          '--disable-extensions',
          '--disable-background-networking',
          '--disable-default-apps',
          '--disable-translate',
          '--disable-sync',
          '--metrics-recording-only',
          '--mute-audio',
          '--no-default-browser-check',
          '--disable-notifications',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          '--disable-breakpad',
          '--disable-component-extensions-with-background-pages',
          '--disable-features=TranslateUI',
          '--disable-ipc-flooding-protection',
          '--disable-hang-monitor',
          '--disable-prompt-on-repost',
          '--disable-client-side-phishing-detection',
          '--enable-low-end-device-mode',
          '--js-flags=--max-old-space-size=512'
        ]
      },
      // Timeout plus court
      qrTimeout: 30000, // 30s
      authTimeout: 60000, // 60s
    });

    // Promesse pour attendre le QR
    let qrCodeDataURL = null;
    const qrPromise = new Promise((resolve, reject) => {
      client.on("qr", async (qr) => {
        try {
          console.log(`[WhatsApp] QR reçu pour ${shopDomain}`);
          qrCodeDataURL = await create(qr, { 
            type: "png", 
            width: 300, 
            margin: 1 
          });
          
          // Sauvegarder en base (SEULEMENT la string Data URL)
          await prisma.whatsappStatus.upsert({
            where: { shopDomain },
            update: { 
              qrCode: qrCodeDataURL,
              status: "waiting_qr", 
              updatedAt: new Date() 
            },
            create: { 
              shopDomain, 
              qrCode: qrCodeDataURL,
              status: "waiting_qr" 
            },
          });
          
          whatsappClients.set(shopDomain, client);
          resolve(qrCodeDataURL);
        } catch (err) {
          console.error("QR generation error:", err);
          reject(err);
        }
      });
    });

    // Événement ready
    client.on("ready", async () => {
      console.log(`[WhatsApp] Client prêt pour ${shopDomain}`);
      const phoneNumber = client.info?.wid?.user || null;

      await prisma.whatsappStatus.update({
        where: { shopDomain },
        data: { 
          phoneNumber, 
          connectedAt: new Date(), 
          status: "connected", 
          qrCode: null 
        },
      });
    });

    // Gestion des erreurs
    client.on("auth_failure", async (error) => {
      console.error(`[WhatsApp] Auth failure pour ${shopDomain}:`, error);
      await prisma.whatsappStatus.update({
        where: { shopDomain },
        data: { 
          status: "auth_failure", 
          lastError: error.message, 
          qrCode: null 
        },
      });
    });

    // Initialiser
    console.log(`[WhatsApp] Initialisation pour ${shopDomain}`);
    await client.initialize();
    
    // Attendre le QR (max 30s)
    qrCodeDataURL = await Promise.race([
      qrPromise,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Timeout génération QR")), 30000)
      )
    ]);

    if (!qrCodeDataURL) {
      throw new Error("QR non généré");
    }

    return json({ 
      ok: true, 
      status: "waiting_qr", 
      qrCode: qrCodeDataURL 
    });

  } catch (error) {
    console.error("[WhatsApp Generate QR] Error:", error);
    
    // Nettoyer le client en cas d'erreur
    if (client) {
      try {
        await client.destroy();
      } catch (e) {
        console.error("Erreur nettoyage client:", e);
      }
    }
    
    return json({ 
      ok: false, 
      error: error.message 
    }, { status: 500 });
  }
}