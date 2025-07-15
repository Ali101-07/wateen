const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

// Test configuration
const testConfig = {
  // You'll need to get a valid token by logging in first
  token: null,
  testNumber: '+923125331072', // Replace with your test number
  testMessage: 'Test message from Watify API'
};

// Helper function to make authenticated requests
const apiRequest = async (method, endpoint, data = null) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Authorization': `Bearer ${testConfig.token}`,
        'Content-Type': 'application/json'
      }
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`❌ Error ${method} ${endpoint}:`, error.response?.data || error.message);
    throw error;
  }
};

// Test functions
const testLogin = async () => {
  console.log('🔐 Testing login...');
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'alihassan.iqbal101@gmail.com',
      password: 'ah2003ah'
    });

    if (response.data.success) {
      testConfig.token = response.data.token;
      console.log('✅ Login successful!');
      console.log('🔑 Token (first 50 chars):', testConfig.token?.substring(0, 50) + '...');
      return true;
    }
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
  }
  return false;
};

const testWhatsAppStatus = async () => {
  console.log('📱 Testing WhatsApp status...');
  try {
    const result = await apiRequest('GET', '/api/whatsapp/status');
    console.log('✅ WhatsApp Status:', result);
    return result;
  } catch (error) {
    console.error('❌ WhatsApp status check failed');
    return null;
  }
};

const testFetchGroups = async () => {
  console.log('📋 Testing group fetching...');
  
  try {
    console.log('  🔍 Fetching WhatsApp groups...');
    const whatsappGroups = await apiRequest('GET', '/api/whatsapp-groups');
    console.log('  ✅ WhatsApp groups:', {
      success: whatsappGroups.success,
      count: whatsappGroups.data?.length || 0,
      data: whatsappGroups.data?.slice(0, 2) // Show first 2 groups
    });

    console.log('  🔍 Fetching WhatsApp group options...');
    const groupOptions = await apiRequest('GET', '/api/whatsapp-groups/options');
    console.log('  ✅ Group options:', {
      success: groupOptions.success,
      count: groupOptions.data?.length || 0,
      data: groupOptions.data?.slice(0, 2) // Show first 2 options
    });

    return { whatsappGroups, groupOptions };
  } catch (error) {
    console.error('❌ Group fetching failed');
    return null;
  }
};

const testSendIndividualMessage = async () => {
  console.log('📤 Testing individual message sending...');
  
  try {
    const result = await apiRequest('POST', '/api/whatsapp/send-message', {
      number: testConfig.testNumber,
      message: testConfig.testMessage
    });
    
    console.log('✅ Individual message sent:', result);
    return result;
  } catch (error) {
    console.error('❌ Individual message sending failed');
    return null;
  }
};

const testSendGroupMessage = async (groupId) => {
  console.log('📤 Testing group message sending...');
  
  try {
    const result = await apiRequest('POST', '/api/whatsapp/send-to-group', {
      groupId: groupId,
      message: testConfig.testMessage,
      groupType: 'whatsapp'
    });
    
    console.log('✅ Group message sent:', result);
    return result;
  } catch (error) {
    console.error('❌ Group message sending failed');
    return null;
  }
};

// Main test function
const runTests = async () => {
  console.log('🚀 Starting Messaging API Tests\n');

  // 1. Test login
  const loginSuccess = await testLogin();
  if (!loginSuccess) {
    console.log('❌ Cannot proceed without login');
    return;
  }

  console.log('');

  // 2. Test WhatsApp status
  const whatsappStatus = await testWhatsAppStatus();
  console.log('');

  // 3. Test group fetching
  const groups = await testFetchGroups();
  console.log('');

  // 4. Test individual message (only if WhatsApp is ready)
  if (whatsappStatus?.data?.isReady) {
    await testSendIndividualMessage();
    console.log('');

    // 5. Test group message (if we have groups)
    if (groups?.whatsappGroups?.data?.length > 0) {
      const firstGroupId = groups.whatsappGroups.data[0].id;
      await testSendGroupMessage(firstGroupId);
    }
  } else {
    console.log('⚠️ WhatsApp not ready, skipping message tests');
  }

  console.log('\n🏁 Tests completed!');
};

// Run the tests
runTests().catch(console.error); 