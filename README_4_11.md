# BÁO CÁO TIẾN ĐỘ BÀI TẬP LỚN - KỶ NGUYÊN VIBE CODING
**Họ và tên sinh viên:** Nguyễn Khắc Dương  
**Mã sinh viên:** 74DCTT22184  
**Lớp:** 74DCTT27  
**Giảng viên hướng dẫn:** Thầy Tô Hải Thiên (`thienth@utt.edu.vn`)  
**Ngày báo cáo:** 04/10/2026 (Theo yêu cầu: file `README_4_11`)  
**Repository (Public):** https://github.com/Nguyen-Khac-Duong/baitaploncuoiky.git  

---

## TỔNG QUAN HỆ THỐNG
Dự án được xây dựng theo mô hình **Thương mại điện tử & Quản lý kho** (Shop Management System) áp dụng các tiêu chuẩn kiến trúc hiện đại nhất hiện nay:
* **Backend:** ASP.NET Core với **ABP Framework** chuẩn kiến trúc **DDD (Domain-Driven Design)** 4 tầng, Entity Framework Core và SQL Server.
* **Frontend:** **Angular 18+ (Standalone Components)**, mô hình Reactive Forms, RxJS Streams và kiến trúc phân quyền bảo vệ Route (`CanActivate`).

---

## Ý 1: XÂY DỰNG HỆ THỐNG VỚI SỰ TRỢ GIÚP CỦA AI AGENT (3 ĐIỂM)

Trong kỷ nguyên **"Vibe Coding"**, mục tiêu không phải là để AI tự làm hết từ A-Z một cách mù quáng, mà là đóng vai trò **Kiến trúc sư hệ thống (System Architect)** chỉ đạo, kiểm soát và xác thực mã nguồn do AI Agent (Claude, Cursor, Antigravity, VSCode Copilot) sinh ra.

### Quy trình 4 bước làm việc với AI Agent trong dự án:
1. **Phân rã bài toán (Decomposition):** 
   * Không bao giờ đưa một prompt mơ hồ: *"Hãy viết cho tôi trang web bán hàng"*.
   * Chia nhỏ thành từng bài toán con theo lớp kiến trúc:
     * *Bước 1:* Thiết kế Entity `SanPham` trong Domain kế thừa `FullAuditedAggregateRoot`.
     * *Bước 2:* Dựng bản hợp đồng `ISanPhamAppService` và các DTOs trong Application.Contracts.
     * *Bước 3:* Viết `SanPhamAppService` kế thừa `CrudAppService` và hiện thực Mapping.
     * *Bước 4:* Xây dựng giao diện Angular với `ReactiveFormsModule`.
2. **Cung cấp ngữ cảnh đầy đủ (Context-Driven Prompting):**
   * Luôn đính kèm các quy chuẩn kỹ thuật (Tech stack, version, coding conventions) để AI không sinh mã lạc hậu.
   * Ví dụ: Chỉ định Angular Standalone (không dùng NgModule cũ), sử dụng `inject()` thay cho constructor injection truyền thống.
3. **Thẩm định & Kiểm soát mã nguồn (Code Verification):**
   * Sau khi Agent sinh mã, lập tức chạy `dotnet build` và `ng build` để kiểm tra lỗi biên dịch.
   * Review từng diff của file để đảm bảo không bị rò rỉ bảo mật (ví dụ: không bao giờ để Entity lộ ra API mà bắt buộc phải qua DTO).
4. **Tối ưu hóa & Refactor:**
   * Sử dụng Agent để phát hiện các đoạn code thừa, memory leak (như việc unsubscribe RxJS bằng `destroy$ = new Subject<void>()`).

---

## Ý 2: KỸ NĂNG KIỂM SOÁT MÃ NGUỒN (5 ĐIỂM)

### a) Kiểm soát tính năng (Feature Mastery)

