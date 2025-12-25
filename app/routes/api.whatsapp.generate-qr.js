// app/routes/api.whatsapp.generate-qr.js - VERSION 100% CORRIGÉE
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import pkg from "whatsapp-web.js";
const { Client, LocalAuth } = pkg;
import QRCode from "qrcode";
import prisma from "../db.server";

// Stocke les clients actifs par boutique
const activeClients = new Map();

export async function action({ request }) {
  let session;
  try {
    console.log("[WhatsApp QR] 🚀 Début de la génération");
    
    // 1. Authentification
    const auth = await authenticate.admin(request);
    session = auth.session;
    const shopDomain = session.shop;
    
    console.log(`[WhatsApp QR] ✅ Authentifié pour: ${shopDomain}`);
    
    // 🔴 CORRECTION CRITIQUE #1: NETTOYER l'ancien client AVANT d'en créer un nouveau
    if (activeClients.has(shopDomain)) {
      console.log(`[WhatsApp QR] ⚠️ Nettoyage ancien client pour ${shopDomain}`);
      const oldClient = activeClients.get(shopDomain);
      try {
        await oldClient.destroy();
        console.log(`[WhatsApp QR] ✅ Ancien client détruit`);
      } catch (destroyError) {
        console.log(`[WhatsApp QR] ℹ️ Impossible de destroy client:`, destroyError.message);
      }
      activeClients.delete(shopDomain);
      
      // Pause critique pour éviter les conflits
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // 2. CONFIGURATION CORRIGÉE du client WhatsApp
    const client = new Client({
      authStrategy: new LocalAuth({
        clientId: `shop_${shopDomain.replace(/[^a-z0-9]/gi, '_')}`,
        dataPath: `/tmp/whatsapp_sessions_${shopDomain.replace(/[^a-z0-9]/gi, '_')}` // 🔴 CORRECTION: chemin temporaire
      }),
      puppeteer: {
        headless: true,
        // CHEMIN CORRECT pour Render (chromium-browser, pas chromium)
        executablePath: process.env.NODE_ENV === 'production' 
          ? '/usr/bin/chromium-browser' 
          : undefined,
        // 🔴 CORRECTION CRITIQUE #2: PLUS D'ARGUMENTS pour éviter les crashes
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu',
          '--disable-software-rasterizer',
          '--disable-features=VizDisplayCompositor',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          '--memory-pressure-off',
          '--js-flags="--max-old-space-size=256"'
        ]
      },
      webVersionCache: {
        type: 'remote',
        remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html'
      }
    });
    
    let qrGenerated = false;
    let qrCodeImage = null;
    let qrCodeData = null;
    
    // 3. GESTION DES ÉVÉNEMENTS avec timeout
    const eventTimeouts = new Map();
    
    // Événement QR
    client.on('qr', async (qr) => {
      console.log(`[WhatsApp QR] 📱 Nouveau QR reçu pour ${shopDomain}`);
      qrGenerated = true;
      qrCodeData = qr;
      
      // Générer l'image
      qrCodeImage = await QRCode.toDataURL(qr, {
        width: 300,
        margin: 1
      });
      
      // Sauvegarder en base
      try {
        await prisma.whatsappStatus.upsert({
          where: { shopDomain },
          update: { 
            status: 'qr_pending',
            qrCode: qr.substring(0, 500), // Limiter la taille
            updatedAt: new Date()
          },
          create: {
            shopDomain,
            status: 'qr_pending',
            qrCode: qr.substring(0, 500)
          }
        });
      } catch (dbError) {
        console.log(`[WhatsApp QR] ⚠️ DB error (qr):`, dbError.message);
      }
    });
    
    // Événement Authenticated
    client.on('authenticated', () => {
      console.log(`[WhatsApp QR] ✅ Authentifié avec succès pour ${shopDomain}`);
    });
    
    // Événement Ready - LE PLUS IMPORTANT
    client.on('ready', async () => {
      console.log(`[WhatsApp QR] 🎉 Client PRÊT et connecté pour ${shopDomain}!`);
      
      try {
        await prisma.whatsappStatus.upsert({
          where: { shopDomain },
          update: { 
            status: 'connected',
            connectedAt: new Date(),
            qrCode: null,
            updatedAt: new Date()
          },
          create: {
            shopDomain,
            status: 'connected',
            connectedAt: new Date()
          }
        });
        
        const clientInfo = client.info;
        console.log(`[WhatsApp QR] 📞 Connecté avec le numéro: ${clientInfo?.wid?.user || 'Inconnu'}`);
        
        // 🔴 CORRECTION: Stocker le client SEULEMENT s'il est ready
        activeClients.set(shopDomain, client);
        
      } catch (dbError) {
        console.error(`[WhatsApp QR] ❌ DB error (ready):`, dbError.message);
      }
    });
    
    // Événement Auth Failure
    client.on('auth_failure', (msg) => {
      console.error(`[WhatsApp QR] ❌ Échec d'authentification pour ${shopDomain}:`, msg);
    });
    
    // Événement Disconnected
    client.on('disconnected', async (reason) => {
      console.log(`[WhatsApp QR] 🔌 Déconnecté pour ${shopDomain}:`, reason);
      
      try {
        await prisma.whatsappStatus.upsert({
          where: { shopDomain },
          update: { 
            status: 'disconnected',
            lastError: reason.substring(0, 200),
            updatedAt: new Date()
          },
          create: {
            shopDomain,
            status: 'disconnected',
            lastError: reason.substring(0, 200)
          }
        });
      } catch (dbError) {
        console.log(`[WhatsApp QR] ⚠️ DB error (disconnected):`, dbError.message);
      }
      
      // Nettoyer
      if (activeClients.get(shopDomain) === client) {
        activeClients.delete(shopDomain);
      }
    });
    
    // 4. 🔴 CORRECTION CRITIQUE #3: INITIALISATION AVEC TIMEOUT ET GESTION D'ERREUR
    console.log(`[WhatsApp QR] ⏳ Tentative d'initialisation du client...`);
    
    try {
      // Timeout de 45 secondes (plus long pour Render)
      const initPromise = client.initialize();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout: Chromium n\'a pas démarré en 45s')), 45000)
      );
      
      await Promise.race([initPromise, timeoutPromise]);
      console.log(`[WhatsApp QR] ✅ Client initialisé avec succès`);
      
    } catch (initError) {
      console.error(`[WhatsApp QR] ❌ ÉCHEC initialisation:`, initError.message);
      
      // Nettoyage d'urgence
      try {
        await client.destroy();
      } catch (destroyError) {
        console.log(`[WhatsApp QR] ⚠️ Impossible de destroy client:`, destroyError.message);
      }
      
      // NE PAS stocker le client échoué
      if (activeClients.get(shopDomain) === client) {
        activeClients.delete(shopDomain);
      }
      
      return json({
        ok: false,
        error: `Échec démarrage WhatsApp: ${initError.message}`,
        status: "chromium_error",
        message: "Le navigateur n'a pas pu démarrer sur Render. Code d'erreur: CHROMIUM_INIT_FAIL"
      }, { status: 500 });
    }
    
    // 5. Attendre le QR avec timeout
    console.log(`[WhatsApp QR] ⏳ Attente du QR code...`);
    
    const qrTimeout = 10000; // 10 secondes max pour le QR
    const startTime = Date.now();
    
    while (!qrGenerated && (Date.now() - startTime) < qrTimeout) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    if (!qrGenerated) {
      // Vérifier si le client est déjà connecté (session restaurée)
      if (client.info) {
        console.log(`[WhatsApp QR] ✅ Client déjà connecté via session restaurée`);
        
        // Mettre à jour le statut
        await prisma.whatsappStatus.upsert({
          where: { shopDomain },
          update: { 
            status: 'connected',
            connectedAt: new Date(),
            updatedAt: new Date()
          },
          create: {
            shopDomain,
            status: 'connected',
            connectedAt: new Date()
          }
        });
        
        activeClients.set(shopDomain, client);
        
        return json({
          ok: true,
          qrCode: null,
          status: "already_connected",
          message: "WhatsApp était déjà connecté (session restaurée)."
        });
      }
      
      // Si pas de QR et pas connecté = erreur
      console.error(`[WhatsApp QR] ❌ Aucun QR généré après ${qrTimeout}ms`);
      
      // Nettoyer
      try {
        await client.destroy();
      } catch (e) {}
      
      return json({
        ok: false,
        error: "Le client WhatsApp n'a pas généré de QR code",
        status: "no_qr_generated",
        message: "WhatsApp n'a pas généré de QR code. Réessayez."
      }, { status: 500 });
    }
    
    // 6. SUCCÈS : QR généré
    console.log(`[WhatsApp QR] 🎯 QR code généré avec succès`);
    
    return json({
      ok: true,
      qrCode: qrCodeImage,
      qrData: qrCodeData ? qrCodeData.substring(0, 100) + "..." : null,
      status: "qr_generated",
      message: "Scannez ce QR code avec WhatsApp mobile (Menu → Appareils connectés)",
      shop: shopDomain,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("[WhatsApp QR] 💀 Erreur fatale:", error.message);
    console.error("[WhatsApp QR] Stack:", error.stack);
    
    // Nettoyage final en cas d'erreur globale
    if (session?.shop && activeClients.has(session.shop)) {
      const errorClient = activeClients.get(session.shop);
      try {
        await errorClient.destroy();
      } catch (e) {}
      activeClients.delete(session.shop);
    }
    
    return json({
      ok: false,
      error: error.message,
      status: "fatal_error",
      message: "Erreur critique lors de la génération du QR code WhatsApp."
    }, { status: 500 });
  }
}

// Endpoint pour vérifier le statut
export async function loader({ request }) {
  try {
    const { session } = await authenticate.admin(request);
    const shopDomain = session.shop;
    
    const status = await prisma.whatsappStatus.findUnique({
      where: { shopDomain }
    });
    
    const isClientActive = activeClients.has(shopDomain);
    const clientInfo = isClientActive ? activeClients.get(shopDomain).info : null;
    
    return json({
      connected: status?.status === 'connected',
      status: status?.status || 'disconnected',
      lastUpdate: status?.updatedAt,
      clientActive: isClientActive,
      clientReady: clientInfo ? true : false,
      phoneNumber: clientInfo?.wid?.user || null
    });
    
  } catch (error) {
    return json({
      error: error.message,
      connected: false,
      status: 'error'
    }, { status: 500 });
  }
}

// Fonction utilitaire pour nettoyer tous les clients (optionnel)
export function cleanupAllClients() {
  console.log(`[WhatsApp QR] 🧹 Nettoyage de tous les clients (${activeClients.size})`);
  activeClients.forEach(async (client, shopDomain) => {
    try {
      await client.destroy();
    } catch (e) {}
  });
  activeClients.clear();
}