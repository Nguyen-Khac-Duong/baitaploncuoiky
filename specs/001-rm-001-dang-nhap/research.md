# Phase 0 Research: RM-001 — Đăng nhập & Đăng ký

## 1. Nghiên cứu Hiện trạng Xác thực (Authentication State)

### Codebase Hiện tại
- **Frontend**:
  - `angular/src/app/auth/dang-nhap/dang-nhap.component.ts`: Đã có giao diện 2 tab (Đăng nhập / Đăng ký), Reactive Forms với validation.
  - `angular/src/app/he-thong/dich-vu/xac-thuc.service.ts`: Đang quản lý người dùng với Angular Signal `currentUser = signal<NguoiDung | null>()`, lưu trữ qua `localStorage` với 2 tài khoản khởi tạo mẫu (`admin@gmail.com` và `khachhang@gmail.com`).
  - `angular/src/app/he-thong/bao-ve/xac-thuc.guard.ts`: Triển khai `adminGuard` và `khachHangGuard` dựa trên Signal `currentUser()`.
- **Backend**:
  - Tích hợp sẵn module ABP Account & OpenIddict trong `aspnet-core/src/testtttt88.HttpApi.Host`.
  - Cung cấp OAuth2 token endpoint `/connect/token` (grant_type: password).

## 2. Quyết định Kỹ thuật (Technical Decisions)

| Hạng mục | Giải pháp chọn | Lý do |
|---|---|---|
| **Mô hình xác thực** | Hybrid (Mock/LocalStorage + OpenIddict Ready) | Đảm bảo app hoạt động độc lập ngay cả khi chưa bật backend (phục vụ chấm điểm đồ án offline), đồng thời có sẵn adapter gọi API backend ABP khi bật server. |
| **Quản lý trạng thái Client** | Angular 18 Signal (`currentUser`) | Tuân thủ triệt để Rule Frontend trong `AGENTS.md`, tối ưu khả năng phản ứng và render lại của UI. |
| **Form Management** | Reactive Forms (`FormGroup`, `Validators`) | Bắt lỗi trực tiếp (email regex, password length >= 6, phone regex, confirm password matcher). |
| **Luồng Đăng ký** | Chuyển tab Đăng nhập sau khi tạo thành công | Theo kết quả `/speckit.clarify`: tăng tính bảo mật, bắt người dùng xác nhận mật khẩu trước khi cấp phiên đăng nhập. |
| **Lưu trữ phiên** | `localStorage` persistent | Giữ đăng nhập khi F5 hoặc mở lại tab. |
