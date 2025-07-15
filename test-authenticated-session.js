const { Client, LocalAuth } = require('whatsapp-web.js');
const path = require('path');

console.log('🧪 Testing Authenticated WhatsApp Session...');
console.log('📁 Using session from:', path.join(__dirname, '.wwebjs_auth'));

// Create client using the existing authenticated session
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

// Ready event
client.on('ready', async () => {
    console.log('\n✅ WhatsApp client is ready using authenticated session!');
    
    try {
        console.log('\n📞 Client Info:');
        console.log(`📱 Phone: ${client.info.wid.user}`);
        console.log(`👤 Name: ${client.info.pushname}`);
        console.log(`🔋 Battery: ${client.info.battery}%`);
        
        isReady = true;
        
        console.log('\n🧪 Testing message sending to yourself...');
        const yourNumber = client.info.wid.user;
        const testMessage = `✅ Message sending test successful! 
Time: ${new Date().toLocaleString()}
From: Watify Application`;
        
        console.log(`📤 Sending test message to: ${yourNumber}`);
        const result = await client.sendMessage(yourNumber + '@c.us', testMessage);
        
        console.log('\n🎉 SUCCESS! Message sent successfully!');
        console.log(`📧 Message ID: ${result.id._serialized}`);
        console.log(`📧 Acknowledgment: ${result.ack}`);
        
        console.log('\n✅ Your WhatsApp authentication is working perfectly!');
        console.log('🌟 Check your WhatsApp - you should see the test message.');
        console.log('\nNow the issue is that your main backend server needs to use this session...');
        
        // Keep running to receive messages
        console.log('\n⏳ Keeping client alive to test message receiving...');
        console.log('💬 Send a message to this WhatsApp number to test receiving.');
        
    } catch (error) {
        console.error('❌ Error testing message:', error);
    }
});

// QR Code event (shouldn't happen with authenticated session)
client.on('qr', (qr) => {
    console.log('⚠️ QR code generated - this means the session expired');
    console.log('Please scan the QR code again to re-authenticate');
});

// Authentication events
client.on('authenticated', () => {
    console.log('🔐 Using existing authentication session');
});

client.on('auth_failure', (msg) => {
    console.error('❌ Authentication failed:', msg);
    console.log('💡 The session may have expired. Please run the authentication process again.');
});

// Message received
client.on('message', (message) => {
    if (!message.fromMe) {
        console.log(`\n📩 Received message: "${message.body}"`);
        console.log(`📧 From: ${message.from}`);
        console.log(`⏰ Time: ${new Date(message.timestamp * 1000).toLocaleString()}`);
    }
});

// Error handling
client.on('error', (error) => {
    console.error('❌ WhatsApp error:', error);
});

// Disconnected
client.on('disconnected', (reason) => {
    console.log('🔌 WhatsApp disconnected:', reason);
});

// Start the client
console.log('🔄 Initializing WhatsApp client with authenticated session...');
client.initialize();

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down...');
    console.log('✅ Authentication test complete!');
    client.destroy();
    process.exit(0);
});

// Auto shutdown after 2 minutes if successful
setTimeout(() => {
    if (isReady) {
        console.log('\n⏰ Auto-shutting down after successful test...');
        console.log('✅ Your WhatsApp session is working perfectly!');
        client.destroy();
        process.exit(0);
    }
}, 120000); 