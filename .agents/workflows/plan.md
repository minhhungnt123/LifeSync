---
description: Quy trình thực thi task coding chuẩn với Brainstorming, Execution và Lưu Learnings bán tự động.
---

# Coding Task Workflow (Plan -> Execute -> Save Learnings)

Workflow này định nghĩa quy trình chuẩn 3 giai đoạn (Phase 1: Brainstorm, Phase 2: Execute, Phase 3: Save Learnings) áp dụng cho mọi task lập trình, đảm bảo mã nguồn sạch (Clean Code), không vi phạm thiết kế và liên tục tích lũy tri thức.

---

## Phase 1: BRAINSTORM (Tư duy & Thiết kế)

> **Mục tiêu**: Làm rõ yêu cầu, đánh giá ràng buộc và chốt phương án kiến trúc/thiết kế trước khi viết bất kỳ dòng code nào.

### 1.1 Load Learnings liên quan
- Trích xuất và kiểm tra các bài học/kinh nghiệm đã lưu tại thư mục `.agents/learnings/` liên quan tới module, công nghệ hoặc tính năng sắp thực hiện.
- Đọc lại các nguyên tắc cốt lõi (Clean Code, SOLID, chuẩn đặt tên C# Unity).

### 1.2 Gọi Brainstorming Skill
- Kích hoạt và tuân thủ tuyệt đối quy trình trong skill `brainstorming` ([SKILL.md](file:///d:/PersonalProject/.agents/skills/brainstorming/SKILL.md)).
- Phân tích ngữ cảnh hiện tại và đặt câu hỏi làm rõ mục tiêu (mỗi lần 1 câu hỏi, ưu tiên trắc nghiệm).
- Xây dựng **Understanding Summary**, **Assumptions**, và **Decision Log**.
- Đề xuất 2-3 phương án thiết kế và làm rõ ưu/nhược điểm (áp dụng triệt để nguyên tắc YAGNI).

---

> [!CAUTION]
> ### 🛑 Phase 1 Gate (Hard Gate)
> **Nghiêm cấm** chuyển sang **Phase 2 (Execute)** nếu chưa hoàn thành Brainstorming và chưa có thiết kế (Design Specification) được người dùng xác nhận (`APPROVED`).

---

## Phase 2: EXECUTE (Thực thi & Kiểm thử)

> **Mục tiêu**: Triển khai code chuẩn xác theo đúng thiết kế đã chốt ở Phase 1.

### 2.1 Tạo Checklist từ Phase 1
- Chuyển đổi thiết kế và các quyết định ở Phase 1 thành một danh sách công việc (Checklist) chi tiết từng bước.
- Lưu trữ/hiển thị checklist để theo dõi tiến độ công việc.

### 2.2 Thực thi từng bước (Incremental Execution)
- Thực hiện lần lượt từng mục trong checklist.
- Tuân thủ nguyên tắc Clean Code: đặt tên biến/hàm rõ ràng, đơn trách nhiệm (Single Responsibility), tuân thủ chuẩn C# Unity / SOLID.
- Giữ các thay đổi nhỏ gọn, dễ kiểm soát.

### 2.3 Verify (Xác minh & Kiểm thử)
- Biên dịch dự án, chạy unit test hoặc thực hiện kiểm thử thủ công để đảm bảo tính đúng đắn.
- Đảm bảo không phát sinh lỗi biên dịch (build error), lỗi runtime, hoặc vi phạm linting.

---

> [!CAUTION]
> ### 🛑 Phase 2 Gate (Hard Gate)
> **Nghiêm cấm** chuyển sang **Phase 3 (Save Learnings)** nếu còn bất kỳ lỗi nào chưa được xử lý triệt để hoặc kết quả kiểm thử chưa đạt.

---

## Phase 3: SAVE LEARNINGS (Lưu tri thức - Bán tự động)

> **Mục tiêu**: Đúc kết các kinh nghiệm, giải pháp chống lặp lại lỗi, hoặc pattern hay thu thập được trong quá trình làm việc.

### 3.1 Hỏi xác nhận từ người dùng
- Chủ động hỏi xác nhận với người dùng xem task vừa hoàn thành có bài học, giải pháp hoặc pattern nào đáng lưu lại vào hệ thống tri thức hay không.

### 3.2 Trích xuất Learnings
- Nếu người dùng đồng ý (hoặc phát hiện có kinh nghiệm quan trọng): tổng hợp ngắn gọn:
  - **Bối cảnh / Vấn đề gặp phải**
  - **Nguyên nhân gốc rễ (Root Cause)**
  - **Giải pháp & Bài học đúc kết**

### 3.3 Ghi vào file Markdown
- Ghi nội dung đúc kết thành file Markdown chuẩn tại thư mục `.agents/learnings/`.
- Định dạng file chuẩn Markdown với tiêu đề, alert, và code block minh họa nếu có.

---

## Quyền hạn & Quy tắc chung
1. **Định dạng Markdown**: Tất cả tài liệu, checklist và file learnings phải sử dụng chuẩn GitHub-Flavored Markdown.
2. **Ngôn ngữ**: Luôn giao tiếp và viết tài liệu bằng tiếng Việt.
3. **Câu hỏi định hướng**: Kết thúc mỗi lượt phản hồi bằng một câu hỏi định hướng phát triển bước tiếp theo.
