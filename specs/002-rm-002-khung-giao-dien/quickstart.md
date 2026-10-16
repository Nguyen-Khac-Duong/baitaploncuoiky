# Quickstart & Verification: RM-002 — Khung Giao Diện & Bộ Lọc Phân Quyền

## 1. Hướng Dẫn Kiểm Thử

### Kịch bản 1: Kiểm thử Khung Khách Hàng & Badge Giỏ Hàng
1. Truy cập `http://localhost:4200/cua-hang`.
2. Kiểm tra thanh Header có logo ShopTech, menu "Cửa hàng", icon giỏ hàng và nút "Đăng nhập".
3. Nhấp vào nút "Thêm vào giỏ" của một sản phẩm bất kỳ.
4. **Kết quả mong muốn**: Badge màu đỏ trên icon giỏ hàng lập tức cập nhật số lượng `1`, `2`... mà không reload trang.

### Kịch bản 2: Kiểm thử Thu gọn / Mở rộng Sidebar Admin
1. Đăng nhập tài khoản `admin@gmail.com` / `123456`.
2. Tại màn hình `/admin/tong-quan`, click nút Toggle biểu tượng thanh menu (Hamburger icon) trên Header admin.
3. **Kết quả mong muốn**: Thanh Sidebar thu nhỏ lại chỉ hiện icon, nội dung bảng bên phải tự động mở rộng mượt mà.

### Kịch bản 3: Kiểm thử Chặn Phân Quyền (`adminGuard`)
1. Đăng xuất hoặc đăng nhập bằng tài khoản khách hàng `khachhang@gmail.com` / `123456`.
2. Gõ trực tiếp link `http://localhost:4200/admin/san-pham`.
3. **Kết quả mong muốn**: Bị `adminGuard` chặn ngay lập tức, chuyển hướng về `/dang-nhap?returnUrl=%2Fadmin%2Fsan-pham`.
