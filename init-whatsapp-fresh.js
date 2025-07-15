const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');

console.log('🚀 Initializing WhatsApp Client...');
console.log('⏳ This may take a few moments...');

// Create client with fresh session
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

// QR Code event
client.on('qr', (qr) => {
    console.log('\n📱 QR CODE READY! Scan this with WhatsApp:');
    console.log('═'.repeat(50));
    qrcode.generate(qr, { small: true });
    console.log('═'.repeat(50));
    console.log('📋 Instructions:');
    console.log('1. Open WhatsApp on your phone');
    console.log('2. Tap Menu (⋮) → Linked devices');
    console.log('3. Tap "Link a device"');
    console.log('4. Scan the QR code above');
    console.log('');
});

// Ready event
client.on('ready', () => {
    console.log('✅ WhatsApp is ready!');
    console.log('🎉 You can now send messages through your application');
    
    // Test the connection
    console.log('\n📞 Client Info:');
    console.log(`📱 Phone: ${client.info.wid.user}`);
    console.log(`👤 Name: ${client.info.pushname}`);
    console.log(`🔋 Battery: ${client.info.battery}%`);
    
    console.log('\n✅ WhatsApp setup complete! You can now close this window.');
    console.log('🌐 Go to your web application and try sending a message.');
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

// Disconnected
client.on('disconnected', (reason) => {
    console.log('🔌 WhatsApp disconnected:', reason);
});

// Error handling
client.on('error', (error) => {
    console.error('❌ WhatsApp error:', error);
});

// Message received (for testing)
client.on('message', (message) => {
    console.log(`📩 Received: ${message.body} from ${message.from}`);
});

// Start the client
console.log('🔄 Starting WhatsApp client...');
client.initialize();

// Keep the process running
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down...');
    client.destroy();
    process.exit(0);
});

console.log('\n💡 Waiting for QR code...');
console.log('⚠️  Keep this window open until authentication is complete!'); 