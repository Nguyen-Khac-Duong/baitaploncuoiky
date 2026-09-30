import { Routes } from '@angular/router';
import { KhungKhachHangComponent } from './client/layout/khung-khach-hang.component';
import { KhungChinhComponent } from './admin/layout/khung-chinh.component';
import { DangNhapComponent } from './auth/dang-nhap/dang-nhap.component';
import { adminGuard, khachHangGuard } from './he-thong/bao-ve/xac-thuc.guard';

export const appRoutes: Routes = [
  // 1. Cửa hàng khách hàng (Mặc định)
  {
    path: '',
    component: KhungKhachHangComponent,
    children: [
      { path: '', redirectTo: 'cua-hang', pathMatch: 'full' },
      {
        path: 'cua-hang',
        loadComponent: () => import('./client/cua-hang/cua-hang.component').then(m => m.CuaHangComponent)
      },
      {
        path: 'gio-hang',
        loadComponent: () => import('./client/gio-hang/gio-hang.component').then(m => m.GioHangComponent)
      },
      {
        path: 'don-hang-cua-toi',
        canActivate: [khachHangGuard],
        loadComponent: () => import('./client/don-hang-cua-toi/don-hang-cua-toi.component').then(m => m.DonHangCuaToiComponent)
      }
    ]
  },
  // 2. Trang Đăng nhập & Đăng ký
  { path: 'dang-nhap', component: DangNhapComponent },
  { path: 'dang-ky', component: DangNhapComponent },
  // 3. Quản trị Admin
  {
    path: 'admin',
    component: KhungChinhComponent,
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'tong-quan', pathMatch: 'full' },
      {
        path: 'tong-quan',
        loadComponent: () => import('./admin/tong-quan/tong-quan.component').then(m => m.TongQuanComponent)
      },
      {
        path: 'san-pham',
        loadComponent: () => import('./admin/san-pham/san-pham.component').then(m => m.SanPhamComponent)
      },
      {
        path: 'don-hang',
        loadComponent: () => import('./admin/don-hang/don-hang.component').then(m => m.DonHangComponent)
      }
    ]
  },
  { path: 'tong-quan', redirectTo: 'admin/tong-quan', pathMatch: 'full' },
  { path: 'san-pham', redirectTo: 'admin/san-pham', pathMatch: 'full' },
  { path: 'don-hang', redirectTo: 'admin/don-hang', pathMatch: 'full' },
  // 4. Các Route hệ thống của ABP
  {
    path: 'abp-home',
    loadChildren: () => import('./home/home.routes').then(m => m.homeRoutes),
  },
  {
    path: 'account',
    loadChildren: () => import('@abp/ng.account').then(m => m.createRoutes()),
  },
  {
    path: 'identity',
    loadChildren: () => import('@abp/ng.identity').then(m => m.createRoutes()),
  },
  {
    path: 'tenant-management',
    loadChildren: () =>
      import('@abp/ng.tenant-management').then(m => m.createRoutes()),
  },
  {
    path: 'setting-management',
    loadChildren: () =>
      import('@abp/ng.setting-management').then(m => m.createRoutes()),
  },
  { path: '**', redirectTo: 'cua-hang' }
];
