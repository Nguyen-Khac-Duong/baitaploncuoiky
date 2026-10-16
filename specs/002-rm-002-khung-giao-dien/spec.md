# Feature Specification: RM-002 — Khung Giao Diện & Bộ Lọc Phân Quyền (Layout & RBAC)

**Feature Branch**: `002-rm-002-khung-giao-dien`  
**Created**: 2026-10-14  
**Status**: Completed  
**Roadmap ID**: [RM-002](../../docs/roadmap.md#rm-002--khung-giao-diện--bộ-lọc-phân-quyền-shared-wave-0)  
**Input**: Đặc tả kiến trúc khung vỏ ứng dụng (Shell Layouts), thanh điều hướng người dùng và cơ chế bảo vệ phân quyền (RBAC Route Guards).

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Khung Khách Hàng Thân Thiện & Badge Giỏ Hàng Realtime (Priority: P1)

Là khách hàng ghé thăm cửa hàng trực tuyến, tôi muốn nhìn thấy thanh Header hiện đại hiển thị thương hiệu ShopTech, thanh tìm kiếm nhanh, badge số lượng món trong giỏ hàng cập nhật tức thì và khu vực hiển thị trạng thái đăng nhập để thuận tiện mua sắm.

**Why this priority**: Layout khách hàng là bộ mặt của hệ thống thương mại điện tử, ảnh hưởng trực tiếp đến trải nghiệm người dùng và tỷ lệ giữ chân khách hàng.

**Independent Test**: Mở trình duyệt tại trang chủ `/cua-hang`, kiểm tra hiển thị Header, Footer, thử thêm 1 món vào giỏ hàng và quan sát badge số lượng nhảy số ngay lập tức mà không cần tải lại trang.

**Acceptance Scenarios**:

1. **Given** người dùng chưa đăng nhập, **When** truy cập bất kỳ trang client nào (`/cua-hang`, `/gio-hang`), **Then** thanh Header hiển thị nút "Đăng nhập", giỏ hàng hiển thị đúng số lượng món đã lưu trong LocalStorage.
2. **Given** khách hàng đã đăng nhập, **When** nhìn vào thanh Header, **Then** hiển thị avatar chữ cái, họ tên khách hàng, nút truy cập nhanh "Đơn hàng của tôi" và nút "Đăng xuất".
3. **Given** người dùng bấm nút "Đăng xuất", **When** xác nhận, **Then** phiên đăng nhập bị hủy, Header lập tức chuyển về trạng thái khách vãng lai và điều hướng về trang đăng nhập.

---

### User Story 2 - Khung Quản Trị Admin Hiện Đại Với Sidebar Co Giãn (Priority: P1)

Là Quản trị viên (Chủ shop), tôi muốn làm việc trong một khung giao diện quản trị riêng biệt (`/admin/*`) với thanh Sidebar bên trái chứa các menu nghiệp vụ (Tổng quan, Sản phẩm, Đơn hàng) và có nút Toggle thu gọn sidebar để mở rộng không gian xem dữ liệu dạng bảng.

**Why this priority**: Quản trị viên cần không gian hiển thị rộng rãi để quản lý hàng trăm sản phẩm và đơn hàng hiệu quả.

**Independent Test**: Đăng nhập tài khoản Admin, truy cập `/admin/tong-quan`, bấm nút toggle sidebar ở góc trên bên trái để thu gọn và mở rộng sidebar.

**Acceptance Scenarios**:

1. **Given** Admin đăng nhập thành công, **When** vào `/admin/*`, **Then** khung `KhungChinhComponent` hiển thị đầy đủ Header quản trị, thông tin admin đăng nhập và Sidebar với các icon trực quan.
2. **Given** Admin bấm nút Toggle Sidebar, **When** click, **Then** Sidebar thu nhỏ về dạng icon (khoảng 70px) và khu vực nội dung chính (`RouterOutlet`) tự động dãn rộng tương ứng.

---

### User Story 3 - Bảo Vệ Tuyến Đường Bằng RBAC Route Guards (Priority: P1)

Là quản trị viên hệ thống, tôi muốn các đường dẫn quản trị nhạy cảm (`/admin/*`) và dữ liệu cá nhân (`/don-hang-cua-toi`) phải được kiểm soát truy cập nghiêm ngặt bằng Route Guards để ngăn chặn rò rỉ dữ liệu hoặc thao tác trái phép.

**Why this priority**: Bảo mật phân quyền là yêu cầu tiên quyết của đồ án và chuẩn kiến trúc doanh nghiệp.

**Independent Test**: Khi chưa đăng nhập hoặc đang đăng nhập tài khoản Khách hàng, gõ trực tiếp URL `/admin/san-pham` trên thanh địa chỉ trình duyệt -> xác nhận bị chặn.

**Acceptance Scenarios**:

1. **Given** người dùng chưa đăng nhập, **When** gõ link `/admin/tong-quan` hoặc `/admin/san-pham`, **Then** `adminGuard` chặn lại ngay lập tức, lưu lại `returnUrl` và chuyển hướng người dùng về `/dang-nhap`.
2. **Given** người dùng đăng nhập với vai trò `khach_hang`, **When** cố tình gõ link `/admin/*`, **Then** `adminGuard` chặn lại, hiển thị cảnh báo từ chối truy cập và đưa về `/cua-hang`.
3. **Given** người dùng chưa đăng nhập, **When** vào `/don-hang-cua-toi`, **Then** `khachHangGuard` chặn lại và yêu cầu đăng nhập trước khi xem lịch sử mua sắm.

---

### Edge Cases

- **Màn hình kích thước nhỏ (Mobile/Tablet Responsive)**: Sidebar admin tự động thu gọn hoặc ẩn dạng drawer khi chiều rộng màn hình < 768px.
- **Reload trang bất ngờ (F5)**: Route Guards phải đọc trực tiếp từ Signal đã đồng bộ LocalStorage để không đá người dùng ra ngoài màn hình đăng nhập nếu phiên vẫn còn hiệu lực.
- **Tuyến đường không tồn tại (Wildcard 404)**: Khi người dùng gõ đường dẫn lạ, hệ thống tự động fallback về `/cua-hang`.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Toàn bộ Layout Client (`KhungKhachHangComponent`) và Admin (`KhungChinhComponent`) PHẢI là Standalone Components, không phụ thuộc `NgModule`.
- **FR-002**: Trạng thái người dùng hiện tại và số lượng giỏ hàng trên Header PHẢI đồng bộ thời gian thực 100% bằng Angular Signals (`currentUser`, `tongSoLuongGioHang`).
- **FR-003**: Route Guards PHẢI sử dụng hàm Functional Guard của Angular 18 (`CanActivateFn`) thay vì class guard kế thừa kiểu cũ.
- **FR-004**: Tích hợp sẵn hộp thoại Chatbot AI Gemini nổi ở góc dưới bên phải khung khách hàng.

---

## Success Criteria *(mandatory)*

- **SC-001**: 100% các route `/admin/*` chặn thành công người dùng không có vai trò `admin`.
- **SC-002**: Thời gian chuyển đổi giữa các layout không có hiện tượng giật layout (Cumulative Layout Shift CLS = 0).
- **SC-003**: Badge giỏ hàng phản ứng tức thì (< 50ms) ngay khi thêm món mới vào giỏ.
