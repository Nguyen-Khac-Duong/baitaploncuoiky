# Feature Specification: RM-004 — Quản Lý Sản Phẩm Sàn & Phân Phối Kho (Catalog Administration)

**Feature Branch**: `004-rm-004-quan-ly-san-pham`  
**Updated**: 2026-11-16 (Upgraded to Multi-vendor Store Association)  
**Status**: Completed  
**Roadmap ID**: [RM-004](../../docs/roadmap.md#rm-004--quản-lý-sản-phẩm-admin-crud-admin-wave-1)  

---

## User Scenarios & Testing

### User Story 1 - Quản Lý Sản Phẩm Toàn Sàn Dành Cho Admin (Priority: P1)
Admin sàn truy cập `/admin/san-pham` để kiểm soát toàn bộ sản phẩm trên hệ thống: xem danh sách dạng bảng, phân trang, gán sản phẩm vào đúng Gian hàng (`CuaHangId`) và Danh mục (`DanhMucId`).

### User Story 2 - Thêm Mới & Chỉnh Sửa Sản Phẩm Chuẩn DDD (Priority: P1)
Admin hoặc Chủ shop nhập thông tin sản phẩm: Tên, Mô tả, Giá bán, Số lượng tồn kho, Hình ảnh, Gian hàng sở hữu và Danh mục.
- Kiểm tra tính hợp lệ dữ liệu (giá > 0, tồn kho >= 0).
- Hỗ trợ Soft Delete (`IsDeleted`), bảo vệ toàn vẹn lịch sử đơn hàng.

---

## Requirements & Backend Integration
- **FR-001**: Thực thể Domain `SanPham` kế thừa `FullAuditedAggregateRoot<Guid>`, có quan hệ với `CuaHangId` và `DanhMucId`.
- **FR-002**: Nghiệp vụ cập nhật tồn kho, thay đổi trạng thái đóng gói trong `SanPhamManager`.
- **FR-003**: DTOs: `SanPhamDto`, `CreateUpdateSanPhamDto` với Fluent Validation.
