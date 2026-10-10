# 🛒 Hệ Thống Quản Lý Cửa Hàng & Bán Hàng Trực Tuyến (testtttt88)
> **Dự án Bài Tập Lớn Môn Học - Trường Đại Học Công Nghệ Giao Thông Vận Tải (UTT)**  
> **Sinh viên:** Nguyễn Khắc Dương | **MSV:** 74DCTT22184 | **Lớp:** 74DCTT27  
> **Giảng viên hướng dẫn:** Thầy Tô Hải Thiên (`thienth@utt.edu.vn`)  
> **Công nghệ:** ASP.NET Core ABP Framework (DDD) + Angular 18+ (Standalone) + Google Gemini AI

---

## 📑 BÁO CÁO TIẾN ĐỘ BÀI TẬP LỚN (MILESTONES)

* 🎯 **Đợt 1 (Ngày 04/10/2026):** Đã hoàn thành toàn diện kiến trúc nền tảng, các phân hệ Khách hàng, Quản trị và Trợ lý Gemini AI.  
  👉 **Xem báo cáo chi tiết đợt 1 tại:** [**README_4_11.md**](README_4_11.md)
* 🎯 **Đợt 2 (Ngày 11/10/2026):** Báo cáo ý hiểu hệ thống, kỹ năng kiểm soát mã nguồn, toàn bộ 8 luồng sự kiện, kỹ năng Graphify, Log, Diff, tiêu chí Leader và kiểm thử nâng cao theo phản hồi của Thầy Tô Hải Thiên.  
  👉 **Xem báo cáo chi tiết đợt 2 tại:** [**README_11_11.md**](README_11_11.md)

---

## 🌟 TỔNG QUAN DỰ ÁN

**`testtttt88`** là giải pháp phần mềm thương mại điện tử và quản lý kho bán lẻ hoàn chỉnh, được phát triển theo mô hình hiện đại **Vibe Coding** với sự đồng hành của **AI Agent**. Hệ thống bao gồm hai cổng giao diện chuyên biệt:
1. **Cổng Khách hàng (Client Storefront):** Trải nghiệm mua sắm trực tuyến mượt mà, tìm kiếm thông minh, giỏ hàng tương tác, quy trình đặt hàng an toàn và trợ lý ảo thông minh **Gemini AI Chatbot** tư vấn trực tiếp theo kho hàng thực tế.
2. **Cổng Quản trị (Admin Operations Portal):** Bảng điều khiển KPI kinh doanh (doanh thu, đơn hàng, tồn kho), quản lý danh mục sản phẩm (CRUD, xóa mềm) và điều phối xử lý trạng thái đơn hàng.

---

## 🛠️ CÔNG NGHỆ & KIẾN TRÚC

```
[ Angular 18+ Client / Admin ] <---> [ ASP.NET Core ABP Web API ] <---> [ SQL Server ]
              │                                      │
       [ Google Gemini AI ]                   [ Domain-Driven Design ]
```

* **Backend (ASP.NET Core ABP Framework):**
  * Áp dụng chuẩn **Domain-Driven Design (DDD) 4 tầng** (`Domain`, `Application.Contracts`, `Application`, `EntityFrameworkCore`).
  * Thực thể nghiệp vụ kế thừa `FullAuditedAggregateRoot` tự động lưu vết lịch sử (Audit Log) và kích hoạt **Soft Delete** (`IsDeleted`).
  * Xử lý nghiệp vụ kho và đơn hàng thông qua **Domain Manager** (`SanPhamManager`, `DonHangManager`) bảo vệ toàn vẹn dữ liệu.
* **Frontend (Angular 18+ Standalone):**
  * Kiến trúc **Standalone Components** hiện đại, kết hợp **Signals** và **RxJS Streams** cho tốc độ phản hồi tức thời.
  * **Reactive Forms & Validation**: Kiểm soát chặt chẽ trạng thái form (`invalid`, `touched`, `dirty`) và custom regex.
  * **Bảo vệ Tuyến đường (Route Guards)**: `adminGuard` và `khachHangGuard` phân quyền người dùng (RBAC).
* **Trí tuệ nhân tạo (Gemini AI):**
  * Sử dụng Google GenAI SDK (`@google/genai`) kết nối mô hình Gemini Flash.
  * Tự động trích xuất các sản phẩm phù hợp từ cơ sở dữ liệu để gợi ý trực tiếp trong phiên chat.

---

## 🚀 CÁC TÍNH NĂNG CHÍNH

