import { Component, inject, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { GiaoDienService } from '../../../he-thong/dich-vu/giao-dien.service';
import { XacThucService } from '../../../he-thong/dich-vu/xac-thuc.service';
import { DuLieuService } from '../../../he-thong/dich-vu/du-lieu.service';
import { ThongBaoService } from '../../../he-thong/dich-vu/thong-bao.service';

// NG-ZORRO Modules
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzTagModule } from 'ng-zorro-antd/tag';

export interface ThongBaoItem {
  id: string;
  tieuDe: string;
  noiDung: string;
  thoiGian: string;
  loai: 'don_hang' | 'kho' | 'he_thong';
  daDoc: boolean;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    NzDropDownModule,
    NzBadgeModule,
    NzAvatarModule,
    NzIconModule,
    NzButtonModule,
    NzTooltipModule,
    NzDividerModule,
    NzTagModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  readonly giaoDienService = inject(GiaoDienService);
  readonly xacThucService = inject(XacThucService);
  readonly thongBaoService = inject(ThongBaoService);
  private readonly duLieuService = inject(DuLieuService);
  private readonly router = inject(Router);

  @Output() readonly toggleSidebar = new EventEmitter<void>();

  tieuDeTrangHienTai: string = '📊 Bảng Điều Khiển Tổng Quan';
  thongBaoList: ThongBaoItem[] = [];

  ngOnInit(): void {
    this.theoDoiRoute();
    this.khoiTaoThongBao();
  }

  get soThongBaoChuaDoc(): number {
    return this.thongBaoList.filter(t => !t.daDoc).length;
  }

  danhDauDaDocTatCa(): void {
    this.thongBaoList = this.thongBaoList.map(t => ({ ...t, daDoc: true }));
  }

  dangXuat(): void {
    this.xacThucService.dangXuat();
    this.thongBaoService.thongTin('Đã đăng xuất khỏi tài khoản Quản trị thành công.', 'Đăng xuất');
    this.router.navigate(['/dang-nhap']);
  }

  private theoDoiRoute(): void {
    this.capNhatTieuDe(this.router.url);

    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => {
        this.capNhatTieuDe(e.urlAfterRedirects || e.url);
      });
  }

  private capNhatTieuDe(url: string): void {
    if (url.includes('san-pham')) {
      this.tieuDeTrangHienTai = '📦 Quản Lý Danh Mục Sản Phẩm';
    } else if (url.includes('don-hang')) {
      this.tieuDeTrangHienTai = '🛒 Quản Lý Tiến Trình Đơn Hàng';
    } else if (url.includes('tong-quan')) {
      this.tieuDeTrangHienTai = '📊 Bảng Điều Khiển Tổng Quan';
    } else {
      this.tieuDeTrangHienTai = '📊 Bảng Điều Khiển Tổng Quan';
    }
  }

  private khoiTaoThongBao(): void {
    this.duLieuService.getDanhSachDonHang().subscribe(donHangs => {
      const donCho = donHangs.filter(dh => dh.trangThai === 'cho_xu_ly');
      this.thongBaoList = [
        ...donCho.map(dh => ({
          id: 'tb-' + dh.id,
          tieuDe: `Đơn hàng mới #${dh.maDon}`,
          noiDung: `${dh.tenKhachHang} vừa đặt đơn trị giá ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(dh.tongTien)}`,
          thoiGian: dh.ngayTao,
          loai: 'don_hang' as const,
          daDoc: false
        })),
        {
          id: 'tb-system-1',
          tieuDe: 'Hệ thống sẵn sàng',
          noiDung: 'Chào mừng quay trở lại hệ thống quản trị bán hàng!',
          thoiGian: 'Vừa xong',
          loai: 'he_thong' as const,
          daDoc: true
        }
      ];
    });
  }
}
