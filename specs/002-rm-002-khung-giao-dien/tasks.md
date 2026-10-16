# Tasks: RM-002 — Khung Giao Diện & Bộ Lọc Phân Quyền

**Input**: Design documents from `/specs/002-rm-002-khung-giao-dien/`  
**Status**: Completed  
**Branch**: `002-rm-002-khung-giao-dien`

---

## Phase 1: Setup & Layout Shells
- [x] T001 Khởi tạo Standalone Component `KhungKhachHangComponent` với RouterOutlet và Header/Footer.
- [x] T002 Khởi tạo Standalone Component `KhungChinhComponent` cho Admin với Header và Sidebar.
- [x] T003 Tích hợp `ChatBotComponent` vào khung giao diện khách hàng.

---

## Phase 2: User Story 1 - Header Khách Hàng & Badge Giỏ Hàng
- [x] T004 Liên kết Signal `currentUser` hiển thị thông tin đăng nhập trên Header.
- [x] T005 Liên kết Computed Signal `tongSoLuongGioHang` hiển thị Badge số lượng món realtime.
- [x] T006 Xử lý sự kiện Đăng xuất (xóa phiên và chuyển về `/dang-nhap`).

---

## Phase 3: User Story 2 - Khung Quản Trị & Sidebar Toggle
- [x] T007 Xây dựng `SidebarComponent` với danh mục menu quản trị (Tổng quan, Sản phẩm, Đơn hàng).
- [x] T008 Triển khai hàm `onToggleSidebar()` điều chỉnh cờ `sidebarThuGon` mở rộng/thu nhỏ sidebar.

---

## Phase 4: User Story 3 - Route Guards & RBAC
- [x] T009 Triển khai `adminGuard` kiểm tra role `admin`, redirect về `/dang-nhap?returnUrl=...` nếu không hợp lệ.
- [x] T010 Triển khai `khachHangGuard` bảo vệ route `/don-hang-cua-toi`.

---

## Phase 5: Verification & Polish
- [x] T011 Kiểm tra responsive trên các kích thước màn hình.
- [x] T012 Chạy typecheck `npx tsc -p tsconfig.app.json --noEmit` -> Đạt 0 lỗi.
