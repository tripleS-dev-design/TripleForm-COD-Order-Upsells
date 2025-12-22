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
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? 'https://votre-domaine.com' 
      : 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(express.json());

// Config WhatsApp Client
const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: path.join(__dirname, '.wwebjs_auth')
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
      '--disable-gpu'
    ]
  },
  webVersionCache: {
    type: 'remote',
    remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html'
  }
});

// Événements WhatsApp
client.on('qr', (qr) => {
  console.log('QR RECEIVED');
  qrcode.generate(qr, { small: true });
  
  // Envoyer QR via Socket.io
  io.emit('qr', qr);
});

client.on('ready', () => {
  console.log('WhatsApp Client is ready!');
  io.emit('ready', { status: 'connected', timestamp: new Date() });
});

client.on('authenticated', () => {
  console.log('WhatsApp Client authenticated!');
  io.emit('authenticated');
});

client.on('auth_failure', (msg) => {
  console.error('WhatsApp Auth failure:', msg);
  io.emit('auth_failure', { error: msg });
});

client.on('disconnected', (reason) => {
  console.log('WhatsApp Client disconnected:', reason);
  io.emit('disconnected', { reason });
});

client.on('message', async (msg) => {
  console.log('Message received:', msg.body);
  
  // Envoyer message via Socket.io
  io.emit('message', {
    from: msg.from,
    body: msg.body,
    timestamp: msg.timestamp,
    id: msg.id._serialized
  });
  
  // Exemple de réponse automatique
  if (msg.body.toLowerCase() === 'ping') {
    await msg.reply('pong');
  }
});

// Routes API
app.post('/api/whatsapp/send', async (req, res) => {
  try {
    const { to, message } = req.body;
    
    if (!client.info || !client.info.wid) {
      return res.status(400).json({ error: 'WhatsApp client not ready' });
    }
    
    const chatId = to.includes('@c.us') ? to : `${to}@c.us`;
    const sent = await client.sendMessage(chatId, message);
    
    res.json({ success: true, messageId: sent.id._serialized });
  } catch (error) {
    console.error('Send error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/whatsapp/status', (req, res) => {
  res.json({
    isReady: !!client.info,
    phone: client.info?.wid.user,
    timestamp: new Date()
  });
});

app.post('/api/whatsapp/logout', async (req, res) => {
  try {
    await client.logout();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Démarrer
const PORT = process.env.WHATSAPP_PORT || 4000;

const startServer = async () => {
  try {
    await client.initialize();
    httpServer.listen(PORT, () => {
      console.log(`WhatsApp Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start WhatsApp server:', error);
  }
};

startServer();

export { client, io };