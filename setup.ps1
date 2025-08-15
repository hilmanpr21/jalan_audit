# setup.ps1 - Windows PowerShell setup script

# Define required Node.js version
$NODE_VERSION = "23.11.1"

Write-Host "Setting up Jalan Audit App development environment..." -ForegroundColor Green

# Check if nvm4w is installed
if (!(Get-Command nvm -ErrorAction SilentlyContinue)) {
    Write-Host "NVM for Windows not found. Please install it first:" -ForegroundColor Red
    Write-Host "https://github.com/coreybutler/nvm-windows"
    exit 1
}

Write-Host "Installing and using Node.js version $NODE_VERSION..." -ForegroundColor Yellow
nvm install $NODE_VERSION
nvm use $NODE_VERSION

Write-Host "Checking versions..." -ForegroundColor Yellow
Write-Host "Node.js: $(node --version)"
Write-Host "npm: $(npm --version)"

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

Write-Host "Setup complete! You can now run:" -ForegroundColor Green
Write-Host "npm run dev"
