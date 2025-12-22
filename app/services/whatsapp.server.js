import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import whatsappWeb from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const { Client, LocalAuth } = whatsappWeb;

const app = express();
const httpServer = createServer(app);

// Config CORS pour production
const io = new Server(httpServer, {
  cors: {
    origin: [
      'https://tripleform-cod-order-upsells.onrender.com',
      'https://tripleform-cod-order-upsells-*.onrender.com',
      'http://localhost:3000'
    ],
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Middleware pour Render
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://tripleform-cod-order-upsells.onrender.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Config WhatsApp Client pour Render
const client = new Client({
  authStrategy: new LocalAuth({
    clientId: 'tripleform-production',
    dataPath: '/tmp/.wwebjs_auth'  // Utiliser /tmp pour Render
  }),
  puppeteer: {
    headless: true,
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
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      '--disable-background-networking',
      '--disable-breakpad',
      '--disable-component-extensions-with-background-pages',
      '--disable-features=TranslateUI,BlinkGenPropertyTrees',
      '--disable-ipc-flooding-protection',
      '--disable-default-apps',
      '--disable-extensions',
      '--disable-sync',
      '--disable-translate',
      '--metrics-recording-only',
      '--mute-audio',
      '--no-default-browser-check',
      '--use-gl=swiftshader',
      '--ignore-certificate-errors',
      '--ignore-ssl-errors',
      '--enable-features=NetworkService,NetworkServiceInProcess'
    ],
    executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium-browser'
  },
  webVersionCache: {
    type: 'remote',
    remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html'
  }
});

// Variables d'état
let qrCode = null;
let isReady = false;
let status = 'initializing';

// Événements WhatsApp
client.on('qr', (qr) => {
  console.log('QR RECEIVED');
  qrcode.generate(qr, { small: true });
  qrCode = qr;
  status = 'qr_required';
  
  io.emit('whatsapp:qr', { qr });
  io.emit('whatsapp:status', { status, qr });
});

client.on('ready', () => {
  console.log('✅ WhatsApp Client is ready!');
  isReady = true;
  status = 'connected';
  qrCode = null;
  
  io.emit('whatsapp:ready', { 
    status, 
    timestamp: new Date(),
    phone: client.info?.wid.user 
  });
  io.emit('whatsapp:status', { status });
});

client.on('authenticated', () => {
  console.log('✅ WhatsApp Client authenticated!');
  status = 'authenticated';
  io.emit('whatsapp:authenticated');
});

client.on('auth_failure', (msg) => {
  console.error('❌ WhatsApp Auth failure:', msg);
  status = 'auth_failed';
  io.emit('whatsapp:auth_failure', { error: msg });
  io.emit('whatsapp:status', { status });
});

client.on('disconnected', (reason) => {
  console.log('⚠️ WhatsApp Client disconnected:', reason);
  isReady = false;
  status = 'disconnected';
  io.emit('whatsapp:disconnected', { reason });
  io.emit('whatsapp:status', { status });
});

client.on('message', async (msg) => {
  console.log('📩 Message received from:', msg.from, 'Body:', msg.body?.substring(0, 50));
  
  io.emit('whatsapp:message', {
    from: msg.from,
    body: msg.body,
    timestamp: msg.timestamp,
    id: msg.id._serialized,
    hasMedia: msg.hasMedia,
    type: msg.type
  });
});

// Routes API
app.get('/api/status', (req, res) => {
  res.json({
    status,
    isReady,
    phone: client.info?.wid.user,
    timestamp: new Date(),
    environment: process.env.NODE_ENV
  });
});

app.post('/api/send', async (req, res) => {
  try {
    const { to, message } = req.body;
    
    if (!isReady) {
      return res.status(400).json({ 
        error: 'WhatsApp client not ready',
        status
      });
    }
    
    const chatId = to.includes('@c.us') || to.includes('@g.us') 
      ? to 
      : `${to}@c.us`;
    
    const sent = await client.sendMessage(chatId, message);
    
    res.json({ 
      success: true, 
      messageId: sent.id._serialized,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Send error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check pour Render
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    whatsapp: status,
    timestamp: new Date(),
    uptime: process.uptime()
  });
});

// Route racine
app.get('/', (req, res) => {
  res.json({
    service: 'WhatsApp Server',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      status: '/api/status',
      send: '/api/send',
      health: '/health'
    }
  });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Démarrer le serveur
const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    console.log('🚀 Starting WhatsApp server...');
    console.log('📁 Auth path:', '/tmp/.wwebjs_auth');
    console.log('🌐 Environment:', process.env.NODE_ENV);
    
    await client.initialize();
    
    httpServer.listen(PORT, () => {
      console.log(`✅ WhatsApp Server running on port ${PORT}`);
      console.log(`📡 WebSocket: ws://localhost:${PORT}`);
      console.log(`🌐 REST API: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Failed to start WhatsApp server:', error);
    process.exit(1);
  }
};

startServer();

export { client, io, status };