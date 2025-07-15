console.log('🔧 Fixing WhatsApp Sending Issue...\n');

// The issue is likely in the WhatsApp service state management
// Let's create a direct fix

const fs = require('fs');
const path = require('path');

// Read the current WhatsApp service file
const servicePath = path.join(__dirname, 'backend', 'services', 'whatsappService.js');

try {
    let serviceContent = fs.readFileSync(servicePath, 'utf8');
    
    console.log('1. Backing up original service...');
    fs.writeFileSync(servicePath + '.backup', serviceContent);
    
    console.log('2. Applying fix for message sending...');
    
    // Fix 1: Update the sendMessage function to bypass isReady check temporarily
    const fixedSendMessage = `
    async sendMessage(number, message, options = {}) {
        return await this.executeWithRetry(async () => {
            console.log(\`🔍 [DEBUG] Attempting to send message to \${number}\`);
            console.log(\`🔍 [DEBUG] Message: \${message}\`);
            
            // Force check client state
            try {
                const clientInfo = await client.getState();
                console.log(\`🔍 [DEBUG] Client state: \${clientInfo}\`);
            } catch (e) {
                console.log(\`⚠️ [DEBUG] Could not get client state: \${e.message}\`);
            }

            // Ensure number is in correct format (remove any spaces or special characters)
            const sanitizedNumber = number.replace(/[^\\d]/g, '');
            const chatId = \`\${sanitizedNumber}@c.us\`;
            
            console.log(\`🔍 [DEBUG] Sanitized number: \${sanitizedNumber}\`);
            console.log(\`🔍 [DEBUG] Chat ID: \${chatId}\`);
            
            try {
                // Try to send message directly without too many checks
                console.log(\`📤 [DEBUG] Sending message via client...\`);
                const response = await client.sendMessage(chatId, message, options);
                
                console.log(\`📤 [DEBUG] Raw response:\`, response);
                
                if (response && response.id) {
                    console.log(\`✅ Message successfully sent to \${number}\`);
                    console.log(\`📧 Message ID: \${response.id._serialized}\`);
                    
                    return {
                        success: true,
                        messageId: response.id._serialized,
                        timestamp: response.timestamp,
                        to: number,
                        body: message,
                        chatId: chatId
                    };
                } else {
                    console.log(\`❌ Invalid response from WhatsApp client\`);
                    throw new Error('Invalid response from WhatsApp client');
                }
                
            } catch (sendError) {
                console.error(\`❌ [ERROR] Send failed: \${sendError.message}\`);
                
                // Try alternative chat ID format
                console.log(\`🔄 [DEBUG] Trying alternative format...\`);
                const altChatId = \`\${sanitizedNumber}@s.whatsapp.net\`;
                
                try {
                    const altResponse = await client.sendMessage(altChatId, message, options);
                    if (altResponse && altResponse.id) {
                        console.log(\`✅ Message sent with alternative format\`);
                        return {
                            success: true,
                            messageId: altResponse.id._serialized,
                            timestamp: altResponse.timestamp,
                            to: number,
                            body: message,
                            chatId: altChatId
                        };
                    }
                } catch (altError) {
                    console.error(\`❌ Alternative format also failed: \${altError.message}\`);
                }
                
                throw new Error(\`Failed to send message: \${sendError.message}\`);
            }
            
        }, 3, \`sendMessage to \${number}\`);
    }`;
    
    // Replace the sendMessage function
    const sendMessageRegex = /async sendMessage\([^}]+\{[\s\S]*?\n    \}/;
    
    if (sendMessageRegex.test(serviceContent)) {
        serviceContent = serviceContent.replace(sendMessageRegex, fixedSendMessage.trim());
        fs.writeFileSync(servicePath, serviceContent);
        console.log('✅ WhatsApp service patched successfully');
    } else {
        console.log('❌ Could not find sendMessage function to patch');
    }
    
    console.log('\n3. Fix applied! Now restart the backend server:');
    console.log('   1. Stop the current backend (Ctrl+C)');
    console.log('   2. Run: cd backend && node server.js');
    console.log('   3. Try sending messages again');
    
} catch (error) {
    console.error('❌ Fix failed:', error.message);
} 