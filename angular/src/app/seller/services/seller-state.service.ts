import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { DuLieuService } from '../../he-thong/dich-vu/du-lieu.service';
import { CuaHang, ViCuaHang, ThongKeDashboard } from '../../shared/mo-hinh/du-lieu.model';

@Injectable({
  providedIn: 'root'
})
export class SellerStateService {
  private readonly duLieuService = inject(DuLieuService);

  readonly dangTai = signal<boolean>(true);
  readonly cuaHang = signal<CuaHang | null>(null);
  readonly viCuaHang = signal<ViCuaHang | null>(null);
  readonly thongKe = signal<ThongKeDashboard | null>(null);

  taiThongTinShop(): Observable<CuaHang | null> {
    this.dangTai.set(true);
    return this.duLieuService.getMyStore().pipe(
      tap(shop => {
        this.cuaHang.set(shop);
        this.dangTai.set(false);
        if (shop && shop.trangThai === 'HoatDong') {
          this.taiDuLieuPhu();
        }
      })
    );
  }

  taiDuLieuPhu(): void {
    this.duLieuService.getMyWallet().subscribe({
      next: (wallet) => this.viCuaHang.set(wallet),
      error: (e) => console.warn('Lỗi tải ví:', e)
    });

    this.duLieuService.getThongKeMyStore().subscribe({
      next: (stats) => this.thongKe.set(stats),
      error: (e) => console.warn('Lỗi thống kê:', e)
    });
  }
}
