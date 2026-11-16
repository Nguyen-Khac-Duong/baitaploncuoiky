import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DuLieuService } from '../../he-thong/dich-vu/du-lieu.service';
import { ThongBaoService } from '../../he-thong/dich-vu/thong-bao.service';
import { XacThucService } from '../../he-thong/dich-vu/xac-thuc.service';
import { SanPham, CuaHang, DanhGiaSanPham, ThongKeDanhGia } from '../../shared/mo-hinh/du-lieu.model';

@Component({
  selector: 'app-chi-tiet-san-pham',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './chi-tiet-san-pham.component.html',
  styleUrl: './chi-tiet-san-pham.component.scss'
})
export class ChiTietSanPhamComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly duLieuService = inject(DuLieuService);
  private readonly thongBaoService = inject(ThongBaoService);
  private readonly xacThucService = inject(XacThucService);

  readonly dangTai = signal<boolean>(true);
  readonly sanPham = signal<SanPham | null>(null);
  readonly cuaHang = signal<CuaHang | null>(null);
  readonly sanPhamLienQuan = signal<SanPham[]>([]);
  readonly soLuongMua = signal<number>(1);
  readonly tabHienTai = signal<'mota' | 'baohanh' | 'danhgia'>('mota');

  // Đánh giá sản phẩm
  readonly danhSachDanhGia = signal<DanhGiaSanPham[]>([]);
  readonly thongKeDanhGia = signal<ThongKeDanhGia | null>(null);
  readonly locSoSao = signal<number | 'all' | 'anh'>('all');

  readonly danhGiaHienThi = computed(() => {
    const list = this.danhSachDanhGia();
    const loc = this.locSoSao();
    if (loc === 'all') return list;
    if (loc === 'anh') return list.filter(x => !!x.hinhAnh);
    return list.filter(x => x.soSao === loc);
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.taiChiTietSanPham(id);
      }
    });
  }

  taiChiTietSanPham(id: string): void {
    this.dangTai.set(true);
    this.soLuongMua.set(1);

    this.duLieuService.getSanPhamById(id).subscribe({
      next: (sp) => {
        this.sanPham.set(sp);
        this.dangTai.set(false);

        // Tải thông tin gian hàng
        if (sp.cuaHangSlug) {
          this.taiThongTinShopTheoSlug(sp.cuaHangSlug);
        } else if (sp.cuaHangId) {
          this.taiThongTinShopTheoId(sp.cuaHangId);
        }

        // Tải đánh giá sản phẩm thực tế
        this.taiDanhGia(id);

        // Tải danh sách sản phẩm liên quan (cùng danh mục)
        this.duLieuService.getDanhSachSanPham().subscribe({
          next: (allProds) => {
            const related = allProds
              .filter(item => item.id !== sp.id && (item.danhMuc === sp.danhMuc || item.cuaHangId === sp.cuaHangId))
              .slice(0, 4);
            this.sanPhamLienQuan.set(related);
          }
        });
      },
      error: () => {
        this.dangTai.set(false);
        this.thongBaoService.thatBai('Không thể tải thông tin sản phẩm!', 'Lỗi');
      }
    });
  }

  private taiThongTinShopTheoSlug(slug: string): void {
    this.duLieuService.getCuaHangBySlug(slug).subscribe({
      next: (shop) => this.cuaHang.set(shop),
      error: () => console.warn('Không thể tải thông tin gian hàng theo slug:', slug)
    });
  }

  private taiThongTinShopTheoId(id: string): void {
    this.duLieuService.getCuaHangById(id).subscribe({
      next: (shop) => this.cuaHang.set(shop),
      error: () => console.warn('Không thể tải thông tin gian hàng theo id:', id)
    });
  }

  taiDanhGia(spId: string): void {
    this.duLieuService.getDanhGiaTheoSanPham(spId).subscribe({
      next: (list) => this.danhSachDanhGia.set(list),
      error: (e) => console.warn('Lỗi tải đánh giá sản phẩm:', e)
    });

    this.duLieuService.getThongKeDanhGiaTheoSanPham(spId).subscribe({
      next: (tk) => this.thongKeDanhGia.set(tk),
      error: (e) => console.warn('Lỗi tải thống kê đánh giá:', e)
    });
  }

  tangSoLuong(): void {
    const sp = this.sanPham();
    if (sp && this.soLuongMua() < sp.soLuongTon) {
      this.soLuongMua.update(n => n + 1);
    }
  }

  giamSoLuong(): void {
    if (this.soLuongMua() > 1) {
      this.soLuongMua.update(n => n - 1);
    }
  }

  themVaoGio(): void {
    const sp = this.sanPham();
    if (!sp) return;

    if (this.xacThucService.laAdmin()) {
      this.thongBaoService.canhBao(
        'Tài khoản Quản Trị Viên Sàn (Admin) không tham gia mua hàng! Vui lòng dùng tài khoản Người Mua.',
        'Chế độ Admin'
      );
      return;
    }

    const thanhCong = this.duLieuService.themVaoGioHang(sp, this.soLuongMua());
    if (thanhCong) {
      this.thongBaoService.thanhCong(`Đã thêm ${this.soLuongMua()} x "${sp.ten}" vào giỏ hàng!`, 'Giỏ hàng');
    } else {
      this.thongBaoService.canhBao('Số lượng vượt quá tồn kho khả dụng!', 'Kho hàng');
    }
  }

  muaNgay(): void {
    const sp = this.sanPham();
    if (!sp) return;

    if (this.xacThucService.laAdmin()) {
      this.thongBaoService.canhBao(
        'Tài khoản Quản Trị Viên Sàn (Admin) không tham gia mua hàng! Vui lòng dùng tài khoản Người Mua.',
        'Chế độ Admin'
      );
      return;
    }

    const thanhCong = this.duLieuService.themVaoGioHang(sp, this.soLuongMua());
    if (thanhCong) {
      this.router.navigate(['/gio-hang']);
    } else {
      this.thongBaoService.canhBao('Số lượng vượt quá tồn kho khả dụng!', 'Kho hàng');
    }
  }

  diDenShop(): void {
    const sp = this.sanPham();
    const shop = this.cuaHang();
    const slug = sp?.cuaHangSlug || shop?.slug;

    if (slug) {
      this.router.navigate(['/shop', slug]);
    } else if (sp?.cuaHangId) {
      this.duLieuService.getCuaHangById(sp.cuaHangId).subscribe({
        next: (res) => {
          if (res?.slug) {
            this.router.navigate(['/shop', res.slug]);
          }
        }
      });
    }
  }

  formatTien(gia: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(gia);
  }
}

