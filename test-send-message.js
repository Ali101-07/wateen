const axios = require('axios');

// Test configuration
const API_BASE_URL = 'http://localhost:5000';
const TEST_TOKEN = 'your-test-token-here'; // Replace with actual token

// Test functions
async function testSendMessage() {
    console.log('🧪 Testing Send Message Functionality...\n');

    try {
        // Test 1: Check WhatsApp status
        console.log('1️⃣ Checking WhatsApp status...');
        const statusResponse = await axios.get(`${API_BASE_URL}/api/whatsapp/status`, {
            headers: {
                'Authorization': `Bearer ${TEST_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ WhatsApp Status:', statusResponse.data);
        
        if (!statusResponse.data.data.isReady) {
            console.log('⚠️ WhatsApp is not ready. Please authenticate first.');
            return;
        }

        // Test 2: Check if test number is registered
        console.log('\n2️⃣ Testing number validation...');
        const testNumber = '+1234567890'; // Replace with actual test number
        
        const numberCheckResponse = await axios.post(`${API_BASE_URL}/api/whatsapp/check-number`, {
            number: testNumber
        }, {
            headers: {
                'Authorization': `Bearer ${TEST_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Number check result:', numberCheckResponse.data);

        // Test 3: Send individual message
        console.log('\n3️⃣ Testing individual message sending...');
        const individualMessageResponse = await axios.post(`${API_BASE_URL}/api/whatsapp/send-message`, {
            number: testNumber,
            message: 'Test message from Watify API'
        }, {
            headers: {
                'Authorization': `Bearer ${TEST_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Individual message result:', individualMessageResponse.data);

        // Test 4: Fetch groups
        console.log('\n4️⃣ Testing group fetching...');
        const groupsResponse = await axios.get(`${API_BASE_URL}/api/whatsapp-groups`, {
            headers: {
                'Authorization': `Bearer ${TEST_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Groups fetched:', groupsResponse.data);
        
        if (groupsResponse.data.data && groupsResponse.data.data.length > 0) {
            const testGroup = groupsResponse.data.data[0];
            
            // Test 5: Send group message
            console.log('\n5️⃣ Testing group message sending...');
            const groupMessageResponse = await axios.post(`${API_BASE_URL}/api/whatsapp/send-to-group`, {
                groupId: testGroup.id,
                message: 'Test group message from Watify API'
            }, {
                headers: {
                    'Authorization': `Bearer ${TEST_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('✅ Group message result:', groupMessageResponse.data);
        } else {
            console.log('⚠️ No groups available for testing');
        }

        console.log('\n🎉 All tests completed successfully!');

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
        
        if (error.response?.status === 401) {
            console.log('💡 Please update the TEST_TOKEN with a valid authentication token');
        } else if (error.response?.status === 503) {
            console.log('💡 WhatsApp client is not ready. Please authenticate by scanning QR code');
        }
    }
}

// Frontend integration test
async function testFrontendIntegration() {
    console.log('\n🖥️ Testing Frontend Integration...\n');

    const testCases = [
        {
            name: 'Individual Message',
            endpoint: '/api/whatsapp/send-message',
            data: {
                number: '+1234567890',
                message: 'Test individual message'
            }
        },
        {
            name: 'Bulk Message',
            endpoint: '/api/whatsapp/send-bulk',
            data: {
                numbers: ['+1234567890', '+0987654321'],
                message: 'Test bulk message'
            }
        }
    ];

    for (const testCase of testCases) {
        try {
            console.log(`📤 Testing ${testCase.name}...`);
            
            const response = await axios.post(`${API_BASE_URL}${testCase.endpoint}`, testCase.data, {
                headers: {
                    'Authorization': `Bearer ${TEST_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log(`✅ ${testCase.name} test passed:`, response.data.message);
            
        } catch (error) {
            console.error(`❌ ${testCase.name} test failed:`, error.response?.data?.message || error.message);
        }
    }
}

// API endpoint test
async function testAPIEndpoints() {
    console.log('\n🔗 Testing API Endpoints...\n');

    const endpoints = [
        { method: 'GET', path: '/api/whatsapp/status', description: 'WhatsApp Status' },
        { method: 'GET', path: '/api/whatsapp/health', description: 'Health Check' },
        { method: 'GET', path: '/api/whatsapp/chats', description: 'WhatsApp Chats' },
        { method: 'GET', path: '/api/whatsapp-groups', description: 'WhatsApp Groups' }
    ];

    for (const endpoint of endpoints) {
        try {
            console.log(`🔍 Testing ${endpoint.description}...`);
            
            const response = await axios({
                method: endpoint.method.toLowerCase(),
                url: `${API_BASE_URL}${endpoint.path}`,
                headers: {
                    'Authorization': `Bearer ${TEST_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log(`✅ ${endpoint.description}: OK`);
            
        } catch (error) {
            console.error(`❌ ${endpoint.description}: ${error.response?.status || 'ERROR'} - ${error.response?.data?.message || error.message}`);
        }
    }
}

// Main execution
async function runTests() {
    console.log('🚀 Starting Send Message Functionality Tests\n');
    console.log('=' .repeat(50));
    
    // Check if server is running
    try {
        const healthResponse = await axios.get(`${API_BASE_URL}/health`);
        console.log('✅ Server is running:', healthResponse.data);
    } catch (error) {
        console.error('❌ Server is not running. Please start the server first.');
        process.exit(1);
    }

    // Run test suites
    await testAPIEndpoints();
    await testSendMessage();
    await testFrontendIntegration();
    
    console.log('\n' + '=' .repeat(50));
    console.log('🏁 Test execution completed!');
    console.log('\n💡 Instructions:');
    console.log('1. Update TEST_TOKEN with a valid authentication token');
    console.log('2. Replace test phone numbers with actual numbers');
    console.log('3. Ensure WhatsApp client is authenticated');
    console.log('4. Create test groups if needed');
}

// Command line interface
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.includes('--help')) {
        console.log('\n🆘 Send Message Test Script - Usage:');
        console.log('');
        console.log('  node test-send-message.js              # Run all tests');
        console.log('  node test-send-message.js --endpoints  # Test API endpoints only');
        console.log('  node test-send-message.js --frontend   # Test frontend integration only');
        console.log('  node test-send-message.js --send       # Test send functionality only');
        console.log('  node test-send-message.js --help       # Show this help\n');
        
        console.log('Configuration:');
        console.log('  - Update TEST_TOKEN with your authentication token');
        console.log('  - Update API_BASE_URL if running on different port');
        console.log('  - Replace test phone numbers with real ones\n');
        process.exit(0);
    } else if (args.includes('--endpoints')) {
        testAPIEndpoints();
    } else if (args.includes('--frontend')) {
        testFrontendIntegration();
    } else if (args.includes('--send')) {
        testSendMessage();
    } else {
        runTests();
    }
}

module.exports = {
    testSendMessage,
    testFrontendIntegration,
    testAPIEndpoints
}; 