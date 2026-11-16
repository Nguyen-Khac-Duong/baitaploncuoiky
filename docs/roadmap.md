# Roadmap Build — Hệ thống Quản lý Cửa hàng & Bán hàng trực tuyến (testtttt88)

**Mục tiêu**: thứ tự build/hoàn thiện từng màn/chức năng.  
**Cập nhật**: 2026-11-16  
**Trạng thái item**: `chưa` (mặc định) / `đang` / `xong`.

> **Nguồn liệt-kê-được**: [`angular/src/app/app.routes.ts`](../angular/src/app/app.routes.ts).  
> Đơn vị "màn/chức năng" = 1 route leaf tương ứng với 1 view/màn hình người dùng, người bán hoặc admin. Luật gộp: các dialog modal/form tạo-sửa gộp chung vào màn quản lý danh sách của thực thể; route chuyển hướng dedup vào item cha.  
> Tổng 19 leaf routes nội bộ dự án → 13 item cốt lõi (RM-001 đến RM-013); các route khung (`/`, `/seller`, `/admin`) đóng vai trò container/layout gộp vào shared.  
>  
> **Chiến lược đã chốt (interview 2026-11-16)**:  
> 1. **Granularity**: Chia theo từng màn hình tương tác người dùng (Khách mua, Người bán, Admin sàn, Auth, Trợ lý ảo AI). Form tạo/sửa tích hợp trực tiếp trong màn danh sách hoặc modal.  
> 2. **Wave 0 = foundation**: Xác thực (Auth), Bảo vệ tuyến đường (RBAC Guards: `adminGuard`, `sellerGuard`, `khachHangGuard`), Khung giao diện dùng chung (Client Layout, Seller Layout, Admin Layout).  
> 3. **Ưu tiên**: Nghiệp vụ Cửa hàng & Quản lý Sản phẩm (đã có Entity Backend) Wave 1; Giỏ hàng, Đơn hàng, Đánh giá & Hoàn trả Wave 2; Báo cáo Thống kê & Trợ lý ảo AI Wave 3.  
> 4. **Đánh số ID**: Cấp mới từ `RM-001` đến `RM-013`, bất biến, không bao giờ dịch chuyển ID cũ.  
> 5. **Luật xử lý CRUD**: Giữ 1 item cho toàn bộ chu trình CRUD của cùng 1 màn hình.  
>  
> **Hạng mục NGOÀI nguồn** (tồn tại trong code ABP nhưng **không tạo item riêng**, parked):  
> - Các route phụ trợ ABP tích hợp sẵn: `/account`, `/identity`, `/tenant-management`, `/setting-management`, `/abp-home` — quản trị nền tảng của ABP Framework.  
>  
> **Cột `Spec`** = thư mục đặc tả SỞ HỮU item trong `specs/`, `—` = chưa có. Hiện **13/13 item có spec**.  
> Chỉ tính thư mục làm chủ item; spec khác chỉ *nhắc tới* ID thì không tính.  
> Tên thư mục quy chuẩn: `NNN-rm-NNN-<slug>`, `NNN` = mã RM của roadmap NÀY.

## Bảng tổng (thứ tự build)

