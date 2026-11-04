import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, catchError, of, tap } from 'rxjs';
import {
  SanPham,
  DonHang,
  ThongKeDashboard,
  TrangThaiDonHang,
  MonGioHang,
  CreateDonHangInput
} from '../../shared/mo-hinh/du-lieu.model';
import { environment } from '../../../environments/environment';
import { MOCK_PRODUCTS } from '../../services/mock-products';

const STORAGE_SAN_PHAM = 'admin_du_lieu_san_pham';
const STORAGE_DON_HANG = 'admin_du_lieu_don_hang';
const STORAGE_GIO_HANG = 'user_du_lieu_gio_hang';

const DEFAULT_SAN_PHAM: SanPham[] = MOCK_PRODUCTS.slice(0, 6).map(p => ({
  id: p.id,
  maSp: p.maSp,
  ten: p.ten,
  gia: p.gia,
  soLuongTon: p.soLuongTon,
  danhMuc: p.danhMuc,
  hinhAnh: p.hinhAnh,
  moTa: p.moTaNgan,
  ngayTao: '2026-01-10'
}));

const DEFAULT_DON_HANG: DonHang[] = [
  {
    id: 'dh-1001',
    maDon: 'DH1001',
    nguoiDungId: 'user-khach-1',
    tenKhachHang: 'Trần Khách Hàng',
    soDienThoai: '0988776655',
    diaChi: '123 Phố Huế, Hai Bà Trưng, Hà Nội',
    tongTien: 34990000,
    trangThai: 'hoan_thanh',
    ngayTao: '2026-01-11 10:30:00',
    chiTiet: [
      {
        sanPhamId: 'sp-01',
        tenSanPham: 'iPhone 16 Pro Max 256GB',
        soLuong: 1,
        donGia: 34990000,
        thanhTien: 34990000
      }
    ]
  }
];

interface SanPhamDtoResponse {
  id: string;
  maSp: string;
  ten: string;
  gia: number | string;
  soLuongTon: number;
  danhMuc: string;
  hinhAnh?: string;
  moTa?: string;
  ngayTao?: string;
  creationTime?: string;
}

interface ChiTietDonHangDtoResponse {
  sanPhamId: string;
  tenSanPham: string;
  soLuong: number;
  donGia: number | string;
  thanhTien: number | string;
  hinhAnh?: string;
}

interface DonHangDtoResponse {
  id: string;
  maDon: string;
  nguoiDungId?: string;
  tenKhachHang: string;
  soDienThoai: string;
  diaChi: string;
  ghiChu?: string;
  tongTien: number | string;
  trangThai: TrangThaiDonHang;
  ngayTao?: string;
  creationTime?: string;
  chiTiet?: ChiTietDonHangDtoResponse[];
}

