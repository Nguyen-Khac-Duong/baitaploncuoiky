import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Observable, combineLatest } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { DuLieuService } from '../../he-thong/dich-vu/du-lieu.service';
import { DonHang, TrangThaiDonHang } from '../../shared/mo-hinh/du-lieu.model';

@Component({
  selector: 'app-don-hang',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './don-hang.component.html',
  styleUrl: './don-hang.component.scss'
})
export class DonHangComponent implements OnInit {
  private readonly duLieuService = inject(DuLieuService);

  readonly searchControl = new FormControl<string>('', { nonNullable: true });
  readonly statusFilterControl = new FormControl<string>('all', { nonNullable: true });

  donHangHienThi$!: Observable<DonHang[]>;
  donHangChiTiet: DonHang | null = null;
  hienModalChiTiet: boolean = false;

  readonly danhSachTrangThai: { key: TrangThaiDonHang | 'all'; label: string }[] = [
    { key: 'all', label: 'Tất cả trạng thái' },
    { key: 'cho_xu_ly', label: 'Chờ xử lý' },
    { key: 'dang_giao', label: 'Đang giao' },
    { key: 'hoan_thanh', label: 'Hoàn thành' },
    { key: 'da_huy', label: 'Đã hủy' }
  ];

  ngOnInit(): void {
    const search$ = this.searchControl.valueChanges.pipe(startWith(''));
    const status$ = this.statusFilterControl.valueChanges.pipe(startWith('all'));

    this.donHangHienThi$ = combineLatest([
      this.duLieuService.getDanhSachDonHang(),
      search$,
      status$
    ]).pipe(
      map(([danhSach, tuKhoa, trangThai]) => {
        return danhSach.filter(dh => {
          const matchTuKhoa = !tuKhoa || 
            dh.maDon.toLowerCase().includes(tuKhoa.toLowerCase()) || 
            dh.tenKhachHang.toLowerCase().includes(tuKhoa.toLowerCase()) ||
            dh.soDienThoai.includes(tuKhoa);
          const matchTrangThai = trangThai === 'all' || dh.trangThai === trangThai;
          return matchTuKhoa && matchTrangThai;
        });
      })
    );
  }

  doiTrangThai(dh: DonHang, trangThaiMoi: string): void {
    this.duLieuService.doiTrangThaiDonHang(dh.id, trangThaiMoi as TrangThaiDonHang);
  }

  xemChiTiet(dh: DonHang): void {
    this.donHangChiTiet = dh;
    this.hienModalChiTiet = true;
  }

  dongModalChiTiet(): void {
    this.donHangChiTiet = null;
    this.hienModalChiTiet = false;
  }

  formatTien(gia: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(gia);
  }

  layTenTrangThai(trangThai: TrangThaiDonHang): string {
    const mapTrangThai: Record<TrangThaiDonHang, string> = {
      cho_xu_ly: 'Chờ xử lý',
      dang_giao: 'Đang giao',
      hoan_thanh: 'Hoàn thành',
      da_huy: 'Đã hủy'
    };
    return mapTrangThai[trangThai] || trangThai;
  }
}