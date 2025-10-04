# PowerShell script to install, lint, and build the project
Write-Host "Installing dependencies..." -ForegroundColor Green
pnpm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "Running linter..." -ForegroundColor Green
    pnpm run lint
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Building project..." -ForegroundColor Green
        pnpm run build
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ All commands completed successfully!" -ForegroundColor Green
        } else {
            Write-Host "❌ Build failed!" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ Linting failed!" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Installation failed!" -ForegroundColor Red
}
