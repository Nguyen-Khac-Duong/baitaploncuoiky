
# Feature Specification: RM-008 — Kênh Người Bán & Quản Lý Gian Hàng (Seller Center)

**Feature Branch**: `008-rm-008-kenh-nguoi-ban`  
**Created**: 2026-11-16  
**Status**: Completed  
**Roadmap ID**: [RM-008](../../docs/roadmap.md#rm-008--kênh-người-bán--quản-lý-gian-hàng-seller-wave-1)  

---

## User Scenarios & Testing

### User Story 1 - Đăng Ký Mở Gian Hàng Mới (Priority: P1)
Là người dùng cá nhân có tài khoản trong hệ thống, tôi muốn đăng ký mở gian hàng bán hàng trực tuyến với tên shop, mô tả, địa chỉ kho và tỷ lệ hoa hồng chiết khấu sàn để bắt đầu kinh doanh.

**Acceptance Scenarios**:
1. **Given** người dùng truy cập `/seller/dang-ky`, **When** điền đầy đủ thông tin tên gian hàng, mô tả, địa chỉ và nhấn "Đăng ký mở shop", **Then** hệ thống ghi nhận hồ sơ và kích hoạt trạng thái gian hàng.
2. **Given** gian hàng đã kích hoạt, **When** người bán truy cập `/seller`, **Then** hệ thống tự động nhận diện và điều hướng vào bảng điều khiển `/seller/tong-quan`.

### User Story 2 - Quản Lý Kho Hàng & Sản Phẩm Của Shop (Priority: P1)
Chủ shop có thể quản lý độc lập kho hàng của riêng mình: xem danh sách sản phẩm, thêm sản phẩm mới, sửa giá, điều chỉnh số lượng tồn kho và cập nhật hình ảnh mà không ảnh hưởng tới gian hàng khác.

**Acceptance Scenarios**:
1. **Given** chủ shop tại `/seller/san-pham`, **When** tải trang, **Then** chỉ các sản phẩm thuộc quyền sở hữu của `CuaHangId` hiện tại mới được hiển thị.
2. **Given** chủ shop thêm mới hoặc cập nhật sản phẩm, **When** lưu thay đổi, **Then** sản phẩm tự động gán `CuaHangId` của shop và đồng bộ với hệ thống catalog toàn sàn.

### User Story 3 - Cài Đặt Thông Tin Gian Hàng (Priority: P2)
Chủ shop có thể cập nhật hotline, email liên hệ, banner quảng bá và mô tả giới thiệu gian hàng tại `/seller/cai-dat`.

---

## Requirements & Backend Integration
- **FR-001**: Kiến trúc phân hệ độc lập: Standalone Component `KhungSellerComponent` (`/seller/*`) bảo vệ bởi `sellerGuard`.
- **FR-002**: API Backend ABP: `ICuaHangAppService` & `ISanPhamAppService` kiểm tra quyền sở hữu `ChuSoHuuId == CurrentUser.Id`.
- **FR-003**: Multi-vendor Catalog: Mỗi sản phẩm gắn chặt với `CuaHangId` duy nhất.