@Injectable({
  providedIn: 'root'
})
export class DuLieuService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apis.default.url || 'https://localhost:44351';

  private readonly sanPham$ = new BehaviorSubject<SanPham[]>((this.docLocalStorage(STORAGE_SAN_PHAM) as SanPham[]) || DEFAULT_SAN_PHAM);
  private readonly donHang$ = new BehaviorSubject<DonHang[]>((this.docLocalStorage(STORAGE_DON_HANG) as DonHang[]) || DEFAULT_DON_HANG);

  // === SIGNAL SẢN PHẨM & GIỎ HÀNG (Signal tức thì 100%) ===
  readonly sanPhamListSignal = signal<SanPham[]>((this.docLocalStorage(STORAGE_SAN_PHAM) as SanPham[]) || DEFAULT_SAN_PHAM);
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
    this.http.get<{ totalCount: number; items: SanPhamDtoResponse[] }>(`${this.apiUrl}/api/app/san-pham?maxResultCount=1000`)
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
    this.http.get<DonHangDtoResponse[]>(`${this.apiUrl}/api/app/don-hang`)
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
            ngayTao: new Date(item.ngayTao || item.creationTime || Date.now()).toLocaleString('vi-VN'),
            chiTiet: (item.chiTiet || []).map(ct => ({
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
  // BE #2, FE #5: Chỉ gửi sanPhamId và soLuong lên server
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

    const maDonTam = 'DH' + Math.floor(1000 + Math.random() * 9000);
    const tongTien = this.tongTienGioHang();

    const donHangMoi: DonHang = {
      id: 'dh-' + Date.now(),
      maDon: maDonTam,
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

    // 2. Gửi request lưu vào SQL Server qua ABP Backend (BE #2 & FE #5: CHỈ gửi SanPhamId và SoLuong)
    const createOrderPayload: CreateDonHangInput = {
      nguoiDungId: thongTin.nguoiDungId || undefined,
      tenKhachHang: thongTin.tenKhachHang,
      soDienThoai: thongTin.soDienThoai,
      diaChi: thongTin.diaChi,
      ghiChu: thongTin.ghiChu || undefined,
      chiTiet: gioHang.map(item => ({
        sanPhamId: this.isGuid(item.sanPham.id) ? item.sanPham.id : '00000000-0000-0000-0000-000000000000',
        soLuong: item.soLuong
      }))
    };

    this.http.post<DonHangDtoResponse>(`${this.apiUrl}/api/app/don-hang`, createOrderPayload)
      .pipe(
        catchError(err => {
          console.warn('Lỗi khi lưu đơn hàng lên server ABP:', err.message);
          return of(null);
        })
      )
      .subscribe(savedOrder => {
        if (savedOrder) {
          // Cập nhật lại đơn hàng thật từ server (mã đơn server sinh, ID thật)
          const updatedOrders = this.donHang$.value.map(dh => {
            if (dh.id === donHangMoi.id) {
              return {
                id: savedOrder.id,
                maDon: savedOrder.maDon,
                nguoiDungId: savedOrder.nguoiDungId,
                tenKhachHang: savedOrder.tenKhachHang,
                soDienThoai: savedOrder.soDienThoai,
                diaChi: savedOrder.diaChi,
                ghiChu: savedOrder.ghiChu,
                tongTien: Number(savedOrder.tongTien),
                trangThai: savedOrder.trangThai,
                ngayTao: new Date(savedOrder.ngayTao || savedOrder.creationTime || Date.now()).toLocaleString('vi-VN'),
                chiTiet: (savedOrder.chiTiet || []).map(ct => ({
                  sanPhamId: ct.sanPhamId,
                  tenSanPham: ct.tenSanPham,
                  soLuong: ct.soLuong,
                  donGia: Number(ct.donGia),
                  thanhTien: Number(ct.thanhTien),
                  hinhAnh: ct.hinhAnh
                }))
              };
            }
            return dh;
          });
          this.capNhatDonHangLocal(updatedOrders);
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

    this.http.post<SanPhamDtoResponse>(`${this.apiUrl}/api/app/san-pham`, payload)
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
    const targetOrder = this.donHang$.value.find(dh => dh.id === id);
    if (!targetOrder) return;

    // Chặn sửa đơn đã hoàn thành hoặc đã hủy (BE #1)
    if (targetOrder.trangThai === 'hoan_thanh' || targetOrder.trangThai === 'da_huy') {
      console.warn('Không thể thay đổi trạng thái đơn hàng đã hoàn tất hoặc đã hủy.');
      return;
    }

    // Cập nhật trạng thái đơn hàng trên local state
    const danhSach = this.donHang$.value.map(dh => {
      if (dh.id === id) {
        return { ...dh, trangThai: trangThaiMoi };
      }
      return dh;
    });
    this.capNhatDonHangLocal(danhSach);

    // Khi trạng thái mới là ĐÃ HỦY: Hoàn trả số lượng tồn kho (BE #1)
    if (trangThaiMoi === 'da_huy') {
      const sanPhamMap = new Map(this.sanPham$.value.map(sp => [sp.id, { ...sp }]));
      for (const ct of targetOrder.chiTiet) {
        const sp = sanPhamMap.get(ct.sanPhamId);
        if (sp) {
          sp.soLuongTon += ct.soLuong;
        }
      }
      this.capNhatSanPhamLocal(Array.from(sanPhamMap.values()));
    }

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
    return (daLuu && Array.isArray(daLuu)) ? (daLuu as MonGioHang[]) : [];
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

  private docLocalStorage(key: string): unknown {
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
