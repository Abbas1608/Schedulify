# Fixed PowerShell script for your project
Write-Host "🚀 Starting build process..." -ForegroundColor Green

Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
pnpm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green
    
    Write-Host "🔍 Running linter..." -ForegroundColor Yellow
    pnpm run lint
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Linting passed!" -ForegroundColor Green
        
        Write-Host "🏗️ Building project..." -ForegroundColor Yellow
        pnpm run build
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "🎉 Build completed successfully!" -ForegroundColor Green
            Write-Host "📊 Build summary:" -ForegroundColor Cyan
            Write-Host "  - TypeScript compilation: ✅" -ForegroundColor White
            Write-Host "  - Vite build: ✅" -ForegroundColor White
            Write-Host "  - Output: dist/ folder" -ForegroundColor White
        } else {
            Write-Host "❌ Build failed!" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "❌ Linting failed!" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "❌ Installation failed!" -ForegroundColor Red
    exit 1
}
