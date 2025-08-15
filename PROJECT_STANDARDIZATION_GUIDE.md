# Node.js Project Standardization Guide

## Overview

This guide provides a standardized approach to initializing and maintaining Node.js projects with consistent environments across different machines and platforms (Windows, Linux, macOS).

## Prerequisites

-   Node Version Manager (NVM) installed on your system
-   Git installed and configured

## Step 1: Environment Setup Files

### 1.1 Package.json Engine Requirements

Add engine requirements to your `package.json`:

``` json
{
  "name": "your-project-name",
  "version": "1.0.0",
  "engines": {
    "node": ">=23.11.1",
    "npm": ">=10.0.0"
  },
  "scripts": {
    "dev": "your-dev-command",
    "build": "your-build-command",
    "setup": "node setup-check.js"
  }
}
```

**Purpose**: - Documents required Node.js and npm versions - Some tools can enforce these requirements - Provides clear documentation for developers

## Step 2: Setup Scripts

### 2.1 Windows PowerShell Setup Script

Create `setup.ps1`:

``` powershell
# setup.ps1 - Windows PowerShell setup script

Write-Host "Setting up project development environment..." -ForegroundColor Green

# Define required Node.js version
$NODE_VERSION = "23.11.1"

Write-Host "Setting up project development environment..." -ForegroundColor Green

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

Write-Host "Setup complete! Available commands:" -ForegroundColor Green
Write-Host "npm run dev    - Start development server"
Write-Host "npm run build  - Build for production"
```

### 2.2 Linux/macOS/WSL Setup Script

Create `setup.sh`:

``` bash
#!/bin/bash
# setup.sh - Linux/WSL/MacOS setup script

# Define required Node.js version
NODE_VERSION="23.11.1"

echo "Setting up project development environment..."

# Check if nvm is installed
if ! command -v nvm &> /dev/null; then
    echo "NVM not found. Please install NVM first:"
    echo "curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
    exit 1
fi

# Load nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

echo "Installing and using Node.js version $NODE_VERSION..."
nvm install $NODE_VERSION
nvm use $NODE_VERSION

echo "Checking versions..."
echo "Node.js: $(node --version)"
echo "npm: $(npm --version)"

# Install dependencies
echo "Installing dependencies..."
npm install

echo "Setup complete! Available commands:"
echo "npm run dev    - Start development server"
echo "npm run build  - Build for production"
```

Make it executable:

``` bash
chmod +x setup.sh
```

### 2.3 Environment Validation Script

Create `setup-check.js`:

``` javascript
const { execSync } = require('child_process');
const fs = require('fs');
const semver = require('semver');

function checkNodeVersion() {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const currentNodeVersion = process.version;
    const requiredNodeVersion = packageJson.engines?.node;
    
    if (requiredNodeVersion && !semver.satisfies(currentNodeVersion, requiredNodeVersion)) {
        console.error(`Node.js version mismatch!`);
        console.error(`Current: ${currentNodeVersion}`);
        console.error(`Required: ${requiredNodeVersion}`);
        console.error(`Please run the setup script for your platform:`);
        console.error(`Windows: .\\setup.ps1`);
        console.error(`Linux/macOS: ./setup.sh`);
        process.exit(1);
    }
    
    console.log(`Node.js version check passed: ${currentNodeVersion}`);
}

function checkNpmVersion() {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const currentNpmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    const requiredNpmVersion = packageJson.engines?.npm;
    
    if (requiredNpmVersion && !semver.satisfies(currentNpmVersion, requiredNpmVersion)) {
        console.error(`npm version mismatch!`);
        console.error(`Current: ${currentNpmVersion}`);
        console.error(`Required: ${requiredNpmVersion}`);
        process.exit(1);
    }
    
    console.log(`npm version check passed: ${currentNpmVersion}`);
}

function checkDependencies() {
    if (!fs.existsSync('node_modules')) {
        console.error(`Dependencies not installed. Run: npm install`);
        process.exit(1);
    }
    
    console.log(`Dependencies check passed`);
}

// Run checks
try {
    checkNodeVersion();
    checkNpmVersion();
    checkDependencies();
    console.log(`All environment checks passed!`);
} catch (error) {
    console.error(`Environment check failed:`, error.message);
    process.exit(1);
}
```

## Step 3: Documentation Files

### 3.1 README.md Template

Create or update `README.md`:

