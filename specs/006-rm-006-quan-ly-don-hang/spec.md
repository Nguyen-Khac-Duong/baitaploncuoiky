# Feature Specification: RM-006 — Quản Lý Đơn Hàng & Đơn Hàng Của Tôi

**Feature Branch**: `006-rm-006-quan-ly-don-hang`  
**Created**: 2026-10-14  
**Status**: Completed  
**Roadmap ID**: [RM-006](../../docs/roadmap.md#rm-006--quản-lý-đơn-hàng--đơn-hàng-của-tôi-don-hang-wave-2)  

---

## User Scenarios & Testing

### User Story 1 - Khách Hàng Tra Cứu "Đơn Hàng Của Tôi" (Priority: P1)
Khách hàng đã đăng nhập truy cập `/don-hang-cua-toi` để xem danh sách lịch sử các đơn hàng đã đặt, trạng thái giao vận (Chờ xử lý, Đang giao, Hoàn thành, Đã hủy) và chi tiết từng món hàng trong đơn.

### User Story 2 - Quản Trị Viên Quản Lý & Chuyển Trạng Thái Đơn Hàng (Priority: P1)
Admin truy cập `/admin/don-hang` để xem danh sách toàn bộ đơn hàng trong hệ thống, tìm kiếm theo mã đơn hoặc tên khách, bấm đổi trạng thái đơn (từ `cho_xu_ly` -> `dang_giao` -> `hoan_thanh` hoặc `da_huy`).

### User Story 3 - Chi Tiết Đơn Hàng (Modal Popup) (Priority: P2)
Admin và Khách hàng có thể bấm "Xem chi tiết" để mở Modal xem danh sách các sản phẩm kèm hình ảnh, đơn giá, số lượng và tổng thanh toán.

---

## Requirements & Backend Integration
- **FR-001**: API Backend ABP `IDonHangAppService`:
  - `GET /api/app/don-hang`: Danh sách đơn hàng toàn hệ thống.
  - `PUT /api/app/don-hang/{id}/trang-thai`: Cập nhật trạng thái đơn qua `DoiTrangThaiDonHangDto`.
- **FR-002**: Lọc đơn hàng theo `nguoiDungId` khi hiển thị cho khách hàng cá nhân.
