# WhatsApp Client Setup Guide

## Overview

This guide helps you set up and configure the WhatsApp client for the Watify application with enhanced session management and comprehensive event handlers.

## Features

✅ **Enhanced Session Management**
- Automatic session persistence
- Smart reconnection logic
- Session cleanup utilities

✅ **Comprehensive Event Handlers**
- QR code generation and management
- Connection state monitoring
- Incoming message handling
- Group event tracking
- Error handling and recovery

✅ **Advanced Configuration**
- Puppeteer optimization
- Rate limiting protection
- Auto-retry mechanisms
- Health monitoring

✅ **Production Ready**
- Graceful shutdown handling
- Resource cleanup
- Performance monitoring
- Detailed logging

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Check System Requirements

```bash
npm run whatsapp:check
```

### 3. Initialize WhatsApp Client

```bash
npm run whatsapp:init
```

### 4. Test Setup

```bash
npm run test:whatsapp
```

## Configuration

### Environment Variables

Create a `.env` file with the following WhatsApp-specific settings:

```env
# WhatsApp Configuration
WHATSAPP_SESSION_DIR=.wwebjs_auth
WHATSAPP_CLIENT_ID=watify-client
WHATSAPP_AUTH_TIMEOUT=60000
WHATSAPP_QR_MAX_RETRIES=5
WHATSAPP_MAX_RECONNECT_ATTEMPTS=3

# Puppeteer Configuration
WHATSAPP_HEADLESS=true
WHATSAPP_TIMEOUT=60000

# Messaging Configuration
MESSAGE_RATE_LIMIT_DELAY=1000
BULK_MESSAGE_MAX_BATCH=50
AUTO_RECONNECT_ENABLED=true
```

### Client Configuration

The WhatsApp client is configured with:

- **LocalAuth Strategy**: Persistent session storage
- **Enhanced Puppeteer Settings**: Optimized for server environments
- **Auto-Reconnection**: Automatic recovery from disconnections
- **Rate Limiting**: Protection against API limits
- **Comprehensive Logging**: Detailed event tracking

## Usage

### Basic Initialization

```javascript
const { initializeWhatsApp, getClientHealth } = require('./backend/config/whatsapp');
const whatsappService = require('./backend/services/whatsappService');

// Initialize client
await initializeWhatsApp();

// Check health
const health = getClientHealth();
console.log('Client ready:', health.isReady);
```

### Sending Messages

```javascript
// Send single message
const result = await whatsappService.sendMessage('1234567890', 'Hello World!');

// Send bulk messages
const numbers = ['1234567890', '0987654321'];
const results = await whatsappService.sendBulkMessages(numbers, 'Bulk message');

// Send media message
const media = MessageMedia.fromFilePath('./image.jpg');
await whatsappService.sendMediaMessage('1234567890', media, 'Image caption');
```

### Handling Events

```javascript
const { client } = require('./backend/config/whatsapp');

// Listen for incoming messages
client.on('incoming_message', async (message) => {
    console.log('New message:', message.body);
    // Handle incoming message
});

// Listen for connection events
client.on('client_ready', (info) => {
    console.log('WhatsApp connected:', info.pushname);
});

client.on('qr_ready', (qr) => {
    console.log('Scan QR code to authenticate');
});
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run whatsapp:init` | Full WhatsApp client initialization with monitoring |
| `npm run whatsapp:check` | Check system requirements and configuration |
| `npm run whatsapp:clean` | Clean session data (requires re-authentication) |
| `npm run test:whatsapp` | Test WhatsApp client setup and functionality |

## API Endpoints

The application provides several WhatsApp-related API endpoints:

### Authentication
- `GET /api/whatsapp/status` - Get connection status
- `GET /api/whatsapp/qr` - Get QR code for authentication
- `POST /api/whatsapp/restart` - Restart WhatsApp client

### Messaging
- `POST /api/whatsapp/send-message` - Send single message
- `POST /api/whatsapp/send-bulk` - Send bulk messages
- `POST /api/whatsapp/check-number` - Check if number is on WhatsApp

