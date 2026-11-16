import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzTabsModule } from 'ng-zorro-antd/tabs';

import { DuLieuService } from '../he-thong/dich-vu/du-lieu.service';
import { XacThucService } from '../he-thong/dich-vu/xac-thuc.service';
import {
  CuaHang,
  ViCuaHang,
  GiaoDichVi,
  YeuCauRutTien,
  SanPham,
  DonHang,
  ThongKeDashboard,
  TrangThaiDonHang
} from '../shared/mo-hinh/du-lieu.model';
import { trichXuatThongBaoLoi } from '../he-thong/tien-ich/loi-api.helper';

@Component({
  selector: 'app-seller',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    NzModalModule,
    NzButtonModule,
    NzTableModule,
    NzTagModule,
    NzCardModule,
    NzStatisticModule,
    NzTabsModule
  ],
  templateUrl: './seller.component.html',
  styleUrl: './seller.component.scss'
})
export class SellerComponent implements OnInit {
  private readonly duLieuService = inject(DuLieuService);
  readonly xacThucService = inject(XacThucService);
  private readonly fb = inject(FormBuilder);
  private readonly message = inject(NzMessageService);
  private readonly router = inject(Router);

  readonly dangTai = signal<boolean>(true);
  readonly cuaHang = signal<CuaHang | null>(null);
  readonly viCuaHang = signal<ViCuaHang | null>(null);
  readonly thongKe = signal<ThongKeDashboard | null>(null);
  readonly sanPhamList = signal<SanPham[]>([]);
  readonly donHangList = signal<DonHang[]>([]);
  readonly giaoDichList = signal<GiaoDichVi[]>([]);
  readonly rutTienList = signal<YeuCauRutTien[]>([]);

  activeTab = 'tong-quan';
  hienModalRutTien = false;
  hienModalSanPham = false;
  hienModalNganHang = false;
  sanPhamDangSua: SanPham | null = null;
  dangXuLy = false;

  formDangKyShop: FormGroup;
  formRutTien: FormGroup;
  formSanPham: FormGroup;
  formNganHang: FormGroup;

