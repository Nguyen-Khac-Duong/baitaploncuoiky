# Data Model & State Contracts: RM-002 — Khung Giao Diện & Bộ Lọc Phân Quyền

## 1. State Models (Angular Signals)

### 1.1 Trạng thái Phân Quyền (`XacThucService`)
```typescript
// Signal quản lý người dùng hiện tại
currentUser = signal<NguoiDung | null>(null);

// Computed Signals kiểm tra quyền tức thì
laAdmin = computed(() => this.currentUser()?.vaiTro === 'admin');
laKhachHang = computed(() => this.currentUser()?.vaiTro === 'khach_hang');
daDangNhap = computed(() => this.currentUser() !== null);
```

### 1.2 Trạng thái Khung Quản Trị
```typescript
export interface AdminLayoutState {
  sidebarThuGon: boolean;  // Trạng thái mở rộng (false) hoặc thu nhỏ (true) của sidebar
}
```

### 1.3 Trạng thái Huy Hiệu Giỏ Hàng (`DuLieuService`)
```typescript
// Computed Signal tính tổng số lượng món hàng trong giỏ
tongSoLuongGioHang = computed(() =>
  this.gioHang().reduce((tong, item) => tong + item.soLuong, 0)
);
```

## 2. Route Guard Schema

```typescript
export const adminGuard: CanActivateFn = (route, state) => {
  // 1. Kiểm tra đăng nhập
  // 2. Kiểm tra vaiTro === 'admin'
  // 3. Nếu sai: Redirect /dang-nhap kèm returnUrl
};

export const khachHangGuard: CanActivateFn = (route, state) => {
  // 1. Kiểm tra đăng nhập
  // 2. Nếu chưa đăng nhập: Redirect /dang-nhap kèm returnUrl
};
```
