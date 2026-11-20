import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { XacThucService } from './xac-thuc.service';
import {
  SanPham,
  DonHang,
  DonHangTong,
  CuaHang,
  DangKyCuaHangInput,
  CapNhatNganHangInput,
  ViCuaHang,
  GiaoDichVi,
  YeuCauRutTien,
  TaoYeuCauRutTienInput,
  XuLyRutTienInput,
  ThongKeDashboard,
  TrangThaiDonHang,
  MonGioHang,
  NhomGioHangShop,
  CreateDonHangInput,
  NguoiDungHeThong,
  DanhMuc,
  DanhMucTree,
  DanhGiaSanPham,
  TaoDanhGiaDto,
  PhanHoiDanhGiaDto,
  ThongKeDanhGia,
  YeuCauTraHangDto,
  XuLyTraHangDto,
  ThongBaoItem,
  TepTinUploadResult,
  VoucherItem,
  KetQuaKiemTraVoucher,
  TaoCapNhatVoucherInput
} from '../../shared/mo-hinh/du-lieu.model';
import { environment } from '../../../environments/environment';

const STORAGE_GIO_HANG = 'user_du_lieu_gio_hang';

interface SanPhamDtoResponse {
  id: string;
  cuaHangId?: string;
  tenCuaHang?: string;
  cuaHangSlug?: string;
  maSp: string;
  ten: string;
  gia: number | string;
  soLuongTon: number;
  danhMuc: string;
  danhMucId?: string;
  hinhAnh?: string;
  moTa?: string;
  ngayTao?: string;
  creationTime?: string;
}

interface ChiTietDonHangDtoResponse {
  id?: string;
  sanPhamId: string;
  tenSanPham: string;
  soLuong: number;
  donGia: number | string;
  thanhTien: number | string;
  hinhAnh?: string;
}

