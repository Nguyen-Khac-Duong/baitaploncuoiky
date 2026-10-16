# Báo Cáo Phân Tích Chuyên Sâu (Spec-Kit Analysis): RM-001 — Đăng nhập & Đăng ký

**Ngày thực hiện**: 2026-10-14  
**Phạm vi kiểm tra chéo**: `spec.md` ↔ `plan.md` ↔ `tasks.md` ↔ Mã nguồn thực tế (`dang-nhap.component.ts`, `xac-thuc.service.ts`).

---

## 1. Kết Quả Kiểm Tra Tính Nhất Quán (Consistency Matrix)

| Tiêu chí đối chiếu | Spec (`spec.md`) | Kế hoạch (`plan.md`) | Danh sách Task (`tasks.md`) | Hiện trạng Mã nguồn (`*.ts`) | Đánh giá |
|---|---|---|---|---|---|
| **P1 - Đăng nhập (Admin / Khách hàng)** | Hỗ trợ 2 vai trò, lưu phiên persistent | Standalone + Signals + LocalStorage | T004, T005, T006, T007 | Đã có `xuLyDangNhap()`, `adminGuard`, `khachHangGuard` | 🟢 **Khớp 100%** |
| **P2 - Đăng ký tài khoản mới** | Tạo xong chuyển về tab Đăng nhập để nhập lại mật khẩu xác thực | Kiến trúc Hybrid Auth, lưu danh sách user | T008, T009, T010 | Hiện tại code cũ tự động cấp `currentUser` ngay khi tạo | 🟡 **Phát hiện độ lệch (Delta)** |
| **P3 - Quick Account & Query Params** | Tab toggle đồng bộ URL `?tab=...`, nút chọn tài khoản mẫu | Standalone Router subscription | T011, T012 | Đã có `chonTaiKhoanMau()` và `doiTab()` | 🟢 **Khớp 100%** |
| **Constitution Check** | Standalone Component, Reactive Forms, Typescript không any | Đạt chuẩn DDD & Angular Signals | T001, T014 | Hoàn toàn tuân thủ hiến pháp dự án | 🟢 **Khớp 100%** |

---

## 2. Chi Tiết Độ Lệch Cần Điều Chỉnh (Gaps & Action Items)

### ⚠️ Độ lệch 1: Luồng xử lý sau khi Đăng ký mới (`XacThucService.dangKy` & `xuLyDangKy`)
- **Quy định trong Spec (Sau khi Clarify)**: Khách hàng sau khi đăng ký thành công sẽ nhận thông báo, form tự động chuyển sang tab "Đăng nhập", điền sẵn email vừa đăng ký và người dùng phải nhập mật khẩu để đăng nhập.
- **Thực tế trong code hiện tại**: Trong `xac-thuc.service.ts` (dòng 84-87), hàm `dangKy()` đang tự động gán `this.currentUser.set(nguoiDungMoi)` và `dang-nhap.component.ts` đang điều hướng thẳng về `/cua-hang`.
- **Hành động khắc phục**: Triển khai đúng task **T009** và **T010** trong đợt `/speckit.implement`:
  - Trong `xac-thuc.service.ts`: Lưu user mới vào `danhSachTaiKhoan`, không tự động set `currentUser`.
  - Trong `dang-nhap.component.ts`: Gọi `doiTab('dang-nhap')`, patch email mới vào `formDangNhap` và thông báo cho người dùng nhập mật khẩu.

### ⚠️ Độ lệch 2: Focus & UX sau khi chuyển tab
- Cần bổ sung focus vào ô mật khẩu sau khi chuyển tab từ Đăng ký thành công sang Đăng nhập để tối ưu trải nghiệm người dùng.

---

## 3. Đánh Giá Độ Sẵn Sàng Thực Thi (Readiness Score)

- **Độ bao phủ yêu cầu (Requirements Coverage)**: `100%` (Tất cả FR-001 đến FR-006 đều có task tương ứng trong `tasks.md`).
- **Khả năng kiểm thử độc lập (Testability)**: `100%` (Từng User Story đều có kịch bản Given-When-Then trong `spec.md` và kiểm thử mẫu trong `quickstart.md`).
- **Trạng thái rủi ro (Risk Level)**: `Thấp` (Chỉ cần điều chỉnh 1 đoạn logic nhỏ ở luồng callback sau đăng ký, không làm thay đổi cấu trúc dữ liệu).

👉 **Kết luận**: Gói đặc tả **RM-001** đã sẵn sàng 100% để tiến hành bước **`/speckit.implement RM-001`**.
