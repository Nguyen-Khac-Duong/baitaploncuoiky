import { Injectable, signal } from '@angular/core';
import { NguoiDung, VaiTroNguoiDung } from '../../shared/mo-hinh/du-lieu.model';

export const TAI_KHOAN_KHOI_TAO: NguoiDung[] = [
  {
    id: 'user-admin-1',
    email: 'admin@gmail.com',
    matKhau: '123456',
    hoTen: 'Nguyễn Văn Admin',
    soDienThoai: '0909123456',
    diaChi: 'Hà Nội, Việt Nam',
    vaiTro: 'admin',
    avatar: 'AD'
  },
  {
    id: 'user-khach-1',
    email: 'khachhang@gmail.com',
    matKhau: '123456',
    hoTen: 'Trần Khách Hàng',
    soDienThoai: '0988776655',
    diaChi: '123 Phố Huế, Hai Bà Trưng, Hà Nội',
    vaiTro: 'khach_hang',
    avatar: 'KH'
  }
];

const STORAGE_USER = 'auth_current_user';
const STORAGE_ALL_USERS = 'auth_danh_sach_tai_khoan';

@Injectable({
  providedIn: 'root'
})
export class XacThucService {
  private danhSachTaiKhoan: NguoiDung[] = this.khoiTaoDanhSachTaiKhoan();
  readonly currentUser = signal<NguoiDung | null>(this.khoiTaoNguoiDung());

  /**
   * Đăng ký tài khoản Khách Hàng (Người mua sắm)
   * Duy nhất chủ shop sở hữu tài khoản Admin quản trị.
   */
  dangKy(thongTin: {
    hoTen: string;
    email: string;
    matKhau: string;
    soDienThoai: string;
    diaChi: string;
  }): { thanhCong: boolean; thongBao: string; user?: NguoiDung } {
    const emailChuanHoa = thongTin.email.trim().toLowerCase();

    // 1. Kiểm tra email đã tồn tại hay chưa
    const daTonTai = this.danhSachTaiKhoan.some(
      u => u.email.toLowerCase() === emailChuanHoa
    );

    if (daTonTai) {
      return {
        thanhCong: false,
        thongBao: `Email "${thongTin.email}" đã được đăng ký! Vui lòng chọn email khác hoặc đăng nhập.`
      };
    }

    // 2. Tạo ID và Avatar chữ cái đầu
    const hoTenParts = thongTin.hoTen.trim().split(' ');
    const avatar = hoTenParts.length > 1
      ? (hoTenParts[0][0] + hoTenParts[hoTenParts.length - 1][0]).toUpperCase()
      : thongTin.hoTen.slice(0, 2).toUpperCase();

    const nguoiDungMoi: NguoiDung = {
      id: 'user-' + Date.now(),
      email: emailChuanHoa,
      matKhau: thongTin.matKhau,
      hoTen: thongTin.hoTen.trim(),
      soDienThoai: thongTin.soDienThoai.trim(),
      diaChi: thongTin.diaChi.trim(),
      vaiTro: 'khach_hang', // Luôn luôn là tài khoản Khách Hàng (Người Mua)
      avatar
    };

    // 3. Lưu vào danh sách tài khoản
    this.danhSachTaiKhoan.push(nguoiDungMoi);
    this.luuDanhSachTaiKhoan();

    // Lưu ý: Không tự động đăng nhập ngay theo quy chuẩn Spec RM-001; 
    // Người dùng được chuyển về tab Đăng nhập để xác nhận lại mật khẩu.
    return {
      thanhCong: true,
      thongBao: `Đăng ký tài khoản thành công! Vui lòng nhập mật khẩu để đăng nhập.`,
      user: nguoiDungMoi
    };
  }

  /**
   * Đăng nhập với email và mật khẩu
   */
  dangNhap(email: string, matKhau: string): NguoiDung | null {
    const emailChuanHoa = email.trim().toLowerCase();
    const user = this.danhSachTaiKhoan.find(
      u => u.email.toLowerCase() === emailChuanHoa && u.matKhau === matKhau
    );

    if (user) {
      this.currentUser.set(user);
      if (this.isBrowser()) {
        localStorage.setItem(STORAGE_USER, JSON.stringify(user));
      }
      return user;
    }
    return null;
  }

  /**
   * Đăng xuất
   */
  dangXuat(): void {
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

  isKhachHang(): boolean {
    return this.currentUser()?.vaiTro === 'khach_hang';
  }

  getVaiTro(): VaiTroNguoiDung | null {
    return this.currentUser()?.vaiTro || null;
  }

  // === INTERNAL HELPERS ===
  private khoiTaoDanhSachTaiKhoan(): NguoiDung[] {
    if (this.isBrowser()) {
      const raw = localStorage.getItem(STORAGE_ALL_USERS);
      if (raw) {
        try {
          const list = JSON.parse(raw);
          if (Array.isArray(list) && list.length > 0) {
            return list;
          }
        } catch {
          // ignore
        }
      }
      // Lưu danh sách khởi tạo mẫu
      localStorage.setItem(STORAGE_ALL_USERS, JSON.stringify(TAI_KHOAN_KHOI_TAO));
    }
    return [...TAI_KHOAN_KHOI_TAO];
  }

  private luuDanhSachTaiKhoan(): void {
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_ALL_USERS, JSON.stringify(this.danhSachTaiKhoan));
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
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }
}