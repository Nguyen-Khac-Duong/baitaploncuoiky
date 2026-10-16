# Phase 0 Research: RM-002 — Khung Giao Diện & Bộ Lọc Phân Quyền

## 1. Khảo Sát Kiến Trúc Shell Layouts

### Hiện trạng Codebase
- **Frontend Angular 18**:
  - `KhungKhachHangComponent` (`angular/src/app/client/layout/`):
    - Đã có Header khách hàng, footer thông tin, tích hợp `ChatBotComponent` (`app-chat-bot`).
    - Lấy thông tin người dùng từ `XacThucService.currentUser()` Signal.
    - Lấy số lượng giỏ hàng từ `DuLieuService.tongSoLuongGioHang()` Computed Signal.
  - `KhungChinhComponent` (`angular/src/app/admin/layout/`):
    - Phân tách module quản trị với `HeaderComponent` và `SidebarComponent`.
    - Trạng thái `sidebarThuGon` boolean quản lý đóng/mở layout.
  - `xac-thuc.guard.ts` (`angular/src/app/he-thong/bao-ve/`):
    - Đã triển khai Functional Route Guards `adminGuard` và `khachHangGuard` bằng `inject(XacThucService)`.

## 2. Quyết Định Kỹ Thuật (Architecture Decisions)

| Hạng mục | Giải pháp | Lý do chọn |
|---|---|---|
| **Layout Pattern** | Nested Routing Shells (`RouterOutlet`) | Tách biệt hoàn toàn trải nghiệm khách hàng mua sắm và quản trị viên, tránh rò rỉ mã nguồn CSS. |
| **Guards** | Angular 18 Functional Guards (`CanActivateFn`) | Tối ưu bundle size, loại bỏ boilerplate Class Guard kiểu cũ. |
| **Reactivity** | Angular Signals (`signal`, `computed`) | Đảm bảo Badge số lượng giỏ hàng và Avatar Header cập nhật đồng thời ngay khi người dùng thao tác ở trang con. |
| **Phân quyền** | Role-Based Access Control (RBAC) | Phân định rạch ròi 2 quyền: `admin` (quản trị toàn hệ thống) và `khach_hang` (mua sắm). |
