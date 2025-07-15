const axios = require('axios');

async function testWhatsAppFlow() {
    console.log('🔍 Testing WhatsApp Flow...\n');
    
    const baseURL = 'http://localhost:5000';
    
    try {
        // Step 1: Login
        console.log('1. Testing Login...');
        const loginResponse = await axios.post(`${baseURL}/api/auth/login`, {
            email: 'alihassan.iqbal101@gmail.com',
            password: 'ah2003ah'
        });
        
        const token = loginResponse.data.data.token;
        console.log('✅ Login successful, token obtained');
        
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
        
        // Step 2: Check WhatsApp Status
        console.log('\n2. Checking WhatsApp Status...');
        const statusResponse = await axios.get(`${baseURL}/api/whatsapp/status`, { headers });
        console.log('📊 WhatsApp Status:', JSON.stringify(statusResponse.data, null, 2));
        
        // Step 3: Try to get QR Code
        console.log('\n3. Attempting to get QR Code...');
        const qrResponse = await axios.get(`${baseURL}/api/whatsapp/qr`, { headers });
        console.log('📱 QR Response:', JSON.stringify({
            status: qrResponse.data.status,
            message: qrResponse.data.message,
            hasQR: !!qrResponse.data.data?.qr,
            qrLength: qrResponse.data.data?.qr ? qrResponse.data.data.qr.length : 0
        }, null, 2));
        
        // Step 4: Try restart if no QR
        if (!qrResponse.data.data?.qr) {
            console.log('\n4. No QR found, attempting restart...');
            try {
                const restartResponse = await axios.post(`${baseURL}/api/whatsapp/restart`, {}, { headers });
                console.log('🔄 Restart response:', restartResponse.data);
                
                // Wait a bit then check again
                console.log('\n5. Waiting 5 seconds then checking QR again...');
                await new Promise(resolve => setTimeout(resolve, 5000));
                
                const qrResponse2 = await axios.get(`${baseURL}/api/whatsapp/qr`, { headers });
                console.log('📱 QR Response (after restart):', JSON.stringify({
                    status: qrResponse2.data.status,
                    message: qrResponse2.data.message,
                    hasQR: !!qrResponse2.data.data?.qr,
                    qrLength: qrResponse2.data.data?.qr ? qrResponse2.data.data.qr.length : 0
                }, null, 2));
                
            } catch (restartError) {
                console.error('❌ Restart failed:', restartError.response?.data || restartError.message);
            }
        }
        
        console.log('\n✅ WhatsApp Flow Test Complete');
        
    } catch (error) {
        console.error('❌ Error in WhatsApp flow test:', error.response?.data || error.message);
    }
}

// Run the test
testWhatsAppFlow().catch(console.error); 