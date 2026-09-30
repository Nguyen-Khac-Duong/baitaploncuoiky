export type VaiTroNguoiDung = 'admin' | 'khach_hang';

export interface NguoiDung {
  id: string;
  email: string;
  matKhau: string;
  hoTen: string;
  soDienThoai: string;
  diaChi: string;
  vaiTro: VaiTroNguoiDung;
  avatar?: string;
}

export interface SanPham {
  id: string;
  maSp: string;
  ten: string;
  gia: number;
  soLuongTon: number;
  danhMuc: string;
  hinhAnh?: string;
  moTa?: string;
  ngayTao: string;
}

export type TrangThaiDonHang = 'cho_xu_ly' | 'dang_giao' | 'hoan_thanh' | 'da_huy';

export interface ChiTietDonHang {
  sanPhamId: string;
  tenSanPham: string;
  soLuong: number;
  donGia: number;
  thanhTien: number;
  hinhAnh?: string;
}

export interface DonHang {
  id: string;
  maDon: string;
  nguoiDungId?: string;
  tenKhachHang: string;
  soDienThoai: string;
  diaChi: string;
  ghiChu?: string;
  tongTien: number;
  trangThai: TrangThaiDonHang;
  ngayTao: string;
  chiTiet: ChiTietDonHang[];
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
}
