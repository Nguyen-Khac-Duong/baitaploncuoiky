import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { XacThucService } from '../../he-thong/dich-vu/xac-thuc.service';
import { DuLieuService } from '../../he-thong/dich-vu/du-lieu.service';
import { ThongBaoService } from '../../he-thong/dich-vu/thong-bao.service';
import { DiaChiNhanHang, VoucherItem } from '../../shared/mo-hinh/du-lieu.model';

@Component({
  selector: 'app-tai-khoan',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, FormsModule],
  templateUrl: './tai-khoan.component.html',
  styleUrl: './tai-khoan.component.scss'
})
export class TaiKhoanComponent implements OnInit {
  readonly xacThucService = inject(XacThucService);
  readonly duLieuService = inject(DuLieuService);
  private readonly thongBaoService = inject(ThongBaoService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // Tab đang hoạt động
  readonly tabHienTai = signal<'hoso' | 'diachi' | 'matkhau' | 'voucher' | 'shop'>('hoso');

  // === 1. HỒ SƠ CÁ NHÂN ===
  formHoSo!: FormGroup;
  dangLuuHoSo: boolean = false;
  avatarTamThoi: string | null = null;
  dangTaiAvatar: boolean = false;

  // === 2. SỔ ĐỊA CHỈ ===
  readonly danhSachDiaChi = signal<DiaChiNhanHang[]>([]);
  hienModalDiaChi: boolean = false;
  formDiaChi!: FormGroup;
  diaChiDangSuaId: string | null = null;
  dangLuuDiaChi: boolean = false;

  // === 3. ĐỔI MẬT KHẨU ===
  formDoiMatKhau!: FormGroup;
  dangDoiMatKhau: boolean = false;

  // === 4. KHO VOUCHER ===
  readonly danhSachVoucherSan = signal<VoucherItem[]>([]);
  readonly danhSachVoucherShop = signal<VoucherItem[]>([]);
  readonly boLocVoucher = signal<'all' | 'san' | 'shop'>('all');

  readonly voucherHienThi = computed(() => {
    const loc = this.boLocVoucher();
    const san = this.danhSachVoucherSan();
    const shop = this.danhSachVoucherShop();

    if (loc === 'san') return san;
    if (loc === 'shop') return shop;
    return [...san, ...shop];
  });

  // === 5. TRẠNG THÁI GIAN HÀNG (MỞ SHOP) ===
  formDangKyShop!: FormGroup;
  dangMoShop: boolean = false;

  ngOnInit(): void {
    // Bắt buộc đăng nhập
    if (!this.xacThucService.daDangNhap()) {
      this.thongBaoService.canhBao('Vui lòng đăng nhập để quản lý cài đặt tài khoản!', 'Yêu cầu đăng nhập');
      this.router.navigate(['/dang-nhap'], { queryParams: { tab: 'dang-nhap', returnUrl: '/tai-khoan' } });
      return;
    }

    // Đọc query param tab nếu có
    this.route.queryParams.subscribe(params => {
      const tab = params['tab'];
      if (tab && ['hoso', 'diachi', 'matkhau', 'voucher', 'shop'].includes(tab)) {
        this.tabHienTai.set(tab as 'hoso' | 'diachi' | 'matkhau' | 'voucher' | 'shop');
      }
    });

    this.khoiTaoForms();
    this.taiDuLieuTab();
  }

  doiTab(tab: 'hoso' | 'diachi' | 'matkhau' | 'voucher' | 'shop'): void {
    this.tabHienTai.set(tab);
  }

  private khoiTaoForms(): void {
    const user = this.xacThucService.currentUser();

    // 1. Form hồ sơ
    this.formHoSo = this.fb.group({
      hoTen: [user?.hoTen || '', [Validators.required, Validators.minLength(2)]],
      soDienThoai: [user?.soDienThoai || '', [Validators.pattern(/^[0-9]{9,11}$/)]],
      avatar: [user?.avatar || '']
    });
    this.avatarTamThoi = user?.avatar || null;

    // 2. Form địa chỉ
    this.formDiaChi = this.fb.group({
      hoTen: ['', [Validators.required, Validators.minLength(2)]],
      soDienThoai: ['', [Validators.required, Validators.pattern(/^[0-9]{9,11}$/)]],
      diaChiChiTiet: ['', [Validators.required, Validators.minLength(5)]],
      loaiDiaChi: ['NhaRieng'],
      laMacDinh: [false]
    });

    // 3. Form đổi mật khẩu
    this.formDoiMatKhau = this.fb.group({
      matKhauHienTai: ['', [Validators.required, Validators.minLength(6)]],
      matKhauMoi: ['', [Validators.required, Validators.minLength(6)]],
      xacNhanMatKhau: ['', [Validators.required]]
    }, { validators: this.kiemTraKhopMatKhau });

    // 4. Form đăng ký mở Shop
    this.formDangKyShop = this.fb.group({
      ten: ['', [Validators.required, Validators.minLength(3)]],
      slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]],
      soDienThoai: [user?.soDienThoai || '', [Validators.required, Validators.pattern(/^[0-9]{9,11}$/)]],
      email: [user?.email || '', [Validators.required, Validators.email]],
      diaChi: ['', [Validators.required, Validators.minLength(5)]],
      soTaiKhoanNganHang: ['', [Validators.required, Validators.minLength(6)]],
      tenNganHang: ['MBBank (Ngân hàng Quân Đội)', [Validators.required]],
      tenChuTaiKhoan: [user?.hoTen || '', [Validators.required, Validators.minLength(2)]],
      moTa: ['']
    });
  }

  private kiemTraKhopMatKhau(control: AbstractControl): ValidationErrors | null {
    const pass = control.get('matKhauMoi')?.value;
    const confirm = control.get('xacNhanMatKhau')?.value;
    return pass && confirm && pass !== confirm ? { matKhauKhongKhop: true } : null;
  }

  taiDuLieuTab(): void {
    // Tải sổ địa chỉ
    const addrs = this.xacThucService.getDanhSachDiaChi();
    this.danhSachDiaChi.set(addrs);

    // Tải danh sách voucher sàn
    this.duLieuService.getDanhSachVoucherSan().subscribe({
      next: (res) => this.danhSachVoucherSan.set((res || []).filter(x => x.kichHoat)),
      error: () => {}
    });

    // Tải danh sách voucher các shop
    this.duLieuService.getDanhSachVouchers().subscribe({
      next: (res) => this.danhSachVoucherShop.set((res || []).filter(x => x.kichHoat && x.cuaHangId)),
      error: () => {}
    });

    // Đảm bảo thông tin shop của tôi được đồng bộ
    this.duLieuService.taiThongTinShopCuaToi();
  }

  // === 1. CẬP NHẬT HỒ SƠ ===
  chonFileAvatar(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (file.size > 5 * 1024 * 1024) {
        this.thongBaoService.canhBao('Kích thước ảnh tối đa là 5MB!', 'Ảnh đại diện');
        return;
      }
      this.dangTaiAvatar = true;
      this.duLieuService.uploadHinhAnh(file).subscribe({
        next: (res) => {
          this.dangTaiAvatar = false;
          this.avatarTamThoi = res.url;
          this.formHoSo.patchValue({ avatar: res.url });
          this.thongBaoService.thanhCong('Tải ảnh đại diện lên thành công! Nhớ bấm Lưu thay đổi.', 'Avatar');
        },
        error: () => {
          this.dangTaiAvatar = false;
          this.thongBaoService.thatBai('Không thể tải ảnh lên. Vui lòng thử lại!', 'Avatar');
        }
      });
    }
  }

  luuHoSo(): void {
    if (this.formHoSo.invalid) {
      this.formHoSo.markAllAsTouched();
      this.thongBaoService.thatBai('Vui lòng kiểm tra lại thông tin hồ sơ!', 'Hồ sơ');
      return;
    }

    this.dangLuuHoSo = true;
    const val = this.formHoSo.value;

    this.xacThucService.capNhatHoSo({
      hoTen: val.hoTen,
      soDienThoai: val.soDienThoai,
      avatar: this.avatarTamThoi || undefined
    }).subscribe({
      next: (res) => {
        this.dangLuuHoSo = false;
        if (res.thanhCong) {
          this.thongBaoService.thanhCong(res.thongBao, 'Cập nhật hồ sơ');
        } else {
          this.thongBaoService.thatBai(res.thongBao, 'Cập nhật thất bại');
        }
      },
      error: () => {
        this.dangLuuHoSo = false;
        this.thongBaoService.thatBai('Lỗi lưu hồ sơ cá nhân. Vui lòng thử lại!', 'Hồ sơ');
      }
    });
  }

  // === 2. SỔ ĐỊA CHỈ NHẬN HÀNG ===
  moModalThemDiaChi(): void {
    const user = this.xacThucService.currentUser();
    this.diaChiDangSuaId = null;
    this.formDiaChi.reset({
      hoTen: user?.hoTen || '',
      soDienThoai: user?.soDienThoai || '',
      diaChiChiTiet: '',
      loaiDiaChi: 'NhaRieng',
      laMacDinh: this.danhSachDiaChi().length === 0
    });
    this.hienModalDiaChi = true;
  }

  moModalSuaDiaChi(addr: DiaChiNhanHang): void {
    this.diaChiDangSuaId = addr.id;
    this.formDiaChi.reset({
      hoTen: addr.hoTen,
      soDienThoai: addr.soDienThoai,
      diaChiChiTiet: addr.diaChiChiTiet,
      loaiDiaChi: addr.loaiDiaChi || 'NhaRieng',
      laMacDinh: addr.laMacDinh
    });
    this.hienModalDiaChi = true;
  }

  dongModalDiaChi(): void {
    this.hienModalDiaChi = false;
    this.diaChiDangSuaId = null;
  }

  luuDiaChi(): void {
    if (this.formDiaChi.invalid) {
      this.formDiaChi.markAllAsTouched();
      this.thongBaoService.thatBai('Vui lòng điền đủ họ tên, SĐT và địa chỉ!', 'Địa chỉ');
      return;
    }

    this.dangLuuDiaChi = true;
    const val = this.formDiaChi.value;

    const updated = this.xacThucService.themHoacCapNhatDiaChi({
      id: this.diaChiDangSuaId || undefined,
      hoTen: val.hoTen,
      soDienThoai: val.soDienThoai,
      diaChiChiTiet: val.diaChiChiTiet,
      loaiDiaChi: val.loaiDiaChi,
      laMacDinh: val.laMacDinh
    });

    this.danhSachDiaChi.set(updated);
    this.dangLuuDiaChi = false;
    this.hienModalDiaChi = false;
    this.thongBaoService.thanhCong(
      this.diaChiDangSuaId ? 'Đã cập nhật địa chỉ nhận hàng!' : 'Đã thêm địa chỉ nhận hàng mới!',
      'Sổ địa chỉ'
    );
  }

  xoaDiaChi(id: string): void {
    if (confirm('Bạn có chắc muốn xóa địa chỉ nhận hàng này?')) {
      const updated = this.xacThucService.xoaDiaChi(id);
      this.danhSachDiaChi.set(updated);
      this.thongBaoService.thongTin('Đã xóa địa chỉ khỏi sổ địa chỉ.', 'Sổ địa chỉ');
    }
  }

  datLamMacDinh(id: string): void {
    const updated = this.xacThucService.datDiaChiMacDinh(id);
    this.danhSachDiaChi.set(updated);
    this.thongBaoService.thanhCong('Đã thiết lập làm địa chỉ nhận hàng mặc định!', 'Sổ địa chỉ');
  }

  // === 3. ĐỔI MẬT KHẨU ===
  xuLyDoiMatKhau(): void {
    if (this.formDoiMatKhau.invalid) {
      this.formDoiMatKhau.markAllAsTouched();
      this.thongBaoService.thatBai('Vui lòng kiểm tra lại thông tin mật khẩu!', 'Đổi mật khẩu');
      return;
    }

    this.dangDoiMatKhau = true;
    const val = this.formDoiMatKhau.value;

    this.xacThucService.doiMatKhau(val.matKhauHienTai, val.matKhauMoi).subscribe({
      next: (res) => {
        this.dangDoiMatKhau = false;
        if (res.thanhCong) {
          this.thongBaoService.thanhCong(res.thongBao, 'Đổi mật khẩu');
          this.formDoiMatKhau.reset();
        } else {
          this.thongBaoService.thatBai(res.thongBao, 'Đổi mật khẩu');
        }
      },
      error: () => {
        this.dangDoiMatKhau = false;
        this.thongBaoService.thatBai('Lỗi hệ thống khi đổi mật khẩu. Vui lòng thử lại!', 'Đổi mật khẩu');
      }
    });
  }

  // === 4. KHO VOUCHER ===
  saoChepMaVoucher(code: string): void {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code).then(() => {
        this.thongBaoService.thanhCong(`Đã sao chép mã "${code}"! Áp dụng tại trang thanh toán để nhận ưu đãi.`, 'Sao chép');
      }).catch(() => {
        this.thongBaoService.thongTin(`Mã voucher: ${code}`, 'Mã giảm giá');
      });
    } else {
      this.thongBaoService.thongTin(`Mã voucher: ${code}`, 'Mã giảm giá');
    }
  }

  // === 5. KÍCH HOẠT MỞ GIAN HÀNG ===
  tuDongTaoSlug(): void {
    const ten = this.formDangKyShop.get('ten')?.value || '';
    const slug = ten
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    this.formDangKyShop.patchValue({ slug });
  }

  xuLyDangKyShop(): void {
    if (this.formDangKyShop.invalid) {
      this.formDangKyShop.markAllAsTouched();
      this.thongBaoService.thatBai('Vui lòng kiểm tra lại thông tin mở gian hàng!', 'Mở Shop');
      return;
    }

    this.dangMoShop = true;
    this.duLieuService.dangKyCuaHang(this.formDangKyShop.value).subscribe({
      next: (shop) => {
        this.dangMoShop = false;
        this.thongBaoService.thanhCong('🎉 Chúc mừng bạn đã mở Gian Hàng thành công!', 'Kênh Người Bán');
        this.duLieuService.taiThongTinShopCuaToi();
        this.router.navigate(['/seller']);
      },
      error: (err) => {
        this.dangMoShop = false;
        const msg = err.error?.error?.message || err.error?.message || 'Đăng ký gian hàng thất bại. Vui lòng thử lại!';
        this.thongBaoService.thatBai(msg, 'Mở Shop thất bại');
      }
    });
  }

  formatTien(gia: number | undefined | null): string {
    const val = Number(gia || 0);
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(isNaN(val) ? 0 : val);
  }
}
