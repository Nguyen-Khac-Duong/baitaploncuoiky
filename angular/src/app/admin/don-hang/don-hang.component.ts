import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Observable, combineLatest } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { DuLieuService } from '../../he-thong/dich-vu/du-lieu.service';
import { DonHang, TrangThaiDonHang } from '../../shared/mo-hinh/du-lieu.model';

// NG-ZORRO Modules
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-don-hang',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NzTableModule,
    NzButtonModule,
    NzInputModule,
    NzSelectModule,
    NzModalModule,
    NzTagModule,
    NzBadgeModule,
    NzIconModule,
    NzTooltipModule,
    NzCardModule,
    NzSpaceModule,
    NzDescriptionsModule,
  ],
  templateUrl: './don-hang.component.html',
  styleUrl: './don-hang.component.scss'
})
export class DonHangComponent implements OnInit {
  private readonly duLieuService = inject(DuLieuService);
  private readonly msg = inject(NzMessageService);

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

  compareTongTien = (a: DonHang, b: DonHang): number => a.tongTien - b.tongTien;

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
    this.msg.success(`Đã cập nhật trạng thái đơn #${dh.maDon} sang "${this.layTenTrangThai(trangThaiMoi as TrangThaiDonHang)}"`);
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

  getTrangThaiColor(trangThai: TrangThaiDonHang): string {
    switch (trangThai) {
      case 'cho_xu_ly': return 'processing';
      case 'dang_giao': return 'warning';
      case 'hoan_thanh': return 'success';
      case 'da_huy': return 'error';
      default: return 'default';
    }
  }
}