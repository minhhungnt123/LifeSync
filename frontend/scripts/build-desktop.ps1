# ==============================================================================
# LifeSync AI - Windows Desktop Packaging Automation Script
# ==============================================================================
# Hỗ trợ kiểm tra môi trường và tự động đóng gói ứng dụng Desktop (Windows .exe / .msi)
# ==============================================================================

param (
    [string]$Target = "all" # Tùy chọn: "all", "nsis", "msi"
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "       LifeSync AI - Desktop Packaging Automation         " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Kiểm tra Node.js & npm
Write-Host "`n[1/4] Kiểm tra môi trường Node.js..." -ForegroundColor Yellow
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Error "Không tìm thấy Node.js! Vui lòng cài đặt Node.js v20+ từ https://nodejs.org"
}
$nodeVersion = node --version
Write-Host "  -> Node.js Version: $nodeVersion" -ForegroundColor Green

# 2. Kiểm tra Rust Toolchain (rustc & cargo)
Write-Host "`n[2/4] Kiểm tra Rust Toolchain (rustc / cargo)..." -ForegroundColor Yellow
$hasRust = Get-Command cargo -ErrorAction SilentlyContinue
if (-not $hasRust) {
    # Kiểm tra trong thư mục .cargo mặc định của user
    $cargoProfilePath = "$env:USERPROFILE\.cargo\bin"
    if (Test-Path "$cargoProfilePath\cargo.exe") {
        $env:PATH = "$cargoProfilePath;" + $env:PATH
        $hasRust = $true
    }
}

if (-not $hasRust) {
    Write-Host "  [!] Không tìm thấy Rust Toolchain trên hệ thống!" -ForegroundColor Red
    Write-Host "  [i] Để build cục bộ, vui lòng cài đặt Rust qua winget:" -ForegroundColor Cyan
    Write-Host "      winget install Rustlang.Rustup" -ForegroundColor White
    Write-Host "      hoặc tải từ trang chủ: https://rustup.rs" -ForegroundColor White
    Write-Host "`n  [Mẹo CI/CD]: Dự án đã tích hợp GitHub Actions (.github/workflows/desktop-build.yml)" -ForegroundColor Green
    Write-Host "  Bạn chỉ cần push code lên GitHub để nhận file cài đặt .exe / .msi tự động mà không cần tốn dung lượng cài compiler trên máy!" -ForegroundColor Green
    exit 1
} else {
    $cargoVersion = cargo --version
    Write-Host "  -> Rust Cargo Version: $cargoVersion" -ForegroundColor Green
}

# 3. Build Web App Frontend
Write-Host "`n[3/4] Biên dịch Web App Frontend (Vite + TypeScript)..." -ForegroundColor Yellow
npm run build
Write-Host "  -> Biên dịch Frontend hoàn tất!" -ForegroundColor Green

# 4. Đóng gói Tauri Desktop (NSIS .exe / WiX .msi)
Write-Host "`n[4/4] Bắt đầu đóng gói Tauri Desktop Installer (Target: $Target)..." -ForegroundColor Yellow
if ($Target -eq "nsis") {
    npm run tauri:build:nsis
} elseif ($Target -eq "msi") {
    npm run tauri:build:msi
} else {
    npm run tauri:build
}

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host " [✔] Đóng gói thành công! File cài đặt nằm tại:            " -ForegroundColor Green
Write-Host "     frontend/src-tauri/target/release/bundle/             " -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor Green
