# Roadmap Build — Hệ thống Quản lý Cửa hàng & Bán hàng trực tuyến (testtttt88)

**Mục tiêu**: thứ tự build/hoàn thiện từng màn/chức năng.  
**Cập nhật**: 2026-10-14  
**Trạng thái item**: `chưa` (mặc định) / `đang` / `xong`.

> **Nguồn liệt-kê-được**: [`angular/src/app/app.routes.ts`](../angular/src/app/app.routes.ts).  
> Đơn vị "màn/chức năng" = 1 route leaf tương ứng với 1 view/màn hình người dùng hoặc admin. Luật gộp: các dialog modal/form tạo-sửa gộp chung vào màn quản lý danh sách của thực thể; route chuyển hướng dedup vào item cha.  
> Tổng 10 leaf routes nội bộ dự án → 7 item cốt lõi (RM-001 đến RM-007); các route khung (`/`, `/admin`) đóng vai trò container/layout gộp vào shared.  
>  
> **Chiến lược đã chốt (interview 2026-10-14)**:  
> 1. **Granularity**: Chia theo từng màn hình tương tác người dùng (Client, Admin, Auth, Trợ lý ảo). Form tạo/sửa tích hợp trực tiếp trong màn danh sách hoặc modal.  
> 2. **Wave 0 = foundation**: Xác thực (Auth), Bảo vệ tuyến đường (RBAC Guards), Khung giao diện dùng chung (Client & Admin Layout).  
> 3. **Ưu tiên**: Nghiệp vụ Cửa hàng & Quản lý Sản phẩm (đã có Entity Backend) ưu tiên Wave 1; Giỏ hàng & Đặt hàng/Đơn hàng triển khai Wave 2; Báo cáo Thống kê & Trợ lý ảo Gemini AI triển khai Wave 3.  
> 4. **Đánh số ID**: Cấp mới từ `RM-001` đến `RM-007`, bất biến, không chèn giữa.  
> 5. **Luật xử lý CRUD**: Giữ 1 item cho toàn bộ chu trình CRUD của cùng 1 màn hình.  
>  
> **Hạng mục NGOÀI nguồn** (tồn tại trong code ABP nhưng **không tạo item riêng**, parked):  
> - Các route phụ trợ ABP tích hợp sẵn: `/account`, `/identity`, `/tenant-management`, `/setting-management`, `/abp-home` — quản trị nền tảng của ABP Framework.  
>  
> **Cột `Spec`** = thư mục đặc tả SỞ HỮU item trong `specs/`, `—` = chưa có. Hiện **7/7 item có spec**.  
> Chỉ tính thư mục làm chủ item; spec khác chỉ *nhắc tới* ID thì không tính.  
> Tên thư mục quy chuẩn: `NNN-rm-NNN-<slug>`, `NNN` = mã RM của roadmap NÀY.

## Bảng tổng (thứ tự build)

| ID | Màn | Module | Wave | Phụ thuộc | Spec | Trạng thái |
|----|-----|--------|------|-----------|------|------------|
| RM-001 | Đăng nhập & Đăng ký | auth | 0 | N/A | [001-rm-001-dang-nhap](../specs/001-rm-001-dang-nhap/spec.md) | xong |
| RM-002 | Khung giao diện & Bộ lọc phân quyền | shared | 0 | RM-001 | [002-rm-002-khung-giao-dien](../specs/002-rm-002-khung-giao-dien/spec.md) | xong |
| RM-003 | Cửa hàng & Danh mục sản phẩm | client | 1 | RM-002 | [003-rm-003-cua-hang](../specs/003-rm-003-cua-hang/spec.md) | xong |
| RM-004 | Quản lý Sản phẩm (Admin CRUD) | admin | 1 | RM-002 | [004-rm-004-quan-ly-san-pham](../specs/004-rm-004-quan-ly-san-pham/spec.md) | xong |
| RM-005 | Giỏ hàng & Đặt hàng | client | 2 | RM-003 | [005-rm-005-gio-hang](../specs/005-rm-005-gio-hang/spec.md) | xong |
| RM-006 | Quản lý Đơn hàng & Đơn hàng của tôi | don-hang | 2 | RM-004, RM-005 | [006-rm-006-quan-ly-don-hang](../specs/006-rm-006-quan-ly-don-hang/spec.md) | xong |
| RM-007 | Tổng quan Báo cáo & Trợ lý ảo AI | tong-hop | 3 | RM-004, RM-006 | [007-rm-007-tong-quan-ai](../specs/007-rm-007-tong-quan-ai/spec.md) | xong |

---

## Chi tiết

### RM-001 — Đăng nhập & Đăng ký (auth, Wave 0)

- **Mô tả**: Màn hình đăng nhập tài khoản và chuyển đổi sang đăng ký tài khoản khách hàng mới; lưu phiên làm việc (JWT/Local state) và phân định vai trò Admin / Khách hàng. Hiện đã có giao diện form và xác thực giả lập/ABP integration.
- **Nguồn**: `angular/src/app/auth/dang-nhap/dang-nhap.component.ts` (route: `/dang-nhap`, `/dang-ky`)
- **Thực thể/CRUD**: `NguoiDung` (Identity User) — Đăng nhập, Đăng ký, Đăng xuất, Lưu Token.
- **Backend**: ABP Account / Identity Service tích hợp sẵn qua OpenIddict.
- **Phụ thuộc**: N/A
- **Spec**: `specs/001-rm-001-dang-nhap/spec.md`
- **Trạng thái**: xong
- **Nợ phát sinh**:
  - (trống)

---

### RM-002 — Khung giao diện & Bộ lọc phân quyền (shared, Wave 0)

