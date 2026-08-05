---
description: Quy trình tự động Sync (Pull), Git Add + Commit theo chuẩn cấu trúc, Push lên Remote và Tạo Pull Request kèm Description đầy đủ khi hoàn thành một task nhỏ.
---

# Task Completion & PR Workflow (Pull -> Commit -> Push -> Create PR)

Workflow này quy định các bước chuẩn bị, đóng gói, đồng bộ mã nguồn và khởi tạo Pull Request (PR) tự động mỗi khi bạn hoàn thành một subtask hoặc task nhỏ.

---

## Các bước thực hiện

### Bước 1: Đồng bộ mã nguồn (Pull & Sync)
1. Kiểm tra trạng thái làm việc và nhánh hiện tại:
   ```bash
   git branch --show-current
   git status
   ```
2. Nếu đang làm việc ở nhánh chính (`main` hoặc `master`), bắt buộc phải chuyển sang hoặc tạo nhánh tính năng mới (dùng skill [create-branch](file:///d:/PersonalProject/.agents/skills/create-branch/SKILL.md)).
3. Cập nhật mã nguồn mới nhất từ remote để tránh xung đột (conflict):
   ```bash
   git pull origin <current-branch>
   ```

---

### Bước 2: Stage & Commit theo chuẩn cấu trúc (Git Add & Conventional Commit)
1. Stage toàn bộ các thay đổi hợp lệ của task:
   ```bash
   git add .
   ```
2. Kích hoạt skill [commit](file:///d:/PersonalProject/.agents/skills/commit/SKILL.md) để tạo commit message theo đúng chuẩn Conventional Commit / Sentry Style:
   - **Định dạng**: `<type>(<scope>): <subject>`
   - **Types hợp lệ**: `feat`, `fix`, `ref`, `perf`, `docs`, `test`, `build`, `ci`, `chore`, `style`.
   - **Subject**: Viết ở thì hiện tại (Imperative), viết hoa chữ cái đầu, không dấu chấm cuối câu, tối đa 70 ký tự.
   - **Body & Footer**: Nêu rõ lý do thay đổi (What & Why), đính kèm ID Issue / Ref (nếu có) và chữ ký AI Co-Authored-By.

---

### Bước 3: Push thay đổi lên Git Remote
1. Gọi skill [git-pushing](file:///d:/PersonalProject/.agents/skills/git-pushing/SKILL.md) hoặc thực hiện lệnh push an toàn:
   ```bash
   git push -u origin <current-branch>
   ```
2. Xác nhận lệnh push thành công trên remote repository mà không bị từ chối hoặc bóp nghẹt bởi branch protection rules.

---

### Bước 4: Tạo Pull Request & Soạn Thảo Description Đầy Đủ
1. Kích hoạt skill [git-pr-review](file:///d:/PersonalProject/.agents/skills/git-pr-review/SKILL.md) để tự động phân tích commit log giữa nhánh hiện tại và nhánh chính (`main`/`master`).
2. Trích xuất thông tin và tạo nội dung Description cho PR theo mẫu cấu trúc đầy đủ:
   - **Title**: `<type>(<scope>): <tóm tắt ngắn gọn>`
   - **Summary**: 1-2 câu giải thích mục đích chính của Pull Request.
   - **Changes**: Danh sách thay đổi phân nhóm theo từng domain/module.
   - **Technical Notes** *(nếu có)*: Cấu hình mới, biến môi trường, migration script hoặc breaking changes.
   - **Impact**: Tác động tới hệ thống, trải nghiệm người dùng và mức độ rủi ro.
3. Sử dụng GitHub CLI (`gh pr create`) hoặc chuẩn bị sẵn tiêu đề & nội dung PR để người dùng tạo PR:
   ```bash
   gh pr create --title "<PR_TITLE>" --body "<PR_DESCRIPTION>" --base main --head <current-branch>
   ```

---

> [!IMPORTANT]
> ### 🛑 Check-gate trước khi hoàn tất Task
> - **Build & Test**: Đảm bảo toàn bộ code đã compile thành công và pass verification trước khi commit/push.
> - **Clean Commit**: Không commit các file rác, file tạm, credentials hoặc API Key cá nhân.
> - **PR Review Checklist**: PR Description phải thể hiện rõ ràng "What" và "Why", giúp reviewer dễ dàng nắm bắt ngữ cảnh.
