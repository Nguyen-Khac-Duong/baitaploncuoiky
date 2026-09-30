import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { XacThucService } from '../dich-vu/xac-thuc.service';
import { ThongBaoService } from '../dich-vu/thong-bao.service';

/**
 * Guard bảo vệ các trang Quản trị (Dành riêng cho Người Bán / Admin)
 */
export const adminGuard: CanActivateFn = () => {
  const platformId = inject(PLATFORM_ID);
  const xacThucService = inject(XacThucService);
  const thongBaoService = inject(ThongBaoService);
  const router = inject(Router);

  // Nếu đang render ở Server, cho phép render tiếp để Client hydrate
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  // 1. Nếu là Admin hợp lệ -> Cho phép truy cập
  if (xacThucService.daDangNhap() && xacThucService.isAdmin()) {
    return true;
  }

  // 2. Nếu đã đăng nhập nhưng là Khách Hàng (Người Mua) -> Chặn truy cập và giữ ở Cửa Hàng
  if (xacThucService.daDangNhap() && xacThucService.isKhachHang()) {
    thongBaoService.canhBao(
      'Khu vực này chỉ dành riêng cho Người Bán (Admin)! Bạn đang đăng nhập bằng tài khoản Người Mua.',
      'Từ chối truy cập'
    );
    router.navigate(['/cua-hang']);
    return false;
  }

  // 3. Nếu chưa đăng nhập -> Đẩy về trang đăng nhập với thông báo
  thongBaoService.thongTin('Vui lòng đăng nhập bằng tài khoản Quản trị để tiếp tục!', 'Yêu cầu đăng nhập');
  router.navigate(['/dang-nhap'], { queryParams: { vaiTro: 'admin' } });
  return false;
};

/**
 * Guard bảo vệ các trang cá nhân Khách Hàng (Ví dụ: Đơn Hàng Của Tôi)
 */
export const khachHangGuard: CanActivateFn = (_route, state) => {
  const platformId = inject(PLATFORM_ID);
  const xacThucService = inject(XacThucService);
  const thongBaoService = inject(ThongBaoService);
  const router = inject(Router);

  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  if (xacThucService.daDangNhap()) {
    return true;
  }

  thongBaoService.thongTin('Vui lòng đăng nhập tài khoản Khách Hàng để xem lịch sử đơn hàng của bạn!', 'Yêu cầu đăng nhập');
  router.navigate(['/dang-nhap'], {
    queryParams: {
      tab: 'dang-nhap',
      returnUrl: state.url || '/don-hang-cua-toi'
    }
  });
  return false;
};