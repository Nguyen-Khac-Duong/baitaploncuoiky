# Feature Specification: RM-012 — Hệ Thống Thông Báo Đa Kênh Buyer & Seller

**Feature Branch**: `012-rm-012-he-thong-thong-bao`  
**Created**: 2026-11-16  
**Status**: Completed  
**Roadmap ID**: [RM-012](../../docs/roadmap.md#rm-012--hệ-thống-thông-báo-đa-kênh-buyer--seller-shared-wave-2)  

---

## User Scenarios & Testing

### User Story 1 - Phân Lập Độc Lập Kênh Thông Báo Giữa Buyer và Seller (Priority: P1)
Hệ thống phân định rạch ròi phạm vi thông báo theo trường `doiTuong` (`buyer` hoặc `seller`), đảm bảo người dùng đóng cả hai vai trò (khách mua và chủ shop) không bị lẫn lộn thông báo giữa hai phân hệ.

**Acceptance Scenarios**:
1. **Given** người dùng tại phân hệ Khách mua (`KhungKhachHangComponent`), **When** mở chuông thông báo, **Then** chỉ các thông báo sự kiện mua sắm (`doiTuong == "buyer"`) được hiển thị.
2. **Given** người dùng tại Kênh Người Bán (`KhungSellerComponent`), **When** mở chuông thông báo, **Then** chỉ các thông báo quản trị đơn và doanh thu (`doiTuong == "seller"`) được hiển thị.

### User Story 2 - Kích Hoạt Tự Động Theo Vòng Đời Nghiệp Vụ (Priority: P1)
Thông báo được tự động tạo và gửi đến đúng đối tượng khi phát sinh sự kiện:
- **Buyer**: Đặt hàng thành công, đơn đang vận chuyển, giao hàng thành công & mời đánh giá, đơn hoàn trả được duyệt/từ chối, shop phản hồi đánh giá.
- **Seller**: Có đơn hàng mới cần gói hàng, khách vừa gửi đánh giá mới, khách gửi yêu cầu trả hàng, tiền quyết toán về Ví Khả Dụng.

### User Story 3 - Tương Tác & Thao Tác Thông Báo (Priority: P2)
Người dùng có thể đánh dấu đã đọc một thông báo, đánh dấu đã đọc toàn bộ hoặc xóa thông báo mà không làm mất thông báo của phân hệ đối diện.

---

## Requirements & Backend Integration
- **FR-001**: Thực thể Domain: `ThongBao` kế thừa `FullAuditedAggregateRoot<Guid>` có cột `DoiTuong` (`buyer` / `seller`).
- **FR-002**: API ABP: `IThongBaoAppService` với các phương thức lọc `doiTuong`.
- **FR-003**: Frontend Angular: Dropdown chuông thông báo tích hợp Angular Signals (`soChuaDoc`, `danhSachThongBao`) và Badge số lượng.
