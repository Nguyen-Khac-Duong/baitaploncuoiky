# Data Model: RM-001 — Đăng nhập & Đăng ký

## 1. Entities & Data Contracts

### 1.1 Model `NguoiDung` (Frontend Interface)
*Định nghĩa tại: `angular/src/app/shared/mo-hinh/du-lieu.model.ts`*

```typescript
export type VaiTroNguoiDung = 'admin' | 'khach_hang';

export interface NguoiDung {
  id: string;                    // UUID hoặc định danh duy nhất
  email: string;                 // Email đăng nhập (duy nhất, lowercase)
  matKhau?: string;              // Mật khẩu (chỉ dùng nội bộ mock, không lộ qua API)
  hoTen: string;                 // Họ và tên
  soDienThoai: string;           // Số điện thoại liên hệ (9-11 số)
  diaChi: string;                // Địa chỉ giao hàng mặc định
  vaiTro: VaiTroNguoiDung;       // 'admin' (quản trị) hoặc 'khach_hang' (người mua)
  avatar?: string;               // Tên viết tắt hoặc link ảnh đại diện
}
```

### 1.2 DTOs Tương tác Xác thực (Authentication DTOs)

```typescript
export interface DangNhapRequest {
  email: string;
  matKhau: string;
}

export interface DangKyRequest {
  hoTen: string;
  email: string;
  matKhau: string;
  soDienThoai: string;
  diaChi: string;
}

export interface KetQuaXacThuc {
  thanhCong: boolean;
  thongBao: string;
  user?: NguoiDung;
  token?: string;
}
```

## 2. Storage Schema (`localStorage`)

- Key: `auth_current_user`
  - Giá trị: JSON string của đối tượng `NguoiDung` (loại bỏ trường `matKhau`).
- Key: `auth_danh_sach_tai_khoan`
  - Giá trị: JSON string mảng danh sách người dùng đã đăng ký để lưu trữ tài khoản demo offline.