## Troubleshooting

### Common Issues

#### 1. QR Code Not Appearing
```bash
# Check system requirements
npm run whatsapp:check

# Clean session and try again
npm run whatsapp:clean
npm run whatsapp:init
```

#### 2. Authentication Failures
```bash
# Clear session data
npm run whatsapp:clean

# Check Chrome/Chromium installation
which google-chrome
which chromium-browser
```

#### 3. Connection Timeouts
- Ensure stable internet connection
- Check firewall settings
- Verify no other WhatsApp Web sessions are active

#### 4. Session Directory Issues
```bash
# Check permissions
ls -la .wwebjs_auth/

# Recreate directory
rm -rf .wwebjs_auth
mkdir .wwebjs_auth
chmod 755 .wwebjs_auth
```

### Debug Mode

Enable debug logging by setting environment variables:

```env
DEBUG=whatsapp-web.js:*
LOG_LEVEL=debug
LOG_WHATSAPP_MESSAGES=true
```

### Performance Optimization

For production environments:

1. **Memory Management**
   ```javascript
   // Monitor memory usage
   const usage = process.memoryUsage();
   console.log('Memory usage:', usage.heapUsed / 1024 / 1024, 'MB');
   ```

2. **Connection Pooling**
   - Use single client instance
   - Implement proper session management
   - Configure auto-reconnection

3. **Rate Limiting**
   - Respect WhatsApp's rate limits
   - Implement message queuing
   - Add delays between bulk messages

## Security Considerations

### Session Security
- Store session files securely
- Use proper file permissions
- Implement session encryption in production

### API Security
- Validate all inputs
- Implement rate limiting
- Use authentication for API endpoints
- Log all message activities

### Network Security
- Use HTTPS in production
- Implement proper CORS policies
- Monitor for suspicious activities

## Monitoring and Maintenance

### Health Checks

```javascript
// Get comprehensive health status
const health = getClientHealth();
console.log({
    isReady: health.isReady,
    isAuthenticated: health.isAuthenticated,
    state: health.state,
    lastSeen: health.lastSeen,
    connectionAttempts: health.connectionAttempts
});
```

### Log Monitoring

Monitor these log patterns:
- `✅ WhatsApp client is ready` - Successful connection
- `📱 QR Code generated` - Authentication needed
- `❌ Authentication failed` - Auth issues
- `🔄 Attempting to restart` - Recovery attempts

### Maintenance Tasks

1. **Regular Session Cleanup**
   - Clean old session files weekly
   - Monitor session directory size
   - Backup important sessions

2. **Performance Monitoring**
   - Track memory usage
   - Monitor response times
   - Log error rates

3. **Updates**
   - Keep whatsapp-web.js updated
   - Monitor for breaking changes
   - Test updates in staging

## Support

For additional support:

1. Check the [whatsapp-web.js documentation](https://wwebjs.dev/)
2. Review application logs for error details
3. Use the built-in diagnostic tools
4. Consult the troubleshooting section above

## Advanced Configuration

### Custom Event Handlers

```javascript
const { client } = require('./backend/config/whatsapp');

// Custom message handler
client.on('message_received', async (data) => {
    const { message, contact } = data;
    
    // Implement custom logic
    if (message.body.toLowerCase().includes('help')) {
        await client.sendMessage(message.from, 'How can I help you?');
    }
});

// Group event handlers
client.on('group_member_added', (notification) => {
    console.log('New member joined:', notification);
});
```

### Webhook Integration

```javascript
// Set up webhooks for external systems
client.on('incoming_message', async (message) => {
    // Send to webhook
    await fetch('https://your-webhook.com/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            from: message.from,
            body: message.body,
            timestamp: message.timestamp
        })
    });
});
```

---

**Note**: This setup is designed for the Watify application and includes enhanced features for production use. Always test thoroughly before deploying to production. 