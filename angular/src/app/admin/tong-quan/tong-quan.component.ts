import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { DuLieuService } from '../../he-thong/dich-vu/du-lieu.service';
import { ThongKeDashboard, DonHang, SanPham } from '../../shared/mo-hinh/du-lieu.model';

@Component({
  selector: 'app-tong-quan',
  standalone: true,
  imports: [CommonModule, RouterLink],
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
}