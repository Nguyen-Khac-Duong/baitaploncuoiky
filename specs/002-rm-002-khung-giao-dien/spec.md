# Feature Specification: RM-002 — Khung Giao Diện & Bộ Lọc Phân Quyền (Multi-Shell Layout & RBAC)

**Feature Branch**: `002-rm-002-khung-giao-dien`  
**Updated**: 2026-11-16 (Upgraded to Multi-vendor Shells)  
**Status**: Completed  
**Roadmap ID**: [RM-002](../../docs/roadmap.md#rm-002--khung-giao-diện--bộ-lọc-phân-quyền-shared-wave-0)  

---

## User Scenarios & Testing

### User Story 1 - Khung Khách Hàng (Buyer Shell Layout) (Priority: P1)
Khách hàng mua sắm tương tác với `KhungKhachHangComponent`: Header tìm kiếm sản phẩm, badge giỏ hàng cập nhật số lượng realtime, nút "Đơn hàng của tôi", và **Dropdown Chuông thông báo dành riêng cho người mua** (`DoiTuongBuyer`).

### User Story 2 - Khung Kênh Người Bán Độc Lập (Seller Shell Layout) (Priority: P1)
Người bán vận hành qua `KhungSellerComponent`: Sidebar nghiệp vụ shop (Tổng quan, Kho sản phẩm, Đơn hàng, Đánh giá, Ví tiền, Cài đặt), Header hiển thị tên shop, tỷ lệ hoa hồng, **Dropdown Chuông thông báo dành riêng cho người bán** (`DoiTuongSeller`). Loại bỏ hoàn toàn các nút dư thừa không thuộc luồng nghiệp vụ.

### User Story 3 - Khung Quản Trị Hệ Thống Sàn (Admin Shell Layout) (Priority: P1)
Platform Admin tương tác với `KhungChinhComponent`: Sidebar quản lý danh mục toàn sàn, phê duyệt gian hàng, phê duyệt lệnh rút tiền ví, quản lý tài khoản và thống kê tổng hợp.

### User Story 4 - Bộ Lọc Tuyến Đường (RBAC Route Guards 3 Cấp) (Priority: P1)
- `adminGuard`: Bảo vệ toàn bộ route `/admin/*`, chỉ tài khoản vai trò `admin` mới được truy cập.
- `sellerGuard`: Bảo vệ toàn bộ route `/seller/*`, yêu cầu đăng nhập và có gian hàng hợp lệ.
- `khachHangGuard`: Bảo vệ route dữ liệu cá nhân khách hàng `/don-hang-cua-toi`.

---

## Requirements & Frontend Architecture
- **FR-001**: 3 Standalone Layout Components độc lập sử dụng Angular 18 Signals.
- **FR-002**: Tách biệt giao diện và phân quyền tuyệt đối giữa Buyer, Seller và Platform Admin.