``` markdown
# Project Name

## Quick Start

### Prerequisites
- Node Version Manager (NVM)

### Setup

**Windows:**
```powershell
.\setup.ps1
```

**Linux/macOS/WSL:**

``` bash
./setup.sh
```

### Development

``` bash
npm run dev
```

### Building

``` bash
npm run build
```

## Environment Requirements

-   Node.js: See `.nvmrc` file
-   npm: See `package.json` engines field

## Troubleshooting

### "Node.js version mismatch" error

Run the setup script for your platform to install the correct Node.js version.

### "Command not found" errors

Ensure you've run the setup script and that all dependencies are installed.

### Cross-platform issues

This project uses environment-specific setup scripts to handle differences between Windows, Linux, and macOS.

```         

### 3.2 Development Guide

Create `DEVELOPMENT.md`:

```markdown
# Development Guide

## Environment Management

This project uses standardized environment setup to ensure consistency across different machines and platforms.

### Node.js Version Management

1. The required Node.js version is specified in `.nvmrc`
2. Engine requirements are enforced in `package.json`
3. Setup scripts automatically install and use the correct version

### Setting Up a New Development Environment

1. Clone the repository
2. Run the appropriate setup script:
   - Windows: `.\setup.ps1`
   - Linux/macOS: `./setup.sh`
3. The script will:
   - Check for NVM installation
   - Install the required Node.js version
   - Switch to the correct version
   - Install project dependencies

### Switching Between Projects

If you work on multiple projects with different Node.js versions:

1. Each project should have its own `.nvmrc` file
2. Use `nvm use` in each project directory
3. Or run the setup script when switching projects

### Adding New Dependencies

1. Ensure you're using the correct Node.js version: `node --version`
2. Install dependencies: `npm install package-name`
3. Commit the updated `package-lock.json`

### Updating Node.js Version

1. Update `.nvmrc` with the new version
2. Update `engines.node` in `package.json`
3. Run the setup script
4. Test the application
5. Update documentation if needed

## Platform-Specific Notes

### Windows
- Uses NVM for Windows
- PowerShell execution policy may need adjustment
- Uses `setup.ps1`

### Linux/macOS/WSL
- Uses standard NVM
- Requires bash shell
- Uses `setup.sh`

### Docker (Optional)
For completely isolated environments, consider adding:

```dockerfile
FROM node:20.11.0-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]
```

```         

## Step 4: Git Configuration

### 4.1 .gitignore Template

Ensure your `.gitignore` includes:

```gitignore
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db

# Build outputs
dist/
build/
*.tgz

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache
```

### 4.2 Git Hooks (Optional)

Create `.husky/pre-commit` for automated checks:

``` bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npm run setup
npm run lint
npm run test
```

## Step 5: Implementation Checklist

### For New Projects:

-   [ ] Create `.nvmrc` with required Node.js version
-   [ ] Add engines to `package.json`
-   [ ] Create `setup.ps1` for Windows
-   [ ] Create `setup.sh` for Linux/macOS
-   [ ] Add `setup-check.js` validation script
-   [ ] Update `README.md` with setup instructions
-   [ ] Create `DEVELOPMENT.md` guide
-   [ ] Test setup scripts on different platforms

### For Existing Projects:

-   [ ] Audit current Node.js version compatibility
-   [ ] Create `.nvmrc` based on current working version
-   [ ] Add engines to `package.json`
-   [ ] Create platform-specific setup scripts
-   [ ] Document the standardization process
-   [ ] Train team members on new setup process

## Best Practices

1.  **Version Consistency**: Always use the same Node.js version across development, testing, and production
2.  **Documentation**: Keep setup instructions clear and up-to-date
3.  **Automation**: Use setup scripts to reduce manual configuration errors
4.  **Validation**: Include environment checks in your development workflow
5.  **Team Communication**: Ensure all team members understand the standardization process

## Troubleshooting Common Issues

### NVM Not Found

-   Windows: Install NVM for Windows from GitHub
-   Linux/macOS: Install NVM using curl command

### Permission Errors

-   Windows: Run PowerShell as Administrator or adjust execution policy
-   Linux/macOS: Ensure setup.sh has execute permissions

### Version Conflicts

-   Delete `node_modules` and `package-lock.json`
-   Run setup script to reinstall with correct Node.js version

### Cross-Platform Issues

-   Use appropriate line endings (LF for Unix, CRLF for Windows)
-   Test setup scripts on target platforms
-   Document platform-specific requirements \`\`\`