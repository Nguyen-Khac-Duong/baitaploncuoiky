# Feature Specification: RM-005 — Giỏ Hàng & Đặt Hàng (Client)

**Feature Branch**: `005-rm-005-gio-hang`  
**Created**: 2026-10-14  
**Status**: Completed  
**Roadmap ID**: [RM-005](../../docs/roadmap.md#rm-005--giỏ-hàng--đặt-hàng-client-wave-2)  

---

## User Scenarios & Testing

### User Story 1 - Xem & Điều Chỉnh Giỏ Hàng (Priority: P1)
Khách hàng có thể tăng, giảm số lượng từng món trong giỏ hàng, xóa món hàng hoặc làm sạch toàn bộ giỏ. Tổng tiền và số lượng giỏ cập nhật theo thời gian thực (Realtime Computed Signal).

### User Story 2 - Điền Thông Tin Nhận Hàng & Đặt Hàng (Priority: P1)
Khách hàng điền thông tin người nhận (Họ tên, Số điện thoại, Địa chỉ giao hàng, Ghi chú). Hệ thống tự động điền thông tin nếu khách hàng đã đăng nhập. Bấm "Xác nhận Đặt Hàng" để tạo đơn.

### User Story 3 - Xử Lý Sau Khi Đặt Hàng Thành Công (Priority: P1)
- Xóa sạch giỏ hàng hiện tại.
- Hiển thị Toast thông báo đặt hàng thành công kèm Mã Đơn Hàng.
- Điều hướng người dùng đến màn hình "Đơn hàng của tôi" (`/don-hang-cua-toi`).

---

## Requirements & Backend Integration
- **FR-001**: Quản lý giỏ hàng bằng Signal `gioHang = signal<MonGioHang[]>()`, lưu trữ dự phòng `user_du_lieu_gio_hang`.
- **FR-002**: Gửi request tạo đơn hàng đến Backend ABP `IDonHangAppService` (`POST /api/app/don-hang` với `CreateDonHangDto`).
- **FR-003**: Kiểm tra validation bắt buộc SĐT nhận hàng (9-11 số), địa chỉ nhận hàng (tối thiểu 5 ký tự).
