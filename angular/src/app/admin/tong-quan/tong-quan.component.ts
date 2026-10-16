import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { DuLieuService } from '../../he-thong/dich-vu/du-lieu.service';
import { ThongKeDashboard, DonHang, SanPham } from '../../shared/mo-hinh/du-lieu.model';

// NG-ZORRO Modules
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzButtonModule } from 'ng-zorro-antd/button';

@Component({
  selector: 'app-tong-quan',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NzStatisticModule,
    NzCardModule,
    NzGridModule,
    NzIconModule,
    NzTableModule,
    NzTagModule,
    NzBadgeModule,
    NzButtonModule,
  ],
  templateUrl: './tong-quan.component.html',
  styleUrl: './tong-quan.component.scss'
})
export class TongQuanComponent {
  private readonly duLieuService = inject(DuLieuService);

  readonly thongKe$: Observable<ThongKeDashboard> = this.duLieuService.getThongKeDashboard();
  readonly donHangMoi$: Observable<DonHang[]> = this.duLieuService.getDanhSachDonHang();
  readonly sanPhamHetHang$: Observable<SanPham[]> = this.duLieuService.getDanhSachSanPham();

  formatTien(gia: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(gia);
  }

  layTenTrangThai(trangThai: string): string {
    const mapTrangThai: Record<string, string> = {
      cho_xu_ly: 'Chờ xử lý',
      dang_giao: 'Đang giao hàng',
      hoan_thanh: 'Hoàn thành',
      da_huy: 'Đã hủy'
    };
    return mapTrangThai[trangThai] || trangThai;
  }

  getTrangThaiColor(trangThai: string): string {
    switch (trangThai) {
      case 'cho_xu_ly': return 'processing';
      case 'dang_giao': return 'warning';
      case 'hoan_thanh': return 'success';
      case 'da_huy': return 'error';
      default: return 'default';
    }
  }
}