### 🛍️ Phân hệ Khách hàng (Client)
* **Cửa hàng (`/cua-hang`):** Duyệt sản phẩm dạng thẻ Card, lọc danh mục tức thời, tìm kiếm từ khóa thời gian thực.
* **Giỏ hàng (`/gio-hang`):** Tăng/giảm số lượng (ràng buộc số lượng tồn kho), xóa sản phẩm, tính tổng tiền tự động.
* **Đặt hàng (Checkout):** Nhập thông tin giao hàng với bộ kiểm tra hợp lệ nghiêm ngặt, tự động trừ kho và sinh mã đơn hàng.
* **Đơn hàng của tôi (`/don-hang-cua-toi`):** Theo dõi lịch sử và tiến độ đơn hàng (*Chờ xử lý $\rightarrow$ Đang giao $\rightarrow$ Hoàn thành / Hủy*).
* **Trợ lý Gemini AI Chatbot:** Cửa sổ trò chuyện thông minh tư vấn mua sắm 24/7 và đính kèm thẻ sản phẩm tương tác.

### 🛡️ Phân hệ Quản trị (Admin)
* **Dashboard Thống kê (`/admin/tong-quan`):** 4 thẻ chỉ số KPI (Doanh thu, Đơn hàng, Sản phẩm, Hết hàng) và danh sách cần xử lý.
* **Quản lý Sản phẩm (`/admin/san-pham`):** Thêm, sửa, tìm kiếm, lọc và xóa an toàn (Soft Delete) mặt hàng.
* **Quản lý Đơn hàng (`/admin/don-hang`):** Tra cứu đơn hàng, lọc theo trạng thái, xem chi tiết hàng đặt và cập nhật tiến độ giao hàng.

### 🔐 Phân hệ Xác thực & Phân quyền
* Đăng nhập / Đăng ký hợp nhất (`/dang-nhap`, `/dang-ky`) hỗ trợ nạp nhanh tài khoản mẫu.
* Phân quyền theo vai trò (`admin` vs `khach_hang`) và bảo vệ các tuyến đường nhạy cảm với `CanActivate` Guards.

---

## 📁 CẤU TRÚC MÃ NGUỒN

```bash
testtttt88/
├── angular/                                  # Frontend Angular 18+
│   └── src/app/
│       ├── admin/                            # Cổng Quản trị (Dashboard, Sản phẩm, Đơn hàng)
│       ├── client/                           # Cổng Khách hàng (Cửa hàng, Giỏ hàng, Đơn cá nhân)
│       ├── auth/                             # Đăng nhập & Đăng ký
│       ├── components/chat-bot/              # Widget Trợ lý Gemini AI
│       ├── he-thong/                         # Services, Guards bảo vệ, Interceptors
│       └── shared/                           # Models, DTOs chung
├── aspnet-core/                              # Backend ASP.NET Core ABP
│   └── src/
│       ├── testtttt88.Domain/                # Entities, Domain Managers, Ràng buộc nghiệp vụ
│       ├── testtttt88.Application.Contracts/ # DTOs, AppService Interfaces, Permissions
│       ├── testtttt88.Application/           # AppServices, Mapping dữ liệu
│       ├── testtttt88.EntityFrameworkCore/   # DbContext, Cấu hình Entity, Audit Logs
│       └── testtttt88.HttpApi.Host/          # Web API Host, Swagger UI, Cấu hình Auth
├── README.md                                 # Tài liệu tổng quan dự án (Trang chủ Repository)
├── README_4_11.md                            # Báo cáo tiến độ chi tiết Đợt 1 (04/10/2026)
└── README_11_11.md                           # Báo cáo ý hiểu hệ thống & kiểm soát code Đợt 2 (11/10/2026)
```

---

## ⚡ HƯỚNG DẪN CÀI ĐẶT & CHẠY ỨNG DỤNG

### 1. Khởi chạy Backend (ASP.NET Core ABP)
```bash
cd aspnet-core/src/testtttt88.HttpApi.Host
dotnet run
```
* **Swagger UI API:** `https://localhost:44351/swagger`

### 2. Khởi chạy Frontend (Angular 18+)
```bash
cd angular
npm install
npm start
```
* **Website:** `http://localhost:4200`

### 3. Tài khoản Demo Trải nghiệm
| Vai trò | Email | Mật khẩu | Quyền hạn |
| :--- | :--- | :--- | :--- |
| **Quản trị viên (Admin)** | `admin@gmail.com` | `123456` | Toàn quyền Quản trị & Cửa hàng |
| **Khách hàng (Client)** | `khachhang@gmail.com` | `123456` | Mua sắm, Giỏ hàng, Đặt hàng, Đơn cá nhân |

*(Có thể bấm trực tiếp nút "Tài khoản Admin mẫu" hoặc "Tài khoản Khách mẫu" trên giao diện Đăng nhập).*

---

*Mọi chi tiết về quá trình thực hiện và kết quả đạt được trong Đợt 1, vui lòng xem tại [README_4_11.md](README_4_11.md).*
