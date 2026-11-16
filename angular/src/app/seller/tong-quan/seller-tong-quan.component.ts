import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { DuLieuService } from '../../he-thong/dich-vu/du-lieu.service';
import { SellerStateService } from '../services/seller-state.service';
import { SanPham, DonHang } from '../../shared/mo-hinh/du-lieu.model';

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
  selector: 'app-seller-tong-quan',
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
    NzButtonModule
  ],
  templateUrl: './seller-tong-quan.component.html',
  styleUrl: './seller-tong-quan.component.scss'
})
export class SellerTongQuanComponent implements OnInit {
  private readonly duLieuService = inject(DuLieuService);
  readonly sellerState = inject(SellerStateService);

  readonly sanPhamList = signal<SanPham[]>([]);
  readonly donHangList = signal<DonHang[]>([]);
  readonly dangTai = signal<boolean>(true);

  ngOnInit(): void {
    this.taiDuLieu();
  }

  taiDuLieu(): void {
    this.dangTai.set(true);
    this.sellerState.taiDuLieuPhu();

    this.duLieuService.getMyStoreProducts().subscribe({
      next: (prods) => this.sanPhamList.set(prods),
      error: (e) => console.warn('Lỗi tải sản phẩm shop:', e)
    });

    this.duLieuService.getMyStoreOrders().subscribe({
      next: (orders) => {
        this.donHangList.set(orders);
        this.dangTai.set(false);
      },
      error: (e) => {
        console.warn('Lỗi tải đơn hàng shop:', e);
        this.dangTai.set(false);
      }
    });
  }

  formatTien(gia: number | undefined | null): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(gia || 0);
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
