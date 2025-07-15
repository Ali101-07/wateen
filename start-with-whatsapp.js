const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const QRCode = require('qrcode'); // For generating QR code images
const path = require('path');
const { Pool } = require('pg');

// Load environment variables
dotenv.config();

console.log('🚀 Starting Wateen Watify with Integrated WhatsApp...');

// Set default environment variables
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'watify_super_secret_jwt_key_2024_change_in_production_very_secure_token';
}

const app = express();
const PORT = process.env.PORT || 5000;

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'wateen_watify',
  user: process.env.DB_USER || 'postgres',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

if (process.env.DB_PASSWORD && process.env.DB_PASSWORD.trim() !== '') {
  dbConfig.password = process.env.DB_PASSWORD;
}

const pool = new Pool(dbConfig);

// Database helper function
const query = async (text, params) => {
  try {
    const res = await pool.query(text, params);
    return res;
  } catch (error) {
    console.error('❌ Database query error:', error);
    throw error;
  }
};

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      status: 'error',
      message: 'Access token required',
      error: 'No token provided'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user exists and is active
    const userResult = await query(
      'SELECT id, email, name, role FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ 
        status: 'error',
        message: 'Invalid token',
        error: 'User not found'
      });
    }

    req.user = {
      id: decoded.userId,
      email: decoded.email,
      name: userResult.rows[0].name,
      role: userResult.rows[0].role
    };
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        status: 'error',
        message: 'Token expired',
        error: 'Please login again'
      });
    }
    
    return res.status(403).json({ 
      status: 'error',
      message: 'Invalid token',
      error: 'Token verification failed'
    });
  }
};

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global WhatsApp client state
let whatsappClient = null;
let isWhatsAppReady = false;
let clientInfo = null;
let qrCodeGenerated = false;
let qrCodeData = null; // Store the actual QR code data for image generation

// Create WhatsApp client
function createWhatsAppClient() {
    return new Client({
        authStrategy: new LocalAuth({
            clientId: 'watify-client',
            dataPath: path.join(__dirname, '.wwebjs_auth')
        }),
        puppeteer: {
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--disable-extensions'
            ]
        }
    });
}

// Send message with retry logic
async function sendWhatsAppMessage(number, message, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            if (!isWhatsAppReady) {
                throw new Error('WhatsApp client is not ready');
            }

            // Format the number
            let chatId = number;
            if (!number.includes('@')) {
                chatId = `${number.replace(/[^\d]/g, '')}@c.us`;
            }

            console.log(`📤 Attempt ${attempt}: Sending message to ${chatId}: ${message.substring(0, 50)}...`);
            
            const result = await whatsappClient.sendMessage(chatId, message);
            
            if (!result || !result.id) {
                throw new Error('Failed to send message - no response received');
            }
            
            console.log(`✅ Message sent successfully! ID: ${result.id._serialized}`);
            
            return {
                success: true,
                messageId: result.id._serialized,
                to: number,
                message: message,
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            console.error(`❌ Attempt ${attempt} failed:`, error.message);
            
            if (attempt === retries) {
                throw error;
            }
            
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
    }
}

