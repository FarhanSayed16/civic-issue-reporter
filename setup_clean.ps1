# Clean Setup Script for Windows PowerShell
# This script sets up a clean virtual environment at project root

Write-Host "🧹 Cleaning up existing virtual environments..." -ForegroundColor Yellow

# Remove existing venv folders
$venvFolders = @(".venv", "venv", "civic_issue_backend\venv", "civic_issue_backend\.venv", "frontend\apps\api\venv")
foreach ($folder in $venvFolders) {
    if (Test-Path $folder) {
        Write-Host "  Removing $folder..." -ForegroundColor Gray
        Remove-Item -Recurse -Force $folder -ErrorAction SilentlyContinue
    }
}

Write-Host "✅ Cleanup complete!" -ForegroundColor Green
Write-Host ""

Write-Host "📦 Creating new virtual environment at project root..." -ForegroundColor Yellow
python -m venv .venv

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Virtual environment created!" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "🔧 Activating virtual environment..." -ForegroundColor Yellow
    & .\.venv\Scripts\Activate.ps1
    
    Write-Host "📥 Installing backend dependencies..." -ForegroundColor Yellow
    Set-Location civic_issue_backend
    pip install --upgrade pip
    pip install -r requirements.txt
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Dependencies installed!" -ForegroundColor Green
        Write-Host ""
        
        Write-Host "🗄️  Initializing database..." -ForegroundColor Yellow
        python init_db.py
        
        Write-Host ""
        Write-Host "🎉 Setup complete!" -ForegroundColor Green
        Write-Host ""
        Write-Host "To start the server, run:" -ForegroundColor Cyan
        Write-Host "  python start.py" -ForegroundColor White
        Write-Host ""
        Write-Host "Or manually:" -ForegroundColor Cyan
        Write-Host "  .venv\Scripts\activate" -ForegroundColor White
        Write-Host "  cd civic_issue_backend" -ForegroundColor White
        Write-Host "  python start.py" -ForegroundColor White
    } else {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Failed to create virtual environment" -ForegroundColor Red
    Write-Host "Make sure Python is installed and in PATH" -ForegroundColor Yellow
}

Set-Location ..

