const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const path = require('path');

console.log('🚀 Starting WhatsApp Authentication Test...');

// Create a simple Express server for testing
const app = express();
app.use(express.json());

// Create WhatsApp client
const client = new Client({
    authStrategy: new LocalAuth({
        clientId: 'watify-client',
        dataPath: path.join(__dirname, '.wwebjs_auth')
    }),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu'
        ]
    }
});

let isReady = false;
let qrCodeData = null;

// QR Code event
client.on('qr', (qr) => {
    console.log('\n📱 QR CODE READY! Scan this with WhatsApp:');
    console.log('═'.repeat(60));
    qrcode.generate(qr, { small: true });
    console.log('═'.repeat(60));
    console.log('📋 Instructions:');
    console.log('1. Open WhatsApp on your phone');
    console.log('2. Tap Menu (⋮) → Linked devices');
    console.log('3. Tap "Link a device"');
    console.log('4. Scan the QR code above');
    console.log('');
    
    qrCodeData = qr;
});

// Ready event
client.on('ready', async () => {
    console.log('\n✅ WhatsApp is ready!');
    console.log('🎉 Authentication successful!');
    
    try {
        console.log('\n📞 Client Info:');
        console.log(`📱 Phone: ${client.info.wid.user}`);
        console.log(`👤 Name: ${client.info.pushname}`);
        console.log(`🔋 Battery: ${client.info.battery}%`);
        
        isReady = true;
        qrCodeData = null;
        
        console.log('\n🧪 Testing message sending...');
        console.log(`📤 Sending test message to yourself: ${client.info.wid.user}`);
        
        const testMessage = `✅ WhatsApp integration test successful! Time: ${new Date().toLocaleString()}`;
        const result = await client.sendMessage(client.info.wid.user + '@c.us', testMessage);
        
        console.log('📧 Test message sent successfully!');
        console.log(`📧 Message ID: ${result.id._serialized}`);
        
        console.log('\n🌟 WhatsApp is now fully operational!');
        console.log('🌐 You can now use your web application to send messages.');
        
    } catch (error) {
        console.error('❌ Error in ready event:', error);
    }
});

// Authentication success
client.on('authenticated', () => {
    console.log('🔐 WhatsApp authenticated successfully!');
});

// Authentication failure
client.on('auth_failure', (msg) => {
    console.error('❌ Authentication failed:', msg);
    console.log('🔄 Please restart this script and try again.');
});

// Message received
client.on('message', (message) => {
    console.log(`📩 Received: ${message.body} from ${message.from}`);
});

// Error handling
client.on('error', (error) => {
    console.error('❌ WhatsApp error:', error);
});

// API endpoints for testing
app.get('/status', (req, res) => {
    res.json({
        isReady,
        hasQR: !!qrCodeData,
        message: isReady ? 'WhatsApp is ready' : 'Waiting for authentication'
    });
});

app.post('/send-test', async (req, res) => {
    if (!isReady) {
        return res.json({
            success: false,
            error: 'WhatsApp not ready'
        });
    }
    
    try {
        const { number, message } = req.body;
        const chatId = number.includes('@') ? number : `${number}@c.us`;
        
        const result = await client.sendMessage(chatId, message || 'Test message from Watify');
        
        res.json({
            success: true,
            messageId: result.id._serialized,
            message: 'Message sent successfully'
        });
    } catch (error) {
        res.json({
            success: false,
            error: error.message
        });
    }
});

// Start the client
console.log('🔄 Starting WhatsApp client...');
client.initialize();

// Start test server
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`\n🔧 Test server running on http://localhost:${PORT}`);
    console.log(`📊 Check status: http://localhost:${PORT}/status`);
    console.log('');
    console.log('💡 Waiting for QR code...');
    console.log('⚠️  Keep this window open until authentication is complete!');
});

// Keep the process running
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down...');
    client.destroy();
    process.exit(0);
}); 