interface DonHangDtoResponse {
  id: string;
  cuaHangId?: string;
  tenCuaHang?: string;
  donHangTongId?: string;
  maDonTong?: string;
  maDon: string;
  nguoiDungId?: string;
  tenKhachHang: string;
  soDienThoai: string;
  diaChi: string;
  ghiChu?: string;
  tienHang?: number | string;
  phiVanChuyen?: number | string;
  tienHoaHongSan?: number | string;
  thucNhanCuaShop?: number | string;
  tongTien: number | string;
  trangThai: TrangThaiDonHang;
  ngayTao?: string;
  creationTime?: string;
  chiTiet?: ChiTietDonHangDtoResponse[];
  lyDoTraHang?: string;
  ghiChuTraHang?: string;
  hinhAnhTraHang?: string;
  thoiGianYeuCauTraHang?: string;
  phanHoiTraHang?: string;
  thoiGianXuLyTraHang?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DuLieuService {
  private readonly http = inject(HttpClient);
  private readonly xacThucService = inject(XacThucService);
  private readonly apiUrl = environment.apis.default.url || 'https://localhost:44351';

  private readonly sanPham$ = new BehaviorSubject<SanPham[]>([]);
  private readonly donHang$ = new BehaviorSubject<DonHang[]>([]);

  readonly sanPhamListSignal = signal<SanPham[]>([]);
  readonly cayDanhMucSignal = signal<DanhMucTree[]>([]);
  readonly gioHang = signal<MonGioHang[]>(this.khoiTaoGioHang());
  readonly myStoreSignal = signal<CuaHang | null>(null);

  readonly tongSoLuongGioHang = computed(() =>
    this.gioHang().reduce((tong, item) => tong + item.soLuong, 0)
  );

  readonly tongTienGioHang = computed(() =>
    this.gioHang().reduce((tong, item) => tong + item.sanPham.gia * item.soLuong, 0)
  );

  // === CÁC SẢN PHẨM ĐƯỢC CHỌN ĐỂ THANH TOÁN (CHECKBOX SELECTION) ===
  // Tự động loại trừ các sản phẩm thuộc gian hàng của chính mình (Self-purchase check)
  readonly cacMonDaChon = computed(() =>
    this.gioHang().filter(item => item.daChon !== false && !this.laSanPhamCuaShopToi(item.sanPham))
  );

  readonly tongSoLuongDaChon = computed(() =>
    this.cacMonDaChon().reduce((tong, item) => tong + item.soLuong, 0)
  );

  readonly tongTienDaChon = computed(() =>
    this.cacMonDaChon().reduce((tong, item) => tong + item.sanPham.gia * item.soLuong, 0)
  );

  readonly daChonTatCa = computed(() => {
    const validItems = this.gioHang().filter(item => !this.laSanPhamCuaShopToi(item.sanPham));
    return validItems.length > 0 && validItems.every(item => item.daChon !== false);
  });

  /**
   * Gom nhóm các sản phẩm trong giỏ hàng theo từng Gian Hàng (Multi-vendor Cart)
   */
  readonly gioHangNhomTheoShop = computed<NhomGioHangShop[]>(() => {
    const items = this.gioHang();
    const mapShops = new Map<string, { ten: string; items: MonGioHang[]; tong: number }>();

    for (const item of items) {
      const shopId = item.sanPham.cuaHangId || 'official-store';
      const shopTen = item.sanPham.tenCuaHang || 'ShopTech Official Store';

      if (!mapShops.has(shopId)) {
        mapShops.set(shopId, { ten: shopTen, items: [], tong: 0 });
      }

      const shopGroup = mapShops.get(shopId)!;
      shopGroup.items.push(item);
      shopGroup.tong += item.sanPham.gia * item.soLuong;
    }

    return Array.from(mapShops.entries()).map(([cuaHangId, data]) => {
      const myShop = this.myStoreSignal();
      const laShopCuaToi = !!(myShop && myShop.id && myShop.id.toLowerCase() === cuaHangId.toLowerCase());
      
      const validItems = data.items.filter(x => !laShopCuaToi && x.daChon !== false);
      const soLuongDaChon = validItems.reduce((sum, x) => sum + x.soLuong, 0);
      const tongTienDaChon = validItems.reduce((sum, x) => sum + x.sanPham.gia * x.soLuong, 0);
      const daChonTatCa = !laShopCuaToi && data.items.length > 0 && data.items.every(x => x.daChon !== false);

      return {
        cuaHangId,
        tenCuaHang: data.ten,
        danhSachMon: data.items,
        tongTien: data.tong,
        daChonTatCa,
        soLuongDaChon,
        tongTienDaChon,
        laShopCuaToi
      };
    });
  });

  /**
   * Gom nhóm CHỈ các sản phẩm đã chọn theo từng Gian Hàng (Dùng cho Trang Thanh Toán)
   */
  readonly nhomShopDaChon = computed<NhomGioHangShop[]>(() => {
    return this.gioHangNhomTheoShop()
      .filter(shop => !shop.laShopCuaToi)
      .map(shop => ({
        ...shop,
        danhSachMon: shop.danhSachMon.filter(item => item.daChon !== false && !this.laSanPhamCuaShopToi(item.sanPham))
      }))
      .filter(shop => shop.danhSachMon.length > 0);
  });

  constructor() {
    this.taiDuLieuTuBackend();

    // Tự động tải thông tin Shop của người dùng hiện tại để kiểm tra chủ quyền sản phẩm
    effect(() => {
      const user = this.xacThucService.currentUser();
      if (user) {
        this.taiThongTinShopCuaToi();
      } else {
        this.myStoreSignal.set(null);
      }
    });
  }

  taiThongTinShopCuaToi(): void {
    if (this.xacThucService.daDangNhap()) {
      this.getMyStore().subscribe({
        next: (shop) => this.myStoreSignal.set(shop),
        error: () => this.myStoreSignal.set(null)
      });
    } else {
      this.myStoreSignal.set(null);
    }
  }

  laSanPhamCuaShopToi(sanPham: SanPham | { cuaHangId?: string } | null | undefined): boolean {
    if (!sanPham) return false;
    const shop = this.myStoreSignal();
    if (!shop || !shop.id || !sanPham.cuaHangId) return false;
    return sanPham.cuaHangId.toLowerCase() === shop.id.toLowerCase();
  }

  taiDuLieuTuBackend(): void {
    this.http.get<{ totalCount: number; items: SanPhamDtoResponse[] }>(
      `${this.apiUrl}/api/app/san-pham?maxResultCount=1000`
    ).subscribe({
      next: (res) => {
        const items = res?.items || [];
        const danhSach: SanPham[] = items.map(item => this.mapSanPhamDto(item));
        this.sanPham$.next(danhSach);
        this.sanPhamListSignal.set(danhSach);
      },
      error: (err) => {
        console.warn('Không thể kết nối API Sản phẩm ABP:', err?.message || err);
      }
    });

    this.http.get<DonHangDtoResponse[]>(`${this.apiUrl}/api/app/don-hang`).subscribe({
      next: (orders) => {
        const items = orders || [];
        const danhSach: DonHang[] = items.map(item => this.mapDonHangDto(item));
        this.donHang$.next(danhSach);
      },
      error: (err) => {
        console.warn('Không thể kết nối API Đơn hàng ABP:', err?.message || err);
      }
    });

    this.taiCayDanhMuc();
  }

  taiCayDanhMuc(): void {
    this.getCayDanhMuc().subscribe({
      next: (tree) => this.cayDanhMucSignal.set(tree),
      error: (err) => console.warn('Không thể tải cây danh mục ABP:', err?.message || err)
    });
  }

  // === DANH MỤC SẢN PHẨM (CATEGORY TREE) ===
  getCayDanhMuc(): Observable<DanhMucTree[]> {
    return this.http.get<DanhMucTree[]>(`${this.apiUrl}/api/app/danh-muc/tree`);
  }

  getDanhSachDanhMuc(): Observable<{ totalCount: number; items: DanhMuc[] }> {
    return this.http.get<{ totalCount: number; items: DanhMuc[] }>(`${this.apiUrl}/api/app/danh-muc?maxResultCount=1000`);
  }

  taoDanhMuc(input: { ten: string; slug?: string; icon?: string; moTa?: string; parentId?: string | null; thuTu?: number; trangThai?: boolean }): Observable<DanhMuc> {
    return this.http.post<DanhMuc>(`${this.apiUrl}/api/app/danh-muc`, input).pipe(
      tap(() => this.taiCayDanhMuc())
    );
  }

  capNhatDanhMuc(id: string, input: { ten: string; slug?: string; icon?: string; moTa?: string; parentId?: string | null; thuTu?: number; trangThai?: boolean }): Observable<DanhMuc> {
    return this.http.put<DanhMuc>(`${this.apiUrl}/api/app/danh-muc/${id}`, input).pipe(
      tap(() => this.taiCayDanhMuc())
    );
  }

  xoaDanhMuc(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/app/danh-muc/${id}`).pipe(
      tap(() => this.taiCayDanhMuc())
    );
  }

  // === GETTERS CHUNG ===
  getDanhSachSanPham(): Observable<SanPham[]> {
    return this.sanPham$.asObservable();
  }

  getSanPhamById(id: string): Observable<SanPham> {
    return this.http.get<SanPhamDtoResponse>(`${this.apiUrl}/api/app/san-pham/${id}`).pipe(
      map(dto => this.mapSanPhamDto(dto))
    );
  }

  getDanhSachDonHang(): Observable<DonHang[]> {
    return this.donHang$.asObservable();
  }

  getDonHangCuaKhachHang(nguoiDungId?: string, soDienThoai?: string): Observable<DonHang[]> {
    const params: string[] = [];
    if (nguoiDungId) params.push(`nguoiDungId=${encodeURIComponent(nguoiDungId)}`);
    if (soDienThoai) params.push(`soDienThoai=${encodeURIComponent(soDienThoai)}`);
    const query = params.length > 0 ? `?${params.join('&')}` : '';
    return this.http.get<DonHangDtoResponse[]>(`${this.apiUrl}/api/app/don-hang/by-nguoi-dung${query}`).pipe(
      map(orders => (orders || []).map(item => this.mapDonHangDto(item)))
    );
  }

  getThongKeDashboard(): Observable<ThongKeDashboard> {
    return this.http.get<ThongKeDashboard>(`${this.apiUrl}/api/app/don-hang/thong-ke-dashboard`);
  }

  getDanhSachNguoiDung(): Observable<{ totalCount: number; items: NguoiDungHeThong[] }> {
    return this.http.get<{ totalCount: number; items: NguoiDungHeThong[] }>(
      `${this.apiUrl}/api/identity/users?maxResultCount=100`
    );
  }

  // === MULTI-VENDOR CỬA HÀNG (MARKETPLACE) ===
  getMyStore(): Observable<CuaHang | null> {
    return this.http.get<CuaHang | null>(`${this.apiUrl}/api/app/cua-hang/my-store`);
  }

  getCuaHangBySlug(slug: string): Observable<CuaHang> {
    return this.http.get<CuaHang>(`${this.apiUrl}/api/app/cua-hang/by-slug?slug=${slug}`);
  }

  getCuaHangById(id: string): Observable<CuaHang> {
    return this.http.get<CuaHang>(`${this.apiUrl}/api/app/cua-hang/${id}`);
  }

  getDanhSachCuaHang(): Observable<{ totalCount: number; items: CuaHang[] }> {
    return this.http.get<{ totalCount: number; items: CuaHang[] }>(`${this.apiUrl}/api/app/cua-hang?maxResultCount=1000`);
  }

  dangKyCuaHang(input: DangKyCuaHangInput): Observable<CuaHang> {
    return this.http.post<CuaHang>(`${this.apiUrl}/api/app/cua-hang/dang-ky`, input);
  }

  capNhatThongTinCuaHang(id: string, input: DangKyCuaHangInput): Observable<CuaHang> {
    return this.http.post<CuaHang>(`${this.apiUrl}/api/app/cua-hang/${id}/cap-nhat-thong-tin`, input);
  }

  capNhatNganHangCuaHang(input: CapNhatNganHangInput): Observable<CuaHang> {
    return this.http.post<CuaHang>(`${this.apiUrl}/api/app/cua-hang/cap-nhat-ngan-hang`, input);
  }

  duyetShop(id: string): Observable<CuaHang> {
    return this.http.post<CuaHang>(`${this.apiUrl}/api/app/cua-hang/${id}/duyet-shop`, {});
  }

  khoaShop(id: string): Observable<CuaHang> {
    return this.http.post<CuaHang>(`${this.apiUrl}/api/app/cua-hang/${id}/khoa-shop`, {});
  }

  moKhoaShop(id: string): Observable<CuaHang> {
    return this.http.post<CuaHang>(`${this.apiUrl}/api/app/cua-hang/${id}/mo-khoa-shop`, {});
  }

  // === VÍ GIAN HÀNG & RÚT TIỀN (SELLER WALLET & PAYOUT) ===
  getMyWallet(): Observable<ViCuaHang> {
    return this.http.get<ViCuaHang>(`${this.apiUrl}/api/app/vi-cua-hang/my-wallet`);
  }

  getMyTransactions(): Observable<{ totalCount: number; items: GiaoDichVi[] }> {
    return this.http.get<{ totalCount: number; items: GiaoDichVi[] }>(`${this.apiUrl}/api/app/vi-cua-hang/my-transactions?maxResultCount=100`);
  }

  taoYeuCauRutTien(input: TaoYeuCauRutTienInput): Observable<YeuCauRutTien> {
    return this.http.post<YeuCauRutTien>(`${this.apiUrl}/api/app/vi-cua-hang/tao-yeu-cau-rut-tien`, input);
  }

  getMyPayoutRequests(): Observable<{ totalCount: number; items: YeuCauRutTien[] }> {
    return this.http.get<{ totalCount: number; items: YeuCauRutTien[] }>(`${this.apiUrl}/api/app/vi-cua-hang/my-payout-requests?maxResultCount=100`);
  }

  getAdminPayoutRequests(): Observable<{ totalCount: number; items: YeuCauRutTien[] }> {
    return this.http.get<{ totalCount: number; items: YeuCauRutTien[] }>(`${this.apiUrl}/api/app/vi-cua-hang/admin-payout-requests?maxResultCount=100`);
  }

  xuLyRutTien(id: string, input: XuLyRutTienInput): Observable<YeuCauRutTien> {
    return this.http.post<YeuCauRutTien>(`${this.apiUrl}/api/app/vi-cua-hang/${id}/xu-ly-rut-tien`, input);
  }

  // === SELLER CENTER (KHO SẢN PHẨM & ĐƠN HÀNG CỦA SHOP) ===
  getMyStoreProducts(): Observable<SanPham[]> {
    return this.http.get<{ totalCount: number; items: SanPhamDtoResponse[] }>(
      `${this.apiUrl}/api/app/san-pham/my-products?maxResultCount=1000`
    ).pipe(
      map(res => (res.items || []).map(item => this.mapSanPhamDto(item)))
    );
  }

  getProductsByShop(shopId: string): Observable<SanPham[]> {
    return this.http.get<{ totalCount: number; items: SanPhamDtoResponse[] }>(
      `${this.apiUrl}/api/app/san-pham/by-shop/${shopId}?maxResultCount=1000`
    ).pipe(
      map(res => (res.items || []).map(item => this.mapSanPhamDto(item)))
    );
  }

  getMyStoreOrders(): Observable<DonHang[]> {
    return this.http.get<{ totalCount: number; items: DonHangDtoResponse[] }>(
      `${this.apiUrl}/api/app/don-hang/my-store-orders?maxResultCount=1000`
    ).pipe(
      map(res => (res.items || []).map(item => this.mapDonHangDto(item)))
    );
  }

  getThongKeMyStore(): Observable<ThongKeDashboard> {
    return this.http.get<ThongKeDashboard>(`${this.apiUrl}/api/app/don-hang/thong-ke-my-store`);
  }

  // === QUẢN LÝ GIỎ HÀNG (Client Signal State) ===
  themVaoGioHang(sanPham: SanPham, soLuong: number = 1): boolean {
    if (sanPham.soLuongTon <= 0) {
      return false;
    }

    // Chặn người bán thêm sản phẩm của chính shop mình vào giỏ hàng
    if (this.laSanPhamCuaShopToi(sanPham)) {
      return false;
    }

    const current = [...this.gioHang()];
    const index = current.findIndex(item => item.sanPham.id === sanPham.id);

    if (index >= 0) {
      const soLuongMoi = current[index].soLuong + soLuong;
      if (soLuongMoi > sanPham.soLuongTon) {
        return false;
      }
      current[index] = {
        ...current[index],
        soLuong: soLuongMoi,
        daChon: current[index].daChon !== false
      };
    } else {
      if (soLuong > sanPham.soLuongTon) {
        return false;
      }
      current.push({ sanPham, soLuong, daChon: true });
    }

    this.capNhatGioHang(current);
    return true;
  }

  capNhatSoLuongGioHang(sanPhamId: string, soLuong: number): boolean {
    const current = [...this.gioHang()];
    const index = current.findIndex(item => item.sanPham.id === sanPhamId);
    if (index < 0) return false;

    const sp = current[index].sanPham;
    if (soLuong <= 0) {
      this.xoaKhoiGioHang(sanPhamId);
      return true;
    }

    if (soLuong > sp.soLuongTon) {
      return false;
    }

    current[index] = { ...current[index], soLuong };
    this.capNhatGioHang(current);
    return true;
  }

  xoaKhoiGioHang(sanPhamId: string): void {
    const filtered = this.gioHang().filter(item => item.sanPham.id !== sanPhamId);
    this.capNhatGioHang(filtered);
  }

  xoaSachGioHang(): void {
    this.capNhatGioHang([]);
  }

  // Checkbox Selection Operations (Shopee Cart Flow)
  toggleChonMon(sanPhamId: string): void {
    const current = this.gioHang().map(item =>
      item.sanPham.id === sanPhamId
        ? { ...item, daChon: item.daChon === false ? true : false }
        : item
    );
    this.capNhatGioHang(current);
  }

  datChonMon(sanPhamId: string, daChon: boolean): void {
    const current = this.gioHang().map(item =>
      item.sanPham.id === sanPhamId
        ? { ...item, daChon }
        : item
    );
    this.capNhatGioHang(current);
  }

  chonTatCaGioHang(daChon: boolean): void {
    const current = this.gioHang().map(item => ({ ...item, daChon }));
    this.capNhatGioHang(current);
  }

  chonNhomShop(cuaHangId: string, daChon: boolean): void {
    const current = this.gioHang().map(item => {
      const shopId = item.sanPham.cuaHangId || 'official-store';
      if (shopId === cuaHangId) {
        return { ...item, daChon };
      }
      return item;
    });
    this.capNhatGioHang(current);
  }

  xoaCacMonDaChon(): void {
    const remaining = this.gioHang().filter(item => item.daChon === false);
    this.capNhatGioHang(remaining);
  }

  private capNhatGioHang(gioHangMoi: MonGioHang[]): void {
    this.gioHang.set(gioHangMoi);
    this.luuLocalStorage(STORAGE_GIO_HANG, gioHangMoi);
  }

  /**
   * Đặt hàng Multi-vendor: Tự động gom nhóm theo shop và chia đơn hàng con
   * CHỈ đặt các món đã được đánh dấu checkbox (daChon !== false)
   */
  datHang(thongTin: CreateDonHangInput): Observable<DonHangTong> {
    const itemsToOrder = this.cacMonDaChon();
    if (itemsToOrder.length === 0) {
      throw new Error('Vui lòng chọn ít nhất 1 sản phẩm để thanh toán!');
    }

    // Kiểm tra chặn tự mua hàng của chính mình
    for (const item of itemsToOrder) {
      if (this.laSanPhamCuaShopToi(item.sanPham)) {
        throw new Error(`Sản phẩm "${item.sanPham.ten}" thuộc gian hàng của bạn! Người bán không được phép tự mua hàng của chính mình.`);
      }
    }

    const createOrderPayload = {
      tenKhachHang: thongTin.tenKhachHang,
      soDienThoai: thongTin.soDienThoai,
      diaChi: thongTin.diaChi,
      ghiChu: thongTin.ghiChu || null,
      maVoucher: thongTin.maVoucher || null,
      tienGiamVoucher: thongTin.tienGiamVoucher || 0,
      maVoucherSan: thongTin.maVoucherSan || null,
      tienGiamVoucherSan: thongTin.tienGiamVoucherSan || 0,
      maVoucherShop: thongTin.maVoucherShop || null,
      tienGiamVoucherShop: thongTin.tienGiamVoucherShop || 0,
      phuongThucThanhToan: thongTin.phuongThucThanhToan || 'COD',
      chiTiet: itemsToOrder.map(item => ({
        sanPhamId: item.sanPham.id,
        soLuong: item.soLuong
      }))
    };

    return this.http.post<DonHangTong>(`${this.apiUrl}/api/app/don-hang/tao-don-hang-tong`, createOrderPayload).pipe(
      map(savedMasterOrder => {
        // Chỉ xóa các món đã đặt mua thành công khỏi giỏ hàng
        const orderedIds = new Set(itemsToOrder.map(x => x.sanPham.id));
        const remainingCart = this.gioHang().filter(item => !orderedIds.has(item.sanPham.id));
        this.capNhatGioHang(remainingCart);
        this.taiDuLieuTuBackend();
        return savedMasterOrder;
      })
    );
  }

  // === TẢI LÊN HÌNH ẢNH (FILE UPLOAD TRỰC TIẾP TỪ CLIENT) ===
  uploadHinhAnh(file: File): Observable<TepTinUploadResult> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<TepTinUploadResult>(`${this.apiUrl}/api/app/tep-tin/upload`, formData);
  }

  // === HỆ THỐNG MÃ GIẢM GIÁ (VOUCHER ENGINE) ===
  kiemTraVoucher(maVoucher: string, tongTienHang: number, cuaHangId?: string): Observable<KetQuaKiemTraVoucher> {
    const payload = {
      maVoucher: maVoucher.trim().toUpperCase(),
      tongTienHang,
      cuaHangId: cuaHangId || null
    };
    return this.http.post<KetQuaKiemTraVoucher>(`${this.apiUrl}/api/app/voucher/kiem-tra-voucher`, payload);
  }

  getDanhSachVoucherKhaDung(tongTienHang?: number, cuaHangId?: string): Observable<VoucherItem[]> {
    const params: string[] = [];
    if (tongTienHang !== undefined && tongTienHang !== null) params.push(`tongTienHang=${tongTienHang}`);
    if (cuaHangId) params.push(`cuaHangId=${cuaHangId}`);
    const query = params.length > 0 ? `?${params.join('&')}` : '';
    return this.http.get<VoucherItem[]>(`${this.apiUrl}/api/app/voucher/danh-sach-voucher-kha-dung${query}`);
  }

  getDanhSachVoucherSan(): Observable<VoucherItem[]> {
    return this.http.get<VoucherItem[]>(`${this.apiUrl}/api/app/voucher/danh-sach-voucher-san`);
  }

  getDanhSachVoucherShop(cuaHangId: string): Observable<VoucherItem[]> {
    return this.http.get<VoucherItem[]>(`${this.apiUrl}/api/app/voucher/danh-sach-voucher-shop?cuaHangId=${cuaHangId}`);
  }

  getMyStoreVouchers(): Observable<VoucherItem[]> {
    return this.http.get<VoucherItem[]>(`${this.apiUrl}/api/app/voucher/my-store-vouchers`);
  }

  getDanhSachVouchers(cuaHangId?: string): Observable<VoucherItem[]> {
    const query = cuaHangId ? `?cuaHangId=${cuaHangId}` : '';
    return this.http.get<VoucherItem[]>(`${this.apiUrl}/api/app/voucher/danh-sach${query}`);
  }

  taoVoucher(input: TaoCapNhatVoucherInput): Observable<VoucherItem> {
    return this.http.post<VoucherItem>(`${this.apiUrl}/api/app/voucher`, input);
  }

  capNhatVoucher(id: string, input: TaoCapNhatVoucherInput): Observable<VoucherItem> {
    return this.http.put<VoucherItem>(`${this.apiUrl}/api/app/voucher/${id}`, input);
  }

  doiTrangThaiVoucher(id: string): Observable<VoucherItem> {
    return this.http.post<VoucherItem>(`${this.apiUrl}/api/app/voucher/${id}/doi-trang-thai-kich-hoat`, {});
  }

  xoaVoucher(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/app/voucher/${id}`);
  }

