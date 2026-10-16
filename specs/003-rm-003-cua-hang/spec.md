# Feature Specification: RM-003 — Cửa Hàng & Danh Mục Sản Phẩm (Client)

**Feature Branch**: `003-rm-003-cua-hang`  
**Created**: 2026-10-14  
**Status**: Completed  
**Roadmap ID**: [RM-003](../../docs/roadmap.md#rm-003--cửa-hàng--danh-mục-sản-phẩm-client-wave-1)  

---

## User Scenarios & Testing

### User Story 1 - Xem Danh Sách Sản Phẩm & Lọc Danh Mục (Priority: P1)
Là khách mua hàng, tôi muốn xem danh sách sản phẩm dạng lưới (Card Grid), có thể lọc sản phẩm theo các danh mục (Điện thoại, Laptop, Phụ kiện, v.v.) và tìm kiếm theo tên sản phẩm.

**Acceptance Scenarios**:
1. **Given** khách vào trang `/cua-hang`, **When** tải trang, **Then** danh sách sản phẩm hiển thị với ảnh, tên, giá tiền, badge danh mục và tình trạng tồn kho.
2. **Given** khách chọn 1 danh mục cụ thể hoặc gõ từ khóa tìm kiếm, **When** lọc, **Then** lưới sản phẩm tự động cập nhật kết quả lọc tương ứng ngay lập tức.

### User Story 2 - Thêm Nhanh Vào Giỏ Hàng (Priority: P1)
Khách hàng có thể bấm nút "Thêm vào giỏ" ngay trên từng thẻ sản phẩm để đưa món hàng vào giỏ mà không bị chuyển trang.

**Acceptance Scenarios**:
1. **Given** sản phẩm còn hàng (`soLuongTon > 0`), **When** khách bấm nút "Thêm vào giỏ", **Then** số lượng trong giỏ hàng tăng lên, badge giỏ hàng trên Header nhảy số và có Toast thông báo thành công.
2. **Given** sản phẩm hết hàng (`soLuongTon === 0`), **When** hiển thị trên UI, **Then** nút mua bị vô hiệu hóa với nhãn "Hết hàng".

---

## Requirements
- **FR-001**: Component `CuaHangComponent` Standalone, đồng bộ danh sách qua `DuLieuService.sanPhamListSignal()`.
- **FR-002**: Lọc danh mục và tìm kiếm sử dụng reactive signals / computed signals.
- **FR-003**: Định dạng giá tiền chuẩn tiền tệ Việt Nam Đồng (`1.000.000 đ`).
