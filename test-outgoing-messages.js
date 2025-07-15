// Test Outgoing WhatsApp Messages
console.log('🧪 Testing Outgoing WhatsApp Messages...\n');

const http = require('http');

function makeRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        const req = http.request(options, (res) => {
            let responseData = '';
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(responseData);
                    resolve({ status: res.statusCode, data: parsed });
                } catch (e) {
                    resolve({ status: res.statusCode, data: responseData });
                }
            });
        });

        req.on('error', (err) => {
            reject(err);
        });

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

async function testOutgoingMessages() {
    try {
        // Step 1: Login
        console.log('1. Logging in...');
        const loginResponse = await makeRequest('POST', '/api/auth/login', {
            email: 'alihassan.iqbal101@gmail.com',
            password: 'ah2003ah'
        });
        
        if (loginResponse.status !== 200) {
            console.error('❌ Login failed:', loginResponse);
            return;
        }
        
        const token = loginResponse.data.data.token;
        console.log('✅ Login successful');
        
        // Step 2: Check WhatsApp Status
        console.log('\n2. Checking WhatsApp Status...');
        const statusResponse = await makeRequest('GET', `/api/whatsapp/status?token=${token}`);
        console.log('📊 Status Response:', JSON.stringify(statusResponse.data, null, 2));
        
        if (!statusResponse.data.data.isReady) {
            console.log('❌ WhatsApp is not ready. Please scan QR code first.');
            return;
        }
        
        // Step 3: Try sending message to your own number
        console.log('\n3. Testing message to your own number...');
        const testNumber = '923363448803'; // Your number
        const testMessage = `Test outgoing message at ${new Date().toISOString()}`;
        
        console.log(`📱 Sending to: ${testNumber}`);
        console.log(`📝 Message: ${testMessage}`);
        
        const sendResponse = await makeRequest('POST', `/api/whatsapp/send-message?token=${token}`, {
            number: testNumber,
            message: testMessage
        });
        
        console.log('\n📤 Send Response:');
        console.log('Status Code:', sendResponse.status);
        console.log('Response:', JSON.stringify(sendResponse.data, null, 2));
        
        if (sendResponse.data.status === 'success') {
            console.log('\n✅ API says message sent successfully');
            console.log('🔍 Now check your phone to see if message actually arrived');
            console.log('⏰ Wait 10-15 seconds for delivery...');
        } else {
            console.log('\n❌ API returned error');
        }
        
        // Step 4: Try with different number format
        console.log('\n4. Testing with different number format...');
        const altNumber = '+923363448803'; // With + prefix
        const altMessage = `Alternative format test at ${new Date().toISOString()}`;
        
        const altResponse = await makeRequest('POST', `/api/whatsapp/send-message?token=${token}`, {
            number: altNumber,
            message: altMessage
        });
        
        console.log('📱 Alternative format response:', JSON.stringify(altResponse.data, null, 2));
        
        // Step 5: Test bulk sending
        console.log('\n5. Testing bulk send...');
        const bulkResponse = await makeRequest('POST', `/api/whatsapp/send-bulk?token=${token}`, {
            numbers: [testNumber],
            message: `Bulk test message at ${new Date().toISOString()}`
        });
        
        console.log('📦 Bulk send response:', JSON.stringify(bulkResponse.data, null, 2));
        
    } catch (error) {
        console.error('❌ Error in test:', error.message);
    }
}

testOutgoingMessages(); 