const http = require('http');

// Simple HTTP request function
function makeAuthenticatedRequest(path, data, token) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify(data);
        
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Content-Length': Buffer.byteLength(postData)
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

        req.write(postData);
        req.end();
    });
}

async function debugSendIssue() {
    console.log('🔍 Debugging WhatsApp Send Issue...\n');
    
    try {
        // Step 1: Get token
        console.log('1. Getting authentication token...');
        const loginData = {
            email: 'alihassan.iqbal101@gmail.com',
            password: 'ah2003ah'
        };
        
        const loginResponse = await new Promise((resolve, reject) => {
            const postData = JSON.stringify(loginData);
            const options = {
                hostname: 'localhost',
                port: 5000,
                path: '/api/auth/login',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(postData)
                }
            };
            
            const req = http.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    try {
                        resolve({ status: res.statusCode, data: JSON.parse(data) });
                    } catch (e) {
                        resolve({ status: res.statusCode, data: data });
                    }
                });
            });
            
            req.on('error', reject);
            req.write(postData);
            req.end();
        });
        
        if (loginResponse.status !== 200) {
            console.error('❌ Login failed:', loginResponse);
            return;
        }
        
        const token = loginResponse.data.data.token;
        console.log('✅ Login successful');
        
        // Step 2: Test message sending with detailed logging
        console.log('\n2. Testing message send with debug...');
        console.log('📱 Sending to: 923363448803 (your number)');
        console.log('📝 Message: Test debug message');
        
        const messageData = {
            number: '923363448803',
            message: `DEBUG TEST: ${new Date().toISOString()}`
        };
        
        const sendResponse = await makeAuthenticatedRequest('/api/whatsapp/send-message', messageData, token);
        
        console.log('\n📤 Send Response:');
        console.log('Status Code:', sendResponse.status);
        console.log('Response Body:', JSON.stringify(sendResponse.data, null, 2));
        
        // Step 3: Check backend logs
        console.log('\n3. Analysis:');
        if (sendResponse.status === 200 && sendResponse.data.status === 'success') {
            console.log('✅ API reports success');
            console.log('🔍 Check your phone now for the message');
            console.log('🔍 Also check the backend terminal for debug logs');
            
            if (sendResponse.data.data.messageId) {
                console.log(`📧 Message ID: ${sendResponse.data.data.messageId}`);
            }
        } else {
            console.log('❌ API reports failure');
            console.log('Error details:', sendResponse.data);
        }
        
        console.log('\n📋 Next Steps:');
        console.log('1. Check your phone for the test message');
        console.log('2. Check the backend terminal for detailed debug logs');
        console.log('3. If message not received but API says success, there\'s a WhatsApp client issue');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

debugSendIssue(); 