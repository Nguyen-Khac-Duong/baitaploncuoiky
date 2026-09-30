import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { XacThucService } from '../../he-thong/dich-vu/xac-thuc.service';
import { ThongBaoService } from '../../he-thong/dich-vu/thong-bao.service';
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
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  tabHienTai: 'dang-nhap' | 'dang-ky' = 'dang-nhap';

  // Form Đăng Nhập
  readonly formDangNhap: FormGroup = this.fb.group({
    email: ['admin@gmail.com', [Validators.required, Validators.email]],
    matKhau: ['123456', [Validators.required, Validators.minLength(6)]]
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

  ngOnInit(): void {
    // Đọc query param từ URL để tự động chuyển tab
    this.route.queryParams.subscribe(params => {
      if (params['tab'] === 'dang-ky') {
        this.tabHienTai = 'dang-ky';
      } else if (params['tab'] === 'dang-nhap') {
        this.tabHienTai = 'dang-nhap';
      }

      if (params['vaiTro'] === 'admin') {
        this.chonTaiKhoanMau('admin@gmail.com', '123456');
      } else if (params['vaiTro'] === 'khach_hang') {
        this.chonTaiKhoanMau('khachhang@gmail.com', '123456');
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

  chonTaiKhoanMau(email: string, matKhau: string): void {
    this.tabHienTai = 'dang-nhap';
    this.formDangNhap.patchValue({ email, matKhau });
    this.loiDangNhap = false;
  }

  xuLyDangNhap(): void {
    if (this.formDangNhap.invalid) {
      this.formDangNhap.markAllAsTouched();
      this.thongBaoService.thatBai('Vui lòng điền đúng định dạng email và mật khẩu!', 'Đăng nhập');
      return;
    }

    const { email, matKhau } = this.formDangNhap.value;
    const user = this.xacThucService.dangNhap(email, matKhau);

    if (user) {
      this.loiDangNhap = false;
      const vaiTroText = user.vaiTro === 'admin' ? 'Người Bán (Admin)' : 'Người Mua (Khách Hàng)';
      this.thongBaoService.thanhCong(
        `Chào mừng ${user.hoTen} (${vaiTroText}) đã đăng nhập thành công!`,
        'Đăng nhập thành công'
      );

      // Phân quyền điều hướng rõ ràng, ưu tiên returnUrl nếu có
      const returnUrl = this.route.snapshot.queryParams['returnUrl'];
      if (user.vaiTro === 'admin') {
        this.router.navigateByUrl(returnUrl && returnUrl.startsWith('/admin') ? returnUrl : '/admin/tong-quan');
      } else {
        this.router.navigateByUrl(returnUrl && !returnUrl.startsWith('/admin') ? returnUrl : '/cua-hang');
      }
    } else {
      this.loiDangNhap = true;
      this.thongBaoLoiDangNhap = 'Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại!';
      this.thongBaoService.thatBai(this.thongBaoLoiDangNhap, 'Đăng nhập thất bại');
    }
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
    const ketQua = this.xacThucService.dangKy({
      hoTen: val.hoTen,
      email: val.email,
      matKhau: val.matKhau,
      soDienThoai: val.soDienThoai,
      diaChi: val.diaChi
    });

    if (ketQua.thanhCong && ketQua.user) {
      this.thongBaoService.thanhCong(ketQua.thongBao, 'Đăng ký thành công');
      // Tài khoản khách hàng điều hướng về returnUrl (ví dụ /gio-hang) hoặc /cua-hang
      const returnUrl = this.route.snapshot.queryParams['returnUrl'];
      this.router.navigateByUrl(returnUrl && !returnUrl.startsWith('/admin') ? returnUrl : '/cua-hang');
    } else {
      this.loiDangNhap = true;
      this.thongBaoLoiDangNhap = ketQua.thongBao;
      this.thongBaoService.thatBai(ketQua.thongBao, 'Đăng ký thất bại');
    }
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