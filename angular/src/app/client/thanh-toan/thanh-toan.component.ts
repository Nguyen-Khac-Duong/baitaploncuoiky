import { Component, inject, OnInit, effect, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DuLieuService } from '../../he-thong/dich-vu/du-lieu.service';
import { XacThucService } from '../../he-thong/dich-vu/xac-thuc.service';
import { ThongBaoService } from '../../he-thong/dich-vu/thong-bao.service';
import { trichXuatThongBaoLoi } from '../../he-thong/tien-ich/loi-api.helper';
import { VoucherItem, DonHangTong, DiaChiNhanHang } from '../../shared/mo-hinh/du-lieu.model';

@Component({
  selector: 'app-thanh-toan',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, FormsModule],
  templateUrl: './thanh-toan.component.html',
  styleUrl: './thanh-toan.component.scss'
})
export class ThanhToanComponent implements OnInit {
  readonly duLieuService = inject(DuLieuService);
  readonly xacThucService = inject(XacThucService);
  private readonly thongBaoService = inject(ThongBaoService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  formDatHang!: FormGroup;
  datHangThanhCongDonHang: string | null = null;
  donHangTongVuaTao: DonHangTong | null = null;
  dangDatHang: boolean = false;

  // === SỔ ĐỊA CHỈ NHẬN HÀNG ===
  readonly danhSachDiaChi = signal<DiaChiNhanHang[]>([]);
  hienModalChonDiaChi: boolean = false;

  // === VOUCHER ENGINE (SHOPEE MULTI-LAYER VOUCHER STACKING) ===
  readonly maVoucherNhap = signal<string>('');
  readonly dangKiemTraVoucher = signal<boolean>(false);
  readonly thongBaoVoucher = signal<{ hopLe: boolean; tinNhan: string } | null>(null);

  // 1. Voucher Gian Hàng (Shop Voucher)
  readonly voucherShopDaChon = signal<VoucherItem | null>(null);
  readonly tienGiamVoucherShop = signal<number>(0);
  readonly danhSachVoucherShop = signal<VoucherItem[]>([]);

  // 2. Voucher Sàn Thương Mại (Platform Voucher)
  readonly voucherSanDaChon = signal<VoucherItem | null>(null);
  readonly tienGiamVoucherSan = signal<number>(0);
  readonly danhSachVoucherSan = signal<VoucherItem[]>([]);

  readonly tongGiamVoucher = computed(() => {
    return Number(this.tienGiamVoucherShop() || 0) + Number(this.tienGiamVoucherSan() || 0);
  });

  readonly tongThanhToanSauGiam = computed(() => {
    const tong = Number(this.duLieuService.tongTienDaChon() || 0);
    const giam = this.tongGiamVoucher();
    return Math.max(0, tong - giam);
  });

  // === THANH TOÁN VIETQR ===
  phuongThucThanhToan: 'COD' | 'ChuyenKhoan' = 'COD';
  hienModalVietQR: boolean = false;
  soTaiKhoanShop: string = '0987654321';
  tenNganHangShop: string = 'MBBank (Ngân Hàng Quân Đội)';
  chuTaiKhoanShop: string = 'TRAN DINH DUONG';

  constructor() {
    effect(() => {
      const user = this.xacThucService.currentUser();
      if (user && this.formDatHang) {
        const saved = this.xacThucService.layThongTinGiaoHang(user.email || user.id) || this.xacThucService.layThongTinGiaoHang();
        const ten = user.hoTen || saved?.hoTen || this.formDatHang.get('tenKhachHang')?.value || '';
        const sdt = user.soDienThoai || saved?.soDienThoai || this.formDatHang.get('soDienThoai')?.value || '';
        const diaChi = user.diaChi || saved?.diaChi || this.formDatHang.get('diaChi')?.value || '';

        this.formDatHang.patchValue({
          tenKhachHang: ten,
          soDienThoai: sdt,
          diaChi: diaChi
        }, { emitEvent: false });
      }
    });
  }

  ngOnInit(): void {
    // Kiểm tra xem có sản phẩm nào được chọn trong giỏ hàng không
    if (this.duLieuService.cacMonDaChon().length === 0) {
      this.thongBaoService.canhBao('Bạn chưa chọn sản phẩm nào để thanh toán. Vui lòng tick chọn sản phẩm trước!', 'Giỏ hàng');
      this.router.navigate(['/gio-hang']);
      return;
    }

    this.khoiTaoForm();
    this.taiDanhSachVoucher();
    this.taiDanhSachDiaChi();
  }

  taiDanhSachDiaChi(): void {
    if (this.xacThucService.daDangNhap()) {
      const list = this.xacThucService.getDanhSachDiaChi();
      this.danhSachDiaChi.set(list);
    }
  }

  chonDiaChiTuSo(addr: DiaChiNhanHang): void {
    if (this.formDatHang) {
      this.formDatHang.patchValue({
        tenKhachHang: addr.hoTen,
        soDienThoai: addr.soDienThoai,
        diaChi: addr.diaChiChiTiet
      });
      this.hienModalChonDiaChi = false;
      this.thongBaoService.thanhCong(`Đã chọn địa chỉ của ${addr.hoTen}!`, 'Sổ địa chỉ');
    }
  }

  taiDanhSachVoucher(): void {
    // 1. Tải Voucher Sàn khả dụng
    this.duLieuService.getDanhSachVoucherSan().subscribe({
      next: (list) => {
        this.danhSachVoucherSan.set((list || []).filter(x => x.kichHoat));
      },
      error: () => {}
    });

    // 2. Tải Voucher của các Shop có trong các món đã chọn
    const nhomShops = this.duLieuService.nhomShopDaChon();
    const shopVouchers: VoucherItem[] = [];
    let count = 0;

    if (nhomShops.length === 0) {
      this.danhSachVoucherShop.set([]);
      return;
    }

    for (const group of nhomShops) {
      if (group.cuaHangId && group.cuaHangId !== 'official-store') {
        this.duLieuService.getDanhSachVoucherShop(group.cuaHangId).subscribe({
          next: (vouchers) => {
            if (vouchers && vouchers.length > 0) {
              shopVouchers.push(...vouchers);
            }
            count++;
            if (count === nhomShops.length) {
              this.danhSachVoucherShop.set(shopVouchers.filter(x => x.kichHoat));
            }
          },
          error: () => {
            count++;
            if (count === nhomShops.length) {
              this.danhSachVoucherShop.set(shopVouchers.filter(x => x.kichHoat));
            }
          }
        });
      } else {
        count++;
        if (count === nhomShops.length) {
          this.danhSachVoucherShop.set(shopVouchers.filter(x => x.kichHoat));
        }
      }
    }
  }

  private khoiTaoForm(): void {
    const user = this.xacThucService.currentUser();
    const saved = this.xacThucService.layThongTinGiaoHang(user?.email || user?.id) || this.xacThucService.layThongTinGiaoHang();

    const tenDefault = user?.hoTen || saved?.hoTen || '';
    const sdtDefault = user?.soDienThoai || saved?.soDienThoai || '';
    const diaChiDefault = user?.diaChi || saved?.diaChi || '';

    this.formDatHang = this.fb.group({
      tenKhachHang: [tenDefault, [Validators.required, Validators.minLength(2)]],
      soDienThoai: [sdtDefault, [Validators.required, Validators.pattern(/^[0-9]{9,11}$/)]],
      diaChi: [diaChiDefault, [Validators.required, Validators.minLength(5)]],
      ghiChu: ['']
    });

    // Lắng nghe thay đổi: Khi người dùng sửa bất kỳ trường nào, tự động lưu lại để những lần mua sau tự động điền sẵn
    this.formDatHang.valueChanges.subscribe(val => {
      if (val.tenKhachHang || val.soDienThoai || val.diaChi) {
        this.xacThucService.luuThongTinGiaoHang({
          hoTen: val.tenKhachHang,
          soDienThoai: val.soDienThoai,
          diaChi: val.diaChi
        }, user?.email || user?.id);
      }
    });

    // Nếu sđt hoặc địa chỉ vẫn còn trống nhưng đã đăng nhập, tự động lấy từ đơn hàng gần nhất
    if ((!sdtDefault || !diaChiDefault) && user?.id) {
      this.duLieuService.getDonHangCuaKhachHang(user.id).subscribe({
        next: (orders) => {
          if (orders && orders.length > 0) {
            const donCuoi = orders[0];
            const updates: { tenKhachHang?: string; soDienThoai?: string; diaChi?: string } = {};
            if (!this.formDatHang.get('soDienThoai')?.value && donCuoi.soDienThoai) {
              updates.soDienThoai = donCuoi.soDienThoai;
            }
            if (!this.formDatHang.get('diaChi')?.value && donCuoi.diaChi) {
              updates.diaChi = donCuoi.diaChi;
            }
            if (!this.formDatHang.get('tenKhachHang')?.value && donCuoi.tenKhachHang) {
              updates.tenKhachHang = donCuoi.tenKhachHang;
            }
            if (Object.keys(updates).length > 0) {
              this.formDatHang.patchValue(updates, { emitEvent: false });
              this.xacThucService.luuThongTinGiaoHang(updates, user.email || user.id);
            }
          }
        },
        error: () => {}
      });
    }
  }

  // --- VOUCHER METHODS (MULTI-LAYER STACKING) ---
  apDungVoucher(codeTuChon?: string): void {
    const code = (codeTuChon || this.maVoucherNhap()).trim().toUpperCase();
    if (!code) {
      this.thongBaoVoucher.set({ hopLe: false, tinNhan: 'Vui lòng nhập mã giảm giá!' });
      return;
    }

    const tongTienDaChon = this.duLieuService.tongTienDaChon();
    this.dangKiemTraVoucher.set(true);
    this.duLieuService.kiemTraVoucher(code, tongTienDaChon).subscribe({
      next: (res) => {
        this.dangKiemTraVoucher.set(false);
        if (res.hopLe) {
          const soTienGiam = Number(res.soTienGiam ?? res.tienGiam ?? (res.voucher?.giaTriGiam) ?? 0);
          const isSan = res.laVoucherSan ?? (!res.voucher?.cuaHangId);

          if (isSan) {
            // Áp dụng vào slot VOUCHER TOÀN SÀN
            this.voucherSanDaChon.set(res.voucher || null);
            this.tienGiamVoucherSan.set(soTienGiam);
            this.thongBaoService.thanhCong(
              `Đã áp dụng Voucher Sàn ${code}! Giảm ${this.formatTien(soTienGiam)}.`,
              'Voucher Toàn Sàn'
            );
          } else {
            // Áp dụng vào slot VOUCHER GIAN HÀNG
            const nhomShops = this.duLieuService.nhomShopDaChon();
            const shopMatch = nhomShops.find(s => s.cuaHangId === res.cuaHangId);
            if (!shopMatch) {
              const msg = `Mã '${code}' thuộc gian hàng ${res.voucher?.tenCuaHang || 'khác'}, không có sản phẩm nào được chọn trong đơn thanh toán này!`;
              this.thongBaoVoucher.set({ hopLe: false, tinNhan: msg });
              this.thongBaoService.thatBai(msg, 'Voucher Gian Hàng');
              return;
            }

            // Tính tiền giảm dựa trên tổng tiền của shop này trong danh sách đã chọn
            const shopTotal = shopMatch.tongTienDaChon ?? shopMatch.tongTien;
            let shopDiscount = soTienGiam;
            if (res.voucher?.loaiGiamGia === 'PhanTram') {
              shopDiscount = Math.round(shopTotal * (res.voucher.giaTriGiam / 100));
              if (res.voucher.giamToiDa && shopDiscount > res.voucher.giamToiDa) {
                shopDiscount = res.voucher.giamToiDa;
              }
            } else if (res.voucher?.loaiGiamGia === 'SoTien') {
              shopDiscount = Math.min(shopTotal, res.voucher.giaTriGiam);
            }

            this.voucherShopDaChon.set(res.voucher || null);
            this.tienGiamVoucherShop.set(shopDiscount);
            this.thongBaoService.thanhCong(
              `Đã áp dụng Voucher Shop ${code} của ${res.voucher?.tenCuaHang || 'gian hàng'}! Giảm ${this.formatTien(shopDiscount)}.`,
              'Voucher Gian Hàng'
            );
          }

          this.maVoucherNhap.set('');
          this.thongBaoVoucher.set({
            hopLe: true,
            tinNhan: `Áp dụng thành công mã ${code}! Đã giảm ${this.formatTien(soTienGiam)}.`
          });
        } else {
          this.thongBaoVoucher.set({ hopLe: false, tinNhan: res.thongBao || 'Mã giảm giá không hợp lệ!' });
          this.thongBaoService.thatBai(res.thongBao || 'Mã giảm giá không hợp lệ!', 'Mã giảm giá');
        }
      },
      error: (err) => {
        this.dangKiemTraVoucher.set(false);
        const msg = trichXuatThongBaoLoi(err, 'Lỗi kiểm tra mã voucher!');
        this.thongBaoVoucher.set({ hopLe: false, tinNhan: msg });
        this.thongBaoService.thatBai(msg, 'Mã giảm giá');
      }
    });
  }

  boChonVoucherShop(): void {
    this.voucherShopDaChon.set(null);
    this.tienGiamVoucherShop.set(0);
    this.thongBaoService.thongTin('Đã hủy áp dụng Voucher của Shop.', 'Voucher');
  }

  boChonVoucherSan(): void {
    this.voucherSanDaChon.set(null);
    this.tienGiamVoucherSan.set(0);
    this.thongBaoService.thongTin('Đã hủy áp dụng Voucher của Sàn.', 'Voucher');
  }

  // --- VIETQR METHODS ---
  getVietQrUrl(maDon: string, soTien: number): string {
    const bankId = 'MB'; // MBBank code
    const accountNo = this.soTaiKhoanShop;
    const accountName = encodeURIComponent(this.chuTaiKhoanShop);
    const orderInfo = encodeURIComponent(maDon);
    return `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${soTien}&addInfo=${orderInfo}&accountName=${accountName}`;
  }

  saoChep(text: string, label: string): void {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        this.thongBaoService.thanhCong(`Đã sao chép ${label}: ${text}`, 'Sao chép');
      }).catch(() => {
        this.thongBaoService.thongTin(`${label}: ${text}`, 'Thông tin');
      });
    } else {
      this.thongBaoService.thongTin(`${label}: ${text}`, 'Thông tin');
    }
  }

  xacNhanDaChuyenKhoan(): void {
    this.hienModalVietQR = false;
    this.thongBaoService.thanhCong('Xác nhận thanh toán! Đơn hàng đang được hệ thống xử lý giao hàng.', 'Thanh toán thành công');
    this.router.navigate(['/don-hang-cua-toi']);
  }

  // --- TIẾN HÀNH ĐẶT HÀNG ---
  tienHanhDatHang(): void {
    // 1. Chặn Admin hệ thống đặt hàng
    if (this.xacThucService.laAdmin()) {
      this.thongBaoService.canhBao(
        'Tài khoản Quản Trị Viên Sàn (Admin) không tham gia mua hàng! Vui lòng đăng xuất và tạo tài khoản Người Mua riêng để đặt hàng.',
        'Chặn mua hàng'
      );
      this.router.navigate(['/admin/tong-quan']);
      return;
    }

    // 2. Bắt buộc đăng nhập
    if (!this.xacThucService.daDangNhap()) {
      this.thongBaoService.canhBao(
        'Bạn cần đăng nhập hoặc tạo tài khoản Khách Hàng để tiến hành đặt hàng!',
        'Yêu cầu đăng nhập'
      );
      this.router.navigate(['/dang-nhap'], {
        queryParams: { tab: 'dang-nhap', returnUrl: '/thanh-toan' }
      });
      return;
    }

    // 3. Kiểm tra danh sách món đã chọn
    if (this.duLieuService.cacMonDaChon().length === 0) {
      this.thongBaoService.thatBai('Bạn chưa chọn sản phẩm nào để thanh toán!', 'Thanh toán');
      this.router.navigate(['/gio-hang']);
      return;
    }

    // 4. Chặn chủ gian hàng mua hàng của chính mình
    const items = this.duLieuService.cacMonDaChon();
    const hasOwnItem = items.some(item => this.duLieuService.laSanPhamCuaShopToi(item.sanPham));
    if (hasOwnItem) {
      this.thongBaoService.thatBai(
        'Trong đơn hàng có sản phẩm thuộc gian hàng của bạn! Người bán không được phép tự mua hàng của chính mình.',
        'Chặn mua hàng'
      );
      return;
    }

    // 5. Kiểm tra form
    if (this.formDatHang.invalid) {
      this.formDatHang.markAllAsTouched();
      this.thongBaoService.thatBai('Vui lòng kiểm tra lại thông tin nhận hàng!', 'Đặt hàng');
      return;
    }

    const user = this.xacThucService.currentUser();
    const val = this.formDatHang.value;

    // Lưu lại thông tin nhận hàng người dùng vừa dùng để tự động điền cho lần mua sau
    this.xacThucService.luuThongTinGiaoHang({
      hoTen: val.tenKhachHang,
      soDienThoai: val.soDienThoai,
      diaChi: val.diaChi
    }, user?.email || user?.id);

    this.dangDatHang = true;
    this.duLieuService.datHang({
      nguoiDungId: user?.id,
      tenKhachHang: val.tenKhachHang,
      soDienThoai: val.soDienThoai,
      diaChi: val.diaChi,
      ghiChu: val.ghiChu,
      maVoucherSan: this.voucherSanDaChon()?.maVoucher,
      tienGiamVoucherSan: this.tienGiamVoucherSan(),
      maVoucherShop: this.voucherShopDaChon()?.maVoucher,
      tienGiamVoucherShop: this.tienGiamVoucherShop(),
      maVoucher: this.voucherSanDaChon()?.maVoucher || this.voucherShopDaChon()?.maVoucher,
      tienGiamVoucher: this.tongGiamVoucher(),
      phuongThucThanhToan: this.phuongThucThanhToan
    }).subscribe({
      next: (donHangTong) => {
        this.dangDatHang = false;
        const maDonHienThi = donHangTong.maDonTong || (donHangTong as any).maDon || 'MALL-ORDER';
        this.datHangThanhCongDonHang = maDonHienThi;
        this.donHangTongVuaTao = donHangTong;

        if (this.phuongThucThanhToan === 'ChuyenKhoan') {
          this.hienModalVietQR = true;
        } else {
          this.thongBaoService.thanhCong(
            `Đơn hàng #${maDonHienThi} đã được tạo thành công!`,
            'Đặt hàng thành công'
          );
        }
      },
      error: (err) => {
        this.dangDatHang = false;
        const msg = trichXuatThongBaoLoi(err, 'Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại!');
        this.thongBaoService.thatBai(msg, 'Đặt hàng thất bại');
      }
    });
  }

  formatTien(gia: number | undefined | null): string {
    const val = Number(gia || 0);
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(isNaN(val) ? 0 : val);
  }
}
