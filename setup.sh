#!/bin/bash
# setup.sh - Linux/WSL/MacOS setup script

# Define required Node.js version
NODE_VERSION="23.11.1"

echo "Setting up Jalan Audit App development environment..."

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

echo "📋 Checking versions..."
echo "Node.js: $(node --version)"
echo "npm: $(npm --version)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo "✅ Setup complete! You can now run:"
echo "npm run dev"
