const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

const testStep = async (description, testFn) => {
  console.log(`\n🧪 ${description}`);
  try {
    const result = await testFn();
    console.log('✅ Success:', result);
    return result;
  } catch (error) {
    console.log('❌ Failed:', error.response?.data || error.message);
    return null;
  }
};

const main = async () => {
  console.log('🚀 Simple API Test\n');

  // Step 1: Test login
  const loginResult = await testStep('Testing login', async () => {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'alihassan.iqbal101@gmail.com',
      password: 'ah2003ah'
    });
    return {
      success: response.data.success,
      hasToken: !!response.data.token,
      tokenLength: response.data.token?.length,
      tokenStart: response.data.token?.substring(0, 20)
    };
  });

  if (!loginResult || !loginResult.success) {
    console.log('❌ Cannot proceed without login');
    return;
  }

  // Get the token for next tests
  const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
    email: 'alihassan.iqbal101@gmail.com',
    password: 'ah2003ah'
  });
  const token = loginResponse.data.token;

  // Step 2: Test WhatsApp status
  await testStep('Testing WhatsApp status with auth', async () => {
    const response = await axios.get(`${BASE_URL}/api/whatsapp/status`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return {
      status: response.data.status,
      hasData: !!response.data.data,
      isReady: response.data.data?.isReady
    };
  });

  // Step 3: Test group fetching
  await testStep('Testing WhatsApp groups fetch', async () => {
    const response = await axios.get(`${BASE_URL}/api/whatsapp-groups`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return {
      success: response.data.success,
      dataType: typeof response.data.data,
      isArray: Array.isArray(response.data.data),
      count: response.data.data?.length || 0
    };
  });

  // Step 4: Test group options
  await testStep('Testing WhatsApp group options', async () => {
    const response = await axios.get(`${BASE_URL}/api/whatsapp-groups/options`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return {
      success: response.data.success,
      dataType: typeof response.data.data,
      isArray: Array.isArray(response.data.data),
      count: response.data.data?.length || 0
    };
  });

  console.log('\n🏁 Test completed!');
};

main().catch(console.error); 