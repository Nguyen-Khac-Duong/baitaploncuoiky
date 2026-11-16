# 🏸 CẤU TRÚC THƯ MỤC DỰ ÁN testtttt88 (MULTI-VENDOR MARKETPLACE)

> **Dự án:** Hệ thống Sàn Giao Dịch & Quản Lý Cửa Hàng Trực Tuyến Đa Gian Hàng (Multi-vendor Marketplace)  
> **Kiến trúc:** ASP.NET Core ABP Framework (DDD 4 Tầng) + Angular 18+ Signals (Standalone Components)

```text
testtttt88/
├── README.md                                    [CẬP NHẬT] Hướng dẫn chạy nhanh Frontend & Backend, giới thiệu hệ thống
├── AGENTS.md                                    [MỚI] Quy tắc kiến trúc & ràng buộc chất lượng cho AI Agent (DDD + Angular Signals)
├── CAU_TRUC_THU_MUC.md                          [MỚI] Sơ đồ cây thư mục chi tiết toàn bộ dự án hiện tại
├── .gitignore                                   [SỬA] Cấu hình loại bỏ node_modules, bin, obj, dist để git luôn sạch đẹp
│
├── docs/                                        📚 TÀI LIỆU QUẢN TRỊ & ROADMAP
│   └── roadmap.md                               [MỚI] Lộ trình phát triển 13 phân hệ (RM-001 -> RM-013) chuẩn Spec-Kit
│
├── specs/                                       📋 THƯ MỤC ĐẶC TẢ TÍNH NĂNG (SPEC-KIT CHUẨN)
│   ├── 001-rm-001-dang-nhap/spec.md             [NÂNG CẤP] Đặc tả đăng nhập & đăng ký 3 vai trò (Admin / Seller / Buyer)
│   ├── 002-rm-002-khung-giao-dien/spec.md       [NÂNG CẤP] Đặc tả 3 Shell Layouts độc lập & RBAC Guards 3 cấp
│   ├── 003-rm-003-cua-hang/spec.md              [NÂNG CẤP] Đặc tả catalog đa gian hàng, trang shop riêng & chi tiết SP
│   ├── 004-rm-004-quan-ly-san-pham/spec.md      [NÂNG CẤP] Đặc tả quản trị sản phẩm toàn sàn gán theo CuaHangId
│   ├── 005-rm-005-gio-hang/spec.md              [NÂNG CẤP] Đặc tả giỏ hàng đa shop & cơ chế Split Order tự động
│   ├── 006-rm-006-quan-ly-don-hang/spec.md      [NÂNG CẤP] Đặc tả vòng đời đơn hàng, tích hợp hoàn trả & đánh giá
│   ├── 007-rm-007-tong-quan-ai/spec.md          [NÂNG CẤP] Đặc tả Dashboard sàn & Trợ lý ảo Google Gemini AI
│   ├── 008-rm-008-kenh-nguoi-ban/spec.md        [MỚI] Đặc tả Kênh Người Bán (Seller Center), đăng ký & quản lý kho shop
│   ├── 009-rm-009-vi-tien-escrow/spec.md        [MỚI] Đặc tả Ví Escrow tạm giữ, quyết toán & rút tiền ngân hàng
│   ├── 010-rm-010-tra-hang-hoan-tien/spec.md    [MỚI] Đặc tả quy trình khách khiếu nại, shop duyệt hoàn tiền & hoàn kho
│   ├── 011-rm-011-danh-gia-san-pham/spec.md     [MỚI] Đặc tả chấm sao 1-5★, upload ảnh thực tế & shop phản hồi
│   ├── 012-rm-012-he-thong-thong-bao/spec.md    [MỚI] Đặc tả hệ thống thông báo đa kênh phân lập Buyer vs Seller
│   └── 013-rm-013-quan-tri-san-admin/spec.md    [MỚI] Đặc tả quản trị danh mục ngành hàng, duyệt shop & rút tiền
│
├── aspnet-core/                                 (BACKEND: ASP.NET Core 10 + ABP Framework chuẩn DDD 4 tầng)
│   └── src/
│       │
│       ├── testtttt88.Domain/                   ⭐ TẦNG 1: TRÁI TIM NGHIỆP VỤ (DOMAIN CORE)
│       │   ├── CuaHangs/                        🏪 MODULE GIAN HÀNG (MULTI-VENDOR)
│       │   │   ├── CuaHang.cs                   [MỚI] Entity Gian hàng (Tên, Slug, Tỷ lệ hoa hồng, Chủ sở hữu)
│       │   │   └── CuaHangManager.cs            [MỚI] Domain Service: Kiểm tra trùng tên/slug, xác thực mở shop
│       │   ├── SanPhams/                        📦 MODULE SẢN PHẨM
│       │   │   ├── SanPham.cs                   [NÂNG CẤP] Entity SP: Gắn CuaHangId, DanhMucId, quản lý kho
│       │   │   └── SanPhamManager.cs            [NÂNG CẤP] Domain Service: Kiểm tra tồn kho, gán shop, đổi trạng thái
│       │   ├── DonHangs/                        📑 MODULE ĐƠN HÀNG & MASTER-SUB ORDER
│       │   │   ├── DonHangTong.cs               [MỚI] Aggregate Root Đơn Hàng Tổng (Master Order của khách)
│       │   │   ├── DonHang.cs                   [NÂNG CẤP] Entity Đơn Hàng Con (Sub-Order theo từng Shop, Escrow, Hoàn trả)
│       │   │   ├── ChiTietDonHang.cs            [GỐC] Entity Chi tiết món hàng trong đơn
│       │   │   └── DonHangManager.cs            [NÂNG CẤP] Domain Service: Sinh mã đơn, tính tiền, chia sub-order
│       │   ├── ViCuaHangs/                      💰 MODULE VÍ TÀI CHÍNH & ESCROW
│       │   │   ├── ViCuaHang.cs                 [MỚI] Entity Ví Shop: Số dư khả dụng, Tiền tạm giữ Escrow
│       │   │   ├── BienDongSoDuVi.cs            [MỚI] Entity Lịch sử biến động số dư (Cộng, Trừ, Quyết toán, Rút)
│       │   │   ├── YeuCauRutTien.cs             [MỚI] Entity Lệnh rút tiền ngân hàng của Người bán
│       │   │   └── ViCuaHangManager.cs          [MỚI] Domain Service: Khóa bảo chứng Escrow, quyết toán, hoàn tiền
│       │   ├── DanhGias/                        ⭐ MODULE ĐÁNH GIÁ & NHẬN XÉT
│       │   │   ├── DanhGiaSanPham.cs            [MỚI] Entity Đánh giá 1-5 sao, hình ảnh thực tế, shop phản hồi
│       │   │   └── DanhGiaManager.cs            [MỚI] Domain Service: Kiểm duyệt đánh giá, cập nhật điểm sao trung bình
│       │   ├── ThongBaos/                       🔔 MODULE THÔNG BÁO THỜI GIAN THỰC
│       │   │   └── ThongBao.cs                  [MỚI] Entity Thông báo: Phân lập DoiTuong ('buyer' vs 'seller')
│       │   ├── DanhMucs/                        🗂 MODULE DANH MỤC SẢN PHẨM
│       │   │   └── DanhMuc.cs                   [MỚI] Entity Cây danh mục ngành hàng toàn sàn
│       │   └── Data/
│       │       ├── ShopDataSeederContributor.cs     [NÂNG CẤP] Khởi tạo dữ liệu mẫu: Shop, Sản phẩm, Tài khoản test
│       │       └── DanhMucDataSeederContributor.cs  [MỚI] Khởi tạo danh mục ngành hàng cầu lông & thể thao
│       │
│       ├── testtttt88.EntityFrameworkCore/      ⭐ TẦNG 2: KẾT NỐI CƠ SỞ DỮ LIỆU (INFRASTRUCTURE)
│       │   ├── EntityFrameworkCore/
│       │   │   └── testtttt88DbContext.cs       [NÂNG CẤP] Cấu hình Fluent API bảng AppCuaHangs, AppVis, AppDanhGias, AppThongBaos,...
│       │   └── Migrations/                      [MỚI] Lịch sử Migrations EF Core đồng bộ cấu trúc Database SQL Server
│       │
│       ├── testtttt88.Application.Contracts/    ⭐ TẦNG 3: HỢP ĐỒNG GIAO TIẾP & DTO (CONTRACTS)
│       │   ├── CuaHangs/                        [MỚI] DTOs & ICuaHangAppService
│       │   ├── SanPhams/                        [NÂNG CẤP] SanPhamDto (kèm TenCuaHang, CuaHangId) & ISanPhamAppService
│       │   ├── DonHangs/                        [NÂNG CẤP] DonHangTongDto, YeuCauTraHangDto, XuLyTraHangDto & IDonHangAppService
│       │   ├── ViCuaHangs/                      [MỚI] ViCuaHangDto, TaoYeuCauRutTienDto & IViCuaHangAppService
│       │   ├── DanhGias/                        [MỚI] DanhGiaDto, TaoDanhGiaDto, PhanHoiDanhGiaDto & IDanhGiaAppService
│       │   ├── ThongBaos/                       [MỚI] ThongBaoDto, TaoThongBaoDto & IThongBaoAppService
│       │   ├── DanhMucs/                        [MỚI] DanhMucDto & IDanhMucAppService
│       │   └── Permissions/                     [NÂNG CẤP] Khai báo cây quyền hạn Seller, Admin, DonHang, SanPham
│       │
│       ├── testtttt88.Application/              ⭐ TẦNG 4: THỰC THI NGHIỆP VỤ ỨNG DỤNG (APPLICATION)
│       │   ├── CuaHangs/CuaHangAppService.cs    [MỚI] Nghiệp vụ đăng ký shop, thông tin gian hàng
│       │   ├── SanPhams/SanPhamAppService.cs    [NÂNG CẤP] Nghiệp vụ sản phẩm theo từng shop
│       │   ├── DonHangs/DonHangAppService.cs    [NÂNG CẤP] Nghiệp vụ tạo đơn Split Order, đổi trạng thái, xử lý hoàn trả & trigger thông báo
│       │   ├── ViCuaHangs/ViCuaHangAppService.cs[MỚI] Nghiệp vụ tra cứu ví shop, tạo lệnh rút tiền, Admin duyệt rút
│       │   ├── DanhGias/DanhGiaAppService.cs    [MỚI] Nghiệp vụ đánh giá sản phẩm, shop phản hồi nhận xét & trigger thông báo
│       │   ├── ThongBaos/ThongBaoAppService.cs  [MỚI] Quản lý thông báo độc lập Buyer vs Seller, đánh dấu đã đọc, xóa
│       │   └── DanhMucs/DanhMucAppService.cs    [MỚI] Quản lý danh mục ngành hàng toàn sàn
│       │
│       └── testtttt88.HttpApi.Host/             🚀 HOSTING & SWAGGER API
│           ├── appsettings.json                 [SỬA] Chuỗi kết nối SQL Server local
│           └── Program.cs                       [GỐC] Khởi động Web API ABP & OpenIddict
│
└── angular/                                     (FRONTEND: Angular 18+ Standalone Components & Reactive Forms & Signals)
    └── src/app/
        ├── app.routes.ts                        [NÂNG CẤP] Định tuyến 3 phân hệ độc lập: Client, Seller, Admin, Auth
        ├── app.component.ts                     [SỬA] Component gốc hiển thị router-outlet và Chatbot AI
        │
        ├── he-thong/                            🛡 TẦNG DỊCH VỤ DÙNG CHUNG & BẢO VỆ
        │   ├── bao-ve/
        │   │   └── xac-thuc.guard.ts            [NÂNG CẤP] 3 Route Guards: adminGuard, sellerGuard, khachHangGuard
        │   └── dich-vu/
        │       ├── xac-thuc.service.ts          [NÂNG CẤP] Quản lý phiên đăng nhập 3 vai trò, giải mã JWT Claims
        │       ├── du-lieu.service.ts           [NÂNG CẤP] Tích hợp API Multi-vendor, Đơn hàng, Ví tiền, Đánh giá, Thông báo
        │       ├── thong-bao.service.ts         [GỐC] Toast thông báo xanh/đỏ (Thành công/Lỗi)
        │       └── giao-dien.service.ts         [MỚI] Quản lý giao diện Sáng / Tối (Theme Switcher)
        │
        ├── auth/                                🔐 MODULE XÁC THỰC ĐA VAI TRÒ
        │   └── dang-nhap/
        │       ├── dang-nhap.component.ts       [NÂNG CẤP] Form Login/Register, nhận diện role Seller/Admin/Buyer và điều hướng
        │       ├── dang-nhap.component.html     [NÂNG CẤP] Nút đăng nhập 1-click cho cả 3 vai trò mẫu
        │       └── dang-nhap.component.scss     [GỐC] Giao diện bo tròn, hiệu ứng mượt mà
        │
        ├── client/                              🛒 MODULE KHÁCH MUA HÀNG (BUYER PORTAL)
        │   ├── layout/
        │   │   ├── khung-khach-hang.component.ts[NÂNG CẤP] Shell khách hàng: Navbar, Badge giỏ hàng, Chuông thông báo Buyer
        │   │   ├── khung-khach-hang.component.html
        │   │   └── khung-khach-hang.component.scss
        │   ├── cua-hang/                        [NÂNG CẤP] Grid sản phẩm toàn sàn, lọc danh mục, tìm kiếm, badge tên shop
        │   ├── chi-tiet-san-pham/               [MỚI] Chi tiết SP, chọn số lượng, Tab Đánh Giá 1-5★ kèm ảnh thực tế
        │   ├── chi-tiet-shop/                   [MỚI] Trang riêng từng shop (/shop/:slug) hiển thị thông tin & catalog của shop
        │   ├── gio-hang/                        [NÂNG CẤP] Giỏ hàng đa shop, form đặt hàng tạo Master-Sub Order
        │   └── don-hang-cua-toi/                [NÂNG CẤP] Lịch sử đơn hàng, Modal Yêu Cầu Hoàn Trả & Modal Đánh Giá SP
        │
        ├── seller/                              🏪 MODULE KÊNH NGƯỜI BÁN (SELLER CENTER - ĐỘC LẬP)
        │   ├── layout/
        │   │   ├── khung-seller.component.ts    [MỚI] Shell người bán: Sidebar chuyên biệt, Chuông thông báo Seller
        │   │   ├── khung-seller.component.html
        │   │   └── khung-seller.component.scss
        │   ├── tong-quan/                       [MỚI] Bảng điều khiển kinh doanh: Doanh thu, Đơn mới, Sản phẩm shop
        │   ├── san-pham/                        [MỚI] Quản lý kho hàng shop: Thêm, Sửa, Xóa SP của riêng gian hàng
        │   ├── don-hang/                        [MỚI] Quản lý đơn hàng shop: Đổi trạng thái, Tiếp nhận & Xử lý Hoàn trả
        │   ├── danh-gia/                        [MỚI] Quản lý đánh giá khách hàng: Xem nhận xét, gửi phản hồi của Shop
        │   ├── vi-tien/                         [MỚI] Ví Doanh Thu: Quỹ Escrow, Số dư khả dụng, Tạo lệnh rút tiền ngân hàng
        │   ├── cai-dat/                         [MỚI] Cài đặt thông tin gian hàng: Hotline, Địa chỉ, Tỷ lệ chiết khấu
        │   └── dang-ky/                         [MỚI] Đăng ký mở gian hàng mới cho người dùng cá nhân
        │
        ├── admin/                               👑 MODULE QUẢN TRỊ VIÊN SÀN (PLATFORM ADMIN)
        │   ├── layout/
        │   │   └── khung-chinh.component.*      [GỐC] Khung quản trị sàn: Sidebar co giãn + Header
        │   ├── tong-quan/                       [NÂNG CẤP] Dashboard số liệu toàn sàn: Doanh thu sàn, Đơn hàng, Kho cảnh báo
        │   ├── san-pham/                        [NÂNG CẤP] Bảng quản trị SP toàn sàn gán theo từng gian hàng
        │   ├── don-hang/                        [NÂNG CẤP] Quản lý giám sát đơn hàng toàn sàn
        │   ├── danh-muc/                        [MỚI] Quản lý cây danh mục ngành hàng toàn sàn
        │   ├── gian-hang/                       [MỚI] Quản lý danh sách gian hàng, duyệt/khóa shop
        │   ├── rut-tien/                        [MỚI] Đối soát & phê duyệt các yêu cầu rút tiền ví của các shop
        │   └── tai-khoan/                       [MỚI] Quản lý tài khoản người dùng & phân quyền hệ thống
        │
        └── components/chat-bot/
            └── chat-bot.component.*             [NÂNG CẤP] Trợ lý ảo Google Gemini AI tư vấn sản phẩm thông minh
```