  // === QUẢN LÝ SẢN PHẨM ===
  themSanPham(sp: Omit<SanPham, 'id' | 'ngayTao'>): Observable<SanPham> {
    const payload = {
      cuaHangId: sp.cuaHangId || null,
      maSp: sp.maSp,
      ten: sp.ten,
      gia: sp.gia,
      soLuongTon: sp.soLuongTon,
      danhMuc: sp.danhMuc,
      danhMucId: sp.danhMucId || null,
      hinhAnh: sp.hinhAnh || null,
      moTa: sp.moTa || null
    };

    return this.http.post<SanPhamDtoResponse>(`${this.apiUrl}/api/app/san-pham`, payload).pipe(
      map(res => {
        const item = this.mapSanPhamDto(res);
        this.taiDuLieuTuBackend();
        return item;
      })
    );
  }

  capNhatThongTinSanPham(id: string, duLieu: Partial<SanPham>): Observable<SanPham> {
    const payload = {
      cuaHangId: duLieu.cuaHangId || null,
      maSp: duLieu.maSp,
      ten: duLieu.ten,
      gia: duLieu.gia,
      soLuongTon: duLieu.soLuongTon,
      danhMuc: duLieu.danhMuc,
      danhMucId: duLieu.danhMucId || null,
      hinhAnh: duLieu.hinhAnh || null,
      moTa: duLieu.moTa || null
    };

    return this.http.put<SanPhamDtoResponse>(`${this.apiUrl}/api/app/san-pham/${id}`, payload).pipe(
      map(res => {
        const item = this.mapSanPhamDto(res);
        this.taiDuLieuTuBackend();
        return item;
      })
    );
  }

