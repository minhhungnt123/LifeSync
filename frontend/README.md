# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

---

## 📱 Multi-Platform Distribution (Android & Desktop)

LifeSync AI supports cross-platform execution across Web, Mobile Android, and Desktop:

### 1. Web Application
```bash
npm run dev      # Khởi chạy Vite dev server (http://localhost:5173)
npm run build    # Biên dịch mã nguồn sản xuất ra dist/
```

### 2. Android Mobile Application (Capacitor)
```bash
npm run cap:sync           # Đồng bộ Web dist sang Android assets
npm run cap:build:debug    # Build APK Debug (assembleDebug)
npm run cap:build:release  # Build APK Release-ready (assembleRelease)
```

### 3. Windows Desktop Application (Tauri v2)
- **Engine**: Tauri v2 + Microsoft Edge WebView2 Evergreen
- **System Tray**: Hỗ trợ chạy ngầm, thu nhỏ khi bấm Close, click icon để khôi phục.
- **Hiệu năng & Tiêu thụ RAM**: Chỉ ~38MB RAM ở trạng thái nghỉ, xem chi tiết tại [desktop_performance_benchmark.md](file:///d:/PersonalProject/docs/desktop_performance_benchmark.md).

```bash
# Chạy trong môi trường phát triển Desktop
npm run tauri:dev

# Đóng gói bộ cài đặt Windows:
npm run tauri:build        # Đóng gói cả NSIS (.exe) và WiX (.msi)
npm run tauri:build:nsis   # Đóng gói riêng NSIS (.exe) installer
npm run tauri:build:msi    # Đóng gói riêng WiX (.msi) installer

# Hoặc sử dụng script kiểm tra môi trường:
powershell -ExecutionPolicy Bypass -File scripts/build-desktop.ps1
```

*Lưu ý*: Dự án đã tích hợp CI/CD tự động tại `.github/workflows/desktop-build.yml` giúp tự động xuất xưởng file cài đặt Windows khi push code lên GitHub.

