# Feature Specification: RM-006 — Quản Lý Đơn Hàng Đa Cấp, Hoàn Trả & Đánh Giá

**Feature Branch**: `006-rm-006-quan-ly-don-hang`  
**Updated**: 2026-11-16 (Upgraded to Multi-tier Order Lifecycle, Refund & Review Triggers)  
**Status**: Completed  
**Roadmap ID**: [RM-006](../../docs/roadmap.md#rm-006--quản-lý-đơn-hàng--đơn-hàng-của-tôi-don-hang-wave-2)  

---

## User Scenarios & Testing

### User Story 1 - Khách Hàng Theo Dõi Đơn Mua Tại "Đơn Hàng Của Tôi" (Priority: P1)
Khách hàng truy cập `/don-hang-cua-toi` để xem danh sách các đơn hàng đã đặt:
- Xem tiến độ vận chuyển (`cho_xu_ly`, `dang_giao`, `hoan_thanh`, `da_huy`, `yeu_cau_tra_hang`, `tra_hang`).
- Khi đơn đang giao hoặc đã nhận: Xuất hiện nút **"Yêu Cầu Trả Hàng / Hoàn Tiền"**.
- Khi đơn giao thành công (`hoan_thanh`): Xuất hiện nút **"Đánh Giá Sản Phẩm"** (chấm sao 1-5★ và gửi ảnh).

### User Story 2 - Người Bán Quản Lý & Chuyển Trạng Thái Đơn Hàng Của Shop (Priority: P1)
Chủ shop truy cập `/seller/don-hang` để quản lý các đơn hàng thuộc gian hàng của mình:
- Cập nhật tiến độ: Xác nhận đơn -> Chuyển sang `dang_giao` (bắn thông báo shipper đang giao cho khách).
- Hoàn tất giao hàng: Chuyển sang `hoan_thanh` (tự động quyết toán tiền từ Escrow sang Ví Khả Dụng và kích hoạt thông báo mời khách đánh giá).
- Tiếp nhận và xử lý yêu cầu đổi trả / hoàn tiền từ người mua.

### User Story 3 - Admin Kiểm Soát Toàn Bộ Đơn Hàng Toàn Sàn (Priority: P2)
Admin truy cập `/admin/don-hang` để giám sát toàn bộ các đơn hàng của tất cả các gian hàng trên sàn.

---

## Requirements & Backend Integration
- **FR-001**: API ABP `IDonHangAppService`: `GetDonHangTongByNguoiDungAsync`, `DoiTrangThaiAsync`, `YeuCauTraHangAsync`, `XuLyTraHangAsync`.
- **FR-002**: Tự động kích hoạt thông báo phân lập Buyer vs Seller tương ứng với từng sự kiện chuyển đổi trạng thái đơn hàng.
- **FR-003**: Tự động giải phóng quỹ Escrow sang `SoDuKhaDung` khi đơn hàng thành công.
