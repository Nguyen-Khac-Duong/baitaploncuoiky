# Feature Specification: RM-013 — Quản Trị Hệ Thống Sàn (Platform Administration)

**Feature Branch**: `013-rm-013-quan-tri-san-admin`  
**Created**: 2026-11-16  
**Status**: Completed  
**Roadmap ID**: [RM-013](../../docs/roadmap.md#rm-013--quản-trị-hệ-thống-sàn-admin-wave-3)  

---

## User Scenarios & Testing

### User Story 1 - Quản Lý Danh Mục Ngành Hàng Toàn Sàn (Priority: P1)
Platform Admin truy cập `/admin/danh-muc` để quản lý cây danh mục sản phẩm (Vợt cầu lông, Giày, Áo quần, Phụ kiện,...), thêm mới, sửa tên và xóa danh mục để các gian hàng phân loại sản phẩm.

### User Story 2 - Quản Lý & Phê Duyệt Hồ Sơ Gian Hàng (Priority: P1)
Platform Admin truy cập `/admin/gian-hang` để kiểm tra danh sách toàn bộ gian hàng đang hoạt động, khóa/mở khóa gian hàng vi phạm và điều chỉnh tỷ lệ hoa hồng sàn.

### User Story 3 - Phê Duyệt Lệnh Rút Tiền Của Người Bán (Priority: P1)
Admin truy cập `/admin/rut-tien` để kiểm tra các yêu cầu rút tiền từ ví của các shop, đối chiếu thông tin tài khoản ngân hàng và bấm "Phê duyệt" hoặc "Từ chối" lệnh rút.

---

## Requirements & Backend Integration
- **FR-001**: Bảo vệ toàn bộ phân hệ bởi `adminGuard` và phân quyền ABP Permission `testtttt88Permissions`.
- **FR-002**: API Backend ABP: Quản lý danh mục, phê duyệt gian hàng và đối soát rút tiền.
- **FR-003**: Frontend Angular: Standalone components `AdminDanhMucComponent`, `AdminGianHangComponent`, `AdminRutTienComponent`.
