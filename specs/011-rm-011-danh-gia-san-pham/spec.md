# Feature Specification: RM-011 — Đánh Giá & Nhận Xét Sản Phẩm (Reviews & Ratings)

**Feature Branch**: `011-rm-011-danh-gia-san-pham`  
**Created**: 2026-11-16  
**Status**: Completed  
**Roadmap ID**: [RM-011](../../docs/roadmap.md#rm-011--đánh-giá--nhận-xét-sản-phẩm-client-wave-2)  

---

## User Scenarios & Testing

### User Story 1 - Khách Hàng Chấm Điểm & Đánh Giá Sản Phẩm Đã Mua (Priority: P1)
Khách hàng sau khi đơn hàng chuyển sang `hoan_thanh` có thể mở Modal Đánh giá từ `/don-hang-cua-toi`: chấm điểm từ 1 đến 5 sao, viết nhận xét thực tế và đính kèm URL hình ảnh trải nghiệm.

**Acceptance Scenarios**:
1. **Given** đơn hàng đã giao thành công và khách là chủ đơn, **When** gửi đánh giá qua `TaoDanhGiaDto`, **Then** đánh giá được lưu vào bảng `AppDanhGiaSanPhams`, điểm sao trung bình của sản phẩm được cập nhật lại tự động.
2. **Given** đơn hàng đã từng có yêu cầu hoàn trả, **When** lưu đánh giá, **Then** cờ `DonHangCoHoanTra` được bật để đánh dấu tính xác thực.

### User Story 2 - Hiển Thị Đánh Giá Công Khai Trên Trang Chi Tiết Sản Phẩm (Priority: P1)
Người mua hàng khi duyệt xem sản phẩm tại `/san-pham/:id` có thể xem tổng số sao trung bình, biểu đồ tỷ lệ sao và danh sách chi tiết các nhận xét của người mua trước đó kèm phản hồi của Shop.

### User Story 3 - Chủ Shop Xem & Phản Hồi Đánh Giá (Priority: P2)
Chủ shop truy cập `/seller/danh-gia` để theo dõi các phản hồi về sản phẩm của mình và gửi lời phản hồi / cảm ơn trực tiếp đến từng khách hàng.

---

## Requirements & Backend Integration
- **FR-001**: Thực thể Domain: `DanhGiaSanPham` kế thừa `FullAuditedAggregateRoot<Guid>`.
- **FR-002**: Nghiệp vụ xác thực & tính trung bình sao đặt trong `DanhGiaManager`.
- **FR-003**: API ABP: `IDanhGiaAppService` (`TaoDanhGiaAsync`, `GetDanhSachTheoSanPhamAsync`, `ShopPhanHoiAsync`).
