# Implementation Plan: RM-001 — Đăng nhập & Đăng ký

**Branch**: `001-rm-001-dang-nhap` | **Date**: 2026-10-14 | **Spec**: [specs/001-rm-001-dang-nhap/spec.md](spec.md)

**Input**: Feature specification from `specs/001-rm-001-dang-nhap/spec.md`

---

## Summary

Xây dựng và hoàn thiện luồng Xác thực (Authentication) gồm Đăng nhập, Đăng ký, Lưu trữ phiên làm việc dài hạn (Persistent Session) và Phân quyền truy cập (Admin vs Khách hàng). Giải pháp kỹ thuật áp dụng kiến trúc kép: hỗ trợ hoạt động độc lập (Offline-ready với LocalStorage và Angular 18 Signals) và sẵn sàng tích hợp chuẩn OAuth2 Token của ABP OpenIddict Backend.

---

## Technical Context

**Language/Version**: TypeScript 5.4+ / C# .NET 8  
**Primary Dependencies**: Angular 18 (Standalone Components, Signals, Reactive Forms), ABP Framework 8.x (OpenIddict / Identity)  
**Storage**: `localStorage` (trên trình duyệt) và cơ sở dữ liệu ABP Identity (SQL Server/EF Core trên Backend)  
**Testing**: Angular Jasmine/Karma Unit Tests (`xac-thuc.service.spec.ts`)  
**Target Platform**: Web Modern Browsers (Chrome, Edge, Firefox, Safari)  
**Project Type**: Web Application (SPA Angular + Web API ABP Backend)  
**Performance Goals**: Thời gian phản hồi form < 50ms, đăng nhập hoàn tất < 500ms  
**Constraints**: 
- Phải dùng Standalone Components & Reactive Forms (không dùng template-driven form hoặc NgModule).
- Không dùng kiểu dữ liệu `any`.
- Session duy trì qua các lần refresh trang cho tới khi nhấn đăng xuất.

---

## Constitution Check

| Nguyên tắc | Đánh giá | Ghi chú tuân thủ |
|---|---|---|
| **I. Backend 4 tầng DDD** | ĐẠT | Luồng xác thực phía máy chủ tuân thủ chuẩn ABP Identity & OpenIddict tích hợp sẵn trong Solution. |
| **II. Frontend Standalone & Signals** | ĐẠT | `DangNhapComponent` là Standalone, state quản lý bằng `signal<NguoiDung | null>()`, form dùng `FormGroup`/`Validators`. |
| **III. Tối giản (Ponytail Rules)** | ĐẠT | Tận dụng tối đa `XacThucService` và Reactive Forms đã có, không cài thêm thư viện auth thứ ba gây phình to bundle. |

---

## Project Structure

### Documentation (this feature)

```text
specs/001-rm-001-dang-nhap/
├── spec.md              # Đặc tả nghiệp vụ & User Stories
├── research.md          # Phân tích kỹ thuật & quyết định kiến trúc
├── data-model.md        # Hợp đồng dữ liệu & schema lưu trữ
├── quickstart.md        # Hướng dẫn chạy và kịch bản test
└── plan.md              # Tài liệu kế hoạch triển khai này
```

### Source Code

```text
angular/src/app/
├── auth/
│   └── dang-nhap/
│       ├── dang-nhap.component.ts       # Standalone component điều khiển Đăng nhập / Đăng ký
│       ├── dang-nhap.component.html     # Giao diện 2 tab với Reactive Forms
│       └── dang-nhap.component.scss     # Định kiểu giao diện hiện đại
├── he-thong/
│   ├── bao-ve/
│   │   └── xac-thuc.guard.ts            # adminGuard & khachHangGuard
│   └── dich-vu/
│       ├── xac-thuc.service.ts          # State Signal, logic lưu trữ & phiên
│       └── thong-bao.service.ts         # Hiển thị Toast thông báo
└── shared/
    └── mo-hinh/
        └── du-lieu.model.ts             # Interface NguoiDung, VaiTroNguoiDung
```

---

## Implementation Steps

1. **Bước 1**: Rà soát và hoàn thiện `XacThucService` để hỗ trợ cơ chế chuyển tab sau đăng ký (không tự động đăng nhập ngay mà yêu cầu nhập lại mật khẩu tại tab đăng nhập).
2. **Bước 2**: Tinh chỉnh `DangNhapComponent` xử lý query params `?tab=dang-nhap` và tự động patch email vừa đăng ký vào ô email của form đăng nhập.
3. **Bước 3**: Đảm bảo `adminGuard` và `khachHangGuard` chặn chặt chẽ các truy cập không hợp lệ.
4. **Bước 4**: Kiểm thử toàn diện các kịch bản theo `quickstart.md` và kiểm tra lỗi cú pháp/linter.
