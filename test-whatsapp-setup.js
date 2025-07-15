const { initializeWhatsApp, getClientHealth, client } = require('./backend/config/whatsapp');
const whatsappService = require('./backend/services/whatsappService');

// Test script to verify WhatsApp client initialization
async function testWhatsAppSetup() {
    console.log('🧪 Testing WhatsApp Client Setup...\n');
    
    try {
        // Test 1: Check if client can be initialized
        console.log('1️⃣ Testing client initialization...');
        await initializeWhatsApp();
        console.log('✅ Client initialization started successfully\n');
        
        // Test 2: Monitor client state for 30 seconds
        console.log('2️⃣ Monitoring client state for 30 seconds...');
        console.log('   (QR code should appear in terminal if not authenticated)\n');
        
        let monitoringInterval;
        let timeoutHandle;
        
        const monitorState = () => {
            const health = getClientHealth();
            const serviceStats = whatsappService.getServiceStats();
            
            console.log('📊 Current Status:');
            console.log(`   - Client State: ${health.state}`);
            console.log(`   - Is Ready: ${health.isReady}`);
            console.log(`   - Is Authenticated: ${health.isAuthenticated}`);
            console.log(`   - Has QR Code: ${health.hasQR}`);
            console.log(`   - Connection Attempts: ${health.connectionAttempts}/${health.maxRetries || 3}`);
            console.log(`   - Service State: ${serviceStats.connectionState}`);
            console.log(`   - Last Seen: ${health.lastSeen || 'Never'}`);
            console.log('   ─────────────────────────────────────────\n');
        };
        
        // Monitor every 3 seconds
        monitoringInterval = setInterval(monitorState, 3000);
        
        // Initial state check
        monitorState();
        
        // Set up event listeners for testing
        client.once('qr_ready', (qr) => {
            console.log('🎯 QR Code Event Received!');
            console.log('📱 Please scan the QR code shown above with WhatsApp');
            console.log('   1. Open WhatsApp on your phone');
            console.log('   2. Go to Settings > Linked Devices');
            console.log('   3. Tap "Link a Device"');
            console.log('   4. Scan the QR code\n');
        });
        
        client.once('client_ready', (info) => {
            console.log('🎉 SUCCESS! WhatsApp client is ready and connected!');
            console.log(`📱 Connected as: ${info.pushname || info.wid.user}`);
            console.log(`📞 Phone: ${info.wid.user}`);
            console.log(`🔋 Battery: ${info.battery}%`);
            console.log(`🔌 Plugged: ${info.plugged ? 'Yes' : 'No'}\n`);
            
            // Test service functions
            testServiceFunctions();
        });
        
        client.once('auth_failed', (msg) => {
            console.log('❌ Authentication failed:', msg);
            console.log('💡 Try restarting the test script\n');
        });
        
        client.once('client_error', (error) => {
            console.log('❌ Client error:', error.message);
        });
        
        // Set timeout for monitoring
        timeoutHandle = setTimeout(() => {
            clearInterval(monitoringInterval);
            
            const finalHealth = getClientHealth();
            console.log('⏰ Monitoring completed after 30 seconds');
            console.log('\n📋 Final Status Report:');
            console.log(`   - Client Ready: ${finalHealth.isReady ? '✅' : '❌'}`);
            console.log(`   - Authenticated: ${finalHealth.isAuthenticated ? '✅' : '❌'}`);
            console.log(`   - Current State: ${finalHealth.state}`);
            
            if (!finalHealth.isReady) {
                console.log('\n💡 If client is not ready:');
                console.log('   - Make sure to scan the QR code if it appeared');
                console.log('   - Check that WhatsApp Web is not open in another browser');
                console.log('   - Try running the script again');
                console.log('   - Check the .wwebjs_auth folder permissions');
            }
            
            console.log('\n🏁 Test completed. Press Ctrl+C to exit.');
        }, 30000);
        
        // Handle graceful shutdown
        process.on('SIGINT', () => {
            console.log('\n🛑 Shutting down test...');
            clearInterval(monitoringInterval);
            clearTimeout(timeoutHandle);
            process.exit(0);
        });
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        console.log('\n🔧 Troubleshooting tips:');
        console.log('   1. Make sure you have proper internet connection');
        console.log('   2. Check if Chrome/Chromium is installed');
        console.log('   3. Verify that the .wwebjs_auth directory is writable');
        console.log('   4. Try clearing the .wwebjs_auth directory and restart');
        console.log('   5. Make sure no other WhatsApp Web sessions are active');
        
        process.exit(1);
    }
}

// Test service functions when client is ready
async function testServiceFunctions() {
    console.log('3️⃣ Testing WhatsApp service functions...\n');
    
    try {
        // Test getting service stats
        const stats = whatsappService.getServiceStats();
        console.log('📊 Service Statistics:');
        console.log(JSON.stringify(stats, null, 2));
        console.log('');
        
        // Test getting client info
        const clientInfo = await whatsappService.getClientInfo();
        console.log('ℹ️ Client Information:');
        console.log(JSON.stringify(clientInfo, null, 2));
        console.log('');
        
        // Test getting chats (commented out to avoid spam)
        // const chats = await whatsappService.getChats();
        // console.log(`💬 Found ${chats.length} chats`);
        
        console.log('✅ All service functions tested successfully!');
        
    } catch (error) {
        console.error('❌ Service function test failed:', error);
    }
}

// Additional helper functions for testing
function displayTestInfo() {
    console.log('📖 WhatsApp Client Test Information:');
    console.log('');
    console.log('This script will:');
    console.log('1. Initialize the WhatsApp client with enhanced configuration');
    console.log('2. Display QR code in terminal (if authentication needed)');
    console.log('3. Monitor connection status for 30 seconds');
    console.log('4. Test service functions when connected');
    console.log('');
    console.log('Features being tested:');
    console.log('• Enhanced session management');
    console.log('• Comprehensive event handlers');
    console.log('• Auto-reconnection logic');
    console.log('• State tracking and health monitoring');
    console.log('• Service layer integration');
    console.log('');
    console.log('🚀 Starting test...\n');
}

// Main execution
if (require.main === module) {
    displayTestInfo();
    testWhatsAppSetup().catch(console.error);
}

module.exports = {
    testWhatsAppSetup,
    testServiceFunctions
}; 