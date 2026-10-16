# Feature Specification: RM-004 — Quản Lý Sản Phẩm (Admin CRUD)

**Feature Branch**: `004-rm-004-quan-ly-san-pham`  
**Created**: 2026-10-14  
**Status**: Completed  
**Roadmap ID**: [RM-004](../../docs/roadmap.md#rm-004--quản-lý-sản-phẩm-admin-crud-admin-wave-1)  

---

## User Scenarios & Testing

### User Story 1 - Xem Danh Sách Dạng Bảng & Phân Trang (Priority: P1)
Là Quản trị viên, tôi muốn xem toàn bộ danh mục sản phẩm trong cửa hàng dưới dạng bảng chi tiết (Mã SP, Tên, Danh mục, Giá bán, Tồn kho, Ngày tạo, Thao tác).

### User Story 2 - Thêm Mới & Chỉnh Sửa Sản Phẩm (Priority: P1)
Admin có thể mở Modal Form để thêm mới sản phẩm hoặc sửa thông tin sản phẩm đã có. Form kiểm tra hợp lệ các trường bắt buộc (Mã SP không trùng, Giá >= 0, Tồn kho >= 0).

### User Story 3 - Xóa Sản Phẩm (Soft Delete) (Priority: P2)
Admin có thể xóa sản phẩm kèm hộp thoại xác nhận ("Bạn có chắc chắn muốn xóa?"). Khi xóa thành công, sản phẩm biến mất khỏi danh sách quản trị và phía cửa hàng người mua.

---

## Requirements & Backend Integration
- **FR-001**: Kết nối API Backend ABP `ISanPhamAppService`:
  - `GET /api/app/san-pham`: Lấy danh sách sản phẩm.
  - `POST /api/app/san-pham`: Tạo sản phẩm mới (`CreateUpdateSanPhamDto`).
  - `PUT /api/app/san-pham/{id}`: Cập nhật thông tin sản phẩm.
  - `DELETE /api/app/san-pham/{id}`: Xóa sản phẩm (Soft delete `FullAuditedAggregateRoot`).
- **FR-002**: Validation Reactive Forms bắt lỗi trực tiếp trên giao diện modal.
