// Debug WhatsApp State Script
console.log('🔍 Debugging WhatsApp State...\n');

try {
    // Import the WhatsApp service
    const whatsappService = require('./backend/services/whatsappService');
    const { getClientHealth } = require('./backend/config/whatsapp');
    
    console.log('1. Checking WhatsApp Service State...');
    const state = whatsappService.getState();
    console.log('Service State:', JSON.stringify(state, null, 2));
    
    console.log('\n2. Checking Client Health...');
    const health = getClientHealth();
    console.log('Client Health:', JSON.stringify(health, null, 2));
    
    console.log('\n3. Getting Service Stats...');
    const stats = whatsappService.getServiceStats();
    console.log('Service Stats:', JSON.stringify(stats, null, 2));
    
    console.log('\n4. Checking if client is ready for messaging...');
    if (!state.isReady) {
        console.log('❌ WhatsApp client is NOT ready for messaging');
        console.log('Reasons client might not be ready:');
        console.log('- QR code not scanned');
        console.log('- WhatsApp connection lost');
        console.log('- Client needs restart');
        
        if (state.hasQR) {
            console.log('📱 QR code is available - please scan it');
        }
    } else {
        console.log('✅ WhatsApp client IS ready for messaging');
        console.log('Client should be able to send messages');
    }
    
    console.log('\n5. Connection Analysis:');
    console.log('- Is Ready:', state.isReady || false);
    console.log('- Is Authenticated:', state.isAuthenticated || false);
    console.log('- Has QR Code:', state.hasQR || false);
    console.log('- Connection State:', state.state || 'unknown');
    
} catch (error) {
    console.error('❌ Error checking WhatsApp state:', error.message);
    console.log('\nThis suggests the WhatsApp service is not properly initialized.');
    console.log('Try restarting the backend server.');
} 