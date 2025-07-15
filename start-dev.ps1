#!/usr/bin/env pwsh

Write-Host "🚀 Starting Development Servers..." -ForegroundColor Cyan
Write-Host ""

# Function to kill processes on port 5000
function Stop-Port5000 {
    Write-Host "🔧 Cleaning up any existing processes on port 5000..." -ForegroundColor Yellow
    $processes = netstat -ano | Select-String ":5000" | ForEach-Object {
        $parts = $_.ToString().Trim() -split '\s+'
        if ($parts.Length -ge 5 -and $parts[1] -like "*:5000*") {
            $parts[4]
        }
    }
    
    foreach ($pid in $processes) {
        if ($pid -and $pid -match '^\d+$') {
            try {
                Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                Write-Host "   ✅ Stopped process $pid" -ForegroundColor Green
            } catch {
                # Process might already be stopped
            }
        }
    }
    Start-Sleep -Seconds 2
}

# Function to check if a port is available
function Test-Port {
    param($Port)
    try {
        $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Any, $Port)
        $listener.Start()
        $listener.Stop()
        return $true
    } catch {
        return $false
    }
}

# Clean up existing processes
Stop-Port5000

# Verify port 5000 is available
if (-not (Test-Port 5000)) {
    Write-Host "❌ Port 5000 is still in use. Please manually stop any processes using port 5000." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔧 Starting Backend Server (Port 5000)..." -ForegroundColor Blue

# Start backend server in a new window
$backendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    npm run dev
}

# Wait a bit for backend to start
Write-Host "⏳ Waiting for backend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Test backend health
$backendReady = $false
$attempts = 0
while (-not $backendReady -and $attempts -lt 10) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5000/health" -TimeoutSec 3 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $backendReady = $true
            Write-Host "✅ Backend server is ready!" -ForegroundColor Green
        }
    } catch {
        Start-Sleep -Seconds 2
        $attempts++
        Write-Host "   ⏳ Backend starting... (attempt $($attempts + 1)/10)" -ForegroundColor Yellow
    }
}

if (-not $backendReady) {
    Write-Host "❌ Backend server failed to start. Check the backend process." -ForegroundColor Red
    Stop-Job $backendJob -Force
    Remove-Job $backendJob -Force
    exit 1
}

Write-Host ""
Write-Host "🎨 Starting Frontend Server (Port 3000)..." -ForegroundColor Green

# Start frontend server in a new window
$frontendJob = Start-Job -ScriptBlock {
    Set-Location "$using:PWD\frontend"
    $env:BROWSER = "none"
    npm start
}

# Wait for frontend to start
Start-Sleep -Seconds 8

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "🎉 Development Environment Ready!" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "Backend API:  http://localhost:5000" -ForegroundColor White
Write-Host "Frontend App: http://localhost:3000" -ForegroundColor White
Write-Host "Health Check: http://localhost:5000/health" -ForegroundColor White
Write-Host ""
Write-Host "📝 Available Endpoints:" -ForegroundColor Yellow
Write-Host "   • GET  /health                    - Server health check"
Write-Host "   • GET  /api                       - API welcome message"
Write-Host "   • POST /api/auth/register         - User registration"
Write-Host "   • POST /api/auth/login            - User login"
Write-Host "   • GET  /api/auth/profile          - User profile (protected)"
Write-Host ""
Write-Host "🔄 Press Ctrl+C to stop monitoring (servers will continue running)" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# Monitor jobs and show status
try {
    while ($true) {
        $backendState = Get-Job $backendJob | Select-Object -ExpandProperty State
        $frontendState = Get-Job $frontendJob | Select-Object -ExpandProperty State
        
        if ($backendState -eq "Failed" -or $backendState -eq "Stopped") {
            Write-Host "❌ Backend server stopped unexpectedly!" -ForegroundColor Red
            break
        }
        
        if ($frontendState -eq "Failed" -or $frontendState -eq "Stopped") {
            Write-Host "❌ Frontend server stopped unexpectedly!" -ForegroundColor Red
            break
        }
        
        Start-Sleep -Seconds 5
        Write-Host "📊 Status - Backend: $backendState | Frontend: $frontendState" -ForegroundColor Gray
    }
} catch {
    Write-Host "🛑 Monitoring stopped." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🛑 To stop servers manually, run:" -ForegroundColor Yellow
Write-Host "   Stop-Job $($backendJob.Id), $($frontendJob.Id) -Force" -ForegroundColor White
Write-Host "   Remove-Job $($backendJob.Id), $($frontendJob.Id) -Force" -ForegroundColor White 