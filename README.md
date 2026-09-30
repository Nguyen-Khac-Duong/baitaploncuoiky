# Hệ Thống Quản Lý Cửa Hàng & Kho Hàng (testtttt88)
> Dự án Bài Tập Lớn - Hướng tiếp cận Vibe Coding với AI Agent  
> Công nghệ: **ASP.NET Core ABP Framework (DDD) + Angular 18+ (Standalone)**

## 📑 Báo Cáo Tiến Độ Bài Tập Lớn
* 👉 **Báo cáo đợt 1 (Ngày 04/10/2026):** Xem chi tiết tại [README_4_11.md](README_4_11.md)
* 👉 **Báo cáo đợt 2 (Ngày 11/10/2026):** Sẽ cập nhật tại `README_11_11.md`

---

## 🛠️ Kiến Trúc Hệ Thống
1. **Backend (`aspnet-core/`):**
   * Chuẩn kiến trúc **DDD 4 tầng** (Domain, Contracts, Application, EntityFrameworkCore).
   * Cơ chế **Audit Logging** tự động và **Soft Delete** kế thừa `FullAuditedAggregateRoot<Guid>`.
   * Giao tiếp chuẩn **DTOs & Mapping** an toàn, bảo mật.
2. **Frontend (`angular/`):**
   * **Angular 18+ Standalone Components**, sử dụng Signals và RxJS Reactive Streams.
   * **Reactive Forms & Validation**: Giám sát trạng thái form (`invalid`, `touched`, `dirty`) và Custom Validators.
   * **Route Guards (`CanActivate`)**: Phân quyền khu vực Quản trị (Admin) và Cửa hàng (Client).

---

## 🚀 Hướng Dẫn Chạy Dự Án
### Backend:
```bash
cd aspnet-core/src/testtttt88.HttpApi.Host
dotnet run
```
Swagger UI: `https://localhost:44351/swagger`

### Frontend:
```bash
cd angular
npm install
npm start
```
Truy cập: `http://localhost:4200`
