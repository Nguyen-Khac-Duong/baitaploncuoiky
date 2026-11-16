# Feature Specification: RM-003 — Cửa Hàng & Danh Mục Sản Phẩm Đa Gian Hàng (Marketplace Catalog)

**Feature Branch**: `003-rm-003-cua-hang`  
**Updated**: 2026-11-16 (Upgraded to Multi-vendor Catalog & Review Integration)  
**Status**: Completed  
**Roadmap ID**: [RM-003](../../docs/roadmap.md#rm-003--cửa-hàng--danh-mục-sản-phẩm-client-wave-1)  

---

## User Scenarios & Testing

### User Story 1 - Khám Phá Sản Phẩm Toàn Sàn & Lọc Đa Tiêu Chí (Priority: P1)
Khách hàng truy cập `/cua-hang` để xem danh sách sản phẩm của tất cả các gian hàng trên sàn. Mỗi thẻ sản phẩm hiển thị ảnh, tên, giá bán, badge danh mục, badge tên gian hàng bán (`TenCuaHang`) và tình trạng tồn kho.
- Hỗ trợ lọc theo Danh mục ngành hàng.
- Hỗ trợ tìm kiếm theo tên sản phẩm.

### User Story 2 - Xem Chi Tiết Gian Hàng Cụ Thể (Storefront) (Priority: P1)
Khách hàng có thể bấm vào tên gian hàng để xem trang riêng của Shop `/shop/:slug`, hiển thị thông tin giới thiệu, địa chỉ, hotline và chỉ lọc các sản phẩm do chính Shop đó cung cấp.

### User Story 3 - Trang Chi Tiết Sản Phẩm & Tích Hợp Đánh Giá (Priority: P1)
Khách hàng truy cập `/san-pham/:id` để xem thông tin chi tiết: mô tả, hình ảnh lớn, giá bán, nút chọn số lượng thêm vào giỏ, và **Tab Đánh Giá Nhận Xét** hiển thị số sao trung bình, đánh giá thực tế của người mua và phản hồi từ chủ Shop.

---

## Requirements & Backend Integration
- **FR-001**: API Backend ABP `ISanPhamAppService.GetListAsync` trả về thông tin sản phẩm kèm `CuaHangId`, `TenCuaHang`, `DanhMucId`.
- **FR-002**: Tích hợp dữ liệu đánh giá thực tế từ `IDanhGiaAppService`.
- **FR-003**: Frontend Angular Signals quản lý trạng thái lọc và tìm kiếm tức thì.
