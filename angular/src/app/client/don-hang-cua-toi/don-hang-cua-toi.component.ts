import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Observable, combineLatest, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { DuLieuService } from '../../he-thong/dich-vu/du-lieu.service';
import { XacThucService } from '../../he-thong/dich-vu/xac-thuc.service';
import { DonHang } from '../../shared/mo-hinh/du-lieu.model';

@Component({
  selector: 'app-don-hang-cua-toi',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './don-hang-cua-toi.component.html',
  styleUrl: './don-hang-cua-toi.component.scss'
})
export class DonHangCuaToiComponent implements OnInit {
  private readonly duLieuService = inject(DuLieuService);
  private readonly route = inject(ActivatedRoute);
  readonly xacThucService = inject(XacThucService);

  tuKhoaTraCuu: string = '';
  daTraCuu: boolean = false;
  donHangList$!: Observable<DonHang[]>;

  ngOnInit(): void {
    const user = this.xacThucService.currentUser();

    // Đọc query param nếu khách vừa đặt hàng từ giỏ hàng sang
    this.route.queryParams.subscribe(params => {
      if (params['maDon']) {
        this.tuKhoaTraCuu = params['maDon'];
        this.daTraCuu = true;
      } else if (params['sdt']) {
        this.tuKhoaTraCuu = params['sdt'];
        this.daTraCuu = true;
      }
      this.taiDanhSachDonHang();
    });
  }

  taiDanhSachDonHang(): void {
    const user = this.xacThucService.currentUser();
    const tuKhoa = this.tuKhoaTraCuu.trim().toLowerCase();

    this.donHangList$ = this.duLieuService.getDanhSachDonHang().pipe(
      map(danhSach => {
        // Chỉ người dùng đã đăng nhập mới có đơn hàng của mình
        if (!user) {
          return [];
        }

        // 1. Lọc tất cả đơn hàng thuộc về tài khoản người dùng hiện tại
        let danhSachDonCuaToi = danhSach.filter(dh =>
          (dh.nguoiDungId && dh.nguoiDungId === user.id) ||
          (dh.soDienThoai && dh.soDienThoai === user.soDienThoai)
        );

        // 2. Nếu khách hàng có nhập từ khóa tìm kiếm (Mã đơn hoặc Tên sản phẩm trong đơn)
        if (tuKhoa) {
          danhSachDonCuaToi = danhSachDonCuaToi.filter(dh =>
            dh.maDon.toLowerCase().includes(tuKhoa) ||
            dh.chiTiet.some(ct => ct.tenSanPham.toLowerCase().includes(tuKhoa))
          );
        }

        return danhSachDonCuaToi;
      })
    );
  }

  traCuu(): void {
    this.daTraCuu = !!this.tuKhoaTraCuu.trim();
    this.taiDanhSachDonHang();
  }

  xoaTraCuu(): void {
    this.tuKhoaTraCuu = '';
    this.daTraCuu = false;
    this.taiDanhSachDonHang();
  }

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

