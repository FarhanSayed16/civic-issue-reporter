#!/bin/bash
# Clean Setup Script for Linux/Mac
# This script sets up a clean virtual environment at project root

echo "🧹 Cleaning up existing virtual environments..."

# Remove existing venv folders
rm -rf .venv venv civic_issue_backend/venv civic_issue_backend/.venv frontend/apps/api/venv

echo "✅ Cleanup complete!"
echo ""

echo "📦 Creating new virtual environment at project root..."
python3 -m venv .venv

if [ $? -eq 0 ]; then
    echo "✅ Virtual environment created!"
    echo ""
    
    echo "🔧 Activating virtual environment..."
    source .venv/bin/activate
    
    echo "📥 Installing backend dependencies..."
    cd civic_issue_backend
    pip install --upgrade pip
    pip install -r requirements.txt
    
    if [ $? -eq 0 ]; then
        echo "✅ Dependencies installed!"
        echo ""
        
        echo "🗄️  Initializing database..."
        python init_db.py
        
        echo ""
        echo "🎉 Setup complete!"
        echo ""
        echo "To start the server, run:"
        echo "  python start.py"
        echo ""
        echo "Or manually:"
        echo "  source .venv/bin/activate"
        echo "  cd civic_issue_backend"
        echo "  python start.py"
    else
        echo "❌ Failed to install dependencies"
    fi
else
    echo "❌ Failed to create virtual environment"
    echo "Make sure Python 3 is installed and in PATH"
fi

cd ..

