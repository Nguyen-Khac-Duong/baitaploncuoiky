import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable, map } from 'rxjs';
import { DuLieuService } from '../../he-thong/dich-vu/du-lieu.service';
import { ThongKeDashboard, CuaHang, YeuCauRutTien } from '../../shared/mo-hinh/du-lieu.model';

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
  readonly danhSachShop$: Observable<CuaHang[]> = this.duLieuService.getDanhSachCuaHang().pipe(
    map(res => res.items || [])
  );
  readonly danhSachRut$: Observable<YeuCauRutTien[]> = this.duLieuService.getAdminPayoutRequests().pipe(
    map(res => res.items || [])
  );

  formatTien(gia: number | undefined | null): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(gia || 0);
  }

  demShopChoDuyet(shops: CuaHang[]): number {
    return (shops || []).filter(s => s.trangThai === 'ChoDuyet').length;
  }

  demRutChoDuyet(payouts: YeuCauRutTien[]): number {
    return (payouts || []).filter(p => p.trangThai === 'ChoDuyet').length;
  }
}