#### 1. Module Đăng Nhập & Đăng Ký nằm ở đâu?
* **Giao diện & Logic Form:**
  * Component: [dang-nhap.component.ts](file:///c:/testtttt88/angular/src/app/auth/dang-nhap/dang-nhap.component.ts)
  * Template HTML: [dang-nhap.component.html](file:///c:/testtttt88/angular/src/app/auth/dang-nhap/dang-nhap.component.html)
* **Xử lý đăng nhập / lưu Token & Phân quyền:**
  * Service: [xac-thuc.service.ts](file:///c:/testtttt88/angular/src/app/he-thong/dich-vu/xac-thuc.service.ts)
* **Cơ chế chặn truy cập trái phép (Route Guard):**
  * File bảo vệ: [xac-thuc.guard.ts](file:///c:/testtttt88/angular/src/app/he-thong/bao-ve/xac-thuc.guard.ts)
  * Khai báo trong router: [app.routes.ts](file:///c:/testtttt88/angular/src/app/app.routes.ts) với `canActivate: [adminGuard]`.

#### 2. Trả lời câu hỏi phỏng vấn: "Tạo ràng buộc mật khẩu phải có dấu `@` như thế nào?"
Có 2 cách thực hiện chính xác và linh hoạt:

* **Cách 1: Sử dụng Built-in `Validators.pattern` của Angular (Nhanh & Chuẩn):**
  Tại [dang-nhap.component.ts](file:///c:/testtttt88/angular/src/app/auth/dang-nhap/dang-nhap.component.ts#L37), sửa dòng khai báo `matKhau`:
  ```typescript
  // Yêu cầu tối thiểu 6 ký tự VÀ bắt buộc phải chứa ký tự @
  matKhau: ['', [
    Validators.required, 
    Validators.minLength(6),
    Validators.pattern(/^.*[@].*$/) // Biểu thức chính quy bắt buộc có dấu @
  ]]
  ```

* **Cách 2: Viết một hàm Custom Validator riêng biệt:**
  ```typescript
  import { AbstractControl, ValidationErrors } from '@angular/forms';

  // Hàm tự định nghĩa kiểm tra ký tự @
  export function matKhauPhaiCoKyTuA(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const coKyTuA = String(control.value).includes('@');
    return coKyTuA ? null : { thieuKyTuA: 'Mật khẩu bắt buộc phải chứa ký tự @' };
  }

  // Gắn vào Form:
  matKhau: ['', [Validators.required, Validators.minLength(6), matKhauPhaiCoKyTuA]]
  ```
  Và trong HTML hiển thị thông báo lỗi:
  ```html
  @if (formDangKy.get('matKhau')?.touched && formDangKy.get('matKhau')?.errors?.['thieuKyTuA']) {
    <span class="error-msg">Mật khẩu bắt buộc phải chứa ký tự @!</span>
  }
  ```

#### 3. Cấu trúc Backend chuẩn 4 tầng DDD của hệ thống:
* **Domain Layer** (`testtttt88.Domain\SanPhams\SanPham.cs`): Chứa Entity nghiệp vụ, kế thừa `FullAuditedAggregateRoot<Guid>`.
* **Contracts Layer** (`testtttt88.Application.Contracts\SanPhams\`): Chứa `ISanPhamAppService`, `SanPhamDto`, `CreateUpdateSanPhamDto`. Định nghĩa ranh giới an toàn, bảo mật.
* **Application Layer** (`testtttt88.Application\SanPhams\SanPhamAppService.cs`): Điều phối nghiệp vụ, thực hiện mapping DTO $\leftrightarrow$ Entity qua hàm `MapToDto` và `MapToEntityAsync`.
* **EntityFrameworkCore Layer** (`testtttt88.EntityFrameworkCore\EntityFrameworkCore\testtttt88DbContext.cs`): Cấu hình DbSet, gọi `b.ConfigureByConvention()` kích hoạt tự động lưu Audit Log và Xóa mềm (Soft Delete `IsDeleted`).

---

### b) Kỹ năng sử dụng skills (Graphify và công cụ hỗ trợ)
* **Ứng dụng Graphify / Sơ đồ hóa quan hệ:**
  * Giúp phân tích cấu trúc phụ thuộc (Dependency Graph) giữa các Module.
  * Đảm bảo nguyên lý DDD: Tầng Domain tuyệt đối không phụ thuộc vào tầng Application hay Database bên ngoài.
* **Áp dụng AI Skills & CheatSheets:**
  * Tận dụng các cấu hình rule (rules/skills) trong IDE để chuẩn hóa style code, quy chuẩn commit message và tự động kiểm thử.

---

### c) Góc nhìn Leader về Git Log, Git Diff và Đánh giá hiệu quả làm việc

#### 1. Ý hiểu về `git log` và `git diff`:
* **`git log`:** Cung cấp dòng thời gian (Timeline) và tiến trình tư duy của lập trình viên. Nhìn vào log, Leader biết được lập trình viên có đi theo từng bước bài bản (từ thiết kế DB $\rightarrow$ viết API $\rightarrow$ dựng UI) hay làm việc chắp vá.
* **`git diff`:** Thể hiện chi tiết sự thay đổi thực tế trên từng dòng code (Thêm `+`, Xóa `-`). Cho thấy chất lượng kỹ thuật, tính gọn gàng và việc tuân thủ quy chuẩn (không để lọt code thừa, file tạm, console.log).

#### 2. Tiêu chí đánh giá 1 thành viên làm việc hiệu quả (Dưới vai trò Leader):
> **Nguyên tắc cốt lõi:** Tuyệt đối **KHÔNG** dùng số dòng code (Lines of Code - LOC) để đo lường hiệu quả! Người viết 1.000 dòng code rác hoặc copy-paste không thể hiệu quả bằng người viết 50 dòng code súc tích, tái sử dụng tốt.

Các tiêu chí đánh giá chuẩn mực:
1. **Tần suất Commit đều đặn (Atomic Commits):**
   * Làm đến đâu commit đến đó, mỗi commit giải quyết trọn vẹn 1 chức năng nhỏ (không dồn toàn bộ đồ sộ vào 1 commit cuối cùng).
2. **Chất lượng Diff (Clean Diffs):**
   * Code thay đổi đúng trọng tâm yêu cầu bài toán, không sửa lan man sang các file không liên quan, không commit file thư viện (`node_modules`, `bin`, `obj`).
3. **Ý thức tự kiểm thử (Self-Testing):**
   * Code sinh ra chạy được ngay, pass toàn bộ build và validation trước khi tạo Pull Request (PR).
4. **Khả năng giải trình và làm chủ mã nguồn:**
   * Khi được hỏi bất kỳ tính năng nào, chỉ ra được ngay file nào, dòng nào chịu trách nhiệm, vì sao lại viết như vậy.

---

## Ý 3: KẾT HỢP CÁC CÔNG CỤ TEST TÍNH NĂNG (NÂNG CAO - 2 ĐIỂM)

Dự án triển khai kiểm thử đa tầng:
1. **Kiểm thử giao diện & Form State (Angular Client-side Testing):**
   * Sử dụng cơ chế giám sát `invalid`, `touched`, `dirty` của Reactive Forms.
   * Kiểm thử tự động vô hiệu hóa nút submit: `[disabled]="formSanPham.invalid"`.
2. **Kiểm thử API Endpoint với Swagger UI:**
   * Backend ABP tích hợp sẵn Swagger UI tại `https://localhost:44351/swagger`.
   * Kiểm tra tính đúng đắn của dữ liệu trả về theo format `PagedResultDto<SanPhamDto>` và mã phản hồi HTTP (`200 OK`, `400 Bad Request`, `403 Forbidden`).
3. **Kiểm thử Phân quyền & Route Protection:**
   * Kiểm thử truy cập không có quyền: Mở tab ẩn danh truy cập `/admin/san-pham` $\rightarrow$ Hệ thống tự kích hoạt `adminGuard` chặn đứng và chuyển hướng về trang `/dang-nhap`.

---

*Báo cáo được hoàn thiện và cập nhật liên tục trên Git commit history.*