  xoaSanPham(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/app/san-pham/${id}`).pipe(
      tap(() => {
        this.taiDuLieuTuBackend();
      })
    );
  }

  doiTrangThaiDonHang(id: string, trangThaiMoi: TrangThaiDonHang): Observable<DonHang> {
    return this.http.post<DonHangDtoResponse>(
      `${this.apiUrl}/api/app/don-hang/${id}/doi-trang-thai`,
      { trangThai: trangThaiMoi }
    ).pipe(
      map(res => {
        const item = this.mapDonHangDto(res);
        this.taiDuLieuTuBackend();
        return item;
      })
    );
  }

  // === HELPERS & MAPPERS ===
  private mapSanPhamDto(dto: SanPhamDtoResponse): SanPham {
    return {
      id: dto.id,
      cuaHangId: dto.cuaHangId,
      tenCuaHang: dto.tenCuaHang,
      cuaHangSlug: dto.cuaHangSlug,
      maSp: dto.maSp,
      ten: dto.ten,
      gia: Number(dto.gia),
      soLuongTon: dto.soLuongTon,
      danhMuc: dto.danhMuc,
      danhMucId: dto.danhMucId,
      hinhAnh: dto.hinhAnh,
      moTa: dto.moTa,
      ngayTao: dto.ngayTao || dto.creationTime || new Date().toISOString()
    };
  }

  private mapDonHangDto(dto: DonHangDtoResponse): DonHang {
    return {
      id: dto.id,
      cuaHangId: dto.cuaHangId,
      tenCuaHang: dto.tenCuaHang,
      donHangTongId: dto.donHangTongId,
      maDonTong: dto.maDonTong,
      maDon: dto.maDon,
      nguoiDungId: dto.nguoiDungId,
      tenKhachHang: dto.tenKhachHang,
      soDienThoai: dto.soDienThoai,
      diaChi: dto.diaChi,
      ghiChu: dto.ghiChu,
      tienHang: Number(dto.tienHang || dto.tongTien),
      phiVanChuyen: Number(dto.phiVanChuyen || 0),
      tienHoaHongSan: Number(dto.tienHoaHongSan || 0),
      thucNhanCuaShop: Number(dto.thucNhanCuaShop || dto.tongTien),
      tongTien: Number(dto.tongTien),
      trangThai: dto.trangThai,
      ngayTao: dto.ngayTao || dto.creationTime || new Date().toISOString(),
      chiTiet: (dto.chiTiet || []).map(ct => ({
        id: ct.id,
        sanPhamId: ct.sanPhamId,
        tenSanPham: ct.tenSanPham,
        soLuong: ct.soLuong,
        donGia: Number(ct.donGia),
        thanhTien: Number(ct.thanhTien),
        hinhAnh: ct.hinhAnh
      })),
      lyDoTraHang: dto.lyDoTraHang,
      ghiChuTraHang: dto.ghiChuTraHang,
      hinhAnhTraHang: dto.hinhAnhTraHang,
      thoiGianYeuCauTraHang: dto.thoiGianYeuCauTraHang,
      phanHoiTraHang: dto.phanHoiTraHang,
      thoiGianXuLyTraHang: dto.thoiGianXuLyTraHang
    };
  }

  // === TRẢ HÀNG & HOÀN TIỀN (RETURN & REFUND) ===
  yeuCauTraHang(donHangId: string, input: YeuCauTraHangDto): Observable<DonHang> {
    return this.http.post<DonHangDtoResponse>(`${this.apiUrl}/api/app/don-hang/${donHangId}/yeu-cau-tra-hang`, input).pipe(
      map(res => {
        const item = this.mapDonHangDto(res);
        this.taiDuLieuTuBackend();
        return item;
      })
    );
  }

  xuLyTraHang(donHangId: string, input: XuLyTraHangDto): Observable<DonHang> {
    return this.http.post<DonHangDtoResponse>(`${this.apiUrl}/api/app/don-hang/${donHangId}/xu-ly-tra-hang`, input).pipe(
      map(res => {
        const item = this.mapDonHangDto(res);
        this.taiDuLieuTuBackend();
        return item;
      })
    );
  }

  // === ĐÁNH GIÁ SẢN PHẨM & PHẢN HỒI GIAN HÀNG ===
  taoDanhGia(input: TaoDanhGiaDto): Observable<DanhGiaSanPham> {
    return this.http.post<DanhGiaSanPham>(`${this.apiUrl}/api/app/danh-gia/tao-danh-gia`, input);
  }

  getDanhGiaTheoSanPham(sanPhamId: string): Observable<DanhGiaSanPham[]> {
    return this.http.get<DanhGiaSanPham[]>(`${this.apiUrl}/api/app/danh-gia/danh-sach-theo-san-pham/${sanPhamId}`);
  }

  getThongKeDanhGiaTheoSanPham(sanPhamId: string): Observable<ThongKeDanhGia> {
    return this.http.get<ThongKeDanhGia>(`${this.apiUrl}/api/app/danh-gia/thong-ke-theo-san-pham/${sanPhamId}`);
  }

  getDanhSachDanhGiaCuaToi(): Observable<DanhGiaSanPham[]> {
    return this.http.get<DanhGiaSanPham[]>(`${this.apiUrl}/api/app/danh-gia/danh-sach-cua-toi`);
  }

  getDanhGiaTheoShop(shopId?: string): Observable<DanhGiaSanPham[]> {
    const query = shopId ? `?shopId=${shopId}` : '';
    return this.http.get<DanhGiaSanPham[]>(`${this.apiUrl}/api/app/danh-gia/danh-sach-theo-shop${query}`);
  }

  shopPhanHoiDanhGia(danhGiaId: string, noiDungPhanHoi: string): Observable<DanhGiaSanPham> {
    return this.http.post<DanhGiaSanPham>(`${this.apiUrl}/api/app/danh-gia/shop-phan-hoi/${danhGiaId}`, {
      noiDungPhanHoi
    });
  }

  // === THÔNG BÁO HỆ THỐNG (NOTIFICATIONS) ===
  getDanhSachThongBao(doiTuong?: 'buyer' | 'seller'): Observable<ThongBaoItem[]> {
    const params = doiTuong ? `?doiTuong=${doiTuong}` : '';
    return this.http.get<ThongBaoItem[]>(`${this.apiUrl}/api/app/thong-bao/danh-sach${params}`);
  }

  getSoThongBaoChuaDoc(doiTuong?: 'buyer' | 'seller'): Observable<number> {
    const params = doiTuong ? `?doiTuong=${doiTuong}` : '';
    return this.http.get<number>(`${this.apiUrl}/api/app/thong-bao/so-chua-doc${params}`);
  }

  danhDauThongBaoDaDoc(id: string): Observable<ThongBaoItem> {
    return this.http.post<ThongBaoItem>(`${this.apiUrl}/api/app/thong-bao/${id}/danh-dau-da-doc`, {});
  }

  danhDauTatCaThongBaoDaDoc(doiTuong?: 'buyer' | 'seller'): Observable<void> {
    const params = doiTuong ? `?doiTuong=${doiTuong}` : '';
    return this.http.post<void>(`${this.apiUrl}/api/app/thong-bao/danh-dau-tat-ca-da-doc${params}`, {});
  }

  xoaThongBao(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/api/app/thong-bao/${id}/xoa-thong-bao`, {});
  }

  xoaTatCaThongBao(doiTuong?: 'buyer' | 'seller'): Observable<void> {
    const params = doiTuong ? `?doiTuong=${doiTuong}` : '';
    return this.http.post<void>(`${this.apiUrl}/api/app/thong-bao/xoa-tat-ca${params}`, {});
  }

  private khoiTaoGioHang(): MonGioHang[] {
    const daLuu = this.docLocalStorage(STORAGE_GIO_HANG);
    if (daLuu && Array.isArray(daLuu)) {
      return (daLuu as MonGioHang[]).map(item => ({
        ...item,
        daChon: item.daChon !== false
      }));
    }
    return [];
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
}
