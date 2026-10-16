# [testtttt88] Constitution — Hệ thống Quản lý Cửa hàng & Bán hàng trực tuyến

## Core Principles

### I. Kiến trúc Backend 4 tầng DDD (ABP Framework)
Mọi chức năng nghiệp vụ phía máy chủ phải tuân thủ nghiêm ngặt mô hình Domain-Driven Design 4 tầng:
1. `Domain`: Aggregate Root (`FullAuditedAggregateRoot<Guid>`), Domain Service/Manager, Business Invariants.
2. `Application.Contracts`: DTOs và Interfaces, tuyệt đối không lộ Entity ra ngoài.
3. `Application`: Triển khai AppService, AutoMapper, ném `UserFriendlyException`.
4. `EntityFrameworkCore`: Cấu hình DbContext, Fluent API, Indexing.

### II. Frontend Hiện đại (Angular 18+ Standalone & Signals)
1. Chỉ dùng **Standalone Components**, không dùng `NgModule`.
2. Quản lý trạng thái và luồng dữ liệu bằng **Angular Signals** (`signal`, `computed`, `effect`) kết hợp RxJS Stream.
3. Mọi form nhập liệu dùng **Reactive Forms** (`FormGroup`, `FormControl`, `Validators`).
4. Phân quyền và bảo vệ route bằng Route Guards (`adminGuard`, `khachHangGuard`).
5. Không dùng kiểu `any`, phải định nghĩa Types/Interfaces rõ ràng trong `shared/mo-hinh/`.

### III. Tối Giản & Tránh Over-Engineering (Ponytail Rules)
1. Ưu tiên giải pháp ngắn gọn nhất, tận dụng chức năng sẵn có của ABP và Angular trước khi thêm thư viện mới.
2. Không viết code boilerplate, wrapper dư thừa chưa cần dùng tới.

## Governance
Mọi bước lập kế hoạch (`plan.md`) và triển khai tác vụ (`tasks.md`) phải tuân thủ các nguyên tắc trên.

**Version**: 1.0.0 | **Ratified**: 2026-10-14