| ID | Màn | Module | Wave | Phụ thuộc | Spec | Trạng thái |
|----|-----|--------|------|-----------|------|------------|
| RM-001 | Đăng nhập & Đăng ký | auth | 0 | N/A | [001-rm-001-dang-nhap](../specs/001-rm-001-dang-nhap/spec.md) | xong |
| RM-002 | Khung giao diện & Bộ lọc phân quyền | shared | 0 | RM-001 | [002-rm-002-khung-giao-dien](../specs/002-rm-002-khung-giao-dien/spec.md) | xong |
| RM-003 | Cửa hàng & Danh mục sản phẩm | client | 1 | RM-002 | [003-rm-003-cua-hang](../specs/003-rm-003-cua-hang/spec.md) | xong |
| RM-004 | Quản lý Sản phẩm (Admin CRUD) | admin | 1 | RM-002 | [004-rm-004-quan-ly-san-pham](../specs/004-rm-004-quan-ly-san-pham/spec.md) | xong |
| RM-005 | Giỏ hàng & Đặt hàng Split Order | client | 2 | RM-003 | [005-rm-005-gio-hang](../specs/005-rm-005-gio-hang/spec.md) | xong |
| RM-006 | Quản lý Đơn hàng & Đơn hàng của tôi | don-hang | 2 | RM-004, RM-005 | [006-rm-006-quan-ly-don-hang](../specs/006-rm-006-quan-ly-don-hang/spec.md) | xong |
| RM-007 | Tổng quan Báo cáo & Trợ lý ảo AI | tong-hop | 3 | RM-004, RM-006 | [007-rm-007-tong-quan-ai](../specs/007-rm-007-tong-quan-ai/spec.md) | xong |
| RM-008 | Kênh Người Bán & Quản Lý Gian Hàng | seller | 1 | RM-002 | [008-rm-008-kenh-nguoi-ban](../specs/008-rm-008-kenh-nguoi-ban/spec.md) | xong |
| RM-009 | Ví Doanh Thu & Quyết Toán Escrow | seller | 2 | RM-008, RM-006 | [009-rm-009-vi-tien-escrow](../specs/009-rm-009-vi-tien-escrow/spec.md) | xong |
| RM-010 | Yêu Cầu Trả Hàng & Hoàn Tiền | don-hang | 2 | RM-006, RM-009 | [010-rm-010-tra-hang-hoan-tien](../specs/010-rm-010-tra-hang-hoan-tien/spec.md) | xong |
| RM-011 | Đánh Giá & Nhận Xét Sản Phẩm | client | 2 | RM-003, RM-006 | [011-rm-011-danh-gia-san-pham](../specs/011-rm-011-danh-gia-san-pham/spec.md) | xong |
| RM-012 | Hệ Thống Thông Báo Đa Kênh Buyer & Seller | shared | 2 | RM-006, RM-011 | [012-rm-012-he-thong-thong-bao](../specs/012-rm-012-he-thong-thong-bao/spec.md) | xong |
| RM-013 | Quản Trị Hệ Thống Sàn (Admin) | admin | 3 | RM-002, RM-009 | [013-rm-013-quan-tri-san-admin](../specs/013-rm-013-quan-tri-san-admin/spec.md) | xong |

---

## Chi tiết

### RM-001 — Đăng nhập & Đăng ký (auth, Wave 0)

- **Mô tả**: Màn hình đăng nhập tài khoản và chuyển đổi sang đăng ký tài khoản khách hàng mới; lưu phiên làm việc (JWT/Local state) và phân định vai trò Admin / Seller / Khách hàng.
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

- **Mô tả**: Bộ layout chuẩn gồm Khung khách hàng (`KhungKhachHangComponent`), Khung người bán (`KhungSellerComponent`) và Khung quản trị (`KhungChinhComponent`), kèm theo cơ chế bảo vệ tuyến đường (`adminGuard`, `sellerGuard`, `khachHangGuard`).
- **Nguồn**: `angular/src/app/client/layout/khung-khach-hang.component.ts`, `angular/src/app/seller/layout/khung-seller.component.ts`, `angular/src/app/admin/layout/khung-chinh.component.ts`
- **Thực thể/CRUD**: `GiaoDienState`, `PhienDangNhap` — Quản lý trạng thái đăng nhập, menu điều hướng và phân quyền theo vai trò.
- **Backend**: ABP Authorization & Permissions API.
- **Phụ thuộc**: RM-001
- **Spec**: `specs/002-rm-002-khung-giao-dien/spec.md`
- **Trạng thái**: xong
- **Nợ phát sinh**:
  - (trống)

---

### RM-003 — Cửa hàng & Danh mục sản phẩm (client, Wave 1)

