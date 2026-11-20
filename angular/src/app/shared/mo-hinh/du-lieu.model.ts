export type VaiTroNguoiDung = 'admin' | 'khach_hang';

export interface NguoiDungHeThong {
  id: string;
  userName: string;
  email: string;
  name?: string;
  surname?: string;
  phoneNumber?: string;
  isActive: boolean;
  creationTime: string;
}

export interface NguoiDung {
  id: string;
  email: string;
  tenDangNhap?: string;
  matKhau?: string;
  hoTen: string;
  soDienThoai?: string;
  diaChi?: string;
  vaiTro: VaiTroNguoiDung;
  avatar?: string;
}

export interface DiaChiNhanHang {
  id: string;
  hoTen: string;
  soDienThoai: string;
  diaChiChiTiet: string;
  loaiDiaChi?: 'NhaRieng' | 'VanPhong';
  laMacDinh: boolean;
  ghiChu?: string;
}

export interface CapNhatHoSoInput {
  hoTen: string;
  soDienThoai?: string;
  avatar?: string;
  email?: string;
}

export interface DoiMatKhauInput {
  currentPassword: string;
  newPassword: string;
}

export interface CuaHang {
  id: string;
  ten: string;
  slug: string;
  chuSoHuuId: string;
  soDienThoai: string;
  email: string;
  diaChi: string;
  logo?: string;
  banner?: string;
  moTa?: string;
  trangThai: 'ChoDuyet' | 'HoatDong' | 'TamKhoa' | 'BiTuChoi' | string;
  phanTramHoaHong: number;
  soTaiKhoanNganHang?: string;
  tenNganHang?: string;
  tenChuTaiKhoan?: string;
  tongSanPham?: number;
}

export interface DangKyCuaHangInput {
  ten: string;
  slug: string;
  soDienThoai: string;
  email: string;
  diaChi: string;
  logo?: string;
  banner?: string;
  moTa?: string;
}

export interface CapNhatNganHangInput {
  soTaiKhoanNganHang: string;
  tenNganHang: string;
  tenChuTaiKhoan: string;
}

export interface ViCuaHang {
  id: string;
  cuaHangId: string;
  soDuKhaDung: number;
  soDuTamGiu: number;
  tongTienDaRut: number;
  tongTienDangChoDuyet?: number;
}

export interface GiaoDichVi {
  id: string;
  viCuaHangId: string;
  cuaHangId: string;
  loaiGiaoDich: string;
  soTien: number;
  soDuSauGiaoDich: number;
  moTa: string;
  maDonHangLienQuan?: string;
  creationTime: string;
}

export interface YeuCauRutTien {
  id: string;
  cuaHangId: string;
  tenCuaHang?: string;
  soTien: number;
  tenNganHang: string;
  soTaiKhoan: string;
  tenChuTaiKhoan: string;
  trangThai: 'ChoDuyet' | 'DaChuyenTien' | 'TuChoi' | string;
  ghiChu?: string;
  lyDoTuChoi?: string;
  ngayXuLy?: string;
  creationTime: string;
}

export interface TaoYeuCauRutTienInput {
  soTien: number;
  ghiChu?: string;
}

export interface XuLyRutTienInput {
  dongY: boolean;
  lyDoTuChoi?: string;
}

export interface DanhMuc {
  id: string;
  ten: string;
  slug: string;
  icon?: string;
  moTa?: string;
  parentId?: string;
  tenDanhMucCha?: string;
  thuTu: number;
  trangThai: boolean;
  soLuongSanPham: number;
}

export interface DanhMucTree extends DanhMuc {
  children: DanhMucTree[];
}

export interface SanPham {
  id: string;
  cuaHangId?: string;
  tenCuaHang?: string;
  cuaHangSlug?: string;
  maSp: string;
  ten: string;
  gia: number;
  soLuongTon: number;
  danhMuc: string;
  danhMucId?: string;
  hinhAnh?: string;
  moTa?: string;
  ngayTao: string;
}

export type TrangThaiDonHang = 
  | 'cho_xu_ly' 
  | 'dang_giao' 
  | 'hoan_thanh' 
  | 'da_huy'
  | 'yeu_cau_tra_hang'
  | 'tra_hang'
  | 'tu_choi_tra_hang';

export interface ChiTietDonHang {
  id?: string;
  sanPhamId: string;
  tenSanPham: string;
  soLuong: number;
  donGia: number;
  thanhTien: number;
  hinhAnh?: string;
}

export interface DonHang {
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
  tienHang?: number;
  phiVanChuyen?: number;
  tienHoaHongSan?: number;
  thucNhanCuaShop?: number;
  tongTien: number;
  trangThai: TrangThaiDonHang;
  ngayTao: string;
  chiTiet: ChiTietDonHang[];
  lyDoTraHang?: string;
  ghiChuTraHang?: string;
  hinhAnhTraHang?: string;
  thoiGianYeuCauTraHang?: string;
  phanHoiTraHang?: string;
  thoiGianXuLyTraHang?: string;
}

