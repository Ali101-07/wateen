#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const path = require('path');
const os = require('os');

console.log('🚀 Starting Development Servers...\n');

// Determine the correct command for the platform
const isWindows = os.platform() === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function logWithColor(color, prefix, message) {
  console.log(`${color}${colors.bright}[${prefix}]${colors.reset} ${message}`);
}

// Kill any existing processes on port 5000
function killPort5000() {
  return new Promise((resolve) => {
    if (isWindows) {
      exec('netstat -ano | findstr :5000', (error, stdout) => {
        if (stdout) {
          const lines = stdout.split('\n');
          lines.forEach(line => {
            const parts = line.trim().split(/\s+/);
            if (parts.length >= 5 && parts[1].includes(':5000')) {
              const pid = parts[4];
              exec(`taskkill /F /PID ${pid}`, () => {});
            }
          });
        }
        setTimeout(resolve, 1000);
      });
    } else {
      exec('lsof -ti:5000 | xargs kill -9', () => {
        setTimeout(resolve, 1000);
      });
    }
  });
}

async function startServers() {
  console.log('🔧 Cleaning up any existing processes...');
  await killPort5000();

  // Start backend server
  console.log('🔧 Starting Backend Server...');
  const backend = spawn(npmCmd, ['run', 'dev'], {
    cwd: process.cwd(),
    stdio: 'pipe',
    shell: isWindows
  });

  backend.stdout.on('data', (data) => {
    const output = data.toString().trim();
    if (output) {
      logWithColor(colors.blue, 'BACKEND', output);
    }
  });

  backend.stderr.on('data', (data) => {
    const output = data.toString().trim();
    if (output && !output.includes('Warning') && !output.includes('[nodemon]')) {
      logWithColor(colors.red, 'BACKEND ERROR', output);
    }
  });

  // Wait for backend to be ready
  console.log('⏳ Waiting for backend to start...');
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Start frontend server
  console.log('\n🎨 Starting Frontend Server...');
  
  const frontend = spawn(npmCmd, ['start'], {
    cwd: path.join(process.cwd(), 'frontend'),
    stdio: 'pipe',
    shell: isWindows,
    env: { ...process.env, BROWSER: 'none' } // Prevent auto-opening browser
  });

  frontend.stdout.on('data', (data) => {
    const output = data.toString().trim();
    if (output && !output.includes('webpack compiled')) {
      logWithColor(colors.green, 'FRONTEND', output);
    }
  });

  frontend.stderr.on('data', (data) => {
    const output = data.toString().trim();
    if (output && !output.includes('Warning') && !output.toLowerCase().includes('deprecated')) {
      logWithColor(colors.yellow, 'FRONTEND WARNING', output);
    }
  });

  // Handle frontend exit
  frontend.on('exit', (code) => {
    logWithColor(colors.red, 'FRONTEND', `Process exited with code ${code}`);
    backend.kill();
    process.exit(code);
  });

  // Handle backend exit
  backend.on('exit', (code) => {
    logWithColor(colors.red, 'BACKEND', `Process exited with code ${code}`);
    frontend.kill();
    process.exit(code);
  });

  // Print helpful information
  setTimeout(() => {
    console.log('\n' + '='.repeat(60));
    console.log('🎉 Development Environment Ready!');
    console.log('='.repeat(60));
    console.log(`${colors.cyan}Backend API:${colors.reset}  http://localhost:5000`);
    console.log(`${colors.cyan}Frontend App:${colors.reset} http://localhost:3000`);
    console.log(`${colors.cyan}Health Check:${colors.reset} http://localhost:5000/health`);
    console.log('\n📝 Available Endpoints:');
    console.log('   • GET  /health                    - Server health check');
    console.log('   • GET  /api                       - API welcome message');
    console.log('   • POST /api/auth/register         - User registration');
    console.log('   • POST /api/auth/login            - User login');
    console.log('   • GET  /api/auth/profile          - User profile (protected)');
    console.log('\n🔄 Press Ctrl+C to stop both servers');
    console.log('='.repeat(60) + '\n');
  }, 8000);

  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\n\n🛑 Shutting down servers...');
    backend.kill();
    frontend.kill();
    setTimeout(() => {
      process.exit(0);
    }, 1000);
  });

  process.on('SIGTERM', () => {
    console.log('\n\n🛑 Shutting down servers...');
    backend.kill();
    frontend.kill();
    setTimeout(() => {
      process.exit(0);
    }, 1000);
  });
}

startServers().catch(console.error); 