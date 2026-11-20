import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { OAuthService } from 'angular-oauth2-oidc';
import { ConfigStateService, CurrentUserDto } from '@abp/ng.core';
import { Observable, from, map, catchError, of, switchMap } from 'rxjs';
import { NguoiDung, VaiTroNguoiDung, CapNhatHoSoInput, DiaChiNhanHang } from '../../shared/mo-hinh/du-lieu.model';
import { environment } from '../../../environments/environment';

const STORAGE_USER = 'auth_current_user';
const STORAGE_SHIPPING_PREFIX = 'tt88_shipping_';
const STORAGE_LAST_SHIPPING = 'tt88_last_shipping_info';

@Injectable({
  providedIn: 'root'
})
export class XacThucService {
  private readonly http = inject(HttpClient);
  private readonly oAuthService = inject(OAuthService);
  private readonly configStateService = inject(ConfigStateService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly apiUrl = environment.apis.default.url || 'https://localhost:44351';

  readonly currentUser = signal<NguoiDung | null>(this.khoiTaoNguoiDung());

  constructor() {
    this.dongBoTrangThaiOAuth();
  }

  private dongBoTrangThaiOAuth(): void {
    if (this.isBrowser() && this.oAuthService.hasValidAccessToken()) {
      const currentUserDto = this.configStateService.getOne('currentUser') as CurrentUserDto;
      if (currentUserDto?.isAuthenticated) {
        const vaiTro: VaiTroNguoiDung = (currentUserDto.roles || []).includes('admin') ? 'admin' : 'khach_hang';
        const email = currentUserDto.email || currentUserDto.userName || '';
        const saved = this.layThongTinGiaoHang(email) || this.layThongTinGiaoHang(currentUserDto.id || '') || this.layThongTinGiaoHang();
        const hoTen = currentUserDto.name ? `${currentUserDto.name} ${currentUserDto.surName || ''}`.trim() : (saved?.hoTen || currentUserDto.userName || email);

        const user: NguoiDung = {
          id: currentUserDto.id || '',
          email,
          tenDangNhap: currentUserDto.userName || email.split('@')[0],
          hoTen,
          soDienThoai: currentUserDto.phoneNumber || saved?.soDienThoai || '',
          diaChi: saved?.diaChi || '',
          vaiTro,
          avatar: (currentUserDto.userName || 'ND').slice(0, 2).toUpperCase()
        };
        this.currentUser.set(user);
        this.luuNguoiDung(user);
      }
    }
  }

  /**
   * Đăng nhập chuẩn ABP OpenIddict OAuth (Password Flow) - 🔴 F1
   */
  dangNhap(email: string, matKhau: string): Observable<NguoiDung | null> {
    const username = email.trim();

    return from(this.oAuthService.fetchTokenUsingPasswordFlow(username, matKhau)).pipe(
      switchMap(() => from(this.configStateService.refreshAppState())),
      map(() => {
        const currentUserDto = this.configStateService.getOne('currentUser') as CurrentUserDto;
        if (currentUserDto && currentUserDto.isAuthenticated) {
          const vaiTro: VaiTroNguoiDung = (currentUserDto.roles || []).includes('admin') ? 'admin' : 'khach_hang';
          const userEmail = currentUserDto.email || username;
          const saved = this.layThongTinGiaoHang(userEmail) || this.layThongTinGiaoHang(currentUserDto.id || '') || this.layThongTinGiaoHang();
          const hoTen = currentUserDto.name ? `${currentUserDto.name} ${currentUserDto.surName || ''}`.trim() : (saved?.hoTen || currentUserDto.userName || username);

          const user: NguoiDung = {
            id: currentUserDto.id || '',
            email: userEmail,
            hoTen,
            soDienThoai: currentUserDto.phoneNumber || saved?.soDienThoai || '',
            diaChi: saved?.diaChi || '',
            vaiTro,
            avatar: (currentUserDto.userName || 'ND').slice(0, 2).toUpperCase()
          };
          this.currentUser.set(user);
          this.luuNguoiDung(user);
          return user;
        }
        return null;
      }),
      catchError(err => {
        console.warn('OAuth fetchToken error:', err?.message || err);
        return of(null);
      })
    );
  }

  /**
   * Đăng ký tài khoản khách hàng mới vào ABP Identity backend - 🔴 F1
   */
  dangKy(thongTin: {
    hoTen: string;
    email: string;
    matKhau: string;
    soDienThoai: string;
    diaChi: string;
  }): Observable<{ thanhCong: boolean; thongBao: string }> {
    const emailChuanHoa = thongTin.email.trim().toLowerCase();

    // Lưu thông tin họ tên, số điện thoại & địa chỉ vào bộ nhớ giao hàng của người dùng
    this.luuThongTinGiaoHang({
      hoTen: thongTin.hoTen,
      soDienThoai: thongTin.soDienThoai,
      diaChi: thongTin.diaChi
    }, emailChuanHoa);

    const payload = {
      userName: emailChuanHoa.split('@')[0] + '_' + Math.floor(Math.random() * 10000),
      emailAddress: emailChuanHoa,
      password: thongTin.matKhau,
      appName: 'testtttt88'
    };

    return this.http.post(`${this.apiUrl}/api/account/register`, payload).pipe(
      map(() => ({
        thanhCong: true,
        thongBao: 'Đăng ký tài khoản thành công! Vui lòng đăng nhập với mật khẩu vừa tạo.'
      })),
      catchError(err => {
        const msg = err.error?.error?.message || err.error?.message || 'Đăng ký thất bại. Vui lòng thử lại!';
        return of({ thanhCong: false, thongBao: msg });
      })
    );
  }

  /**
   * Đăng xuất và dọn sạch OAuth Token
   */
  dangXuat(): void {
    try {
      this.oAuthService.logOut();
    } catch {
      // ignore
    }
    this.currentUser.set(null);
    if (this.isBrowser()) {
      localStorage.removeItem(STORAGE_USER);
    }
  }

  daDangNhap(): boolean {
    return !!this.currentUser();
  }

  isAdmin(): boolean {
    return this.currentUser()?.vaiTro === 'admin';
  }

  laAdmin(): boolean {
    return this.isAdmin();
  }

  isKhachHang(): boolean {
    return this.currentUser()?.vaiTro === 'khach_hang';
  }

  getVaiTro(): VaiTroNguoiDung | null {
    return this.currentUser()?.vaiTro || null;
  }

  // === QUẢN LÝ VÀ TỰ ĐỘNG ĐIỀN THÔNG TIN GIAO HÀNG (AUTO-FILL SHIPPING PROFILE) ===
  layThongTinGiaoHang(key?: string): { hoTen: string; soDienThoai: string; diaChi: string } | null {
    if (!this.isBrowser()) return null;
    try {
      if (key) {
        const raw = localStorage.getItem(`${STORAGE_SHIPPING_PREFIX}${key.toLowerCase().trim()}`);
        if (raw) return JSON.parse(raw);
      }
      const last = localStorage.getItem(STORAGE_LAST_SHIPPING);
      if (last) return JSON.parse(last);
    } catch {
      return null;
    }
    return null;
  }

  luuThongTinGiaoHang(thongTin: { hoTen?: string; soDienThoai?: string; diaChi?: string }, key?: string): void {
    if (!this.isBrowser()) return;
    try {
      const data = {
        hoTen: thongTin.hoTen || '',
        soDienThoai: thongTin.soDienThoai || '',
        diaChi: thongTin.diaChi || ''
      };
      localStorage.setItem(STORAGE_LAST_SHIPPING, JSON.stringify(data));
      if (key) {
        localStorage.setItem(`${STORAGE_SHIPPING_PREFIX}${key.toLowerCase().trim()}`, JSON.stringify(data));
      }
      const cur = this.currentUser();
      if (cur) {
        const updated: NguoiDung = {
          ...cur,
          hoTen: data.hoTen || cur.hoTen,
          soDienThoai: data.soDienThoai || cur.soDienThoai,
          diaChi: data.diaChi || cur.diaChi
        };
        this.currentUser.set(updated);
        this.luuNguoiDung(updated);
      }
    } catch {
      // ignore
    }
  }

  // === ĐỔI MẬT KHẨU & CẬP NHẬT HỒ SƠ NGƯỜI DÙNG ===
  doiMatKhau(matKhauHienTai: string, matKhauMoi: string): Observable<{ thanhCong: boolean; thongBao: string }> {
    return this.http.post(`${this.apiUrl}/api/account/my-profile/change-password`, {
      currentPassword: matKhauHienTai,
      newPassword: matKhauMoi
    }).pipe(
      map(() => ({
        thanhCong: true,
        thongBao: 'Đổi mật khẩu thành công! Vui lòng bảo mật mật khẩu mới của bạn.'
      })),
      catchError(err => {
        const msg = err.error?.error?.message || err.error?.message || 'Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu hiện tại!';
        return of({ thanhCong: false, thongBao: msg });
      })
    );
  }

  capNhatHoSo(input: CapNhatHoSoInput): Observable<{ thanhCong: boolean; thongBao: string }> {
    const cur = this.currentUser();
    if (!cur) return of({ thanhCong: false, thongBao: 'Bạn chưa đăng nhập!' });

    const updated: NguoiDung = {
      ...cur,
      hoTen: input.hoTen,
      soDienThoai: input.soDienThoai ?? cur.soDienThoai,
      avatar: input.avatar ?? cur.avatar
    };

    this.currentUser.set(updated);
    this.luuNguoiDung(updated);
    this.luuThongTinGiaoHang({
      hoTen: updated.hoTen,
      soDienThoai: updated.soDienThoai,
      diaChi: updated.diaChi
    }, cur.email || cur.id);

    const nameParts = input.hoTen.trim().split(' ');
    const surname = nameParts.length > 1 ? nameParts[0] : '';
    const name = nameParts.length > 1 ? nameParts.slice(1).join(' ') : input.hoTen;

    return this.http.post(`${this.apiUrl}/api/account/my-profile`, {
      userName: cur.email,
      email: cur.email,
      name: name,
      surname: surname,
      phoneNumber: input.soDienThoai
    }).pipe(
      map(() => ({ thanhCong: true, thongBao: 'Cập nhật hồ sơ cá nhân thành công!' })),
      catchError(() => {
        return of({ thanhCong: true, thongBao: 'Đã lưu thông tin hồ sơ của bạn!' });
      })
    );
  }

  // === SỔ ĐỊA CHỈ NHẬN HÀNG (ADDRESS BOOK) ===
  private getAddressStorageKey(userId?: string): string {
    const id = userId || this.currentUser()?.id || this.currentUser()?.email || 'guest';
    return `tt88_addresses_${id.toLowerCase().trim()}`;
  }

  getDanhSachDiaChi(userId?: string): DiaChiNhanHang[] {
    if (!this.isBrowser()) return [];
    try {
      const raw = localStorage.getItem(this.getAddressStorageKey(userId));
      if (raw) {
        const list = JSON.parse(raw) as DiaChiNhanHang[];
        if (Array.isArray(list) && list.length > 0) return list;
      }
      const cur = this.currentUser();
      const saved = this.layThongTinGiaoHang();
      if (saved?.diaChi || cur?.diaChi) {
        const defaultItem: DiaChiNhanHang = {
          id: 'addr_default_1',
          hoTen: cur?.hoTen || saved?.hoTen || '',
          soDienThoai: cur?.soDienThoai || saved?.soDienThoai || '',
          diaChiChiTiet: cur?.diaChi || saved?.diaChi || '',
          loaiDiaChi: 'NhaRieng',
          laMacDinh: true
        };
        this.luuDanhSachDiaChi([defaultItem], userId);
        return [defaultItem];
      }
    } catch {
      return [];
    }
    return [];
  }

  luuDanhSachDiaChi(list: DiaChiNhanHang[], userId?: string): void {
    if (!this.isBrowser()) return;
    try {
      localStorage.setItem(this.getAddressStorageKey(userId), JSON.stringify(list));
      const macDinh = list.find(x => x.laMacDinh) || list[0];
      if (macDinh) {
        this.luuThongTinGiaoHang({
          hoTen: macDinh.hoTen,
          soDienThoai: macDinh.soDienThoai,
          diaChi: macDinh.diaChiChiTiet
        }, userId);
      }
    } catch {
      // ignore
    }
  }

  themHoacCapNhatDiaChi(input: Omit<DiaChiNhanHang, 'id'> & { id?: string }, userId?: string): DiaChiNhanHang[] {
    const currentList = this.getDanhSachDiaChi(userId);
    let updatedList: DiaChiNhanHang[];

    if (input.id) {
      updatedList = currentList.map(item => {
        if (item.id === input.id) {
          return { ...item, ...input } as DiaChiNhanHang;
        }
        return input.laMacDinh ? { ...item, laMacDinh: false } : item;
      });
    } else {
      const newId = 'addr_' + Date.now();
      const isFirst = currentList.length === 0;
      const isDefault = input.laMacDinh || isFirst;

      const prepared = isDefault
        ? currentList.map(x => ({ ...x, laMacDinh: false }))
        : currentList;

      const newItem: DiaChiNhanHang = {
        id: newId,
        hoTen: input.hoTen,
        soDienThoai: input.soDienThoai,
        diaChiChiTiet: input.diaChiChiTiet,
        loaiDiaChi: input.loaiDiaChi || 'NhaRieng',
        laMacDinh: isDefault,
        ghiChu: input.ghiChu
      };

      updatedList = [newItem, ...prepared];
    }

    this.luuDanhSachDiaChi(updatedList, userId);
    return updatedList;
  }

  xoaDiaChi(diaChiId: string, userId?: string): DiaChiNhanHang[] {
    const currentList = this.getDanhSachDiaChi(userId);
    const filtered = currentList.filter(x => x.id !== diaChiId);
    if (filtered.length > 0 && !filtered.some(x => x.laMacDinh)) {
      filtered[0].laMacDinh = true;
    }
    this.luuDanhSachDiaChi(filtered, userId);
    return filtered;
  }

  datDiaChiMacDinh(diaChiId: string, userId?: string): DiaChiNhanHang[] {
    const currentList = this.getDanhSachDiaChi(userId);
    const updated = currentList.map(item => ({
      ...item,
      laMacDinh: item.id === diaChiId
    }));
    this.luuDanhSachDiaChi(updated, userId);
    return updated;
  }

  private luuNguoiDung(user: NguoiDung): void {
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_USER, JSON.stringify(user));
    }
  }

  private khoiTaoNguoiDung(): NguoiDung | null {
    if (this.isBrowser()) {
      const raw = localStorage.getItem(STORAGE_USER);
      if (raw) {
        try {
          return JSON.parse(raw);
        } catch {
          return null;
        }
      }
    }
    return null;
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}
