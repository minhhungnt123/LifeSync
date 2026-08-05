---
description: Quy trình kiểm thử từng kịch bản chức năng (Test Cases) sau khi hoàn thành Task hoặc Milestone để nghiệm thu các mục tiêu đề ra.
---

# Task & Milestone Verification Workflow (Test Plan -> Execution -> Bug Fix -> Documentation)

Workflow này quy định quy trình kiểm thử toàn diện, nghiệm thu từng trường hợp chức năng (Use Cases / Test Cases) sau khi hoàn tất một Task hoặc Milestone, đảm bảo mọi mục tiêu đề ra đều đạt chất lượng cao nhất, tuân thủ nguyên tắc Clean Code và SOLID.

---

## Phase 1: Phân tích Mục tiêu & Thiết kế Kịch bản Kiểm thử (Test Planning)

> **Mục tiêu**: Xác định rõ các tiêu chí nghiệm thu (Acceptance Criteria), các trường hợp sử dụng (Use Cases) và chuẩn bị danh sách Test Cases đầy đủ trước khi tiến hành test.

### 1.1 Trích xuất Mục tiêu & Yêu cầu
- Đọc nội dung Task / Milestone tương ứng trong file `milestones_and_tasks.md` hoặc tài liệu yêu cầu dự án.
- Liệt kê toàn bộ các tính năng, luồng nghiệp vụ và kết quả kỳ vọng (Expected Results).

### 1.2 Phân tích Luồng Dữ liệu & Kiến trúc
- Sử dụng skill [data-flow-generator](file:///d:/PersonalProject/.agents/skills/data-flow-generator/SKILL.md) để phân tích và trực quan hóa luồng dữ liệu giữa các Managers, Controllers, UIs trong Unity (nếu task có liên quan đến tương tác nhiều module).

### 1.3 Xây dựng Bảng Kịch bản Kiểm thử (Test Matrix)
- Sử dụng skill [brainstorming](file:///d:/PersonalProject/.agents/skills/brainstorming/SKILL.md) để phản biện và xây dựng danh sách kịch bản kiểm thử đa chiều:
  - **Happy Path (Luồng chuẩn)**: Các trường hợp người dùng thao tác đúng và hệ thống hoạt động hoàn hảo.
  - **Edge Cases (Trường hợp biên)**: Giá trị cực hạn, mảng rỗng, dữ liệu null, thao tác nhanh liên tục.
  - **Exception & Error Handling (Xử lý lỗi)**: Mất kết nối, sai định dạng dữ liệu, hủy thao tác giữa chừng.

---

## Phase 2: Thực thi Kiểm thử & Đánh giá Chất lượng Code (Test Execution & Quality Check)

> **Mục tiêu**: Tiến hành kiểm thử thực tế từng kịch bản và rà soát chất lượng mã nguồn.

### 2.1 Kiểm thử Chức năng (Functional Testing)
- Thực hiện lần lượt từng Test Case trong bảng kịch bản ở Phase 1.
- Ghi nhận trạng thái: `PASSED` (Đạt) hoặc `FAILED` (Thất bại - kèm mô tả lỗi, log lỗi, step-to-reproduce).

### 2.2 Rà soát Chất lượng Code (Clean Code & SOLID Audit)
- Kích hoạt skill [clean-code](file:///d:/PersonalProject/.agents/skills/clean-code/SKILL.md) để kiểm tra các file C# vừa được tạo/chỉnh sửa:
  - Tuân thủ nguyên lý SOLID (Single Responsibility, Open/Closed,...).
  - Quy chuẩn đặt tên C# Unity (`PascalCase` cho Class/Method/Property, `camelCase` hoặc `_camelCase` cho variable/field).
  - Không có magic numbers, code lặp lại, hoặc hàm quá dài.

---

> [!CAUTION]
> ### 🛑 Phase 2 Gate (Hard Gate)
> **Nghiêm cấm** đóng Task hoặc Milestone nếu còn bất kỳ Test Case trọng yếu nào bị `FAILED` hoặc mã nguồn chưa đạt chuẩn Clean Code.

---

## Phase 3: Xử lý Lỗi & Kiểm thử Bổ sung (Bug Fixing & Regression Testing)

> **Mục tiêu**: Khắc phục triệt để các lỗi phát hiện được và đảm bảo không phát sinh lỗi mới ở các tính năng cũ.

### 3.1 Phân tích & Sửa lỗi (Root Cause Analysis & Fix)
- Với mỗi kịch bản `FAILED`, phân tích nguyên nhân gốc rễ từ log hoặc code.
- Áp dụng nguyên tắc Clean Code để viết mã sửa lỗi (Fixing Code), tránh các giải pháp vá tạm thời (Quick Patch / Symptom Patch).

### 3.2 Kiểm thử Lại & Kiểm thử Hồi quy (Re-test & Regression Test)
- Kiểm thử lại (Re-test) đúng kịch bản vừa sửa lỗi.
- Chạy lại các kịch bản quan trọng khác (Regression Test) để đảm bảo việc sửa lỗi không gây ảnh hưởng tác động phụ (side-effects) lên các tính năng đã hoàn thành trước đó.

---

## Phase 4: Nghiệm thu, Cập nhật Tài liệu & Lưu vết (Acceptance & Wrap-up)

> **Mục tiêu**: Cập nhật trạng thái nghiệm thu mục tiêu, xuất báo cáo và lưu lại lịch sử làm việc.

### 4.1 Cập nhật Trạng thái Task & Milestone
- Đánh dấu hoàn thành (`[x]`) cho các Task / Milestone tương ứng trong file `milestones_and_tasks.md`.

### 4.2 Tạo Báo cáo Nghiệm thu (Documentation)
- Gọi skill [docs-generator](file:///d:/PersonalProject/.agents/skills/docs-generator/SKILL.md) để tự động xuất thông tin nghiệm thu, cập nhật báo cáo tiến độ dự án.

### 4.3 Đóng gói & Push Code (Commit & PR)
- Kích hoạt skill [commit](file:///d:/PersonalProject/.agents/skills/commit/SKILL.md) để tạo commit message chuẩn cho giai đoạn verification/testing (`test: verify task X feature cases`).
- Gọi skill [git-pushing](file:///d:/PersonalProject/.agents/skills/git-pushing/SKILL.md) và [git-pr-review](file:///d:/PersonalProject/.agents/skills/git-pr-review/SKILL.md) / [create-pr](file:///d:/PersonalProject/.agents/skills/create-pr/SKILL.md) nếu cần đẩy code lên remote hoặc tạo Pull Request nghiệm thu Milestone.

---

## Quyền hạn & Quy tắc chung
1. **Minh bạch kết quả**: Mọi kịch bản test phải được ghi rõ kết quả `PASSED` hay `FAILED` kèm lý do.
2. **Tuân thủ chuẩn C# Unity & SOLID**: Kiểm thử không chỉ dừng ở tính năng mà phải kiểm tra cả chất lượng kiến trúc code.
3. **Ngôn ngữ & Phản hồi**: Sử dụng tiếng Việt chuẩn hóa, báo cáo rõ ràng và kết thúc bằng câu hỏi định hướng bước tiếp theo.