- **Mô tả**: Màn hình danh mục sản phẩm đa gian hàng: Xem lưới sản phẩm toàn sàn kèm badge gian hàng sở hữu, lọc danh mục, tìm kiếm, xem trang riêng từng Shop (`/shop/:slug`), và trang chi tiết sản phẩm (`/san-pham/:id`) tích hợp Tab đánh giá thực tế và số sao trung bình.
- **Nguồn**: `angular/src/app/client/cua-hang/cua-hang.component.ts`, `angular/src/app/client/chi-tiet-san-pham/chi-tiet-san-pham.component.ts`, `angular/src/app/client/chi-tiet-shop/chi-tiet-shop.component.ts`
- **Thực thể/CRUD**: `SanPham`, `DanhGiaSanPham` — Danh sách (List), Tìm kiếm (Search), Lọc danh mục (Filter), Chi tiết & Xem đánh giá.
- **Backend**: `ISanPhamAppService`, `IDanhGiaAppService`.
- **Phụ thuộc**: RM-002
- **Spec**: `specs/003-rm-003-cua-hang/spec.md`
- **Trạng thái**: xong
- **Nợ phát sinh**:
  - (trống)

---

### RM-004 — Quản lý Sản phẩm Admin (admin, Wave 1)

- **Mô tả**: Màn hình quản trị sản phẩm dành cho Admin sàn: Quản lý toàn bộ danh mục sản phẩm sàn, phân trang, thêm mới sản phẩm, sửa thông tin, điều chỉnh tồn kho, phân bổ gian hàng (`CuaHangId`) và xóa an toàn (Soft Delete).
- **Nguồn**: `angular/src/app/admin/san-pham/san-pham.component.ts` (route: `/admin/san-pham`)
- **Thực thể/CRUD**: `SanPham` — Create, Read, Update, Delete (Full Audited).
- **Backend**: `ISanPhamAppService`, `SanPhamManager` và `testtttt88DbContext`.
- **Phụ thuộc**: RM-002
- **Spec**: `specs/004-rm-004-quan-ly-san-pham/spec.md`
- **Trạng thái**: xong
- **Nợ phát sinh**:
  - (trống)

---

### RM-005 — Giỏ hàng & Đặt hàng Split Order (client, Wave 2)

- **Mô tả**: Quản lý các món hàng đã chọn từ nhiều shop khác nhau, tự động nhóm theo từng gian hàng. Khi bấm "Đặt hàng", hệ thống tự động tách thành Đơn hàng tổng (`DonHangTong`) và các Đơn hàng con (`DonHang`) theo từng Shop, đồng thời đưa tiền vào quỹ bảo chứng tạm giữ Escrow của từng Shop.
- **Nguồn**: `angular/src/app/client/gio-hang/gio-hang.component.ts` (route: `/gio-hang`)
- **Thực thể/CRUD**: `MonGioHang`, `DonHangTong`, `DonHang`, `ChiTietDonHang` — Thêm, Bớt, Xóa giỏ, Tách đơn hàng con theo shop, Tạm giữ Escrow.
- **Backend**: `IDonHangAppService.TaoDonHangTongAsync`, `ViCuaHangManager.GhiNhanDonHangMoiAsync`.
- **Phụ thuộc**: RM-003
- **Spec**: `specs/005-rm-005-gio-hang/spec.md`
- **Trạng thái**: xong
- **Nợ phát sinh**:
  - (trống)

---

### RM-006 — Quản lý Đơn hàng & Đơn hàng của tôi (don-hang, Wave 2)

- **Mô tả**: Vòng đời đơn hàng đa cấp và tích hợp đổi trả / đánh giá: Khách hàng xem đơn tại `/don-hang-cua-toi` (kèm nút Yêu cầu hoàn trả và Đánh giá 1-5★ khi nhận hàng); Người bán quản lý đơn của shop tại `/seller/don-hang`; Đơn chuyển `hoan_thanh` tự động quyết toán tiền từ quỹ Escrow sang Ví Khả Dụng.
- **Nguồn**: `angular/src/app/admin/don-hang/don-hang.component.ts`, `angular/src/app/seller/don-hang/seller-don-hang.component.ts`, `angular/src/app/client/don-hang-cua-toi/don-hang-cua-toi.component.ts`
- **Thực thể/CRUD**: `DonHang`, `ChiTietDonHang` — Tra cứu danh sách, Xem chi tiết, Đổi trạng thái, Gửi yêu cầu hoàn trả, Đánh giá sản phẩm.
- **Backend**: `IDonHangAppService`, `DonHangManager`, `ViCuaHangManager`.
- **Phụ thuộc**: RM-004, RM-005
- **Spec**: `specs/006-rm-006-quan-ly-don-hang/spec.md`
- **Trạng thái**: xong
- **Nợ phát sinh**:
  - (trống)

