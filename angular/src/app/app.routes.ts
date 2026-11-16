import { Routes } from '@angular/router';
import { KhungKhachHangComponent } from './client/layout/khung-khach-hang.component';
import { KhungChinhComponent } from './admin/layout/khung-chinh.component';
import { KhungSellerComponent } from './seller/layout/khung-seller.component';
import { DangNhapComponent } from './auth/dang-nhap/dang-nhap.component';
import { adminGuard, khachHangGuard, sellerGuard } from './he-thong/bao-ve/xac-thuc.guard';

export const appRoutes: Routes = [
  // 1. Cửa hàng khách hàng (Buyer Portal)
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
        path: 'san-pham/:id',
        loadComponent: () => import('./client/chi-tiet-san-pham/chi-tiet-san-pham.component').then(m => m.ChiTietSanPhamComponent)
      },
      {
        path: 'gio-hang',
        loadComponent: () => import('./client/gio-hang/gio-hang.component').then(m => m.GioHangComponent)
      },
      {
        path: 'don-hang-cua-toi',
        canActivate: [khachHangGuard],
        loadComponent: () => import('./client/don-hang-cua-toi/don-hang-cua-toi.component').then(m => m.DonHangCuaToiComponent)
      },
      {
        path: 'shop/:slug',
        loadComponent: () => import('./client/chi-tiet-shop/chi-tiet-shop.component').then(m => m.ChiTietShopComponent)
      }
    ]
  },

  // 2. Kênh Người Bán (Seller Center - Layout Sidebar Riêng Biệt Độc Lập)
  {
    path: 'seller',
    component: KhungSellerComponent,
    canActivate: [sellerGuard],
    children: [
      { path: '', redirectTo: 'tong-quan', pathMatch: 'full' },
      {
        path: 'tong-quan',
        loadComponent: () => import('./seller/tong-quan/seller-tong-quan.component').then(m => m.SellerTongQuanComponent)
      },
      {
        path: 'san-pham',
        loadComponent: () => import('./seller/san-pham/seller-san-pham.component').then(m => m.SellerSanPhamComponent)
      },
      {
        path: 'don-hang',
        loadComponent: () => import('./seller/don-hang/seller-don-hang.component').then(m => m.SellerDonHangComponent)
      },
      {
        path: 'danh-gia',
        loadComponent: () => import('./seller/danh-gia/seller-danh-gia.component').then(m => m.SellerDanhGiaComponent)
      },
      {
        path: 'vi-tien',
        loadComponent: () => import('./seller/vi-tien/seller-vi-tien.component').then(m => m.SellerViTienComponent)
      },
      {
        path: 'cai-dat',
        loadComponent: () => import('./seller/cai-dat/seller-cai-dat.component').then(m => m.SellerCaiDatComponent)
      },
      {
        path: 'dang-ky',
        loadComponent: () => import('./seller/dang-ky/seller-dang-ky.component').then(m => m.SellerDangKyComponent)
      }
    ]
  },

  // 3. Quản trị Hệ Thống Sàn (Platform Admin)
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
        path: 'danh-muc',
        loadComponent: () => import('./admin/danh-muc/danh-muc.component').then(m => m.AdminDanhMucComponent)
      },
      {
        path: 'gian-hang',
        loadComponent: () => import('./admin/gian-hang/gian-hang.component').then(m => m.AdminGianHangComponent)
      },
      {
        path: 'rut-tien',
        loadComponent: () => import('./admin/rut-tien/rut-tien.component').then(m => m.AdminRutTienComponent)
      },
      {
        path: 'tai-khoan',
        loadComponent: () => import('./admin/tai-khoan/tai-khoan.component').then(m => m.TaiKhoanComponent)
      }
    ]
  },

  // 4. Trang Đăng nhập & Đăng ký
  { path: 'dang-nhap', component: DangNhapComponent },
  { path: 'dang-ky', component: DangNhapComponent },

  // Redirects cũ
  { path: 'tong-quan', redirectTo: 'admin/tong-quan', pathMatch: 'full' },

  // 5. Các Route hệ thống của ABP
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
