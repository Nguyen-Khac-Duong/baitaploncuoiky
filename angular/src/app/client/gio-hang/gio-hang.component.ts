import { Component, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DuLieuService } from '../../he-thong/dich-vu/du-lieu.service';
import { XacThucService } from '../../he-thong/dich-vu/xac-thuc.service';
import { ThongBaoService } from '../../he-thong/dich-vu/thong-bao.service';

@Component({
  selector: 'app-gio-hang',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './gio-hang.component.html',
  styleUrl: './gio-hang.component.scss'
})
export class GioHangComponent implements OnInit {
  readonly duLieuService = inject(DuLieuService);
  readonly xacThucService = inject(XacThucService);
  private readonly thongBaoService = inject(ThongBaoService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  formDatHang!: FormGroup;
  datHangThanhCongDonHang: string | null = null;

  constructor() {
    effect(() => {
      const user = this.xacThucService.currentUser();
      if (user && this.formDatHang) {
        this.formDatHang.patchValue({
          tenKhachHang: user.hoTen || '',
          soDienThoai: user.soDienThoai || '',
          diaChi: user.diaChi || ''
        });
      }
    });
  }

  ngOnInit(): void {
    this.khoiTaoForm();
  }

  private khoiTaoForm(): void {
    const user = this.xacThucService.currentUser();

    this.formDatHang = this.fb.group({
      tenKhachHang: [user?.hoTen || '', [Validators.required, Validators.minLength(2)]],
      soDienThoai: [user?.soDienThoai || '', [Validators.required, Validators.pattern(/^[0-9]{9,11}$/)]],
      diaChi: [user?.diaChi || '', [Validators.required, Validators.minLength(5)]],
      ghiChu: ['']
    });
  }

  tangSoLuong(sanPhamId: string, soLuongHienTai: number, soLuongTon: number): void {
    if (soLuongHienTai < soLuongTon) {
      this.duLieuService.capNhatSoLuongGioHang(sanPhamId, soLuongHienTai + 1);
    } else {
      this.thongBaoService.canhBao('Đã đạt số lượng tồn kho tối đa!', 'Giỏ hàng');
    }
  }

  giamSoLuong(sanPhamId: string, soLuongHienTai: number): void {
    this.duLieuService.capNhatSoLuongGioHang(sanPhamId, soLuongHienTai - 1);
  }

  xoaMon(sanPhamId: string): void {
    this.duLieuService.xoaKhoiGioHang(sanPhamId);
    this.thongBaoService.thongTin('Đã xóa sản phẩm khỏi giỏ hàng', 'Giỏ hàng');
  }

  tienHanhDatHang(): void {
    // 1. Bắt buộc đăng nhập: Khách xem hàng chưa đăng nhập không thể đặt hàng
    if (!this.xacThucService.daDangNhap()) {
      this.thongBaoService.canhBao(
        'Bạn cần đăng nhập hoặc tạo tài khoản Khách Hàng để tiến hành đặt hàng!',
        'Yêu cầu đăng nhập'
      );
      this.router.navigate(['/dang-nhap'], {
        queryParams: { tab: 'dang-nhap', returnUrl: '/gio-hang' }
      });
      return;
    }

    // 2. Kiểm tra tính hợp lệ của thông tin nhận hàng
    if (this.formDatHang.invalid) {
      this.formDatHang.markAllAsTouched();
      this.thongBaoService.thatBai('Vui lòng kiểm tra lại thông tin nhận hàng!', 'Đặt hàng');
      return;
    }

    const user = this.xacThucService.currentUser();
    const val = this.formDatHang.value;

    // 3. Tiến hành đặt hàng liên kết chặt chẽ với tài khoản Khách Hàng
    const donHang = this.duLieuService.datHang({
      nguoiDungId: user?.id,
      tenKhachHang: val.tenKhachHang,
      soDienThoai: val.soDienThoai,
      diaChi: val.diaChi,
      ghiChu: val.ghiChu
    });

    if (donHang) {
      this.datHangThanhCongDonHang = donHang.maDon;
      this.thongBaoService.thanhCong(
        `Đơn hàng #${donHang.maDon} đã được tạo thành công! Bạn có thể xem ngay tại "Đơn Hàng Của Tôi".`,
        'Đặt hàng thành công'
      );
    }
  }

  formatTien(gia: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(gia);
  }
}
