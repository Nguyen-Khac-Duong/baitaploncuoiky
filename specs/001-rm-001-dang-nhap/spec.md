# Feature Specification: RM-001 — Đăng nhập & Đăng ký

**Feature Branch**: `001-rm-001-dang-nhap`  
**Created**: 2026-10-14  
**Status**: Draft  
**Roadmap ID**: [RM-001](../../docs/roadmap.md#rm-001--đăng-nhập--đăng-ký-auth-wave-0)  
**Input**: Đặc tả chi tiết nghiệp vụ luồng xác thực (Authentication) cho Hệ thống Quản lý Cửa hàng & Bán hàng trực tuyến.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Khách Hàng / Quản Trị Viên Đăng Nhập Hệ Thống (Priority: P1)

Là một người dùng (Khách hàng hoặc Quản trị viên), tôi muốn nhập email và mật khẩu để đăng nhập vào hệ thống, giúp tôi được nhận diện danh tính và truy cập đúng các tính năng tương ứng với vai trò của mình.

**Why this priority**: Đăng nhập là cửa ngõ nền tảng (Wave 0) cho toàn bộ hệ thống để bảo vệ các tuyến đường riêng tư, quản lý giỏ hàng, đặt hàng và quản trị sản phẩm.

**Independent Test**: Có thể kiểm thử độc lập bằng cách mở màn hình `/dang-nhap`, nhập tài khoản Admin mẫu (`admin@gmail.com` / `123456`) hoặc Khách hàng (`khachhang@gmail.com` / `123456`), bấm Đăng nhập và xác nhận phiên đăng nhập được lưu, giao diện chuyển hướng đúng đích.

**Acceptance Scenarios**:

1. **Given** người dùng chưa đăng nhập ở trang `/dang-nhap`, **When** nhập đúng email và mật khẩu của tài khoản Admin rồi ấn "Đăng nhập", **Then** hệ thống hiển thị thông báo thành công, lưu phiên đăng nhập và chuyển hướng đến trang Quản trị `/admin/tong-quan`.
2. **Given** người dùng chưa đăng nhập, **When** nhập đúng email và mật khẩu của tài khoản Khách hàng rồi ấn "Đăng nhập", **Then** hệ thống hiển thị thông báo thành công và chuyển hướng đến `/cua-hang` hoặc trang trước đó cần xác thực.
3. **Given** người dùng nhập sai mật khẩu hoặc email chưa đăng ký, **When** nhấn nút "Đăng nhập", **Then** hệ thống không cho phép đăng nhập, hiển thị thông báo lỗi cụ thể (ví dụ: "Email hoặc mật khẩu không chính xác").

---

### User Story 2 - Khách Hàng Mới Đăng Ký Tài Khoản Mua Sắm (Priority: P2)

Là một khách hàng mới ghé thăm cửa hàng, tôi muốn đăng ký tài khoản với họ tên, email, số điện thoại, địa chỉ và mật khẩu để có thể theo dõi đơn hàng và lưu thông tin nhận hàng cho những lần mua sắm tiếp theo.

**Why this priority**: Cho phép người mua tự tạo tài khoản là luồng chuyển đổi người dùng quan trọng nhất của cửa hàng bán lẻ trực tuyến.

**Independent Test**: Chọn tab Đăng ký tại `/dang-ky`, điền đầy đủ và hợp lệ các trường thông tin, bấm "Đăng ký", kiểm tra thông báo thành công, form tự động chuyển về tab "Đăng nhập", điền sẵn email và yêu cầu người dùng nhập mật khẩu để xác nhận.

**Acceptance Scenarios**:

1. **Given** khách hàng ở tab "Đăng ký", **When** điền đầy đủ thông tin hợp lệ và bấm "Đăng ký", **Then** hệ thống tạo tài khoản mới thành công với vai trò `khach_hang`, hiển thị thông báo chúc mừng, tự động chuyển về tab "Đăng nhập" (có thể điền sẵn email mới) và yêu cầu người dùng nhập mật khẩu để đăng nhập xác thực.
2. **Given** khách hàng nhập email đã tồn tại trong hệ thống, **When** bấm "Đăng ký", **Then** hệ thống chặn tạo mới và hiển thị cảnh báo: "Email đã được đăng ký! Vui lòng chọn email khác hoặc đăng nhập."
3. **Given** khách hàng nhập mật khẩu xác nhận không khớp với mật khẩu, **When** điền form, **Then** form báo lỗi xác thực ngay lập tức và vô hiệu hóa nút gửi hoặc chặn submit.

---

### User Story 3 - Chuyển Đổi Tab & Tài Khoản Mẫu Nhanh (Priority: P3)

Là một người dùng hoặc người đánh giá/chấm điểm dự án, tôi muốn chuyển đổi mượt mà giữa form Đăng nhập và Đăng ký, đồng thời có các nút chọn nhanh tài khoản mẫu (Admin / Khách hàng) để tiết kiệm thời gian trải nghiệm.

**Why this priority**: Tăng cường trải nghiệm người dùng (UX) và thuận tiện trong quá trình kiểm thử, demo đồ án.

**Independent Test**: Nhấp chọn tab "Đăng nhập" / "Đăng ký" kiểm tra URL đồng bộ query param `?tab=...`; nhấp vào chip "Admin mẫu" kiểm tra form tự động điền đúng thông tin admin.

**Acceptance Scenarios**:

1. **Given** đang ở `/dang-nhap`, **When** bấm vào tab hoặc liên kết "Đăng ký ngay", **Then** giao diện chuyển đổi sang form Đăng ký mà không cần tải lại toàn trang.
2. **Given** người dùng bấm nút "Chọn tài khoản Admin mẫu", **When** click, **Then** ô email và mật khẩu được tự động điền thông tin tài khoản Admin và xóa các cảnh báo lỗi trước đó.

---

### Edge Cases

- **Mất kết nối mạng / Lưu trữ LocalStorage bị chặn**: Hệ thống vẫn giữ trạng thái phiên trong bộ nhớ Runtime Signal của `XacThucService`, tránh crash ứng dụng.
- **Dữ liệu nhập có khoảng trắng dư thừa**: Email phải tự động được `trim()` và chuyển thành chữ thường `toLowerCase()` trước khi kiểm tra hoặc lưu trữ.
- **Xâm nhập trái phép URL Admin**: Khách hàng đang đăng nhập với vai trò `khach_hang` cố tình gõ link `/admin/*` phải bị `adminGuard` chặn lại và điều hướng về trang lỗi phân quyền hoặc trang chủ `/cua-hang`.
- **Đăng xuất an toàn**: Khi nhấn Đăng xuất, toàn bộ thông tin định danh trong Signal và LocalStorage bị xóa sạch, giao diện header cập nhật ngay lập tức về trạng thái khách vãng lai.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Hệ thống PHẢI cung cấp giao diện phản hồi nhanh (Reactive Form) cho cả hai nghiệp vụ Đăng nhập và Đăng ký trong cùng một module Auth.
- **FR-002**: Hệ thống PHẢI kiểm tra tính hợp lệ dữ liệu trực tiếp trên giao diện:
  - Email đúng định dạng regex chuẩn email.
  - Mật khẩu tối thiểu 6 ký tự.
  - Số điện thoại từ 9 đến 11 chữ số.
  - Mật khẩu xác nhận phải trùng khớp 100% với mật khẩu chính.
- **FR-003**: Hệ thống PHẢI tự động gán vai trò `khach_hang` cho mọi tài khoản đăng ký qua form công khai. Tuyệt đối không cho phép đăng ký trực tiếp vai trò `admin`.
- **FR-004**: Hệ thống PHẢI lưu trạng thái người dùng đăng nhập thông qua Angular Signal (`currentUser`) để toàn bộ component trong app (Header, Sidebar, Giỏ hàng) nhận phản ứng tức thì (Reactivity).
- **FR-005**: Hệ thống PHẢI tích hợp đồng bộ với ABP OpenIddict / Identity backend khi ở môi trường production và hỗ trợ fallback lưu trữ an toàn khi chạy chế độ demo client.
- **FR-006**: Hệ thống PHẢI cung cấp cơ chế thông báo trực quan (Toast/Notification) khi đăng nhập thành công, đăng nhập thất bại hoặc đăng ký hoàn tất.

### Key Entities

- **NguoiDung (User)**:
  - `id`: Mã định danh duy nhất (Guid / String).
  - `email`: Địa chỉ thư điện tử (duy nhất, khóa định danh đăng nhập).
  - `matKhau`: Mật khẩu bảo mật.
  - `hoTen`: Họ và tên hiển thị của người dùng.
  - `soDienThoai`: Số điện thoại liên hệ nhận hàng.
  - `diaChi`: Địa chỉ giao hàng mặc định.
  - `vaiTro`: Phân quyền người dùng (`'admin'` hoặc `'khach_hang'`).
  - `avatar`: Ký tự viết tắt hoặc đường dẫn ảnh đại diện.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Thời gian hoàn thành thao tác đăng nhập dưới 1 giây.
- **SC-002**: Form validation phản hồi lỗi tức thì (< 100ms) ngay khi người dùng gõ sai định dạng email hoặc không khớp mật khẩu.
- **SC-003**: 100% các tuyến đường quản trị `/admin/*` chặn thành công truy cập trái phép của người dùng chưa đăng nhập hoặc tài khoản chỉ có quyền `khach_hang`.
- **SC-004**: Dữ liệu phiên đăng nhập tồn tại ổn định qua các lần F5 / làm mới trình duyệt.

---

## Assumptions & Clarifications

### Clarification Decisions (Resolved on 2026-10-14)

- **Q1 (Chiến lược Backend & Storage)**: Hệ thống áp dụng kiến trúc kép (Hybrid Authentication). Khi chạy offline/demo đồ án, hệ thống xác thực trực tiếp qua Mock Data và đồng bộ vào `localStorage`. Khi backend ASP.NET Core ABP Framework hoạt động, client sẽ ưu tiên gửi yêu cầu lấy OAuth2 Bearer Token qua endpoint OpenIddict.
- **Q2 (Luồng sau Đăng ký)**: Sau khi đăng ký thành công, hệ thống hiển thị thông báo thành công và chuyển sang tab "Đăng nhập", điền sẵn email người dùng vừa tạo và yêu cầu nhập mật khẩu để hoàn tất xác thực đăng nhập.
- **Q3 (Thời hạn phiên làm việc)**: Phiên đăng nhập được duy trì lâu dài (Persistent Session qua `localStorage`) cho tới khi người dùng chủ động nhấn nút "Đăng xuất" (Logout).

### Technical Assumptions

- Mọi khách hàng đều có địa chỉ email hợp lệ để nhận diện tài khoản.
- Tài khoản quản trị cấp cao `admin@gmail.com` được tạo sẵn trong dữ liệu khởi tạo (Seed Data), không đăng ký qua form đại trà.
- Client chạy trên nền tảng trình duyệt hiện đại hỗ trợ LocalStorage và Javascript ES2022+.
