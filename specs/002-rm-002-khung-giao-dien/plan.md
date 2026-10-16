# Implementation Plan: RM-002 — Khung Giao Diện & Bộ Lọc Phân Quyền

**Branch**: `002-rm-002-khung-giao-dien` | **Date**: 2026-10-14 | **Spec**: [specs/002-rm-002-khung-giao-dien/spec.md](spec.md)

---

## Summary
Thiết lập và hoàn thiện hệ thống Shell Layouts chuẩn Standalone cho 2 phân hệ (Client Store & Admin Portal) và bộ lọc phân quyền Route Guards dựa trên Angular 18 Signals.

---

## Technical Context
- **Framework**: Angular 18 Standalone Components.
- **State**: Angular Signals (`currentUser`, `gioHang`, `tongSoLuongGioHang`).
- **Guards**: Functional Guards (`CanActivateFn`).
- **Styling**: SCSS Responsive.

---

## Constitution Check
- **Standalone**: ĐẠT (Cả `KhungKhachHangComponent` và `KhungChinhComponent` đều là standalone).
- **Signals**: ĐẠT (Toàn bộ trạng thái giỏ hàng và định danh dùng Signal/Computed).
- **TypeScript**: ĐẠT (Không có kiểu `any`).

---

## Project Structure
```text
angular/src/app/
├── client/layout/
│   ├── khung-khach-hang.component.ts
│   ├── khung-khach-hang.component.html
│   └── khung-khach-hang.component.scss
├── admin/layout/
│   ├── khung-chinh.component.ts
│   ├── khung-chinh.component.html
│   └── khung-chinh.component.scss
└── he-thong/bao-ve/
    └── xac-thuc.guard.ts
```
