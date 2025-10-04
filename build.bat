@echo off
echo Installing dependencies...
pnpm install && pnpm run lint && pnpm run build
if %errorlevel% == 0 (
    echo ✅ All commands completed successfully!
) else (
    echo ❌ One or more commands failed!
)
