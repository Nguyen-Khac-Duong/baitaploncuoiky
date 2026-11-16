
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { XacThucService } from '../../he-thong/dich-vu/xac-thuc.service';
import { ThongBaoService } from '../../he-thong/dich-vu/thong-bao.service';
import { SellerStateService } from '../../seller/services/seller-state.service';
import { VaiTroNguoiDung } from '../../shared/mo-hinh/du-lieu.model';

@Component({
  selector: 'app-dang-nhap',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './dang-nhap.component.html',
  styleUrl: './dang-nhap.component.scss'
})
export class DangNhapComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly xacThucService = inject(XacThucService);
  private readonly thongBaoService = inject(ThongBaoService);
  private readonly sellerState = inject(SellerStateService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  tabHienTai: 'dang-nhap' | 'dang-ky' = 'dang-nhap';

  // Form Đăng Nhập (Hỗ trợ cả Username 'admin' và Email - 🔴 F1)
  readonly formDangNhap: FormGroup = this.fb.group({
    email: ['', [Validators.required]],
    matKhau: ['', [Validators.required, Validators.minLength(6)]]
  });

  // Form Đăng Ký Khách Hàng (Người Mua)
  readonly formDangKy: FormGroup = this.fb.group({
    hoTen: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    soDienThoai: ['', [Validators.required, Validators.pattern(/^[0-9]{9,11}$/)]],
    diaChi: ['', [Validators.required, Validators.minLength(5)]],
    matKhau: ['', [Validators.required, Validators.minLength(6)]],
    xacNhanMatKhau: ['', [Validators.required]]
  }, { validators: this.kiemTraKhopMatKhau });

  loiDangNhap: boolean = false;
  thongBaoLoiDangNhap: string = '';
  dangXuLy: boolean = false;

  ngOnInit(): void {
    // Đọc query param từ URL để tự động chuyển tab
    this.route.queryParams.subscribe(params => {
      if (params['tab'] === 'dang-ky') {
        this.tabHienTai = 'dang-ky';
      } else if (params['tab'] === 'dang-nhap') {
        this.tabHienTai = 'dang-nhap';
      }
    });
  }

  doiTab(tab: 'dang-nhap' | 'dang-ky'): void {
    this.tabHienTai = tab;
    this.loiDangNhap = false;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab },
      queryParamsHandling: 'merge'
    });
  }

  // === ĐĂNG NHẬP ===
  get emailControl() {
    return this.formDangNhap.get('email');
  }

  get matKhauControl() {
    return this.formDangNhap.get('matKhau');
  }

  xuLyDangNhap(): void {
    if (this.formDangNhap.invalid) {
      this.formDangNhap.markAllAsTouched();
      this.thongBaoService.thatBai('Vui lòng điền đúng định dạng email và mật khẩu!', 'Đăng nhập');
      return;
    }

    const { email, matKhau } = this.formDangNhap.value;
    this.dangXuLy = true;
    this.loiDangNhap = false;

    this.xacThucService.dangNhap(email, matKhau).subscribe({
      next: (user) => {
        this.dangXuLy = false;
        if (user) {
          this.loiDangNhap = false;
          const returnUrl = this.route.snapshot.queryParams['returnUrl'];

          // 1. Phân quyền Platform Admin
          if (user.vaiTro === 'admin') {
            this.thongBaoService.thanhCong(
              `Chào mừng ${user.hoTen} (Quản Trị Viên Sàn)!`,
              'Đăng nhập thành công'
            );
            this.router.navigateByUrl('/admin/tong-quan');
            return;
          }

          // 2. Người dùng thông thường (Khách hàng / Chủ shop)
          this.sellerState.taiThongTinShop().subscribe({
            next: (shop) => {
              if (shop && shop.trangThai === 'HoatDong' && (!returnUrl || returnUrl === '/seller')) {
                this.thongBaoService.thanhCong(
                  `Chào mừng Shop "${shop.ten}" vào Kênh Người Bán!`,
                  'Đăng nhập thành công'
                );
                this.router.navigateByUrl('/seller/tong-quan');
              } else {
                this.thongBaoService.thanhCong(
                  `Chào mừng ${user.hoTen} đã đăng nhập!`,
                  'Đăng nhập thành công'
                );
                this.router.navigateByUrl(returnUrl && !returnUrl.startsWith('/admin') ? returnUrl : '/cua-hang');
              }
            },
            error: () => {
              this.router.navigateByUrl(returnUrl && !returnUrl.startsWith('/admin') ? returnUrl : '/cua-hang');
            }
          });
        } else {
          this.loiDangNhap = true;
          this.thongBaoLoiDangNhap = 'Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại!';
          this.thongBaoService.thatBai(this.thongBaoLoiDangNhap, 'Đăng nhập thất bại');
        }
      },
      error: () => {
        this.dangXuLy = false;
        this.loiDangNhap = true;
        this.thongBaoLoiDangNhap = 'Không thể kết nối đến máy chủ xác thực. Vui lòng thử lại!';
        this.thongBaoService.thatBai(this.thongBaoLoiDangNhap, 'Lỗi kết nối');
      }
    });
  }

  // === ĐĂNG KÝ ===
  get dkControls() {
    return this.formDangKy.controls;
  }

  xuLyDangKy(): void {
    if (this.formDangKy.invalid) {
      this.formDangKy.markAllAsTouched();
      this.thongBaoService.thatBai('Vui lòng kiểm tra lại các trường thông tin đăng ký!', 'Đăng ký');
      return;
    }

    const val = this.formDangKy.value;
    this.dangXuLy = true;

    this.xacThucService.dangKy({
      hoTen: val.hoTen,
      email: val.email,
      matKhau: val.matKhau,
      soDienThoai: val.soDienThoai,
      diaChi: val.diaChi
    }).subscribe({
      next: (ketQua) => {
        this.dangXuLy = false;
        if (ketQua.thanhCong) {
          this.thongBaoService.thanhCong(ketQua.thongBao, 'Đăng ký thành công');
          this.formDangKy.reset();
          this.doiTab('dang-nhap');
        } else {
          this.loiDangNhap = true;
          this.thongBaoLoiDangNhap = ketQua.thongBao;
          this.thongBaoService.thatBai(ketQua.thongBao, 'Đăng ký thất bại');
        }
      },
      error: (err) => {
        this.dangXuLy = false;
        const msg = err.error?.error?.message || 'Có lỗi xảy ra khi tạo tài khoản!';
        this.thongBaoService.thatBai(msg, 'Đăng ký thất bại');
      }
    });
  }

  private kiemTraKhopMatKhau(control: AbstractControl): { [key: string]: boolean } | null {
    const mk = control.get('matKhau');
    const xnMk = control.get('xacNhanMatKhau');
    if (mk && xnMk && mk.value !== xnMk.value) {
      xnMk.setErrors({ khongKhop: true });
      return { khongKhop: true };
    }
    return null;
  }
}