export interface YeuCauTraHangDto {
  lyDoTraHang: string;
  ghiChuTraHang?: string;
  hinhAnhTraHang?: string;
}

export interface XuLyTraHangDto {
  dongY: boolean;
  phanHoi?: string;
}

export interface DonHangTong {
  id: string;
  maDonTong: string;
  nguoiDungId?: string;
  tenKhachHang: string;
  soDienThoai: string;
  diaChi: string;
  ghiChu?: string;
  tongTien: number;
  maVoucher?: string;
  tienGiamVoucher?: number;
  phuongThucThanhToan: string;
  trangThai: string;
  donHangCons: DonHang[];
}

export interface CreateChiTietDonHangInput {
  sanPhamId: string;
  soLuong: number;
}

export interface CreateDonHangInput {
  nguoiDungId?: string;
  tenKhachHang: string;
  soDienThoai: string;
  diaChi: string;
  ghiChu?: string;
  maVoucher?: string;
  tienGiamVoucher?: number;
  maVoucherSan?: string;
  tienGiamVoucherSan?: number;
  maVoucherShop?: string;
  tienGiamVoucherShop?: number;
  phuongThucThanhToan?: string;
  chiTiet?: CreateChiTietDonHangInput[];
}

export interface ThongKeDashboard {
  tongSanPham: number;
  tongDonHang: number;
  tongDoanhThu: number;
  sanPhamHetHang: number;
}

export interface MonGioHang {
  sanPham: SanPham;
  soLuong: number;
  daChon?: boolean;
}

export interface NhomGioHangShop {
  cuaHangId: string;
  tenCuaHang: string;
  danhSachMon: MonGioHang[];
  tongTien: number;
  daChonTatCa?: boolean;
  soLuongDaChon?: number;
  tongTienDaChon?: number;
  laShopCuaToi?: boolean;
}

export interface DanhGiaSanPham {
  id: string;
  creationTime: string;
  creatorId?: string;
  sanPhamId: string;
  tenSanPham: string;
  hinhAnhSanPham?: string;
  donHangId: string;
  maDonHang: string;
  cuaHangId: string;
  tenCuaHang: string;
  nguoiDungId: string;
  tenNguoiDung: string;
  avatarNguoiDung?: string;
  soSao: number;
  noiDung: string;
  hinhAnh?: string;
  donHangCoHoanTra: boolean;
  phanHoiShop?: string;
  thoiGianPhanHoi?: string;
}

export interface TaoDanhGiaDto {
  sanPhamId: string;
  donHangId: string;
  soSao: number;
  noiDung: string;
  hinhAnh?: string;
}

export interface PhanHoiDanhGiaDto {
  noiDungPhanHoi: string;
}

export interface ThongKeDanhGia {
  diemTrungBinh: number;
  tongSoDanhGia: number;
  soLuong5Sao: number;
  soLuong4Sao: number;
  soLuong3Sao: number;
  soLuong2Sao: number;
  soLuong1Sao: number;
  soLuongCoHinhAnh: number;
  soLuongDonHoanTra: number;
}

export type LoaiThongBaoHeThong = 'don_hang' | 'hoan_tien' | 'danh_gia' | 'vi_tien' | 'kho_hang' | 'he_thong';

export interface ThongBaoItem {
  id: string;
  nguoiDungId?: string;
  cuaHangId?: string;
  doiTuong?: 'buyer' | 'seller';
  tieuDe: string;
  noiDung: string;
  loai: LoaiThongBaoHeThong | string;
  lienKet?: string;
  daDoc: boolean;
  thoiGianDoc?: string;
  creationTime: string;
}

export interface TepTinUploadResult {
  url: string;
  relativeUrl: string;
  fileName: string;
  fileSizeBytes: number;
}

export interface VoucherItem {
  id: string;
  maVoucher: string;
  tieuDe: string;
  moTa?: string;
  loaiGiamGia: 'PhanTram' | 'SoTien' | string;
  giaTriGiam: number;
  giaTriDonToiThieu: number;
  giamToiDa?: number;
  soLuong: number;
  soLuongDaDung: number;
  ngayBatDau: string;
  ngayKetThuc: string;
  cuaHangId?: string;
  tenCuaHang?: string;
  laVoucherSan?: boolean;
  kichHoat: boolean;
}

export interface KetQuaKiemTraVoucher {
  hopLe: boolean;
  soTienGiam: number;
  tienGiam?: number;
  tongTienSauGiam: number;
  thongBao: string;
  laVoucherSan?: boolean;
  cuaHangId?: string;
  voucher?: VoucherItem;
}

export interface TaoCapNhatVoucherInput {
  maVoucher: string;
  tieuDe: string;
  moTa?: string;
  loaiGiamGia: 'PhanTram' | 'SoTien' | string;
  giaTriGiam: number;
  giaTriDonToiThieu: number;
  giamToiDa?: number;
  soLuong: number;
  ngayBatDau: string;
  ngayKetThuc: string;
  cuaHangId?: string;
  kichHoat?: boolean;
}