// Send bulk messages with delay
async function sendBulkMessages(numbers, message, options = {}) {
    const { delay = 2000 } = options;
    const results = [];
    
    console.log(`📤 Starting bulk message send to ${numbers.length} numbers...`);
    
    for (let i = 0; i < numbers.length; i++) {
        const number = numbers[i];
        
        try {
            console.log(`📤 Sending message ${i + 1}/${numbers.length} to ${number}...`);
            
            const result = await sendWhatsAppMessage(number, message);
            results.push({ 
                number, 
                success: true, 
                result,
                index: i 
            });
            
            console.log(`✅ Bulk message ${i + 1}/${numbers.length} sent to ${number}`);
            
        } catch (error) {
            console.error(`❌ Failed to send to ${number}:`, error.message);
            results.push({ 
                number, 
                success: false, 
                error: error.message,
                index: i 
            });
        }
        
        // Add delay between messages (except for the last one)
        if (i < numbers.length - 1) {
            console.log(`⏳ Waiting ${delay}ms before next message...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    return {
        total: numbers.length,
        successful,
        failed,
        results
    };
}

// Initialize WhatsApp
async function initializeWhatsApp() {
    try {
        console.log('📱 Initializing WhatsApp client...');
        
        whatsappClient = createWhatsAppClient();
        
        // QR Code event
        whatsappClient.on('qr', (qr) => {
            console.log('\n📱 QR CODE - Scan with WhatsApp:');
            console.log('═'.repeat(50));
            qrcode.generate(qr, { small: true });
            console.log('═'.repeat(50));
            console.log('Scan this QR code with your WhatsApp to authenticate');
            qrCodeGenerated = true;
            qrCodeData = qr; // Store QR data for web endpoint
        });
        
        // Ready event
        whatsappClient.on('ready', () => {
            console.log('✅ WhatsApp client is ready!');
            isWhatsAppReady = true;
            qrCodeGenerated = false;
            qrCodeData = null; // Clear QR data when authenticated
            clientInfo = whatsappClient.info;
            console.log(`📱 Connected as: ${clientInfo.pushname} (${clientInfo.wid.user})`);
        });
        
        // Authentication events
        whatsappClient.on('authenticated', () => {
            console.log('🔐 WhatsApp authenticated successfully');
        });
        
        whatsappClient.on('auth_failure', (msg) => {
            console.error('❌ WhatsApp authentication failed:', msg);
            isWhatsAppReady = false;
            qrCodeGenerated = false;
            qrCodeData = null; // Clear QR data on auth failure
        });
        
        // Message events
        whatsappClient.on('message', (message) => {
            if (!message.fromMe) {
                console.log(`📩 Received: "${message.body}" from ${message.from}`);
            }
        });
        
        whatsappClient.on('disconnected', (reason) => {
            console.log('🔌 WhatsApp disconnected:', reason);
            isWhatsAppReady = false;
            qrCodeGenerated = false;
            qrCodeData = null; // Clear QR data on disconnect
        });
        
        await whatsappClient.initialize();
        
    } catch (error) {
        console.error('❌ WhatsApp initialization error:', error);
    }
}

// Routes
app.get('/', (req, res) => {
    res.json({ 
        message: 'Welcome to Wateen Watify API',
        whatsappStatus: isWhatsAppReady ? 'Connected' : 'Disconnected',
        timestamp: new Date().toISOString()
    });
});

app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK',
        whatsapp: isWhatsAppReady ? 'Ready' : 'Not Ready',
        hasQR: qrCodeGenerated,
        timestamp: new Date().toISOString()
    });
});

// WhatsApp API endpoints
app.get('/api/whatsapp/status', authenticateToken, (req, res) => {
    res.json({
        status: 'success',
        data: {
            isReady: isWhatsAppReady,
            isAuthenticated: isWhatsAppReady,
            clientInfo: clientInfo,
            hasQR: qrCodeGenerated
        }
    });
});

// QR Code endpoint for web interface
app.get('/api/whatsapp/qr', authenticateToken, async (req, res) => {
    try {
        console.log('📱 QR code requested by web interface');
        
        if (!qrCodeData) {
            return res.status(404).json({
                status: 'error',
                message: 'No QR code available. WhatsApp may already be authenticated or client not initialized.',
                data: { 
                    hasQR: false,
                    isReady: isWhatsAppReady 
                }
            });
        }

        // Generate QR code as base64 data URL
        const qrCodeImage = await QRCode.toDataURL(qrCodeData, {
            type: 'image/png',
            quality: 0.92,
            margin: 1,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            },
            width: 256
        });

        console.log('✅ QR code image generated for web interface');

        res.json({
            status: 'success',
            message: 'QR code generated successfully',
            data: {
                qr: qrCodeImage,
                hasQR: true,
                isReady: isWhatsAppReady
            }
        });

    } catch (error) {
        console.error('❌ Error generating QR code image:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to generate QR code image',
            error: error.message
        });
    }
});

app.post('/api/whatsapp/send-message', authenticateToken, async (req, res) => {
    try {
        console.log('📨 Received send-message request:', {
            user: req.user.name,
            body: req.body
        });

        if (!isWhatsAppReady) {
            return res.status(503).json({
                status: 'error',
                message: 'WhatsApp client is not ready. Please authenticate first.',
                data: { 
                    isReady: isWhatsAppReady,
                    hasQR: qrCodeGenerated 
                }
            });
        }
        
        const { number, message } = req.body;
        
        if (!number || !message) {
            return res.status(400).json({
                status: 'error',
                message: 'Number and message are required',
                error: 'Missing required fields'
            });
        }
        
        const result = await sendWhatsAppMessage(number, message);
        
        res.json({
            status: 'success',
            message: 'Message sent successfully',
            data: result
        });
        
    } catch (error) {
        console.error('❌ Send message error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to send message',
            error: error.message
        });
    }
});

app.post('/api/whatsapp/send-bulk', authenticateToken, async (req, res) => {
    try {
        console.log('📨 Received send-bulk request:', {
            user: req.user.name,
            numbersCount: req.body.numbers?.length || 0
        });

        if (!isWhatsAppReady) {
            return res.status(503).json({
                status: 'error',
                message: 'WhatsApp client is not ready'
            });
        }
        
        const { numbers, message, options = {} } = req.body;
        
        if (!numbers || !Array.isArray(numbers) || !message) {
            return res.status(400).json({
                status: 'error',
                message: 'Numbers array and message are required'
            });
        }

        if (numbers.length === 0) {
            return res.status(400).json({
                status: 'error',
                message: 'At least one number is required'
            });
        }
        
        const results = await sendBulkMessages(numbers, message, options);
        
        res.json({
            status: 'success',
            message: `Bulk messages processed: ${results.successful} successful, ${results.failed} failed`,
            data: results
        });
        
    } catch (error) {
        console.error('❌ Send bulk error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to send bulk messages',
            error: error.message
        });
    }
});

app.post('/api/whatsapp/send-to-group', authenticateToken, async (req, res) => {
    try {
        console.log('📨 Received send-to-group request:', {
            user: req.user.name,
            groupId: req.body.groupId
        });

        if (!isWhatsAppReady) {
            return res.status(503).json({
                status: 'error',
                message: 'WhatsApp client is not ready'
            });
        }
        
        const { groupId, message, groupType = 'whatsapp' } = req.body;
        
        if (!groupId || !message) {
            return res.status(400).json({
                status: 'error',
                message: 'Group ID and message are required'
            });
        }
        
        // Get group members from database
        let membersQuery;
        if (groupType === 'whatsapp') {
            membersQuery = `
                SELECT phone_number 
                FROM whatsapp_group_members 
                WHERE group_id = $1 AND status = 'active'
            `;
        } else {
            membersQuery = `
                SELECT phone_number 
                FROM group_members 
                WHERE group_id = $1 AND status = 'active'
            `;
        }
        
        const membersResult = await query(membersQuery, [groupId]);
        
        if (membersResult.rows.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'No active members found in the selected group'
            });
        }
        
        const numbers = membersResult.rows
            .map(row => row.phone_number)
            .filter(phone => phone && phone.trim() !== '');
        
        if (numbers.length === 0) {
            return res.status(400).json({
                status: 'error',
                message: 'No valid phone numbers found in group members'
            });
        }
        
        const results = await sendBulkMessages(numbers, message, { delay: 2000 });
        
        res.json({
            status: 'success',
            message: `Group message sent: ${results.successful} successful, ${results.failed} failed`,
            data: {
                groupId,
                groupType,
                totalMembers: membersResult.rows.length,
                validNumbers: numbers.length,
                ...results
            }
        });
        
    } catch (error) {
        console.error('❌ Send group message error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to send group message',
            error: error.message
        });
    }
});

// Import auth routes
try {
    app.use('/api/auth', require('./backend/routes/auth'));
    console.log('✅ Auth routes loaded');
} catch (error) {
    console.log('⚠️  Auth routes not available:', error.message);
}

// Import other essential routes with error handling
try {
    app.use('/api/whatsapp-groups', authenticateToken, require('./backend/routes/whatsappGroups'));
    console.log('✅ WhatsApp Groups routes loaded');
} catch (error) {
    console.log('⚠️  WhatsApp Groups routes not available:', error.message);
}

try {
    app.use('/api/groups', authenticateToken, require('./backend/routes/groups'));
    console.log('✅ Groups routes loaded');
} catch (error) {
    console.log('⚠️  Groups routes not available:', error.message);
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('💥 Unhandled error:', err);
    res.status(500).json({ 
        status: 'error',
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ 
        status: 'error',
        message: 'Route not found' 
    });
});

// Start server
async function startServer() {
    try {
        // Test database connection
        await query('SELECT NOW()');
        console.log('✅ Database connected successfully');
        
        // Start the HTTP server
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`🌐 API: http://localhost:${PORT}`);
            console.log(`📊 Health: http://localhost:${PORT}/health`);
        });
        
        // Initialize WhatsApp after server starts
        console.log('⏳ Starting WhatsApp initialization...');
        await initializeWhatsApp();
        
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down gracefully...');
    if (whatsappClient) {
        whatsappClient.destroy();
    }
    if (pool) {
        pool.end();
    }
    process.exit(0);
});

// Start the application
startServer(); 