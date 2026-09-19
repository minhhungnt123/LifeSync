# LifeSync AI - Roadmap & Task Breakdown (MVP Milestone)

> Tài liệu này được tổng hợp và phân chi tiết từ file [PROJECT_CONTEXT.md](file:///d:/PersonalProject/PROJECT_CONTEXT.md). Danh sách các Milestone và Task nhằm định hướng phát triển phiên bản MVP (Minimum Viable Product) theo đúng tiêu chuẩn Clean Architecture và nguyên lý SOLID.

---

## 🗺️ Tổng quan Lộ trình phát triển (Milestone Overview)

| Milestone | Tên Milestone | Mục tiêu chính | Nhánh Git (Branch) | Thời lượng ước tính | Trạng thái |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **M1** | Project Setup & Architecture Foundation | Khởi tạo cấu trúc dự án Full-stack, thiết lập DB, hệ thống Base Entity & UI Design System | `main` | 1 Tuần | ✅ Hoàn thành |
| **M2** | Authentication & User Management | Xây dựng cơ chế xác thực JWT, Đăng ký / Đăng nhập, bảo mật API và Quản lý User Profile | `main` | 1 Tuần | ✅ Hoàn thành |
| **M3** | Time & Schedule Management | Mô hình hóa Lịch trình (Schedule CRUD), tích hợp FullCalendar giao diện trực quan | `minhhungnt123/feat/time-schedule-management` | 1.5 Tuần | ✅ Hoàn thành |
| **M3.5** | User Profile, Settings & Notifications | Quản lý thông tin cá nhân, chỉ số thể chất (BMI/TDEE), cài đặt tài khoản & trung tâm thông báo | `minhhungnt123/feat/m3.5-user-profile-settings` | 1 Tuần | ✅ Hoàn thành |
| **M4** | Meal Management | Quản lý nhật ký bữa ăn, tính toán chỉ số dinh dưỡng (Calories/Macros) | `minhhungnt123/feat/m4-meal-management` | 1 Tuần | ✅ Hoàn thành |
| **M5** | Dashboard & Analytics | Trực quan hóa dữ liệu hiệu suất thời gian và bữa ăn bằng biểu đồ Recharts | `minhhungnt123/feat/m5-dashboard-analytics` | 1 Tuần | ✅ Hoàn thành |
| **M6** | AI Vision & Heartcare Assistant Integration | Tích hợp Google Gemini Multimodal API quét món ăn và Trợ lý AI chăm sóc tim mạch & lối sống | `minhhungnt123/feat/m6-ai-assistant` | 1.5 Tuần | ⏳ Chờ thực hiện |
| **M7** | System Polish, Testing & Deployment | Kiểm thử tự động, tối ưu hóa giao diện, đóng gói Docker và chuẩn bị phát hành | `minhhungnt123/feat/m7-system-polish-deployment` | 1 Tuần | ⏳ Chờ thực hiện |

---

## 📌 Phân chia Chi tiết các Task (Detailed Task Breakdown)

### 🚀 Milestone 1: Project Setup & Architecture Foundation (✅ HOÀN THÀNH)

> **Mục tiêu**: Xây dựng bộ khung ứng dụng (Scaffold), cấu hình môi trường phát triển và áp dụng Clean Architecture.

#### Backend (Spring Boot 3 + Java 21)
- [x] `TASK-101`: Khởi tạo project Spring Boot 3 với Java 21 & Maven (Dependencies: Web, JPA, Security, PostgreSQL, Validation, Lombok).
- [x] `TASK-102`: Cấu hình PostgreSQL Database connection (`application.yml` + `docker-compose.yml`).
- [x] `TASK-103`: Thiết lập Kiến trúc mô hình hoá (Repository - Service - Controller pattern, DTO separation).
- [x] `TASK-104`: Tạo Base Entity (`BaseAuditableEntity` chứa `id`, `createdAt`, `updatedAt`) và định dạng Chuẩn Response Wrapper (`ApiResponse<T>`).
- [x] `TASK-105`: Triển khai `GlobalExceptionHandler` xử lý các ngoại lệ toàn cục (`ResourceNotFoundException`, `BadRequestException`, `ValidationException`).

#### Frontend (React + Vite + TypeScript)
- [x] `TASK-106`: Khởi tạo dự án React + Vite với TypeScript.
- [x] `TASK-107`: Cấu hình Tailwind CSS v4, Google Fonts và hệ thống Design System (Color Tokens, Glassmorphism, Micro-animations).
- [x] `TASK-108`: Thiết lập React Router DOM v6 và định nghĩa cấu trúc Router.
- [x] `TASK-109`: Cấu hình TanStack Query (React Query) & Axios Client.
- [x] `TASK-110`: Dựng Base Layouts (AppLayout với Sidebar, Navbar, Main Content Area và Responsive Mobile View).

---

### 🔑 Milestone 2: Authentication & User Management (✅ HOÀN THÀNH)

> **Mục tiêu**: Đảm bảo an toàn thông tin người dùng với xác thực Token-based (JWT).

#### Backend
- [x] `TASK-201`: Định nghĩa Entity `User` và `Role` Enum (USER, ADMIN).
- [x] `TASK-202`: Xây dựng `JwtTokenProvider` (Tạo Token, Validate Token, Parse Claims).
- [x] `TASK-203`: Cấu hình `SecurityFilterChain` của Spring Security (Stateless session, CORS filter, CSRF disable).
- [x] `TASK-204`: Triển khai `AuthService` và các DTOs (`RegisterRequest`, `LoginRequest`, `AuthResponse`).
- [x] `TASK-205`: Xây dựng `AuthController` cung cấp API `/api/v1/auth/register`, `/login`, `/refresh`, `/me`.
- [x] `TASK-206`: Xử lý nạp UserDetails và Exception Handling cho Authentication.

#### Frontend
- [x] `TASK-207`: Xây dựng `AuthContext` / State Store quản lý thông tin User & Access Token.
- [x] `TASK-208`: Dựng trang Đăng ký (Register Page) kèm Form validation.
- [x] `TASK-209`: Dựng trang Đăng nhập (Login Page) với giao diện Glassmorphism hiện đại.
- [x] `TASK-210`: Xây dựng `ProtectedRoute` ngăn chặn truy cập trái phép.

---

### 📅 Milestone 3: Time & Schedule Management (✅ HOÀN THÀNH)

> **Mục tiêu**: Cho phép người dùng tạo, sửa, xóa và quản lý lịch trình cá nhân trực quan.

#### Backend
- [x] `TASK-301`: Thiết kế Entity `Schedule` (`id`, `userId`, `title`, `description`, `startTime`, `endTime`, `category`, `status`, `priority`).
- [x] `TASK-302`: Tạo `ScheduleRepository` hỗ trợ query lọc lịch theo khoảng thời gian (`findByUserIdAndStartTimeBetween`).
- [x] `TASK-303`: Viết `ScheduleService` thực hiện CRUD và validation logic (Thời gian kết thúc phải sau thời gian bắt đầu).
- [x] `TASK-304`: Xây dựng `ScheduleController` (`/api/v1/schedules`).
- [x] `TASK-305`: Viết Unit Test cho `ScheduleService` (chú trọng kiểm thử trùng lịch / trùng khoảng thời gian).

#### Frontend
- [x] `TASK-306`: Cấu hình và nhúng `FullCalendar` (Month, Week, Day views).
- [x] `TASK-307`: Kết nối React Query để fetch dữ liệu sự kiện từ Backend hiển thị lên Calendar.
- [x] `TASK-308`: Xây dựng Modal Form thêm/sửa Sự kiện (Create/Edit Schedule Modal) với TimePicker & Category Selector.
- [x] `TASK-309`: Thêm tính năng Kéo-thả (Drag & Drop) hoặc Đổi kích thước (Resize) để cập nhật thời gian sự kiện trên Calendar.
- [x] `TASK-310`: Xây dựng bộ lọc lịch trình theo Phân loại (Category Filter: Work, Study, Health, Personal).

---

### 👤 Milestone 3.5: User Profile, Account Settings & Notifications

> **Mục tiêu**: Hoàn thiện các trang tính năng từ Account Popover Menu bao gồm Hồ sơ cá nhân, Cài đặt tài khoản và Trung tâm thông báo.
> **Nhánh Git (Branch)**: `minhhungnt123/feat/m3.5-user-profile-settings`

#### Backend (Spring Boot 3 + Java 21)
- [x] `TASK-351`: Thiết kế Entity `UserProfile`, `UserPreference` và `Notification`.
- [x] `TASK-352`: Viết `UserService` xử lý cập nhật thông tin cá nhân, chỉ số thể chất (BMI/TDEE) và đổi mật khẩu.
- [x] `TASK-353`: Triển khai `NotificationService` & `NotificationController` (`/api/v1/notifications`).
- [x] `TASK-354`: Xây dựng API xuất dữ liệu cá nhân (`/api/v1/users/export-data`).

#### Frontend (React + Vite + TypeScript)
- [x] `TASK-355`: Dựng trang Hồ sơ cá nhân (`ProfilePage.tsx`) với Form cập nhật thông tin & Thống kê chỉ số thể chất BMI.
- [x] `TASK-356`: Dựng trang Cài đặt tài khoản (`SettingsPage.tsx`) hỗ trợ đổi mật khẩu, tùy chỉnh giao diện & quyền riêng tư.
- [x] `TASK-357`: Dựng trang Trung tâm thông báo (`NotificationsPage.tsx`) hỗ trợ bộ lọc & đánh dấu đã đọc.
- [x] `TASK-358`: Kết nối điều hướng từ Account Popover Menu sang 3 trang mới (`/profile`, `/settings`, `/notifications`).

---

### 🥗 Milestone 4: Meal Management

> **Mục tiêu**: Nhật ký ăn uống và tính toán dinh dưỡng tự động theo ngày.
> **Nhánh Git (Branch)**: `minhhungnt123/feat/m4-meal-management`

#### Backend
- [x] `TASK-401`: Thiết kế Entity `MealLog` (`id`, `userId`, `mealType`, `foodName`, `calories`, `protein`, `carbs`, `fat`, `loggedAt`).
- [x] `TASK-402`: Viết `MealService` tính tổng chỉ số dinh dưỡng (Total Calories/Macros) theo ngày.
- [x] `TASK-403`: Xây dựng `MealController` (`/api/v1/meals`).
- [x] `TASK-404`: Tạo DTOs (`MealLogRequest`, `MealLogResponse`, `DailyNutritionSummaryResponse`).

#### Frontend
- [x] `TASK-405`: Thiết kế trang Quản lý Bữa ăn (Meal Management Dashboard).
- [x] `TASK-406`: Dựng danh sách thẻ bữa ăn trong ngày (Sáng, Trưa, Tối, Bữa phụ).
- [x] `TASK-407`: Tạo Form thêm món ăn / nhật ký dinh dưỡng.
- [x] `TASK-408`: Dựng thanh tiến trình (Progress Bar) tổng Calories & Macros đã tiêu thụ trong ngày so với mục tiêu.

---

### 📊 Milestone 5: Dashboard & Analytics

> **Mục tiêu**: Tổng hợp dữ liệu thành chỉ số tổng quan và biểu đồ trực quan.
> **Nhánh Git (Branch)**: `minhhungnt123/feat/m5-dashboard-analytics`

#### Backend
- [x] `TASK-501`: Viết Custom Query trong JPA/Native SQL tổng hợp số giờ hoàn thành công việc theo tuần/tháng.
- [x] `TASK-502`: Viết API thống kê xu hướng nạp Calorie & dinh dưỡng theo thời gian.
- [x] `TASK-503`: Xây dựng `DashboardController` (`/api/v1/dashboard/summary`).

#### Frontend
- [x] `TASK-504`: Dựng Main Dashboard View chứa các thẻ Stat Summary (Tổng giờ làm việc, Calorie nạp, Tỷ lệ hoàn thành công việc).
- [x] `TASK-505`: Tích hợp thư viện `Recharts` dựng Biểu đồ phân bổ thời gian (Pie Chart / Bar Chart).
- [x] `TASK-506`: Dựng Biểu đồ theo dõi chỉ số dinh dưỡng 7 ngày gần nhất (Area Chart / Line Chart).
- [x] `TASK-507`: Tối ưu hóa giao diện Dashboard thân thiện trên Responsive Layout (Desktop/Tablet/Mobile).

---

### 🤖 Milestone 6: AI Vision & Heartcare Assistant Integration

> **Mục tiêu**: Tích hợp Google Gemini Multimodal API để quét/ước tính dinh dưỡng từ ảnh bữa ăn (Food Vision Scanner) và Trợ lý AI đồng hành chăm sóc sức khỏe tim mạch & lối sống (Heartcare & Lifestyle Companion) dựa trên dữ liệu cá nhân.
> **Nhánh Git (Branch)**: `minhhungnt123/feat/m6-ai-assistant`

#### Backend (Spring Boot 3 + Java 21)
- [x] `TASK-601`: Cấu hình Gemini AI Client (`GeminiApiClient` tích hợp Google Gemini API qua Spring RestClient, hỗ trợ Multimodal Vision và Structured JSON Output).
- [x] `TASK-602`: Triển khai `FoodScanService` & DTOs (`FoodScanResponse` gồm `foodName`, `portion`, `calories`, `macros`, `heartHealthTip`): Nhận diện ảnh và ước tính calo/dinh dưỡng từ Gemini Flash.
- [x] `TASK-603`: Xây dựng `HeartCareContextBuilderService`: Tổng hợp thông tin hồ sơ sức khỏe (`UserProfile`: BMI, TDEE), lịch sử ăn uống (`MealLog`) và áp lực lịch trình (`Schedule`) thành AI Prompt Context.
- [x] `TASK-604`: Thiết lập Heartcare System Prompt Template (Nguyên tắc lối sống phòng ngừa, dinh dưỡng thân thiện tim mạch DASH/Mediterranean, giảm stress, kèm Medical Disclaimer chuẩn mực).
- [x] `TASK-605`: Triển khai `AiAssistantService` và `AiController` (`POST /api/v1/ai/scan-food`, `POST /api/v1/ai/chat`, `GET /api/v1/ai/suggested-prompts`).
- [x] `TASK-606`: Xử lý ngoại lệ AI, Validation ảnh tải lên và cơ chế Rate Limiting / Fallback khi kết nối mô hình.

#### Frontend (React + Vite + TypeScript)
- [x] `TASK-607`: Xây dựng `FoodScanModal` & Tích hợp nút quét ảnh món ăn tại `MealPage.tsx` (Chụp ảnh/Upload, xem trước ảnh, xử lý nén client-side).
- [x] `TASK-608`: Giao diện Xác nhận & Hiệu chỉnh kết quả quét món ăn (Human-in-the-loop review trước khi bấm lưu vào nhật ký `MealLog`).
- [x] `TASK-609`: Xây dựng giao diện Heartcare Chatbot (Floating Chat Widget góc phải màn hình và View Chat toàn trang).
- [x] `TASK-610`: Tích hợp Markdown Renderer, hiển thị chỉ số sức khỏe trực quan và hiệu ứng Typing / Thinking Animation.
- [ ] `TASK-611`: Xây dựng bộ thẻ câu hỏi nhanh (Heartcare Prompt Chips: "Đánh giá thực đơn hôm nay cho tim mạch", "Gợi ý bữa phụ ít muối", "Lịch làm việc có gây quá tải không?").

---

### 🛠️ Milestone 7: System Polish, Testing & Deployment

> **Mục tiêu**: Đảm bảo chất lượng hệ thống, không còn lỗi nghiêm trọng và hoàn thiện tài liệu.
> **Nhánh Git (Branch)**: `minhhungnt123/feat/m7-system-polish-deployment`

- [x] `TASK-701`: Rà soát toàn bộ mã nguồn theo chuẩn SOLID, Clean Code và Naming Conventions.
- [x] `TASK-702`: Thực hiện kiểm thử tích hợp End-to-End (E2E) giữa React Frontend và Spring Boot Backend.
- [x] `TASK-703`: Đảm bảo xử lý lỗi trơn tru trên UI khi Backend mất kết nối hoặc trả về lỗi Validation.

- [x] `TASK-704`: Cấu hình `Dockerfile` cho Frontend và Backend.
- [x] `TASK-705`: Xây dựng `docker-compose.yml` chạy đồng thời PostgreSQL, Backend và Frontend.
- [ ] `TASK-706`: Viết tài liệu API với Swagger/OpenAPI (`springdoc-openapi`).
- [ ] `TASK-707`: Kiểm tra Responsive, accessibility và hiệu năng tải trang.

---

## 🎯 Tiêu chuẩn Đánh giá Hoàn thành (Definition of Done - DoD)

1. **Tính năng**: Thực thi đúng mô tả functional scope trong MVP.
2. **Kiểm thử**: Đạt mốc kiểm thử unit test cần thiết cho các Service chính.
3. **Mã nguồn**: Tuân thủ chuẩn RESTful, Clean Architecture, SOLID và Naming Conventions.
4. **Tài liệu**: Có OpenAPI / Swagger docs đầy đủ cho API endpoints.
5. **Giao diện**: Đáp ứng chuẩn UX/UI hiện đại, mượt mà và không có lỗi UI phát sinh.