- **Mô tả**: Bộ layout chuẩn gồm Khung khách hàng (Header, Footer, Navigation) và Khung quản trị Admin (Sidebar, Header thông tin), kèm theo cơ chế bảo vệ tuyến đường (`adminGuard`, `khachHangGuard`) và theme trạng thái.
- **Nguồn**: `angular/src/app/client/layout/khung-khach-hang.component.ts`, `angular/src/app/admin/layout/khung-chinh.component.ts`, `angular/src/app/he-thong/bao-ve/xac-thuc.guard.ts`
- **Thực thể/CRUD**: `GiaoDienState`, `PhienDangNhap` — Quản lý trạng thái đăng nhập, menu điều hướng và phân quyền theo vai trò.
- **Backend**: ABP Authorization & Permissions API.
- **Phụ thuộc**: RM-001
- **Spec**: —
- **Trạng thái**: đang
- **Nợ phát sinh**:
  - (trống)

---

### RM-003 — Cửa hàng & Danh mục sản phẩm (client, Wave 1)

- **Mô tả**: Màn hình hiển thị danh sách sản phẩm dành cho khách hàng với chức năng tìm kiếm, lọc theo danh mục, xem chi tiết và nút thêm nhanh vào giỏ hàng.
- **Nguồn**: `angular/src/app/client/cua-hang/cua-hang.component.ts` (route: `/cua-hang`)
- **Thực thể/CRUD**: `SanPham` — Danh sách (List), Tìm kiếm (Search), Lọc danh mục (Filter), Xem chi tiết (Detail).
- **Backend**: Đã có `ISanPhamAppService` (`testtttt88.Application.Contracts/SanPhams`) và Entity `SanPham` (`testtttt88.Domain/SanPhams`).
- **Phụ thuộc**: RM-002
- **Spec**: —
- **Trạng thái**: đang
- **Nợ phát sinh**:
  - (trống)

---

### RM-004 — Quản lý Sản phẩm Admin (admin, Wave 1)

- **Mô tả**: Màn hình quản trị sản phẩm dành cho Admin: xem danh sách dạng bảng, phân trang, thêm mới sản phẩm, sửa thông tin, điều chỉnh tồn kho và xoá (Soft Delete).
- **Nguồn**: `angular/src/app/admin/san-pham/san-pham.component.ts` (route: `/admin/san-pham`)
- **Thực thể/CRUD**: `SanPham` — Create, Read, Update, Delete (Full Audited).
- **Backend**: Đã có `ISanPhamAppService`, `SanPhamManager` và `testtttt88DbContext`.
- **Phụ thuộc**: RM-002
- **Spec**: —
- **Trạng thái**: đang
- **Nợ phát sinh**:
  - (trống)

---

### RM-005 — Giỏ hàng & Đặt hàng (client, Wave 2)

- **Mô tả**: Quản lý các món hàng đã chọn, điều chỉnh số lượng mua, tính tổng tiền, điền thông tin người nhận (Họ tên, SĐT, Địa chỉ) và xác nhận tạo đơn hàng mới.
- **Nguồn**: `angular/src/app/client/gio-hang/gio-hang.component.ts` (route: `/gio-hang`)
- **Thực thể/CRUD**: `MonGioHang`, `DonHang`, `ChiTietDonHang` — Thêm, Bớt, Xoá khỏi giỏ, Tạo đơn đặt hàng.
- **Backend**: Đã có `IDonHangAppService`, `DonHangManager` (`testtttt88.Domain/DonHangs`).
- **Phụ thuộc**: RM-003
- **Spec**: —
- **Trạng thái**: đang
- **Nợ phát sinh**:
  - (trống)

---

### RM-006 — Quản lý Đơn hàng & Lịch sử Đơn hàng (don-hang, Wave 2)

- **Mô tả**: Màn hình quản trị đơn hàng toàn diện cho Admin (cập nhật trạng thái: chờ xử lý, đang giao, hoàn thành, hủy) và Màn hình "Đơn hàng của tôi" cho khách hàng theo dõi tiến độ đơn mua cá nhân.
- **Nguồn**: `angular/src/app/admin/don-hang/don-hang.component.ts` (route: `/admin/don-hang`) & `angular/src/app/client/don-hang-cua-toi/don-hang-cua-toi.component.ts` (route: `/don-hang-cua-toi`)
- **Thực thể/CRUD**: `DonHang`, `ChiTietDonHang` — Tra cứu danh sách, Xem chi tiết đơn, Cập nhật trạng thái đơn hàng.
- **Backend**: Đã có `IDonHangAppService` và `DonHangManager`.
- **Phụ thuộc**: RM-004, RM-005
- **Spec**: —
- **Trạng thái**: đang
- **Nợ phát sinh**:
  - (trống)

---

### RM-007 — Tổng quan Báo cáo & Trợ lý ảo AI (tong-hop, Wave 3)

- **Mô tả**: Dashboard phân tích chỉ số kinh doanh (tổng doanh thu, số lượng đơn hàng, số lượng sản phẩm, cảnh báo sản phẩm hết hàng) kết hợp hộp thoại Chatbot AI Gemini tư vấn sản phẩm trực quan.
- **Nguồn**: `angular/src/app/admin/tong-quan/tong-quan.component.ts` (route: `/admin/tong-quan`), `angular/src/app/components/chat-bot/chat-bot.component.ts`
- **Thực thể/CRUD**: `ThongKeDashboard`, `GeminiChatSession` — Đọc số liệu thống kê tổng hợp và tương tác API Google Gemini.
- **Backend**: Dịch vụ thống kê tổng hợp từ `DonHang` + `SanPham`; Service Gemini Frontend (`gemini.service.ts`).
- **Phụ thuộc**: RM-004, RM-006
- **Spec**: —
- **Trạng thái**: đang
- **Nợ phát sinh**:
  - (trống)
