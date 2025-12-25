// app/routes/api.whatsapp.generate-qr.js - VERSION CORRECTE
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import pkg from "whatsapp-web.js";
const { Client, LocalAuth } = pkg;
import QRCode from "qrcode";
import prisma from "../db.server";

// Stocke les clients actifs par boutique pour éviter les doublons
const activeClients = new Map();

export async function action({ request }) {
  let session;
  try {
    console.log("[WhatsApp QR] Début de la génération");
    
    // 1. Authentification
    const auth = await authenticate.admin(request);
    session = auth.session;
    const shopDomain = session.shop;
    
    console.log(`[WhatsApp QR] Authentifié pour: ${shopDomain}`);
    
    // 2. Vérifier si un client existe déjà pour cette boutique
    if (activeClients.has(shopDomain)) {
      console.log(`[WhatsApp QR] Client déjà actif pour ${shopDomain}`);
      const existingClient = activeClients.get(shopDomain);
      
      // Si le client est déjà prêt, pas besoin de nouveau QR
      if (existingClient.info) {
        return json({
          ok: true,
          qrCode: null,
          status: "already_connected",
          message: "WhatsApp est déjà connecté pour cette boutique."
        });
      }
    }
    
    // 3. CONFIGURATION CRITIQUE du client WhatsApp
    const client = new Client({
      authStrategy: new LocalAuth({
        clientId: `shop_${shopDomain.replace(/[^a-z0-9]/gi, '_')}` // Unique par boutique
      }),
      puppeteer: {
        headless: true,
        // CHEMIN ABSOLUMENT CRITIQUE pour Render
        executablePath: process.env.NODE_ENV === 'production' 
          ? '/usr/bin/chromium-browser' 
          : undefined,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ]
      },
      webVersionCache: {
        type: 'remote',
        remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html'
      }
    });
    
    // Stocker le client
    activeClients.set(shopDomain, client);
    
    let qrGenerated = false;
    let qrCodeImage = null;
    
    // 4. GESTION DES ÉVÉNEMENTS WhatsApp
    client.on('qr', async (qr) => {
      console.log(`[WhatsApp QR] Nouveau QR reçu pour ${shopDomain}`);
      qrGenerated = true;
      
      // Générer l'image du QR code
      qrCodeImage = await QRCode.toDataURL(qr, {
        width: 300,
        margin: 1
      });
      
      // Mettre à jour le statut dans la base "En attente de scan"
      await prisma.whatsappStatus.upsert({
        where: { shopDomain },
        update: { 
          status: 'qr_pending',
          qrCode: qr,
          updatedAt: new Date()
        },
        create: {
          shopDomain,
          status: 'qr_pending',
          qrCode: qr
        }
      });
    });
    
    client.on('authenticated', () => {
      console.log(`[WhatsApp QR] Authentifié avec succès pour ${shopDomain}`);
    });
    
    client.on('ready', async () => {
      console.log(`[WhatsApp QR] Client PRÊT et connecté pour ${shopDomain}!`);
      
      // Mettre à jour le statut dans la base "Connecté"
      await prisma.whatsappStatus.upsert({
        where: { shopDomain },
        update: { 
          status: 'connected',
          connectedAt: new Date(),
          qrCode: null, // Nettoyer le QR après connexion
          updatedAt: new Date()
        },
        create: {
          shopDomain,
          status: 'connected',
          connectedAt: new Date()
        }
      });
      
      // Récupérer le numéro du client connecté
      const clientInfo = client.info;
      console.log(`[WhatsApp QR] Connecté avec le numéro: ${clientInfo?.wid?.user || 'Inconnu'}`);
    });
    
    client.on('auth_failure', (msg) => {
      console.error(`[WhatsApp QR] Échec d'authentification pour ${shopDomain}:`, msg);
    });
    
    client.on('disconnected', async (reason) => {
      console.log(`[WhatsApp QR] Déconnecté pour ${shopDomain}:`, reason);
      
      // Mettre à jour le statut
      await prisma.whatsappStatus.upsert({
        where: { shopDomain },
        update: { 
          status: 'disconnected',
          lastError: reason,
          updatedAt: new Date()
        },
        create: {
          shopDomain,
          status: 'disconnected',
          lastError: reason
        }
      });
      
      // Nettoyer le client
      activeClients.delete(shopDomain);
    });
    
    // 5. Initialiser le client
    await client.initialize();
    console.log(`[WhatsApp QR] Client initialisé pour ${shopDomain}`);
    
    // Attendre un peu pour que l'événement 'qr' se déclenche
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (!qrGenerated) {
      // Si pas de QR après 1s, le client est peut-être déjà connecté
      if (client.info) {
        return json({
          ok: true,
          qrCode: null,
          status: "already_connected",
          message: "WhatsApp est déjà connecté."
        });
      }
      
      throw new Error("Le QR code n'a pas été généré par le client WhatsApp.");
    }
    
    return json({
      ok: true,
      qrCode: qrCodeImage,
      status: "qr_generated",
      message: "Scannez ce QR code avec WhatsApp mobile pour vous connecter."
    });
    
  } catch (error) {
    console.error("[WhatsApp QR] Erreur fatale:", error.message, error.stack);
    
    return json({
      ok: false,
      error: error.message,
      status: "error",
      message: "Échec de la génération du QR code WhatsApp."
    }, { status: 500 });
  }
}

// Optionnel: Endpoint pour vérifier le statut de connexion
export async function loader({ request }) {
  const { session } = await authenticate.admin(request);
  const shopDomain = session.shop;
  
  const status = await prisma.whatsappStatus.findUnique({
    where: { shopDomain }
  });
  
  return json({
    connected: status?.status === 'connected',
    status: status?.status || 'disconnected',
    lastUpdate: status?.updatedAt
  });
}