---

### RM-007 — Tổng quan Báo cáo & Trợ lý ảo AI (tong-hop, Wave 3)

- **Mô tả**: Dashboard phân tích chỉ số kinh doanh toàn sàn (doanh thu, đơn hàng, sản phẩm cảnh báo hết kho) kết hợp hộp thoại Chatbot AI Gemini tư vấn sản phẩm trực quan.
- **Nguồn**: `angular/src/app/admin/tong-quan/tong-quan.component.ts`, `angular/src/app/components/chat-bot/chat-bot.component.ts`
- **Thực thể/CRUD**: `ThongKeDashboard`, `GeminiChatSession` — Đọc thống kê và tương tác Google Gemini AI.
- **Backend**: `DonHangAppService.GetThongKeDashboardAsync`, Service Gemini Frontend (`gemini.service.ts`).
- **Phụ thuộc**: RM-004, RM-006
- **Spec**: `specs/007-rm-007-tong-quan-ai/spec.md`
- **Trạng thái**: xong
- **Nợ phát sinh**:
  - (trống)

---

### RM-008 — Kênh Người Bán & Quản Lý Gian Hàng (seller, Wave 1)

- **Mô tả**: Phân hệ Kênh Người Bán (Seller Center) chuyên biệt: Đăng ký mở shop (`/seller/dang-ky`), Bảng điều khiển kinh doanh (`/seller/tong-quan`), Quản lý kho hàng shop (`/seller/san-pham`) và Cài đặt thông tin shop (`/seller/cai-dat`).
- **Nguồn**: `angular/src/app/seller/` (layout: `KhungSellerComponent`, route: `/seller/*`)
- **Thực thể/CRUD**: `CuaHang`, `SanPham` — Đăng ký, Cập nhật thông tin, Quản lý kho hàng thuộc shop.
- **Backend**: `ICuaHangAppService`, `ISanPhamAppService`.
- **Phụ thuộc**: RM-002
- **Spec**: `specs/008-rm-008-kenh-nguoi-ban/spec.md`
- **Trạng thái**: xong
- **Nợ phát sinh**:
  - (trống)

---

### RM-009 — Ví Doanh Thu & Quyết Toán Escrow (seller, Wave 2)

- **Mô tả**: Cơ chế bảo chứng thanh toán Escrow và quản lý tài chính đa gian hàng: Tạm giữ tiền bán hàng khi phát sinh đơn, tự động quyết toán sang Ví Khả Dụng khi hoàn tất đơn, tạo lệnh rút tiền về tài khoản ngân hàng và Admin phê duyệt.
- **Nguồn**: `angular/src/app/seller/vi-tien/seller-vi-tien.component.ts`, `angular/src/app/admin/rut-tien/rut-tien.component.ts`
- **Thực thể/CRUD**: `ViCuaHang`, `BienDongSoDuVi`, `YeuCauRutTien` — Tạm giữ, Quyết toán, Rút tiền, Duyệt rút tiền.
- **Backend**: `ViCuaHangManager`, `IViCuaHangAppService`.
- **Phụ thuộc**: RM-008, RM-006
- **Spec**: `specs/009-rm-009-vi-tien-escrow/spec.md`
- **Trạng thái**: xong
- **Nợ phát sinh**:
  - (trống)

---

### RM-010 — Yêu Cầu Trả Hàng & Hoàn Tiền (don-hang, Wave 2)

