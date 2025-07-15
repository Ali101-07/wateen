// Direct WhatsApp QR Fix Script
const path = require('path');

async function fixWhatsAppQR() {
    console.log('🔧 Starting WhatsApp QR Fix...\n');
    
    try {
        // Import the WhatsApp config
        const whatsappConfig = require('./backend/config/whatsapp');
        
        console.log('1. Getting current client state...');
        const health = whatsappConfig.getClientHealth();
        console.log('Current state:', JSON.stringify(health, null, 2));
        
        console.log('\n2. Attempting to restart WhatsApp client...');
        await whatsappConfig.restartClient();
        
        console.log('\n3. Waiting for client to initialize...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        console.log('\n4. Checking new state...');
        const newHealth = whatsappConfig.getClientHealth();
        console.log('New state:', JSON.stringify(newHealth, null, 2));
        
        console.log('\n✅ WhatsApp QR fix complete!');
        console.log('Now try refreshing your browser and the QR code should appear.');
        
    } catch (error) {
        console.error('❌ Error fixing WhatsApp QR:', error.message);
        console.log('\n🔄 Trying alternative approach...');
        
        try {
            // Alternative: Clear session and restart
            const fs = require('fs');
            const sessionPath = path.join(__dirname, 'backend', '.wwebjs_auth');
            
            if (fs.existsSync(sessionPath)) {
                console.log('Clearing session directory...');
                fs.rmSync(sessionPath, { recursive: true, force: true });
            }
            
            console.log('Session cleared. Please restart the backend server.');
            console.log('Run: cd backend && node server.js');
            
        } catch (altError) {
            console.error('❌ Alternative fix failed:', altError.message);
        }
    }
}

// Run the fix
fixWhatsAppQR().catch(console.error); 