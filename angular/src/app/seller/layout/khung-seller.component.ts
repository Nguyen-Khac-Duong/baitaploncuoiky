import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

import { XacThucService } from '../../he-thong/dich-vu/xac-thuc.service';
import { ThongBaoService } from '../../he-thong/dich-vu/thong-bao.service';
import { GiaoDienService } from '../../he-thong/dich-vu/giao-dien.service';
import { DuLieuService } from '../../he-thong/dich-vu/du-lieu.service';
import { SellerStateService } from '../services/seller-state.service';
import { ThongBaoItem } from '../../shared/mo-hinh/du-lieu.model';

// NG-ZORRO Modules
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzDropdownModule } from 'ng-zorro-antd/dropdown';
import { NzBadgeModule } from 'ng-zorro-antd/badge';

@Component({
  selector: 'app-khung-seller',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterOutlet,
    NzMenuModule,
    NzIconModule,
    NzTooltipModule,
    NzTagModule,
    NzDropdownModule,
    NzBadgeModule
  ],
  templateUrl: './khung-seller.component.html',
  styleUrl: './khung-seller.component.scss'
})
export class KhungSellerComponent implements OnInit {
  readonly xacThucService = inject(XacThucService);
  private readonly thongBaoService = inject(ThongBaoService);
  private readonly duLieuService = inject(DuLieuService);
  readonly giaoDienService = inject(GiaoDienService);
  readonly sellerState = inject(SellerStateService);
  private readonly router = inject(Router);

  sidebarThuGon: boolean = false;
  tieuDeTrang: string = 'Tổng Quan Kinh Doanh';

  // Quản lý Thông báo Hệ thống (Notification Bell)
  readonly danhSachThongBao = signal<ThongBaoItem[]>([]);
  readonly soChuaDoc = computed(() => this.danhSachThongBao().filter(x => !x.daDoc).length);
  readonly locTabThongBao = signal<'all' | 'unread'>('all');
  hienDropdownThongBao: boolean = false;

  readonly thongBaoHienThi = computed(() => {
    const list = this.danhSachThongBao();
    if (this.locTabThongBao() === 'unread') {
      return list.filter(x => !x.daDoc);
    }
    return list;
  });

  menuItems = [
    { label: 'Tổng Quan Shop', icon: 'dashboard', route: '/seller/tong-quan' },
    { label: 'Sản Phẩm Của Tôi', icon: 'appstore', route: '/seller/san-pham' },
    { label: 'Đơn Hàng Của Shop', icon: 'shopping-cart', route: '/seller/don-hang' },
    { label: 'Khuyến Mãi & Voucher', icon: 'tag', route: '/seller/voucher' },
    { label: 'Đánh Giá & Phản Hồi', icon: 'star', route: '/seller/danh-gia' },
    { label: 'Ví Tiền & Rút Tiền', icon: 'wallet', route: '/seller/vi-tien' },
    { label: 'Cài Đặt Gian Hàng', icon: 'setting', route: '/seller/cai-dat' }
  ];

