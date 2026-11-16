# Feature Specification: RM-010 — Yêu Cầu Trả Hàng & Hoàn Tiền (Return & Refund)

**Feature Branch**: `010-rm-010-tra-hang-hoan-tien`  
**Created**: 2026-11-16  
**Status**: Completed  
**Roadmap ID**: [RM-010](../../docs/roadmap.md#rm-010--yêu-cầu-trả-hàng--hoàn-tiền-don-hang-wave-2)  

---

## User Scenarios & Testing

### User Story 1 - Khách Hàng Gửi Yêu Cầu Trả Hàng / Hoàn Tiền (Priority: P1)
Khách hàng sau khi nhận hàng hoặc khi đơn đang giao gặp vấn đề có thể gửi yêu cầu trả hàng từ màn hình `/don-hang-cua-toi`: chọn lý do đổi trả (sai hàng, lỗi nhà sản xuất, hàng hỏng,...), ghi chú mô tả và đính kèm đường dẫn hình ảnh bằng chứng.

**Acceptance Scenarios**:
1. **Given** đơn hàng ở trạng thái `dang_giao` hoặc `hoan_thanh`, **When** khách mở Modal và gửi `YeuCauTraHangDto`, **Then** trạng thái đơn chuyển sang `yeu_cau_tra_hang` và lưu vết thời gian cùng bằng chứng.
2. **Given** khách cố gắng gửi yêu cầu cho đơn của người khác, **When** gửi lệnh, **Then** hệ thống ném ngoại lệ bảo mật 403.

### User Story 2 - Người Bán / Admin Tiếp Nhận & Phê Duyệt Yêu Cầu (Priority: P1)
Người bán tại `/seller/don-hang` hoặc Admin tại `/admin/don-hang` kiểm tra bằng chứng hoàn trả và quyết định Chấp thuận hoặc Từ chối:
1. **Nếu Chấp thuận**: Trạng thái chuyển `tra_hang`, số lượng sản phẩm tự động hoàn trả vào kho hàng, tiền được trừ hoàn từ ví shop.
2. **Nếu Từ chối**: Trạng thái chuyển `tu_choi_tra_hang`, kèm lý do phản hồi chi tiết tới khách hàng.

---

## Requirements & Backend Integration
- **FR-001**: API Backend ABP: `IDonHangAppService.YeuCauTraHangAsync` & `XuLyTraHangAsync`.
- **FR-002**: Tự động hoàn kho cho các sản phẩm trong đơn (`SanPham.TangSoLuongTon`).
- **FR-003**: Tự động kích hoạt thông báo tiến trình cho cả Người mua và Người bán.
