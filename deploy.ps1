# ===== Kyusha Summit Deploy =====
# Usage: .\deploy.ps1
# Builds, uploads via scp, and restarts pm2

$ErrorActionPreference = "Stop"
$keyPath = "C:\Users\lifes\kagoya_deploy.key"
$server = "ubuntu@133.18.160.234"
$remotePath = "/home/ubuntu/kyusha-summit"
$tarFile = "deploy.tar.gz"
$pm2Name = "kyusha-summit"

Write-Host ""
Write-Host "=== KYUSHA SUMMIT DEPLOY ===" -ForegroundColor Cyan
$sw = [System.Diagnostics.Stopwatch]::StartNew()

# Step 1: Build (skip astro check for speed)
Write-Host "[1/3] Building..." -ForegroundColor Yellow
$buildStart = $sw.Elapsed
$ErrorActionPreference = "Continue"
& npx astro build 2>&1 | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
$buildExit = $LASTEXITCODE
$ErrorActionPreference = "Stop"
if ($buildExit -ne 0) {
    Write-Host "BUILD FAILED" -ForegroundColor Red
    exit 1
}
$buildTime = ($sw.Elapsed - $buildStart).ToString("mm\:ss")
Write-Host "  OK ($buildTime)" -ForegroundColor Green

# Step 2: Package + Upload
Write-Host "[2/3] Packaging and uploading..." -ForegroundColor Yellow
$uploadStart = $sw.Elapsed

& tar -czf $tarFile -C dist client server -C .. package.json package-lock.json
$sizeMB = [math]::Round((Get-Item $tarFile).Length / 1MB, 1)
Write-Host ("  Package: {0}MB" -f $sizeMB) -ForegroundColor Gray

$ErrorActionPreference = "Continue"
& scp -i $keyPath -o StrictHostKeyChecking=no -o ConnectTimeout=10 $tarFile "${server}:/tmp/$tarFile" 2>&1 | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
$uploadExit = $LASTEXITCODE
$ErrorActionPreference = "Stop"
Remove-Item $tarFile -ErrorAction SilentlyContinue

if ($uploadExit -ne 0) {
    Write-Host "UPLOAD FAILED" -ForegroundColor Red
    exit 1
}
$uploadTime = ($sw.Elapsed - $uploadStart).ToString("mm\:ss")
Write-Host "  OK ($uploadTime)" -ForegroundColor Green

# Step 3: Deploy on server
Write-Host "[3/3] Deploying on server..." -ForegroundColor Yellow
$deployScript = @"
#!/bin/bash
set -e
cd $remotePath

# Extract new build
rm -rf dist/client dist/server
tar -xzf /tmp/$tarFile
mkdir -p dist
mv client dist/ 2>/dev/null || true
mv server dist/ 2>/dev/null || true
rm -f /tmp/$tarFile

# Install deps
npm install --omit=dev --prefer-offline --no-audit --no-fund 2>&1 | tail -3

# Restart only kyusha-summit
pm2 restart $pm2Name --update-env 2>&1 | tail -3

# Health check
sleep 3
HTTP_CODE=`$(curl -s -o /dev/null -w '%{http_code}' http://localhost:4324/ 2>/dev/null || echo "000")
echo "HEALTH: HTTP `$HTTP_CODE"
if [ "`$HTTP_CODE" != "200" ]; then
    pm2 logs $pm2Name --lines 10 --nostream 2>&1
fi
"@

$ErrorActionPreference = "Continue"
$deployScript | & ssh -i $keyPath -o StrictHostKeyChecking=no $server "cat > /tmp/deploy_run.sh && sed -i 's/\r$//' /tmp/deploy_run.sh && bash /tmp/deploy_run.sh" 2>&1 | ForEach-Object {
    Write-Host "  $_" -ForegroundColor Gray
}
$deployResult = $LASTEXITCODE
$ErrorActionPreference = "Stop"

$sw.Stop()
$elapsed = $sw.Elapsed.ToString("mm\:ss")

if ($deployResult -eq 0) {
    Write-Host ""
    Write-Host "=== DEPLOY SUCCESS ($elapsed) ===" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "=== DEPLOY FAILED ($elapsed) ===" -ForegroundColor Red
    exit 1
}
