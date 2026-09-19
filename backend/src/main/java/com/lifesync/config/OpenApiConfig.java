package com.lifesync.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.info.License;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.servers.Server;
import io.swagger.v3.oas.models.OpenAPI;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * OpenAPI 3.0 configuration for LifeSync AI Backend.
 * Configures API metadata, JWT Bearer authentication scheme, and server definitions.
 */
@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "LifeSync AI - RESTful API Specification",
                version = "1.0.0",
                description = "Tài liệu API chính thức của nền tảng Quản lý năng suất và Trợ lý AI LifeSync.\n\n"
                        + "Hệ thống cung cấp các nhóm chức năng chính:\n"
                        + "- **Authentication**: Đăng ký, Đăng nhập và Quản lý phiên làm việc JWT.\n"
                        + "- **User Profile & Settings**: Quản lý thông tin cá nhân, chỉ số thể chất (BMI/TDEE) và bảo mật.\n"
                        + "- **Schedule Management**: Quản lý lịch trình, công việc và sự kiện thời gian thực.\n"
                        + "- **Meal Management**: Quản lý nhật ký bữa ăn, tính toán Calo và dinh dưỡng đa lượng (Macros).\n"
                        + "- **Dashboard & Analytics**: Thống kê trực quan hiệu suất thời gian và thói quen sinh hoạt.\n"
                        + "- **AI Vision & Heartcare Assistant**: Phân tích ảnh món ăn bằng Gemini Vision và Trợ lý đồng hành sức khỏe tim mạch.\n"
                        + "- **Notifications**: Trung tâm thông báo và cảnh báo lối sống.\n"
                        + "- **Routine Templates**: Bộ mẫu lịch trình định kỳ sẵn có.",
                contact = @Contact(
                        name = "LifeSync AI Engineering Team",
                        email = "support@lifesync.ai",
                        url = "https://lifesync.ai"
                ),
                license = @License(
                        name = "Apache 2.0",
                        url = "https://www.apache.org/licenses/LICENSE-2.0"
                )
        ),
        servers = {
                @Server(url = "http://localhost:8080", description = "Backend Local Development Server"),
                @Server(url = "http://localhost:3000", description = "Frontend Nginx Reverse Proxy Server")
        },
        security = {
                @SecurityRequirement(name = "Bearer Authentication")
        }
)
@SecurityScheme(
        name = "Bearer Authentication",
        type = SecuritySchemeType.HTTP,
        bearerFormat = "JWT",
        scheme = "bearer",
        description = "Nhập JWT Access Token (không cần tiền tố 'Bearer ', Swagger UI sẽ tự động bổ sung)."
)
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI();
    }
}
