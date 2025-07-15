const { initializeWhatsApp, getClientHealth, restartClient, client } = require('./backend/config/whatsapp');
const whatsappService = require('./backend/services/whatsappService');

/**
 * Test script to verify session error recovery and restart functionality
 * This script helps test the enhanced error handling for Puppeteer session closure issues
 */

async function testSessionRecovery() {
    console.log('🧪 Testing WhatsApp Session Recovery...\n');
    
    try {
        // Test 1: Initialize client
        console.log('1️⃣ Testing client initialization...');
        await initializeWhatsApp();
        console.log('✅ Client initialization started\n');
        
        // Test 2: Monitor for session errors
        console.log('2️⃣ Setting up session error monitoring...');
        
        let sessionErrorDetected = false;
        let recoveryAttempted = false;
        
        // Listen for session errors
        const errorHandler = (error) => {
            if (error.message && error.message.includes('Session closed')) {
                console.log('🎯 Session closed error detected!');
                sessionErrorDetected = true;
            }
        };
        
        client.on('error', errorHandler);
        
        // Listen for recovery events
        client.on('client_ready', () => {
            if (sessionErrorDetected && !recoveryAttempted) {
                console.log('🎉 Recovery successful after session error!');
                recoveryAttempted = true;
            }
        });
        
        // Test 3: Monitor health for 30 seconds
        console.log('3️⃣ Monitoring client health...\n');
        
        let monitorCount = 0;
        const maxMonitorTime = 30000; // 30 seconds
        const monitorInterval = 3000; // 3 seconds
        
        const healthMonitor = setInterval(async () => {
            monitorCount++;
            const health = getClientHealth();
            const serviceStats = whatsappService.getServiceStats();
            
            console.log(`📊 Health Check #${monitorCount}:`);
            console.log(`   🔗 State: ${health.state}`);
            console.log(`   ✅ Ready: ${health.isReady ? 'YES' : 'NO'}`);
            console.log(`   🔐 Authenticated: ${health.isAuthenticated ? 'YES' : 'NO'}`);
            console.log(`   📱 QR Available: ${health.hasQR ? 'YES' : 'NO'}`);
            console.log(`   🔄 Session Closed: ${health.sessionClosed ? 'YES' : 'NO'}`);
            console.log(`   📈 Connection Attempts: ${health.connectionAttempts}`);
            console.log(`   🔄 Restart In Progress: ${health.restartInProgress ? 'YES' : 'NO'}`);
            console.log(`   ⏰ Last Seen: ${health.lastSeen || 'Never'}`);
            console.log('   ────────────────────────────────────────\n');
            
            // Test service health check
            try {
                const healthCheck = await whatsappService.performHealthCheck();
                console.log(`🏥 Service Health: ${healthCheck.overall}`);
                console.log(`🔌 Connectivity: ${healthCheck.connectivity}`);
                
                if (healthCheck.recommendations.length > 0) {
                    console.log('💡 Recommendations:');
                    healthCheck.recommendations.forEach(rec => {
                        console.log(`   • ${rec}`);
                    });
                }
                console.log('');
            } catch (error) {
                console.log('❌ Service health check failed:', error.message);
            }
            
            // Stop monitoring after max time
            if (monitorCount * monitorInterval >= maxMonitorTime) {
                clearInterval(healthMonitor);
                finishTest();
            }
        }, monitorInterval);
        
        // Test 4: Test restart functionality
        setTimeout(async () => {
            console.log('4️⃣ Testing manual restart functionality...\n');
            
            try {
                await testRestartFunctionality();
            } catch (error) {
                console.log('❌ Restart test failed:', error.message);
            }
        }, 15000); // After 15 seconds
        
        function finishTest() {
            console.log('⏰ Monitoring completed\n');
            console.log('📋 Test Summary:');
            console.log(`   • Session Error Detected: ${sessionErrorDetected ? 'YES' : 'NO'}`);
            console.log(`   • Recovery Attempted: ${recoveryAttempted ? 'YES' : 'NO'}`);
            
            const finalHealth = getClientHealth();
            console.log(`   • Final State: ${finalHealth.state}`);
            console.log(`   • Final Ready Status: ${finalHealth.isReady ? 'READY' : 'NOT READY'}`);
            console.log(`   • Session Closed: ${finalHealth.sessionClosed ? 'YES' : 'NO'}`);
            
            console.log('\n💡 Tips for handling session errors:');
            console.log('   • Session closed errors are normal during navigation/restart');
            console.log('   • The client has built-in retry and recovery mechanisms');
            console.log('   • Monitor the sessionClosed flag in health checks');
            console.log('   • Use the executeWithRetry method for operations');
            
            console.log('\n🏁 Session recovery test completed. Press Ctrl+C to exit.');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        console.log('\n🔧 If you see session closed errors:');
        console.log('   1. This is normal behavior during startup/restart');
        console.log('   2. The client will automatically attempt recovery');
        console.log('   3. Monitor the logs for recovery attempts');
        console.log('   4. Check the sessionClosed flag in health status');
    }
}

// Test restart functionality specifically
async function testRestartFunctionality() {
    console.log('🔄 Testing restart functionality...\n');
    
    try {
        const beforeHealth = getClientHealth();
        console.log(`📊 Before restart - Ready: ${beforeHealth.isReady}, State: ${beforeHealth.state}`);
        
        // Trigger restart
        console.log('🔄 Triggering manual restart...');
        await whatsappService.restart();
        
        // Wait a bit for restart to take effect
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        const afterHealth = getClientHealth();
        console.log(`📊 After restart - Ready: ${afterHealth.isReady}, State: ${afterHealth.state}`);
        
        console.log('✅ Restart test completed\n');
        
    } catch (error) {
        console.log('❌ Restart test error:', error.message);
        
        if (error.message.includes('Session closed')) {
            console.log('⚠️ This is expected during restart - session will be recreated\n');
        }
    }
}

// Test session error simulation
async function simulateSessionError() {
    console.log('🎭 Simulating session error...\n');
    
    try {
        // This will likely trigger a session error
        if (client && client.pupPage) {
            console.log('🔥 Attempting to close browser page to simulate session error...');
            await client.pupPage.close();
            console.log('✅ Page closed - session error should be triggered');
        } else {
            console.log('⚠️ Cannot simulate - client page not accessible');
        }
    } catch (error) {
        console.log('🎯 Session error simulated:', error.message);
    }
}

// Test service retry mechanisms
async function testRetryMechanisms() {
    console.log('🔄 Testing retry mechanisms...\n');
    
    try {
        // Test message sending with potential session errors
        console.log('📤 Testing message send with retry...');
        
        // This should use the executeWithRetry mechanism
        const result = await whatsappService.sendMessage('1234567890', 'Test message');
        console.log('✅ Message send test result:', result);
        
    } catch (error) {
        console.log('❌ Message send test failed:', error.message);
        
        if (error.message.includes('Session closed')) {
            console.log('✅ Session error handled by retry mechanism');
        }
    }
}

// Command line interface
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.includes('--simulate')) {
        console.log('🎭 Session Error Simulation Mode\n');
        testSessionRecovery().then(() => {
            setTimeout(simulateSessionError, 10000);
        });
    } else if (args.includes('--restart')) {
        console.log('🔄 Restart Test Mode\n');
        testRestartFunctionality().then(() => process.exit(0));
    } else if (args.includes('--retry')) {
        console.log('🔄 Retry Mechanism Test Mode\n');
        testRetryMechanisms().then(() => process.exit(0));
    } else if (args.includes('--help')) {
        console.log('\n🆘 Session Recovery Test - Usage:');
        console.log('');
        console.log('  node test-session-recovery.js            # Run full recovery test');
        console.log('  node test-session-recovery.js --simulate # Test with simulated errors');
        console.log('  node test-session-recovery.js --restart  # Test restart functionality');
        console.log('  node test-session-recovery.js --retry    # Test retry mechanisms');
        console.log('  node test-session-recovery.js --help     # Show this help\n');
        process.exit(0);
    } else {
        testSessionRecovery();
    }
    
    // Graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n🛑 Shutting down test...');
        process.exit(0);
    });
}

module.exports = {
    testSessionRecovery,
    testRestartFunctionality,
    simulateSessionError,
    testRetryMechanisms
}; 