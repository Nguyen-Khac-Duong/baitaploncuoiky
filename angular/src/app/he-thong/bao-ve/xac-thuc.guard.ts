import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { XacThucService } from '../dich-vu/xac-thuc.service';
import { ThongBaoService } from '../dich-vu/thong-bao.service';

/**
 * Guard bảo vệ các trang Quản trị Sàn (Chỉ dành riêng cho Platform Admin)
 */
export const adminGuard: CanActivateFn = () => {
  const platformId = inject(PLATFORM_ID);
  const xacThucService = inject(XacThucService);
  const thongBaoService = inject(ThongBaoService);
  const router = inject(Router);

  if (!isPlatformBrowser(platformId)) {
    return false;
  }

  // 1. Nếu là Admin hợp lệ -> Cho phép truy cập
  if (xacThucService.daDangNhap() && xacThucService.isAdmin()) {
    return true;
  }

  // 2. Nếu đã đăng nhập nhưng không phải Admin -> Chặn truy cập
  if (xacThucService.daDangNhap() && !xacThucService.isAdmin()) {
    thongBaoService.canhBao(
      'Khu vực này chỉ dành riêng cho Quản Trị Viên Sàn (Platform Admin)! Tài khoản của bạn không có quyền truy cập.',
      'Từ chối truy cập'
    );
    router.navigate(['/cua-hang']);
    return false;
  }

  // 3. Nếu chưa đăng nhập -> Đẩy về trang đăng nhập
  thongBaoService.thongTin('Vui lòng đăng nhập bằng tài khoản Quản Trị Viên Sàn để tiếp tục!', 'Yêu cầu đăng nhập');
  router.navigate(['/dang-nhap'], { queryParams: { returnUrl: '/admin/tong-quan' } });
  return false;
};

/**
 * Guard bảo vệ Kênh Người Bán (Seller Center)
 * - Chặn Admin hệ thống (Admin không được làm Seller)
 * - Yêu cầu đăng nhập tài khoản người dùng thông thường
 */
export const sellerGuard: CanActivateFn = () => {
  const platformId = inject(PLATFORM_ID);
  const xacThucService = inject(XacThucService);
  const thongBaoService = inject(ThongBaoService);
  const router = inject(Router);

  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  if (!xacThucService.daDangNhap()) {
    thongBaoService.thongTin('Vui lòng đăng nhập để truy cập Kênh Người Bán!', 'Yêu cầu đăng nhập');
    router.navigate(['/dang-nhap'], { queryParams: { returnUrl: '/seller' } });
    return false;
  }

  // Chặn hoàn toàn Admin hệ thống tham gia bán lẻ
  if (xacThucService.isAdmin()) {
    thongBaoService.canhBao(
      'Tài khoản Quản Trị Viên Sàn (Admin) không được phép tham gia bán hàng hoặc quản lý gian hàng! Nếu muốn bán hàng, vui lòng đăng xuất và tạo tài khoản Người Dùng riêng.',
      'Chặn truy cập'
    );
    router.navigate(['/admin/tong-quan']);
    return false;
  }

  return true;
};

/**
 * Guard bảo vệ các trang cá nhân Khách Hàng (Ví dụ: Đơn Hàng Của Tôi)
 * - Chặn Admin hệ thống (Admin không tham gia mua hàng)
 */
export const khachHangGuard: CanActivateFn = (_route, state) => {
  const platformId = inject(PLATFORM_ID);
  const xacThucService = inject(XacThucService);
  const thongBaoService = inject(ThongBaoService);
  const router = inject(Router);

  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  if (!xacThucService.daDangNhap()) {
    thongBaoService.thongTin('Vui lòng đăng nhập để xem thông tin đơn hàng!', 'Yêu cầu đăng nhập');
    router.navigate(['/dang-nhap'], {
      queryParams: {
        tab: 'dang-nhap',
        returnUrl: state.url || '/don-hang-cua-toi'
      }
    });
    return false;
  }

  // Chặn hoàn toàn Admin hệ thống tham gia mua sắm
  if (xacThucService.isAdmin()) {
    thongBaoService.canhBao(
      'Tài khoản Quản Trị Viên Sàn (Admin) không tham gia đặt mua hàng! Nếu muốn mua hàng, vui lòng đăng xuất và đăng ký tài khoản Người Mua riêng.',
      'Chặn mua hàng'
    );
    router.navigate(['/admin/tong-quan']);
    return false;
  }

  return true;
};
