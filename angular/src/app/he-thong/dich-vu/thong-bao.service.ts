import { Injectable, signal } from '@angular/core';

export type LoaiThongBao = 'success' | 'error' | 'warning' | 'info';

export interface ThongBaoToast {
  id: string;
  loai: LoaiThongBao;
  tieuDe?: string;
  noiDung: string;
  thoiGianHienThi?: number; // ms
}

@Injectable({
  providedIn: 'root'
})
export class ThongBaoService {
  readonly danhSachToast = signal<ThongBaoToast[]>([]);

  hienThi(loai: LoaiThongBao, noiDung: string, tieuDe?: string, thoiGian: number = 3500): void {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
    const toastMoi: ThongBaoToast = {
      id,
      loai,
      tieuDe,
      noiDung,
      thoiGianHienThi: thoiGian
    };

    this.danhSachToast.update(list => [...list, toastMoi]);

    if (thoiGian > 0) {
      setTimeout(() => {
        this.dongToast(id);
      }, thoiGian);
    }
  }

  thanhCong(noiDung: string, tieuDe: string = 'Thành công'): void {
    this.hienThi('success', noiDung, tieuDe);
  }

  thatBai(noiDung: string, tieuDe: string = 'Lỗi'): void {
    this.hienThi('error', noiDung, tieuDe);
  }

  canhBao(noiDung: string, tieuDe: string = 'Cảnh báo'): void {
    this.hienThi('warning', noiDung, tieuDe);
  }

  thongTin(noiDung: string, tieuDe: string = 'Thông tin'): void {
    this.hienThi('info', noiDung, tieuDe);
  }

  dongToast(id: string): void {
    this.danhSachToast.update(list => list.filter(t => t.id !== id));
  }
}
