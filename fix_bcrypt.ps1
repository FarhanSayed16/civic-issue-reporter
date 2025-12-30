# Quick Fix Script for Bcrypt Issue
# Run this script to fix the bcrypt compatibility issue

Write-Host "🔧 Fixing Bcrypt Compatibility Issue..." -ForegroundColor Yellow
Write-Host ""

# Check if venv is activated
if (-not $env:VIRTUAL_ENV) {
    Write-Host "⚠️  Virtual environment not activated!" -ForegroundColor Red
    Write-Host "Activating virtual environment..." -ForegroundColor Yellow
    & .\.venv\Scripts\Activate.ps1
}

Write-Host "📦 Uninstalling current bcrypt..." -ForegroundColor Yellow
pip uninstall bcrypt -y

Write-Host ""
Write-Host "📥 Installing bcrypt 3.2.0 (compatible version)..." -ForegroundColor Yellow
pip install bcrypt==3.2.0

Write-Host ""
Write-Host "✅ Verifying installation..." -ForegroundColor Yellow
python -c "import bcrypt; print('bcrypt version:', bcrypt.__version__); print('Has __about__:', hasattr(bcrypt, '__about__'))"

Write-Host ""
Write-Host "🎉 Bcrypt fix complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Restart the server: python start.py" -ForegroundColor White
Write-Host "  2. Try logging in from frontend" -ForegroundColor White
Write-Host ""

