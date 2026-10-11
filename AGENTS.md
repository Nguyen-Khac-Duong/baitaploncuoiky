# AGENTS.MD - HƯỚNG DẪN KIẾN TRÚC & QUY TẮC RÀNG BUỘC CHO AI AGENT (testtttt88)

> **Dự án:** Hệ thống Quản lý Cửa hàng & Bán hàng trực tuyến  
> **Sinh viên thực hiện:** Nguyễn Khắc Dương | **MSV:** 74DCTT22184 | **Lớp:** 74DCTT27  
> **Giảng viên hướng dẫn:** Thầy Tô Hải Thiên (`thienth@utt.edu.vn`)  
> **Mục đích:** Định hình hành vi, bắt buộc AI Agent tuân thủ nghiêm ngặt các quy chuẩn kỹ thuật khi sinh mã (Code Generation) và tái cấu trúc (Refactoring).

---

## 1. NGUYÊN TẮC BẮT BUỘC BACKEND (ASP.NET CORE ABP FRAMEWORK)

Mọi mã nguồn Backend sinh ra phải tuân thủ nghiêm ngặt mô hình **Domain-Driven Design (DDD) 4 tầng**:

1. **Tầng Domain (`testtttt88.Domain`):**
   - Chứa thực thể cốt lõi (`SanPham`, `DonHang`, `ChiTietDonHang`).
   - Mọi thực thể nghiệp vụ bắt buộc kế thừa `FullAuditedAggregateRoot<Guid>` để tự động hỗ trợ **Audit Logs** (`CreationTime`, `CreatorId`,...) và **Soft Delete** (`IsDeleted`).
   - Logic nghiệp vụ, kiểm tra ràng buộc toàn vẹn (Invariants) như kiểm tra tồn kho phải viết trong **Domain Service / Manager** (`SanPhamManager`, `DonHangManager`), không được viết tràn lan ở AppService hay Controller.

2. **Tầng Contracts (`testtttt88.Application.Contracts`):**
   - Định nghĩa DTOs (`SanPhamDto`, `CreateUpdateSanPhamDto`, `DonHangDto`, `TaoDonHangDto`) và Interface dịch vụ (`ISanPhamAppService`, `IDonHangAppService`).
   - Tuyệt đối không để lộ thực thể Domain trực tiếp ra bên ngoài tầng này.

3. **Tầng Application (`testtttt88.Application`):**
   - Triển khai các `AppService`.
   - Sử dụng `ObjectMapper` để chuyển đổi qua lại giữa Entity và DTO.
   - Khi có lỗi nghiệp vụ (ví dụ: kho hết hàng, vượt số lượng), bắt buộc ném ngoại lệ bằng `UserFriendlyException` để trả về lỗi thân thiện cho người dùng.

4. **Tầng EntityFrameworkCore (`testtttt88.EntityFrameworkCore`):**
   - Cấu hình quan hệ bảng, Fluent API, chỉ mục (Index) và cấu hình DbContext (`testtttt88DbContext`).

---

## 2. NGUYÊN TẮC BẮT BUỘC FRONTEND (ANGULAR 18+)

1. **Kiến trúc Hiện đại:**
   - Sử dụng **Standalone Components**, không sử dụng `NgModule`.
   - Quản lý trạng thái và luồng dữ liệu thời gian thực bằng **Angular Signals** (`signal`, `computed`, `effect`) kết hợp với RxJS Streams khi gọi API HTTP.

2. **Form & Kiểm tra hợp lệ (Validation):**
   - Bắt buộc dùng **Reactive Forms** (`FormGroup`, `FormControl`, `Validators`).
   - Bắt lỗi chi tiết hiển thị trực tiếp lên UI (required, minLength, pattern regex).

3. **Bảo vệ Tuyến đường & Phân quyền (RBAC):**
   - Các tuyến đường dành cho Quản trị (`/admin/*`) và Khách hàng (`/don-hang-cua-toi`) phải được bảo vệ bởi Route Guards (`adminGuard`, `khachHangGuard`).

4. **Kỷ luật mã nguồn TypeScript:**
   - Tuyệt đối không dùng kiểu `any`. Phải định nghĩa interface rõ ràng trong thư mục `shared/models/`.

---

## 3. QUY TRÌNH THỰC THI (WORKFLOW) CỦA AI AGENT

Khi nhận bất kỳ câu lệnh nào từ người dùng:
1. **Kiểm tra ngữ cảnh:** Kích hoạt skill **Graphify** để tra cứu đồ thị phụ thuộc giữa Backend và Frontend, xác định các file bị ảnh hưởng (Impact Analysis).
2. **Thực thi:** Sinh code tuân thủ các điều khoản trên.
3. **Nghiệm thu:** Tự động kiểm tra lỗi cú pháp và chạy lệnh build/test trước khi kết thúc tác vụ.