  ngOnInit(): void {
    if (!this.xacThucService.daDangNhap()) {
      this.router.navigate(['/dang-nhap'], { queryParams: { returnUrl: '/seller' } });
      return;
    }

    this.taiThongBao();

    if (this.xacThucService.laAdmin()) {
      this.thongBaoService.canhBao(
        'Tài khoản Quản Trị Viên Sàn (Admin) không tham gia bán hàng! Nếu muốn mở gian hàng, vui lòng đăng xuất và đăng ký tài khoản Người Dùng riêng.',
        'Chặn truy cập'
      );
      this.router.navigate(['/admin/tong-quan']);
      return;
    }

    this.sellerState.taiThongTinShop().subscribe({
      next: (shop) => {
        const urlHienTai = this.router.url;
        if (!shop || shop.trangThai !== 'HoatDong') {
          if (!urlHienTai.includes('/seller/dang-ky')) {
            this.router.navigate(['/seller/dang-ky']);
          }
        } else {
          if (urlHienTai === '/seller' || urlHienTai === '/seller/' || urlHienTai.includes('/seller/dang-ky')) {
            this.router.navigate(['/seller/tong-quan']);
          }
        }
      }
    });

    this.capNhatTieuDe(this.router.url);
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: any) => {
      this.capNhatTieuDe(e.urlAfterRedirects || e.url);
    });
  }

  onToggleSidebar(): void {
    this.sidebarThuGon = !this.sidebarThuGon;
  }

  capNhatTieuDe(url: string): void {
    if (url.includes('san-pham')) this.tieuDeTrang = 'Quản Lý Kho Hàng & Sản Phẩm';
    else if (url.includes('don-hang')) this.tieuDeTrang = 'Quản Lý Đơn Hàng Cần Giao';
    else if (url.includes('voucher')) this.tieuDeTrang = 'Quản Lý Khuyến Mãi & Voucher';
    else if (url.includes('danh-gia')) this.tieuDeTrang = 'Đánh Giá & Phản Hồi Khách Hàng';
    else if (url.includes('vi-tien')) this.tieuDeTrang = 'Ví Doanh Thu & Quyết Toán Escrow';
    else if (url.includes('cai-dat')) this.tieuDeTrang = 'Cài Đặt Thông Tin Gian Hàng';
    else if (url.includes('dang-ky')) this.tieuDeTrang = 'Hồ Sơ Đăng Ký Mở Gian Hàng';
    else this.tieuDeTrang = 'Bảng Điều Khiển Tổng Quan Kinh Doanh';
  }

  dangXuat(): void {
    this.xacThucService.dangXuat();
    this.thongBaoService.thongTin('Đã đăng xuất khỏi Kênh Người Bán.', 'Đăng xuất');
    this.router.navigate(['/dang-nhap']);
  }

  // === NOTIFICATION ACTIONS ===
  taiThongBao(): void {
    if (!this.xacThucService.daDangNhap()) return;
    this.duLieuService.getDanhSachThongBao('seller').subscribe({
      next: (list) => this.danhSachThongBao.set(list),
      error: (e) => console.warn('Lỗi tải thông báo seller:', e)
    });
  }

  onNotificationClick(tb: ThongBaoItem): void {
    if (!tb.daDoc) {
      this.duLieuService.danhDauThongBaoDaDoc(tb.id).subscribe({
        next: () => {
          this.danhSachThongBao.update(list =>
            list.map(x => x.id === tb.id ? { ...x, daDoc: true } : x)
          );
        }
      });
    }

    this.hienDropdownThongBao = false;
    if (tb.lienKet) {
      this.router.navigateByUrl(tb.lienKet);
    }
  }

  danhDauTatCaDaDoc(): void {
    this.duLieuService.danhDauTatCaThongBaoDaDoc('seller').subscribe({
      next: () => {
        this.danhSachThongBao.update(list => list.map(x => ({ ...x, daDoc: true })));
      }
    });
  }

  xoaThongBao(event: MouseEvent, tbId: string): void {
    event.stopPropagation();
    this.duLieuService.xoaThongBao(tbId).subscribe({
      next: () => {
        this.danhSachThongBao.update(list => list.filter(x => x.id !== tbId));
      }
    });
  }

  xoaTatCaThongBao(): void {
    this.duLieuService.xoaTatCaThongBao('seller').subscribe({
      next: () => {
        this.danhSachThongBao.set([]);
      }
    });
  }

  layIconLoai(loai: string): string {
    switch (loai) {
      case 'don_hang': return '📦';
      case 'hoan_tien': return '↩️';
      case 'danh_gia': return '⭐';
      case 'vi_tien': return '💰';
      case 'kho_hang': return '⚠️';
      default: return '🔔';
    }
  }

  formatTimeAgo(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSec < 60) return 'Vừa xong';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)} phút trước`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} giờ trước`;
    return `${Math.floor(diffSec / 86400)} ngày trước`;
  }
}