  constructor() {
    this.formDangKyShop = this.fb.group({
      ten: ['', [Validators.required, Validators.maxLength(256)]],
      slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]],
      soDienThoai: ['', [Validators.required, Validators.maxLength(32)]],
      email: ['', [Validators.required, Validators.email]],
      diaChi: ['', [Validators.required, Validators.maxLength(512)]],
      moTa: ['']
    });

    this.formRutTien = this.fb.group({
      soTien: [100000, [Validators.required, Validators.min(50000)]],
      ghiChu: ['']
    });

    this.formSanPham = this.fb.group({
      maSp: ['', [Validators.required, Validators.maxLength(32)]],
      ten: ['', [Validators.required, Validators.maxLength(256)]],
      gia: [0, [Validators.required, Validators.min(1000)]],
      soLuongTon: [10, [Validators.required, Validators.min(0)]],
      danhMuc: ['Điện thoại', [Validators.required]],
      hinhAnh: [''],
      moTa: ['']
    });

    this.formNganHang = this.fb.group({
      tenNganHang: ['', [Validators.required]],
      soTaiKhoanNganHang: ['', [Validators.required]],
      tenChuTaiKhoan: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    if (!this.xacThucService.daDangNhap()) {
      this.router.navigate(['/dang-nhap'], { queryParams: { returnUrl: '/seller' } });
      return;
    }
    this.taiThongTinGianHang();
  }

  taiThongTinGianHang(): void {
    this.dangTai.set(true);
    this.duLieuService.getMyStore().subscribe({
      next: (shop) => {
        this.cuaHang.set(shop);
        if (shop) {
          this.formNganHang.patchValue({
            tenNganHang: shop.tenNganHang || '',
            soTaiKhoanNganHang: shop.soTaiKhoanNganHang || '',
            tenChuTaiKhoan: shop.tenChuTaiKhoan || ''
          });
          this.taiDuLieuChiTietShop();
        } else {
          // Điền sẵn thông tin user vào form đăng ký shop
          const user = this.xacThucService.currentUser();
          if (user) {
            this.formDangKyShop.patchValue({
              ten: `${user.hoTen} Store`,
              slug: user.hoTen.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.floor(Math.random() * 1000),
              soDienThoai: user.soDienThoai || '',
              email: user.email,
              diaChi: user.diaChi || ''
            });
          }
          this.dangTai.set(false);
        }
      },
      error: (err) => {
        this.dangTai.set(false);
        this.message.error(trichXuatThongBaoLoi(err, 'Lỗi nạp thông tin gian hàng!'));
      }
    });
  }

  taiDuLieuChiTietShop(): void {
    this.duLieuService.getMyWallet().subscribe({
      next: (wallet) => this.viCuaHang.set(wallet),
      error: (e) => console.warn('Lỗi tải ví:', e)
    });

    this.duLieuService.getThongKeMyStore().subscribe({
      next: (stats) => this.thongKe.set(stats),
      error: (e) => console.warn('Lỗi thống kê:', e)
    });

    this.duLieuService.getMyStoreProducts().subscribe({
      next: (prods) => this.sanPhamList.set(prods),
      error: (e) => console.warn('Lỗi sản phẩm:', e)
    });

    this.duLieuService.getMyStoreOrders().subscribe({
      next: (orders) => this.donHangList.set(orders),
      error: (e) => console.warn('Lỗi đơn hàng:', e)
    });

    this.duLieuService.getMyTransactions().subscribe({
      next: (res) => this.giaoDichList.set(res.items || []),
      error: (e) => console.warn('Lỗi giao dịch:', e)
    });

    this.duLieuService.getMyPayoutRequests().subscribe({
      next: (res) => this.rutTienList.set(res.items || []),
      error: (e) => console.warn('Lỗi yêu cầu rút tiền:', e),
      complete: () => this.dangTai.set(false)
    });
  }

  // === ĐĂNG KÝ MỞ GIAN HÀNG ===
  xuLyDangKyShop(): void {
    if (this.formDangKyShop.invalid) {
      this.formDangKyShop.markAllAsTouched();
      this.message.warning('Vui lòng kiểm tra lại thông tin gian hàng!');
      return;
    }

    this.dangXuLy = true;
    this.duLieuService.dangKyCuaHang(this.formDangKyShop.value).subscribe({
      next: (shop) => {
        this.dangXuLy = false;
        this.message.success('🎉 Chúc mừng! Mở gian hàng thành công!');
        this.cuaHang.set(shop);
        this.taiThongTinGianHang();
      },
      error: (err) => {
        this.dangXuLy = false;
        this.message.error(trichXuatThongBaoLoi(err, 'Không thể đăng ký gian hàng!'));
      }
    });
  }

  // === RÚT TIỀN VỀ NGÂN HÀNG ===
  moModalRutTien(): void {
    const shop = this.cuaHang();
    if (!shop?.soTaiKhoanNganHang || !shop?.tenNganHang || !shop?.tenChuTaiKhoan) {
      this.message.warning('Vui lòng cập nhật Tài khoản ngân hàng trước khi rút tiền!');
      this.hienModalNganHang = true;
      return;
    }
    this.hienModalRutTien = true;
  }

  dongModalRutTien(): void {
    this.hienModalRutTien = false;
  }

  xacNhanRutTien(): void {
    if (this.formRutTien.invalid) {
      this.formRutTien.markAllAsTouched();
      return;
    }

    const soTien = this.formRutTien.value.soTien;
    const soDu = this.viCuaHang()?.soDuKhaDung || 0;
    if (soTien > soDu) {
      this.message.error(`Số dư khả dụng (${this.formatTien(soDu)}) không đủ để rút ${this.formatTien(soTien)}!`);
      return;
    }

    this.dangXuLy = true;
    this.duLieuService.taoYeuCauRutTien(this.formRutTien.value).subscribe({
      next: () => {
        this.dangXuLy = false;
        this.hienModalRutTien = false;
        this.message.success('Đã gửi yêu cầu rút tiền thành công! Admin sẽ duyệt và giải ngân sớm.');
        this.taiDuLieuChiTietShop();
      },
      error: (err) => {
        this.dangXuLy = false;
        this.message.error(trichXuatThongBaoLoi(err, 'Lỗi gửi yêu cầu rút tiền!'));
      }
    });
  }

  // === CẬP NHẬT TÀI KHOẢN NGÂN HÀNG ===
  moModalNganHang(): void {
    this.hienModalNganHang = true;
  }

  dongModalNganHang(): void {
    this.hienModalNganHang = false;
  }

  luuNganHang(): void {
    if (this.formNganHang.invalid) {
      this.formNganHang.markAllAsTouched();
      return;
    }

    this.dangXuLy = true;
    this.duLieuService.capNhatNganHangCuaHang(this.formNganHang.value).subscribe({
      next: (shop) => {
        this.dangXuLy = false;
        this.hienModalNganHang = false;
        this.cuaHang.set(shop);
        this.message.success('Đã cập nhật thông tin tài khoản ngân hàng nhận tiền!');
      },
      error: (err) => {
        this.dangXuLy = false;
        this.message.error(trichXuatThongBaoLoi(err, 'Lỗi cập nhật ngân hàng!'));
      }
    });
  }

  // === QUẢN LÝ SẢN PHẨM CỦA SHOP ===
  moModalThemSanPham(): void {
    this.sanPhamDangSua = null;
    this.formSanPham.reset({
      maSp: `SP${Math.floor(100 + Math.random() * 900)}`,
      ten: '',
      gia: 100000,
      soLuongTon: 10,
      danhMuc: 'Điện thoại',
      hinhAnh: '',
      moTa: ''
    });
    this.hienModalSanPham = true;
  }

  moModalSuaSanPham(sp: SanPham): void {
    this.sanPhamDangSua = sp;
    this.formSanPham.patchValue({
      maSp: sp.maSp,
      ten: sp.ten,
      gia: sp.gia,
      soLuongTon: sp.soLuongTon,
      danhMuc: sp.danhMuc,
      hinhAnh: sp.hinhAnh || '',
      moTa: sp.moTa || ''
    });
    this.hienModalSanPham = true;
  }

  dongModalSanPham(): void {
    this.hienModalSanPham = false;
    this.sanPhamDangSua = null;
  }

  luuSanPham(): void {
    if (this.formSanPham.invalid) {
      this.formSanPham.markAllAsTouched();
      return;
    }

    this.dangXuLy = true;
    const formVal = this.formSanPham.value;
    const shop = this.cuaHang();

    if (this.sanPhamDangSua) {
      this.duLieuService.capNhatThongTinSanPham(this.sanPhamDangSua.id, {
        ...formVal,
        cuaHangId: shop?.id
      }).subscribe({
        next: () => {
          this.dangXuLy = false;
          this.dongModalSanPham();
          this.message.success('Cập nhật sản phẩm thành công!');
          this.taiDuLieuChiTietShop();
        },
        error: (err) => {
          this.dangXuLy = false;
          this.message.error(trichXuatThongBaoLoi(err, 'Lỗi cập nhật sản phẩm!'));
        }
      });
    } else {
      this.duLieuService.themSanPham({
        ...formVal,
        cuaHangId: shop?.id
      }).subscribe({
        next: () => {
          this.dangXuLy = false;
          this.dongModalSanPham();
          this.message.success('Thêm sản phẩm mới vào gian hàng thành công!');
          this.taiDuLieuChiTietShop();
        },
        error: (err) => {
          this.dangXuLy = false;
          this.message.error(trichXuatThongBaoLoi(err, 'Lỗi thêm sản phẩm!'));
        }
      });
    }
  }

  xoaSanPham(id: string): void {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;
    this.duLieuService.xoaSanPham(id).subscribe({
      next: () => {
        this.message.success('Đã xóa sản phẩm khỏi kho!');
        this.taiDuLieuChiTietShop();
      },
      error: (err) => {
        this.message.error(trichXuatThongBaoLoi(err, 'Lỗi xóa sản phẩm!'));
      }
    });
  }

  // === ĐƠN HÀNG CỦA SHOP & ĐỐI SOÁT ESCROW ===
  chuyenTrangThaiDon(donHang: DonHang, trangThaiMoi: TrangThaiDonHang): void {
    const tenTrangThaiMap: Record<string, string> = {
      dang_giao: 'Đang Giao Hàng',
      hoan_thanh: 'Hoàn Thành (Quyết toán tiền vào Ví)',
      da_huy: 'Hủy Đơn Hàng'
    };

    if (!confirm(`Xác nhận chuyển trạng thái đơn #${donHang.maDon} sang "${tenTrangThaiMap[trangThaiMoi]}"?`)) return;

    this.dangXuLy = true;
    this.duLieuService.doiTrangThaiDonHang(donHang.id, trangThaiMoi).subscribe({
      next: () => {
        this.dangXuLy = false;
        this.message.success(`Đã cập nhật đơn #${donHang.maDon} sang ${tenTrangThaiMap[trangThaiMoi]}!`);
        this.taiDuLieuChiTietShop();
      },
      error: (err) => {
        this.dangXuLy = false;
        this.message.error(trichXuatThongBaoLoi(err, 'Lỗi cập nhật trạng thái đơn!'));
      }
    });
  }

  // === TIỆN ÍCH HIỂN THỊ ===
  formatTien(soTien?: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(soTien || 0);
  }

  layTenTrangThaiDon(tt: string): string {
    const map: Record<string, string> = {
      cho_xu_ly: 'Chờ xử lý',
      dang_giao: 'Đang giao hàng',
      hoan_thanh: 'Đã hoàn thành',
      da_huy: 'Đã hủy'
    };
    return map[tt] || tt;
  }

  layMauTrangThaiDon(tt: string): string {
    const map: Record<string, string> = {
      cho_xu_ly: 'warning',
      dang_giao: 'processing',
      hoan_thanh: 'success',
      da_huy: 'error'
    };
    return map[tt] || 'default';
  }

  layMauTrangThaiRut(tt: string): string {
    const map: Record<string, string> = {
      ChoDuyet: 'warning',
      DaChuyenTien: 'success',
      TuChoi: 'error'
    };
    return map[tt] || 'default';
  }
}

