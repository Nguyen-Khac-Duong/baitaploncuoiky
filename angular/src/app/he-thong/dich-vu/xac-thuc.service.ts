import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { OAuthService } from 'angular-oauth2-oidc';
import { ConfigStateService, CurrentUserDto } from '@abp/ng.core';
import { Observable, from, map, catchError, of, switchMap } from 'rxjs';
import { NguoiDung, VaiTroNguoiDung } from '../../shared/mo-hinh/du-lieu.model';
import { environment } from '../../../environments/environment';

const STORAGE_USER = 'auth_current_user';

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
        const user: NguoiDung = {
          id: currentUserDto.id || '',
          email: currentUserDto.email || currentUserDto.userName || '',
          hoTen: currentUserDto.name ? `${currentUserDto.name} ${currentUserDto.surName || ''}`.trim() : currentUserDto.userName || '',
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
          const user: NguoiDung = {
            id: currentUserDto.id || '',
            email: currentUserDto.email || username,
            hoTen: currentUserDto.name ? `${currentUserDto.name} ${currentUserDto.surName || ''}`.trim() : currentUserDto.userName || username,
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
