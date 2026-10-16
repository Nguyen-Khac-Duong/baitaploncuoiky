import { Injectable, signal } from '@angular/core';

export type CheDoGiaoDien = 'sang' | 'toi';

const STORAGE_THEME = 'app_theme_mode';

@Injectable({
  providedIn: 'root'
})
export class GiaoDienService {
  readonly cheDoToi = signal<boolean>(false);

  constructor() {
    this.khoiTaoGiaoDien();
  }

  chuyenDoiGiaoDien(): void {
    const trangThaiMoi = !this.cheDoToi();
    this.cheDoToi.set(trangThaiMoi);
    this.apDungGiaoDien(trangThaiMoi);
  }

  private khoiTaoGiaoDien(): void {
    if (this.isBrowser()) {
      const daLuu = localStorage.getItem(STORAGE_THEME);
      // Ưu tiên cấu hình đã lưu, nếu chưa có thì kiểm tra prefers-color-scheme của máy
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const isDark = daLuu ? daLuu === 'toi' : prefersDark;

      this.cheDoToi.set(isDark);
      this.apDungGiaoDien(isDark);
    }
  }

  private apDungGiaoDien(isDark: boolean): void {
    if (this.isBrowser()) {
      const root = document.documentElement;
      if (isDark) {
        root.setAttribute('data-theme', 'dark');
        document.body?.setAttribute('data-theme', 'dark');
        localStorage.setItem(STORAGE_THEME, 'toi');
      } else {
        root.removeAttribute('data-theme');
        document.body?.removeAttribute('data-theme');
        localStorage.setItem(STORAGE_THEME, 'sang');
      }
    }
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }
}