- **Mô tả**: Quy trình xử lý khiếu nại và đổi trả đơn hàng: Khách hàng gửi yêu cầu kèm lý do và ảnh bằng chứng tại `/don-hang-cua-toi`; Người bán hoặc Admin tiếp nhận, kiểm tra và duyệt/từ chối tại `/seller/don-hang`. Tự động hoàn kho và trừ tiền ví shop khi được duyệt.
- **Nguồn**: Modal hoàn trả tại `don-hang-cua-toi.component.ts`, Xử lý tại `seller-don-hang.component.ts`
- **Thực thể/CRUD**: `DonHang`, `ChiTietDonHang` — `GuiYeuCauTraHang`, `XuLyTraHang`.
- **Backend**: `DonHangAppService.YeuCauTraHangAsync`, `DonHangAppService.XuLyTraHangAsync`.
- **Phụ thuộc**: RM-006, RM-009
- **Spec**: `specs/010-rm-010-tra-hang-hoan-tien/spec.md`
- **Trạng thái**: xong
- **Nợ phát sinh**:
  - (trống)

---

### RM-011 — Đánh Giá & Nhận Xét Sản Phẩm (client, Wave 2)

- **Mô tả**: Hệ thống đánh giá trải nghiệm mua sắm: Khách hàng chấm điểm 1-5 sao, viết nhận xét và đính kèm ảnh thực tế sau khi nhận hàng (`/don-hang-cua-toi`); xem đánh giá công khai tại `/san-pham/:id`; Người bán phản hồi nhận xét tại `/seller/danh-gia`.
- **Nguồn**: Modal đánh giá tại `don-hang-cua-toi.component.ts`, Tab đánh giá tại `chi-tiet-san-pham.component.ts`, Quản lý tại `seller-danh-gia.component.ts`
- **Thực thể/CRUD**: `DanhGiaSanPham` — Tạo đánh giá, Xem danh sách theo sản phẩm, Shop phản hồi.
- **Backend**: `IDanhGiaAppService`, `DanhGiaManager`.
- **Phụ thuộc**: RM-003, RM-006
- **Spec**: `specs/011-rm-011-danh-gia-san-pham/spec.md`
- **Trạng thái**: xong
- **Nợ phát sinh**:
  - (trống)

---

### RM-012 — Hệ Thống Thông Báo Đa Kênh Buyer & Seller (shared, Wave 2)

- **Mô tả**: Hệ thống thông báo thời gian thực phân lập rạch ròi theo phân hệ (`doiTuong`: `buyer` / `seller`): Người mua nhận thông báo vận chuyển, giao hàng, nhắc đánh giá, phản hồi hoàn trả; Người bán nhận thông báo đơn mới cần đóng gói, đánh giá mới, yêu cầu hoàn tiền và tiền về ví.
- **Nguồn**: Dropdown chuông tại `KhungKhachHangComponent` và `KhungSellerComponent`
- **Thực thể/CRUD**: `ThongBao` — Lấy danh sách, Đếm chưa đọc, Đánh dấu đã đọc, Xóa thông báo theo phân hệ.
- **Backend**: `IThongBaoAppService`, `ThongBaoAppService`.
- **Phụ thuộc**: RM-006, RM-011
- **Spec**: `specs/012-rm-012-he-thong-thong-bao/spec.md`
- **Trạng thái**: xong
- **Nợ phát sinh**:
  - (trống)

---

### RM-013 — Quản Trị Hệ Thống Sàn (admin, Wave 3)

- **Mô tả**: Phân hệ quản trị nền tảng toàn diện dành cho Platform Admin: Quản lý cây danh mục sản phẩm sàn (`/admin/danh-muc`), Quản lý & duyệt danh sách gian hàng (`/admin/gian-hang`), Đối soát & duyệt lệnh rút tiền (`/admin/rut-tien`), Phân quyền tài khoản (`/admin/tai-khoan`).
- **Nguồn**: `angular/src/app/admin/` (layout: `KhungChinhComponent`, route: `/admin/*`)
- **Thực thể/CRUD**: `DanhMuc`, `CuaHang`, `YeuCauRutTien`, `IdentityUser` — CRUD danh mục, Phê duyệt shop, Phê duyệt rút tiền.
- **Backend**: `IDanhMucAppService`, `ICuaHangAppService`, `IViCuaHangAppService`, ABP Identity.
- **Phụ thuộc**: RM-002, RM-009
- **Spec**: `specs/013-rm-013-quan-tri-san-admin/spec.md`
- **Trạng thái**: xong
- **Nợ phát sinh**:
  - (trống)
