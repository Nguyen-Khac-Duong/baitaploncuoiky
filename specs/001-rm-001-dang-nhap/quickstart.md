# Quickstart & Verification: RM-001 — Đăng nhập & Đăng ký

## 1. Khởi chạy Ứng dụng
```bash
# Di chuyển vào thư mục Frontend
cd C:\testtttt88\angular

# Chạy server phát triển
npm start
```
Ứng dụng sẽ khả dụng tại `http://localhost:4200`.

## 2. Các Kịch bản Kiểm thử Thủ công (Manual Test Cases)

### Kịch bản 1: Đăng nhập Tài khoản Admin mẫu
1. Mở trình duyệt truy cập `http://localhost:4200/dang-nhap`.
2. Bấm vào nút/chip **"Chọn tài khoản Admin mẫu"** (hoặc điền: `admin@gmail.com` / `123456`).
3. Bấm **"Đăng nhập"**.
4. **Kết quả mong muốn**: Hiển thị Toast thông báo thành công và chuyển hướng đến `/admin/tong-quan`.

### Kịch bản 2: Đăng ký Tài khoản Khách Hàng mới
1. Bấm sang tab **"Đăng ký"** tại `/dang-nhap?tab=dang-ky`.
2. Điền thông tin:
   - Họ tên: `Nguyễn Văn Test`
   - Email: `testuser@gmail.com`
   - Số điện thoại: `0912345678`
   - Địa chỉ: `Số 1 Phố Mới, Hà Nội`
   - Mật khẩu: `123456`
   - Nhập lại mật khẩu: `123456`
3. Bấm **"Đăng ký tài khoản"**.
4. **Kết quả mong muốn**: Thông báo đăng ký thành công, tự động chuyển về tab "Đăng nhập", điền sẵn `testuser@gmail.com`.
5. Nhập mật khẩu `123456` và bấm **"Đăng nhập"** -> Hệ thống đăng nhập thành công và chuyển về `/cua-hang`.

### Kịch bản 3: Kiểm tra Phân quyền Route Guard
1. Khi chưa đăng nhập hoặc khi đang đăng nhập tài khoản Khách hàng, gõ trực tiếp URL `http://localhost:4200/admin/tong-quan`.
2. **Kết quả mong muốn**: `adminGuard` chặn lại và chuyển hướng về trang lỗi hoặc thông báo bạn không có quyền truy cập.
