# Feature Specification: RM-001 — Đăng Nhập & Đăng Ký Đa Vai Trò (Multi-Role Authentication)

**Feature Branch**: `001-rm-001-dang-nhap`  
**Updated**: 2026-11-16 (Upgraded to Multi-vendor Marketplace)  
**Status**: Completed  
**Roadmap ID**: [RM-001](../../docs/roadmap.md#rm-001--đăng-nhập--đăng-ký-auth-wave-0)  
**Input**: Hệ thống xác thực định danh đa vai trò cho Sàn Thương Mại Điện Tử Đa Gian Hàng.

---

## User Scenarios & Testing

### User Story 1 - Phân Định Danh Tính & Điều Hướng Theo 3 Vai Trò (Priority: P1)
Là người dùng (Quản trị viên sàn / Chủ shop Người bán / Khách mua hàng), tôi muốn đăng nhập bằng email và mật khẩu, hệ thống tự động nhận diện vai trò và điều hướng vào đúng không gian làm việc tương ứng.

**Acceptance Scenarios**:
1. **Given** tài khoản Platform Admin (`admin@gmail.com`), **When** đăng nhập thành công, **Then** chuyển hướng vào Kênh Quản Trị Sàn `/admin/tong-quan`.
2. **Given** tài khoản Chủ Gian Hàng (Seller), **When** đăng nhập thành công, **Then** hệ thống nhận diện `CuaHang` thuộc sở hữu và điều hướng thẳng vào Kênh Người Bán `/seller/tong-quan` (hoặc `/seller/dang-ky` nếu chưa mở shop).
3. **Given** tài khoản Khách Mua Hàng (Buyer), **When** đăng nhập thành công, **Then** chuyển hướng vào Cửa Hàng `/cua-hang` hoặc trang mua sắm trước đó.

### User Story 2 - Đăng Ký Tài Khoản Khách Hàng & Nâng Cấp Gian Hàng (Priority: P1)
Khách hàng mới có thể tự do đăng ký tài khoản mua sắm cá nhân. Sau khi có tài khoản, khách hàng có thể nâng cấp mở gian hàng kinh doanh thông qua Kênh Người Bán mà không cần tạo tài khoản riêng.

### User Story 3 - Chuyển Đổi Nhanh Tài Khoản Mẫu Test (Priority: P2)
Cung cấp các nút đăng nhập nhanh 1-click cho cả 3 vai trò mẫu (Admin, Chủ Shop, Khách hàng) để phục vụ chấm điểm và kiểm thử luồng nghiệp vụ.

---

## Requirements & Backend Integration
- **FR-001**: ABP Identity OpenIddict xác thực JWT Token, lưu thông tin phiên qua `XacThucService`.
- **FR-002**: Tự động tra cứu `CuaHang` theo `ChuSoHuuId` sau khi đăng nhập thành công để quyết định luồng chuyển hướng.
- **FR-003**: Mã hóa mật khẩu an toàn, thông báo lỗi xác thực thân thiện.
