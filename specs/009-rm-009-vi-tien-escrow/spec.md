# Feature Specification: RM-009 — Ví Doanh Thu & Quyết Toán Escrow (Multi-vendor Escrow Wallet)

**Feature Branch**: `009-rm-009-vi-tien-escrow`  
**Created**: 2026-11-16  
**Status**: Completed  
**Roadmap ID**: [RM-009](../../docs/roadmap.md#rm-009--ví-doanh-thu--quyết-toán-escrow-seller-wave-2)  

---

## User Scenarios & Testing

### User Story 1 - Tạm Giữ Tiền Bảo Chứng Đơn Hàng (Escrow) (Priority: P1)
Khi khách hàng đặt đơn hàng trực tuyến, số tiền bán hàng (sau khi trừ chiết khấu hoa hồng sàn) sẽ tự động được đưa vào quỹ `TienTamGiu` (Escrow) của người bán nhằm đảm bảo quyền lợi khách hàng trong suốt quá trình vận chuyển.

**Acceptance Scenarios**:
1. **Given** đơn hàng mới được tạo thành công, **When** ghi nhận vào hệ thống ví qua `ViCuaHangManager.GhiNhanDonHangMoiAsync`, **Then** quỹ `TienTamGiu` của shop tăng lên tương ứng và lưu vết trong lịch sử biến động số dư.

### User Story 2 - Quyết Toán Tự Động Sang Số Dư Khả Dụng (Priority: P1)
Khi đơn hàng được giao thành công và chuyển sang trạng thái `Hoàn thành`, hệ thống tự động giải phóng tiền từ quỹ tạm giữ sang `SoDuKhaDung`.

**Acceptance Scenarios**:
1. **Given** đơn hàng chuyển sang trạng thái `hoan_thanh`, **When** gọi `QuyetToanDonHangAsync`, **Then** số tiền được trừ khỏi `TienTamGiu` và cộng thẳng vào `SoDuKhaDung`.
2. **Given** đơn hàng bị hủy trước khi giao, **When** hủy đơn, **Then** số tiền tạm giữ tự động được gỡ bỏ khỏi quỹ Escrow.

### User Story 3 - Yêu Cầu Rút Tiền Về Ngân Hàng & Admin Phê Duyệt (Priority: P2)
Chủ shop có thể tạo lệnh rút tiền từ số dư khả dụng về tài khoản ngân hàng chính chủ (`/seller/vi-tien`). Quản trị viên sàn kiểm tra và phê duyệt lệnh rút tại `/admin/rut-tien`.

---

## Requirements & Backend Integration
- **FR-001**: Thực thể Domain: `ViCuaHang`, `BienDongSoDuVi`, `YeuCauRutTien` kế thừa `FullAuditedAggregateRoot<Guid>`.
- **FR-002**: Quản lý tính toàn vẹn tài chính bằng `ViCuaHangManager`: khóa giao dịch số dư, ngăn ngừa rút quá số dư khả dụng.
- **FR-003**: Giao diện Angular Signals: `SellerViTienComponent` và `AdminRutTienComponent` phản hồi số dư thời gian thực.
