# Feature Specification: RM-005 — Giỏ Hàng & Tách Đơn Đa Gian Hàng (Multi-vendor Split Order)

**Feature Branch**: `005-rm-005-gio-hang`  
**Updated**: 2026-11-16 (Upgraded to Split Orders & Escrow Holding)  
**Status**: Completed  
**Roadmap ID**: [RM-005](../../docs/roadmap.md#rm-005--giỏ-hàng--đặt-hàng-split-order-client-wave-2)  

---

## User Scenarios & Testing

### User Story 1 - Giỏ Hàng Đa Gian Hàng (Multi-Shop Cart) (Priority: P1)
Khách hàng có thể thêm vào giỏ hàng các sản phẩm từ nhiều cửa hàng khác nhau cùng lúc. Màn hình `/gio-hang` hiển thị danh sách các món, tự động nhóm theo từng Gian hàng để khách hàng dễ theo dõi.

### User Story 2 - Đặt Hàng & Tự Động Chia Đơn (Split Order) (Priority: P1)
Khi khách hàng điền thông tin giao hàng (Tên, SĐT, Địa chỉ, Ghi chú) và bấm "Đặt hàng":
1. Hệ thống tạo một **Đơn Hàng Tổng (Master Order - `DonHangTong`)** đại diện cho toàn bộ thanh toán của người mua.
2. Tự động chia tách thành các **Đơn Hàng Con (Sub-Orders - `DonHang`)** theo từng gian hàng tương ứng.
3. Tự động trừ tồn kho của từng sản phẩm.
4. Số tiền của từng đơn con (sau khi trừ chiết khấu hoa hồng) được chuyển vào quỹ tạm giữ Escrow (`TienTamGiu`) của từng gian hàng tương ứng.
5. Tự động bắn thông báo cho cả Người mua (Đặt hàng thành công) và từng Người bán (Có đơn hàng mới cần gói hàng).

---

## Requirements & Backend Integration
- **FR-001**: API Backend ABP `IDonHangAppService.TaoDonHangTongAsync(CreateDonHangDto)`.
- **FR-002**: Tự động tính tỷ lệ hoa hồng sàn (`PhanTramHoaHong`) cấu hình theo từng gian hàng.
- **FR-003**: Đưa tiền vào `ViCuaHangManager.GhiNhanDonHangMoiAsync`.
