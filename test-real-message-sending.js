const axios = require('axios');

async function testRealMessageSending() {
    console.log('🧪 Testing Real WhatsApp Message Sending...\n');
    
    const baseURL = 'http://localhost:5000';
    
    try {
        // Step 1: Login
        console.log('1. Logging in...');
        const loginResponse = await axios.post(`${baseURL}/api/auth/login`, {
            email: 'alihassan.iqbal101@gmail.com',
            password: 'ah2003ah'
        });
        
        const token = loginResponse.data.data.token;
        console.log('✅ Login successful');
        
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
        
        // Step 2: Check WhatsApp Status
        console.log('\n2. Checking WhatsApp Status...');
        const statusResponse = await axios.get(`${baseURL}/api/whatsapp/status`, { headers });
        console.log('📊 WhatsApp Status:');
        console.log('  - Ready:', statusResponse.data.data.isReady);
        console.log('  - Authenticated:', statusResponse.data.data.isAuthenticated);
        console.log('  - State:', statusResponse.data.data.state);
        console.log('  - Has QR:', statusResponse.data.data.hasQR);
        
        if (!statusResponse.data.data.isReady) {
            console.log('❌ WhatsApp is not ready. Cannot send messages.');
            console.log('Please scan the QR code first and ensure WhatsApp is connected.');
            return;
        }
        
        // Step 3: Test with Your Own Number (for testing)
        console.log('\n3. Testing message to your own number...');
        const testNumber = '923363448803'; // Your own number for testing
        const testMessage = `Test message from Watify at ${new Date().toISOString()}`;
        
        console.log(`Sending to: ${testNumber}`);
        console.log(`Message: ${testMessage}`);
        
        const sendResponse = await axios.post(`${baseURL}/api/whatsapp/send-message`, {
            number: testNumber,
            message: testMessage
        }, { headers });
        
        console.log('\n📱 Send Response:');
        console.log('  - Status:', sendResponse.data.status);
        console.log('  - Message:', sendResponse.data.message);
        console.log('  - Data:', JSON.stringify(sendResponse.data.data, null, 2));
        
        // Step 4: Wait and check for delivery
        console.log('\n4. Waiting 10 seconds to check delivery...');
        await new Promise(resolve => setTimeout(resolve, 10000));
        
        // Step 5: Try alternative endpoint
        console.log('\n5. Testing alternative send method...');
        try {
            const altResponse = await axios.post(`${baseURL}/api/whatsapp/send-bulk`, {
                numbers: [testNumber],
                message: `Bulk test message from Watify at ${new Date().toISOString()}`
            }, { headers });
            
            console.log('📦 Bulk Send Response:');
            console.log('  - Status:', altResponse.data.status);
            console.log('  - Message:', altResponse.data.message);
            console.log('  - Results:', JSON.stringify(altResponse.data.data, null, 2));
            
        } catch (altError) {
            console.log('❌ Alternative method failed:', altError.response?.data || altError.message);
        }
        
        // Step 6: Health check
        console.log('\n6. Performing health check...');
        try {
            const healthResponse = await axios.get(`${baseURL}/api/whatsapp/health`, { headers });
            console.log('🏥 Health Check:', JSON.stringify(healthResponse.data, null, 2));
        } catch (healthError) {
            console.log('⚠️ Health check failed:', healthError.response?.data || healthError.message);
        }
        
        console.log('\n📋 Summary:');
        console.log('- Check your phone for the test messages');
        console.log('- If messages are not received, the WhatsApp connection may not be properly established');
        console.log('- Ensure you have scanned the QR code and WhatsApp Web is active');
        
    } catch (error) {
        console.error('\n❌ Error in message sending test:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
        
        console.log('\n🔍 Common Issues:');
        console.log('1. WhatsApp not properly connected (scan QR code)');
        console.log('2. Phone number format incorrect (should include country code)');
        console.log('3. WhatsApp session expired');
        console.log('4. Network connectivity issues');
    }
}

// Run the test
if (require.main === module) {
    testRealMessageSending().catch(console.error);
}

module.exports = { testRealMessageSending }; 