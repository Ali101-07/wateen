const { Client, LocalAuth } = require('whatsapp-web.js');
const path = require('path');

console.log('🧪 Testing Backend WhatsApp Session...');
console.log('📁 Using session from: backend/.wwebjs_auth');

// Create client using the backend authenticated session
const client = new Client({
    authStrategy: new LocalAuth({
        clientId: 'watify-client',
        dataPath: path.join(__dirname, 'backend', '.wwebjs_auth')
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

// Ready event
client.on('ready', async () => {
    console.log('\n✅ WhatsApp client is ready using backend session!');
    
    try {
        console.log('\n📞 Client Info:');
        console.log(`📱 Phone: ${client.info.wid.user}`);
        console.log(`👤 Name: ${client.info.pushname}`);
        console.log(`🔋 Battery: ${client.info.battery}%`);
        
        isReady = true;
        
        console.log('\n🧪 Testing message sending...');
        const yourNumber = client.info.wid.user;
        const testMessage = `🎉 SUCCESS! WhatsApp is working perfectly!

✅ Message sending test from Watify
📅 Time: ${new Date().toLocaleString()}
🔧 Status: Backend session authenticated successfully

Your WhatsApp integration is now working! 🚀`;
        
        console.log(`📤 Sending test message to: ${yourNumber}`);
        const result = await client.sendMessage(yourNumber + '@c.us', testMessage);
        
        console.log('\n🎉 PERFECT! Message sent successfully!');
        console.log(`📧 Message ID: ${result.id._serialized}`);
        console.log(`📧 Acknowledgment: ${result.ack}`);
        
        console.log('\n✅ Your WhatsApp authentication is working perfectly!');
        console.log('🌟 Check your WhatsApp - you should see the test message.');
        console.log('\n🔧 Now the main issue is the backend server configuration...');
        
        console.log('\n⏰ Auto-shutting down in 10 seconds...');
        setTimeout(() => {
            console.log('✅ Test complete! WhatsApp session verified working.');
            client.destroy();
            process.exit(0);
        }, 10000);
        
    } catch (error) {
        console.error('❌ Error testing message:', error);
    }
});

// QR Code event (shouldn't happen with authenticated session)
client.on('qr', (qr) => {
    console.log('⚠️ QR code generated - session may have expired');
    console.log('❌ The authentication needs to be redone');
});

// Authentication events
client.on('authenticated', () => {
    console.log('🔐 Using existing backend authentication session');
});

client.on('auth_failure', (msg) => {
    console.error('❌ Authentication failed:', msg);
    console.log('💡 The session may have expired.');
});

// Error handling
client.on('error', (error) => {
    console.error('❌ WhatsApp error:', error);
});

// Start the client
console.log('🔄 Initializing WhatsApp client with backend session...');
client.initialize();

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down...');
    client.destroy();
    process.exit(0);
}); 