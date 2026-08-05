# 🧪 Milestone 2 Test Cases Specification: Authentication & User Management

> **Dự án**: LifeSync AI  
> **Milestone**: 2 - Authentication & User Management  
> **Tài liệu liên quan**: [milestones_and_tasks.md](file:///d:/PersonalProject/milestones_and_tasks.md)  
> **Ngày tạo**: 03/08/2026  
> **Trạng thái**: Chờ thực thi kiểm thử (Ready for Execution)

---

## 📌 Bảng Tổng Quan Kịch Bản Kiểm Thử (Test Suite Summary)

| Phân vùng kiểm thử | Tổng số Test Cases | Luồng chuẩn (Happy Path) | Trường hợp biên (Edge Cases) | Lỗi & Bảo mật (Exception & Security) |
| :--- | :---: | :---: | :---: | :---: |
| **I. Backend Unit Test** | 9 | 4 | 2 | 3 |
| **II. Backend API Integration** | 9 | 4 | 2 | 3 |
| **III. Security & Authorization** | 4 | 1 | 1 | 2 |
| **IV. Frontend UI & State Flow** | 9 | 5 | 2 | 2 |
| **TỔNG CỘNG** | **31** | **14** | **7** | **10** |

---

## 🛠️ Chi Tiết Các Kịch Bản Kiểm Thử (Test Cases Details)

### I. Backend Unit Test (`JwtTokenProvider` & `AuthService`)

#### `TC-M2-UNIT-001`: Tạo JWT Access Token hợp lệ từ UserDetails
- **Loại**: Happy Path
- **Thành phần**: `JwtTokenProvider`
- **Tiền điều kiện**: Khởi tạo object `UserDetails` hợp lệ với email `user@example.com` và Role `ROLE_USER`.
- **Các bước**: Gọi hàm `generateToken(userDetails)`.
- **Kết quả kỳ vọng**: Trả về chuỗi JWT không rỗng, gồm 3 phần (header.payload.signature).

#### `TC-M2-UNIT-002`: Validate JWT Token thành công
- **Loại**: Happy Path
- **Thành phần**: `JwtTokenProvider`
- **Tiền điều kiện**: Có JWT Token còn hạn và được ký đúng Secret Key.
- **Các bước**: Gọi hàm `validateToken(token)`.
- **Kết quả kỳ vọng**: Trả về `true`, không quăng ngoại lệ.

#### `TC-M2-UNIT-003`: Từ chối JWT Token đã hết hạn (Expired Token)
- **Loại**: Exception Case
- **Thành phần**: `JwtTokenProvider`
- **Tiền điều kiện**: Tạo Token có thời gian hết hạn (`expiration`) ở quá khứ.
- **Các bước**: Gọi hàm `validateToken(expiredToken)`.
- **Kết quả kỳ vọng**: Trả về `false` hoặc ném ngoại lệ `ExpiredJwtException`.

#### `TC-M2-UNIT-004`: Từ chối JWT Token bị thay đổi nội dung / chữ ký sai
- **Loại**: Security Case
- **Thành phần**: `JwtTokenProvider`
- **Tiền điều kiện**: Tạo JWT Token hợp lệ nhưng chỉnh sửa 1 ký tự trong chữ ký Signature.
- **Các bước**: Gọi hàm `validateToken(tamperedToken)`.
- **Kết quả kỳ vọng**: Trả về `false` hoặc ném ngoại lệ `SignatureException` / `MalformedJwtException`.

#### `TC-M2-UNIT-005`: Extract thông tin Username/Claims chính xác từ JWT Token
- **Loại**: Happy Path
- **Thành phần**: `JwtTokenProvider`
- **Tiền điều kiện**: Token được tạo cho user `john.doe@example.com`.
- **Các bước**: Gọi hàm `getUsernameFromToken(token)`.
- **Kết quả kỳ vọng**: Trả về chính xác chuỗi `"john.doe@example.com"`.

#### `TC-M2-UNIT-006`: Đăng ký User thành công với mật khẩu đã mã hóa BCrypt
- **Loại**: Happy Path
- **Thành phần**: `AuthService`
- **Tiền điều kiện**: Mock `UserRepository.existsByEmail()` trả về `false`. Mock `PasswordEncoder.encode()`.
- **Các bước**: Gọi `authService.register(registerRequest)`.
- **Kết quả kỳ vọng**: `UserRepository.save()` được gọi với password đã được mã hóa (bắt đầu bằng `$2a$`), không lưu raw password. Trả về `AuthResponse`.

#### `TC-M2-UNIT-007`: Ném ngoại lệ khi Đăng ký Email trùng lặp
- **Loại**: Exception Case
- **Thành phần**: `AuthService`
- **Tiền điều kiện**: Mock `UserRepository.existsByEmail("existing@example.com")` trả về `true`.
- **Các bước**: Gọi `authService.register` với email `existing@example.com`.
- **Kết quả kỳ vọng**: Ném ngoại lệ `BadRequestException` hoặc `DuplicateResourceException` với message "Email đã được sử dụng".

#### `TC-M2-UNIT-008`: Đăng nhập thành công trả về cặp Access Token & Refresh Token
- **Loại**: Happy Path
- **Thành phần**: `AuthService`
- **Tiền điều kiện**: Mock `AuthenticationManager.authenticate()` thành công.
- **Các bước**: Gọi `authService.login(loginRequest)`.
- **Kết quả kỳ vọng**: Trả về `AuthResponse` chứa `accessToken`, `refreshToken`, `tokenType: "Bearer"` và thông tin user.

#### `TC-M2-UNIT-009`: Đăng nhập thất bại khi sai Mật khẩu
- **Loại**: Exception Case
- **Thành phần**: `AuthService`
- **Tiền điều kiện**: Mock `AuthenticationManager.authenticate()` ném `BadCredentialsException`.
- **Các bước**: Gọi `authService.login(invalidLoginRequest)`.
- **Kết quả kỳ vọng**: Ném `BadCredentialsException` hoặc `UnauthorizedException`.

---

### II. Backend API Endpoints (Integration Testing)

#### `TC-M2-API-001`: `POST /api/v1/auth/register` - Đăng ký tài khoản thành công
- **Loại**: Happy Path
- **Payload**:
  ```json
  {
    "fullName": "Nguyen Van A",
    "email": "nguyenvana@example.com",
    "password": "Password123@"
  }
  ```
- **Kết quả kỳ vọng**: Status `201 Created` (hoặc `200 OK`), Body chứa `ApiResponse` chuẩn: `success: true`, `data` chứa Access Token và thông tin User.

#### `TC-M2-API-002`: `POST /api/v1/auth/register` - Lỗi Email đã tồn tại
- **Loại**: Exception Case
- **Payload**: Email đã có trong Database.
- **Kết quả kỳ vọng**: Status `400 Bad Request` hoặc `409 Conflict`, Message rõ ràng: "Email đã tồn tại trong hệ thống".

#### `TC-M2-API-003`: `POST /api/v1/auth/register` - Lỗi Validation DTO
- **Loại**: Edge / Exception Case
- **Payload**:
  ```json
  {
    "fullName": "",
    "email": "invalid-email-format",
    "password": "123"
  }
  ```
- **Kết quả kỳ vọng**: Status `400 Bad Request`, `GlobalExceptionHandler` trả về danh sách chi tiết các field bị lỗi validation (`email`, `password`, `fullName`).

#### `TC-M2-API-004`: `POST /api/v1/auth/login` - Đăng nhập thành công
- **Loại**: Happy Path
- **Payload**: Credential hợp lệ.
- **Kết quả kỳ vọng**: Status `200 OK`, nhận được `accessToken` & `refreshToken`.

#### `TC-M2-API-005`: `POST /api/v1/auth/login` - Đăng nhập sai thông tin
- **Loại**: Exception Case
- **Payload**: Mật khẩu sai hoặc Email không tồn tại.
- **Kết quả kỳ vọng**: Status `401 Unauthorized`, Message: "Email hoặc mật khẩu không chính xác".

#### `TC-M2-API-006`: `POST /api/v1/auth/refresh` - Cấp mới Access Token thành công
- **Loại**: Happy Path
- **Payload**: Refresh Token hợp lệ.
- **Kết quả kỳ vọng**: Status `200 OK`, trả về `accessToken` mới.

#### `TC-M2-API-007`: `POST /api/v1/auth/refresh` - Refresh Token hết hạn / sai
- **Loại**: Exception Case
- **Payload**: Refresh Token đã hết hạn hoặc bị sửa đổi.
- **Kết quả kỳ vọng**: Status `401 Unauthorized` hoặc `403 Forbidden`.

#### `TC-M2-API-008`: `GET /api/v1/auth/me` - Lấy Profile với Bearer Token hợp lệ
- **Loại**: Happy Path
- **Header**: `Authorization: Bearer <valid_access_token>`
- **Kết quả kỳ vọng**: Status `200 OK`, trả về thông tin chi tiết user (`id`, `fullName`, `email`, `role`).

#### `TC-M2-API-009`: `GET /api/v1/auth/me` - Truy cập không có Token
- **Loại**: Security Case
- **Header**: Không có header `Authorization` hoặc header sai định dạng.
- **Kết quả kỳ vọng**: Status `401 Unauthorized`.

---

### III. Security, Headers & Policy Testing

#### `TC-M2-SEC-001`: SecurityFilterChain chặn các Endpoint bảo vệ
- **Loại**: Security Case
- **Mô tả**: Gọi bất kỳ API bảo vệ (ví dụ `/api/v1/schedules`, `/api/v1/users/me`) khi chưa authentication.
- **Kết quả kỳ vọng**: Spring Security chặn ngay từ Filter, trả về `401 Unauthorized`.

#### `TC-M2-SEC-002`: Kiểm tra cấu hình CORS Filter
- **Loại**: Security Case
- **Mô tả**: Gửi Pre-flight HTTP Request (`OPTIONS`) từ Origin được phép (`http://localhost:5173`) và Origin lạ (`http://malicious-site.com`).
- **Kết quả kỳ vọng**: Origin hợp lệ nhận `Access-Control-Allow-Origin: http://localhost:5173`. Origin lạ bị từ chối Header CORS.

#### `TC-M2-SEC-003`: CSRF Disabled cho Stateless Session
- **Loại**: Security Case
- **Mô tả**: Gửi Request `POST` không đính kèm CSRF token.
- **Kết quả kỳ vọng**: Hệ thống xử lý bình thường (vì dùng JWT Stateless, không phụ thuộc vào Cookie Session truyền thống).

#### `TC-M2-SEC-004`: Bảo vệ chữ ký Secret Key
- **Loại**: Security Case
- **Mô tả**: Dùng JWT bí mật từ bên ngoài (ký bằng secret key khác) để gọi API.
- **Kết quả kỳ vọng**: Backend phát hiện sai chữ ký và từ chối `401 Unauthorized`.

---

### IV. Frontend UI & State Flow Testing

#### `TC-M2-FE-001`: Trang Register - Form Validation Thời gian thực
- **Loại**: Happy / Edge Case
- **Thao tác**: Nhập sai định dạng email, mật khẩu ngắn hơn 6 ký tự, bấm Register.
- **Kết quả kỳ vọng**: Hiển thị thông báo lỗi dưới các input tương ứng ngay lập tức, nút Submit bị disable hoặc không gửi request API.

#### `TC-M2-FE-002`: Trang Register - Đăng ký thành công
- **Loại**: Happy Path
- **Thao tác**: Nhập đầy đủ thông tin hợp lệ, nhấn Đăng ký.
- **Kết quả kỳ vọng**: Hiển thị Notification/Toast thành công, tự động điều hướng sang trang Đăng nhập hoặc Dashboard.

#### `TC-M2-FE-003`: Trang Login - Hiển thị lỗi khi Đăng nhập thất bại
- **Loại**: Exception Case
- **Thao tác**: Nhập thông tin tài khoản sai, nhấn Đăng nhập.
- **Kết quả kỳ vọng**: Hiển thị Toast / Alert lỗi từ Backend ("Email hoặc mật khẩu không chính xác"), không bị đơ giao diện.

#### `TC-M2-FE-004`: Trang Login - Đăng nhập thành công & Lưu State
- **Loại**: Happy Path
- **Thao tác**: Đăng nhập với tài khoản hợp lệ.
- **Kết quả kỳ vọng**: Token & thông tin User được lưu vào State Store (Zustand/Context) + LocalStorage/Cookie, chuyển hướng người dùng vào App (Trang chính/Dashboard).

#### `TC-M2-FE-005`: Axios Interceptor - Gắn Bearer Token tự động
- **Loại**: Happy Path
- **Thao tác**: Thực hiện một request yêu cầu xác thực sau khi đăng nhập.
- **Kết quả kỳ vọng**: Axios Interceptor tự động thêm header `Authorization: Bearer <token>` vào HTTP Request.

#### `TC-M2-FE-006`: Axios Interceptor - Auto Refresh Token khi 401
- **Loại**: Edge Case
- **Thao tác**: Giả lập Access Token hết hạn. Người dùng thực hiện thao tác trên UI.
- **Kết quả kỳ vọng**: Interceptor bắt lỗi 401, tự động gọi API `/refresh` lấy token mới, thử lại request ban đầu một cách trong suốt (Transparent to User).

#### `TC-M2-FE-007`: `ProtectedRoute` - Chặn người dùng chưa đăng nhập
- **Loại**: Security Case
- **Thao tác**: Người dùng chưa đăng nhập gõ trực tiếp URL `/dashboard` hoặc `/schedules` trên trình duyệt.
- **Kết quả kỳ vọng**: `ProtectedRoute` chặn lại và ngay lập tức redirect về `/login`, lưu location cũ vào State `from`.

#### `TC-M2-FE-008`: `ProtectedRoute` - Cho phép truy cập khi đã đăng nhập & Restore Location
- **Loại**: Happy Path
- **Thao tác**: Sau khi bị redirect về `/login` ở `TC-M2-FE-007`, thực hiện đăng nhập thành công.
- **Kết quả kỳ vọng**: Hệ thống điều hướng thẳng đến URL ban đầu người dùng định truy cập (`/schedules`).

#### `TC-M2-FE-009`: Thao tác Đăng xuất (Logout)
- **Loại**: Happy Path
- **Thao tác**: Nhấn nút Đăng xuất trên Navbar/Sidebar.
- **Kết quả kỳ vọng**: State AuthContext bị xóa, LocalStorage/Cookie bị xoá token, lập tức redirect về `/login`.

---

## 🎯 Tiêu Chuẩn Nghiệm Thu (Acceptance Criteria)

1. **Pass Rate**: 100% các Test Cases loại **Happy Path** và **Security** phải đạt `PASSED`.
2. **Coverage**: Unit test backend bao phủ >= 80% code coverage cho `AuthService` và `JwtTokenProvider`.
3. **Clean Code**: Không có cảnh báo bảo mật, không hardcode Secret Keys trong code (phải dùng `application.yml` / `@Value` / Environment Variable).
