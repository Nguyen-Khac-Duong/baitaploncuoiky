import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, catchError, of, tap } from 'rxjs';
import { SanPham, DonHang, ThongKeDashboard, TrangThaiDonHang, MonGioHang } from '../../shared/mo-hinh/du-lieu.model';
import { environment } from '../../../environments/environment';

const STORAGE_SAN_PHAM = 'admin_du_lieu_san_pham';
const STORAGE_DON_HANG = 'admin_du_lieu_don_hang';
const STORAGE_GIO_HANG = 'user_du_lieu_gio_hang';

@Injectable({
  providedIn: 'root'
})
export class DuLieuService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apis.default.url || 'https://localhost:44351';

  private readonly sanPham$ = new BehaviorSubject<SanPham[]>(this.docLocalStorage(STORAGE_SAN_PHAM) || []);
  private readonly donHang$ = new BehaviorSubject<DonHang[]>(this.docLocalStorage(STORAGE_DON_HANG) || []);

  // === SIGNAL SẢN PHẨM & GIỎ HÀNG (Signal tức thì 100%) ===
  readonly sanPhamListSignal = signal<SanPham[]>(this.docLocalStorage(STORAGE_SAN_PHAM) || []);
  readonly gioHang = signal<MonGioHang[]>(this.khoiTaoGioHang());
  readonly tongSoLuongGioHang = computed(() =>
    this.gioHang().reduce((tong, item) => tong + item.soLuong, 0)
  );
  readonly tongTienGioHang = computed(() =>
    this.gioHang().reduce((tong, item) => tong + item.sanPham.gia * item.soLuong, 0)
  );

  constructor() {
    this.taiDuLieuTuBackend();
  }

  /**
   * Đồng bộ dữ liệu thật từ ABP Backend SQL Server
   */
  taiDuLieuTuBackend(): void {
    // 1. Tải danh sách sản phẩm từ SQL Server qua ABP API
    this.http.get<{ totalCount: number; items: any[] }>(`${this.apiUrl}/api/app/san-pham?maxResultCount=1000`)
      .pipe(
        catchError(err => {
          console.warn('Không thể kết nối API Sản phẩm ABP, sử dụng dữ liệu cục bộ:', err.message);
          return of({ totalCount: 0, items: [] });
        })
      )
      .subscribe(res => {
        if (res?.items && res.items.length > 0) {
          const sanPhams: SanPham[] = res.items.map(item => ({
            id: item.id,
            maSp: item.maSp,
            ten: item.ten,
            gia: Number(item.gia),
            soLuongTon: item.soLuongTon,
            danhMuc: item.danhMuc,
            hinhAnh: item.hinhAnh,
            moTa: item.moTa,
            ngayTao: (item.ngayTao || item.creationTime || '').split('T')[0]
          }));
          this.capNhatSanPhamLocal(sanPhams);
        }
      });

    // 2. Tải danh sách đơn hàng từ SQL Server qua ABP API
    this.http.get<any[]>(`${this.apiUrl}/api/app/don-hang`)
      .pipe(
        catchError(err => {
          console.warn('Không thể kết nối API Đơn hàng ABP, sử dụng dữ liệu cục bộ:', err.message);
          return of([]);
        })
      )
      .subscribe(orders => {
        if (orders && orders.length > 0) {
          const donHangs: DonHang[] = orders.map(item => ({
            id: item.id,
            maDon: item.maDon,
            nguoiDungId: item.nguoiDungId,
            tenKhachHang: item.tenKhachHang,
            soDienThoai: item.soDienThoai,
            diaChi: item.diaChi,
            ghiChu: item.ghiChu,
            tongTien: Number(item.tongTien),
            trangThai: item.trangThai as TrangThaiDonHang,
            ngayTao: new Date(item.ngayTao || item.creationTime).toLocaleString('vi-VN'),
            chiTiet: (item.chiTiet || []).map((ct: any) => ({
              sanPhamId: ct.sanPhamId,
              tenSanPham: ct.tenSanPham,
              soLuong: ct.soLuong,
              donGia: Number(ct.donGia),
              thanhTien: Number(ct.thanhTien),
              hinhAnh: ct.hinhAnh
            }))
          }));
          this.capNhatDonHangLocal(donHangs);
        }
      });
  }

  // === GETTERS ===
  getDanhSachSanPham(): Observable<SanPham[]> {
    return this.sanPham$.asObservable();
  }

  getDanhSachDonHang(): Observable<DonHang[]> {
    return this.donHang$.asObservable();
  }

  getDonHangCuaKhachHang(nguoiDungId?: string, soDienThoai?: string): Observable<DonHang[]> {
    return this.donHang$.pipe(
      map(danhSach => danhSach.filter(dh => {
        if (nguoiDungId && dh.nguoiDungId === nguoiDungId) return true;
        if (soDienThoai && dh.soDienThoai === soDienThoai) return true;
        return false;
      }))
    );
  }

  getThongKeDashboard(): Observable<ThongKeDashboard> {
    return this.http.get<ThongKeDashboard>(`${this.apiUrl}/api/app/don-hang/thong-ke-dashboard`).pipe(
      catchError(() => {
        // Fallback tính toán từ local state
        const sanPhamList = this.sanPham$.value;
        const donHangList = this.donHang$.value;
        const tongSanPham = sanPhamList.length;
        const sanPhamHetHang = sanPhamList.filter(sp => sp.soLuongTon <= 0).length;
        const tongDonHang = donHangList.length;
        const tongDoanhThu = donHangList
          .filter(dh => dh.trangThai === 'hoan_thanh' || dh.trangThai === 'dang_giao')
          .reduce((tong, dh) => tong + dh.tongTien, 0);

        return of({ tongSanPham, tongDonHang, tongDoanhThu, sanPhamHetHang });
      })
    );
  }

  // === THAO TÁC GIỎ HÀNG (DÀNH CHO USER) ===
  themVaoGioHang(sanPham: SanPham, soLuong: number = 1): boolean {
    if (sanPham.soLuongTon <= 0) {
      return false;
    }

    const current = [...this.gioHang()];
    const index = current.findIndex(item => item.sanPham.id === sanPham.id);

    if (index > -1) {
      const soLuongMoi = current[index].soLuong + soLuong;
      if (soLuongMoi > sanPham.soLuongTon) {
        return false;
      }
      current[index] = { ...current[index], soLuong: soLuongMoi };
    } else {
      current.push({ sanPham, soLuong });
    }

    this.gioHang.set(current);
    this.luuLocalStorage(STORAGE_GIO_HANG, current);
    return true;
  }

  capNhatSoLuongGioHang(sanPhamId: string, soLuong: number): void {
    let current = [...this.gioHang()];
    if (soLuong <= 0) {
      current = current.filter(item => item.sanPham.id !== sanPhamId);
    } else {
      const index = current.findIndex(item => item.sanPham.id === sanPhamId);
      if (index > -1) {
        current[index] = { ...current[index], soLuong };
      }
    }
    this.gioHang.set(current);
    this.luuLocalStorage(STORAGE_GIO_HANG, current);
  }

  xoaKhoiGioHang(sanPhamId: string): void {
    const current = this.gioHang().filter(item => item.sanPham.id !== sanPhamId);
    this.gioHang.set(current);
    this.luuLocalStorage(STORAGE_GIO_HANG, current);
  }

  xoaSachGioHang(): void {
    this.gioHang.set([]);
    this.luuLocalStorage(STORAGE_GIO_HANG, []);
  }

  // === ĐẶT HÀNG USER -> LƯU VÀO SQL SERVER QUA ABP API & CẬP NHẬT TỒN KHO ===
  datHang(thongTin: {
    nguoiDungId?: string;
    tenKhachHang: string;
    soDienThoai: string;
    diaChi: string;
    ghiChu?: string;
  }): DonHang | null {
    const gioHang = this.gioHang();
    if (gioHang.length === 0) {
      return null;
    }

    const maDon = 'DH' + Math.floor(1000 + Math.random() * 9000);
    const tongTien = this.tongTienGioHang();

    const donHangMoi: DonHang = {
      id: 'dh-' + Date.now(),
      maDon,
      nguoiDungId: thongTin.nguoiDungId,
      tenKhachHang: thongTin.tenKhachHang,
      soDienThoai: thongTin.soDienThoai,
      diaChi: thongTin.diaChi,
      ghiChu: thongTin.ghiChu,
      tongTien,
      trangThai: 'cho_xu_ly',
      ngayTao: new Date().toLocaleString('vi-VN'),
      chiTiet: gioHang.map(item => ({
        sanPhamId: item.sanPham.id,
        tenSanPham: item.sanPham.ten,
        soLuong: item.soLuong,
        donGia: item.sanPham.gia,
        thanhTien: item.sanPham.gia * item.soLuong,
        hinhAnh: item.sanPham.hinhAnh
      }))
    };

    // 1. Phản hồi tức thì trên UI
    const danhSachDonHang = [donHangMoi, ...this.donHang$.value];
    this.capNhatDonHangLocal(danhSachDonHang);

    const danhSachSanPham = this.sanPham$.value.map(sp => {
      const monHang = gioHang.find(item => item.sanPham.id === sp.id);
      if (monHang) {
        return {
          ...sp,
          soLuongTon: Math.max(0, sp.soLuongTon - monHang.soLuong)
        };
      }
      return sp;
    });
    this.capNhatSanPhamLocal(danhSachSanPham);

    this.xoaSachGioHang();

    // 2. Gửi request lưu vào SQL Server qua ABP Backend
    const createOrderPayload = {
      nguoiDungId: thongTin.nguoiDungId || null,
      tenKhachHang: thongTin.tenKhachHang,
      soDienThoai: thongTin.soDienThoai,
      diaChi: thongTin.diaChi,
      ghiChu: thongTin.ghiChu || null,
      chiTiet: gioHang.map(item => ({
        sanPhamId: this.isGuid(item.sanPham.id) ? item.sanPham.id : '00000000-0000-0000-0000-000000000000',
        tenSanPham: item.sanPham.ten,
        soLuong: item.soLuong,
        donGia: item.sanPham.gia,
        thanhTien: item.sanPham.gia * item.soLuong,
        hinhAnh: item.sanPham.hinhAnh || null
      }))
    };

    this.http.post<any>(`${this.apiUrl}/api/app/don-hang`, createOrderPayload)
      .pipe(
        catchError(err => {
          console.warn('Lỗi khi lưu đơn hàng lên server ABP:', err.message);
          return of(null);
        })
      )
      .subscribe(savedOrder => {
        if (savedOrder) {
          // Đồng bộ lại với backend
          this.taiDuLieuTuBackend();
        }
      });

    return donHangMoi;
  }

  // === QUẢN LÝ SẢN PHẨM ADMIN ===
  themSanPham(sp: Omit<SanPham, 'id' | 'ngayTao'>): void {
    const moi: SanPham = {
      ...sp,
      id: 'sp-' + Date.now(),
      ngayTao: new Date().toISOString().split('T')[0]
    };
    this.capNhatSanPhamLocal([moi, ...this.sanPham$.value]);

    // Gửi request POST lên ABP API để lưu vào SQL Server
    const payload = {
      maSp: sp.maSp,
      ten: sp.ten,
      gia: sp.gia,
      soLuongTon: sp.soLuongTon,
      danhMuc: sp.danhMuc,
      hinhAnh: sp.hinhAnh || null,
      moTa: sp.moTa || null
    };

    this.http.post<any>(`${this.apiUrl}/api/app/san-pham`, payload)
      .pipe(
        catchError(err => {
          console.warn('Lỗi khi thêm sản phẩm lên server:', err.message);
          return of(null);
        })
      )
      .subscribe(res => {
        if (res && res.id) {
          // Cập nhật ID thật từ database
          const updatedList = this.sanPham$.value.map(item =>
            item.id === moi.id ? { ...item, id: res.id } : item
          );
          this.capNhatSanPhamLocal(updatedList);
        }
      });
  }

  capNhatThongTinSanPham(id: string, duLieu: Partial<SanPham>): void {
    const danhSach = this.sanPham$.value.map(sp => {
      if (sp.id === id) {
        return { ...sp, ...duLieu };
      }
      return sp;
    });
    this.capNhatSanPhamLocal(danhSach);

    const spTarget = danhSach.find(s => s.id === id);
    if (spTarget && this.isGuid(id)) {
      const payload = {
        maSp: spTarget.maSp,
        ten: spTarget.ten,
        gia: spTarget.gia,
        soLuongTon: spTarget.soLuongTon,
        danhMuc: spTarget.danhMuc,
        hinhAnh: spTarget.hinhAnh || null,
        moTa: spTarget.moTa || null
      };
      this.http.put(`${this.apiUrl}/api/app/san-pham/${id}`, payload)
        .pipe(catchError(() => of(null)))
        .subscribe();
    }
  }

  xoaSanPham(id: string): void {
    this.capNhatSanPhamLocal(this.sanPham$.value.filter(sp => sp.id !== id));

    if (this.isGuid(id)) {
      this.http.delete(`${this.apiUrl}/api/app/san-pham/${id}`)
        .pipe(catchError(() => of(null)))
        .subscribe();
    }
  }

  doiTrangThaiDonHang(id: string, trangThaiMoi: TrangThaiDonHang): void {
    const danhSach = this.donHang$.value.map(dh => {
      if (dh.id === id) {
        return { ...dh, trangThai: trangThaiMoi };
      }
      return dh;
    });
    this.capNhatDonHangLocal(danhSach);

    if (this.isGuid(id)) {
      this.http.post(`${this.apiUrl}/api/app/don-hang/${id}/doi-trang-thai`, { trangThai: trangThaiMoi })
        .pipe(catchError(() => of(null)))
        .subscribe();
    }
  }

  // === PERSISTENCE HELPERS ===
  private capNhatSanPhamLocal(danhSach: SanPham[]): void {
    this.sanPham$.next(danhSach);
    this.sanPhamListSignal.set(danhSach);
    this.luuLocalStorage(STORAGE_SAN_PHAM, danhSach);
  }

  private capNhatDonHangLocal(danhSach: DonHang[]): void {
    this.donHang$.next(danhSach);
    this.luuLocalStorage(STORAGE_DON_HANG, danhSach);
  }

  private khoiTaoGioHang(): MonGioHang[] {
    const daLuu = this.docLocalStorage(STORAGE_GIO_HANG);
    return (daLuu && Array.isArray(daLuu)) ? daLuu : [];
  }

  private luuLocalStorage(key: string, data: unknown): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(key, JSON.stringify(data));
      }
    } catch (e) {
      console.error('Lỗi khi lưu localStorage', e);
    }
  }

  private docLocalStorage(key: string): any {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
      }
    } catch (e) {
      console.error('Lỗi khi đọc localStorage', e);
    }
    return null;
  }

  private isGuid(str: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
  }
}
