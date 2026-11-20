import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTagModule } from 'ng-zorro-antd/tag';

import { DuLieuService } from '../../he-thong/dich-vu/du-lieu.service';
import { CuaHang, SanPham } from '../../shared/mo-hinh/du-lieu.model';
import { trichXuatThongBaoLoi } from '../../he-thong/tien-ich/loi-api.helper';

@Component({
  selector: 'app-chi-tiet-shop',
  standalone: true,
  imports: [CommonModule, NzTagModule, RouterLink],
  templateUrl: './chi-tiet-shop.component.html',
  styleUrl: './chi-tiet-shop.component.scss'
})
export class ChiTietShopComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly duLieuService = inject(DuLieuService);
  private readonly message = inject(NzMessageService);

  readonly dangTai = signal<boolean>(true);
  readonly cuaHang = signal<CuaHang | null>(null);
  readonly sanPhams = signal<SanPham[]>([]);

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      if (slug) {
        this.taiThongTinShop(slug);
      }
    });
  }

  taiThongTinShop(slug: string): void {
    this.dangTai.set(true);
    this.duLieuService.getCuaHangBySlug(slug).subscribe({
      next: (shop) => {
        this.cuaHang.set(shop);
        this.taiSanPhamCuaShop(shop.id);
      },
      error: (err) => {
        this.dangTai.set(false);
        this.message.error(trichXuatThongBaoLoi(err, 'Không tìm thấy gian hàng!'));
      }
    });
  }

  taiSanPhamCuaShop(shopId: string): void {
    this.duLieuService.getProductsByShop(shopId).subscribe({
      next: (prods) => {
        this.sanPhams.set(prods);
        this.dangTai.set(false);
      },
      error: () => {
        this.dangTai.set(false);
      }
    });
  }

  themVaoGio(sp: SanPham): void {
    if (this.duLieuService.laSanPhamCuaShopToi(sp)) {
      this.message.warning(`Bạn là chủ gian hàng này, không thể tự mua sản phẩm "${sp.ten}" của chính mình!`);
      return;
    }
    if (sp.soLuongTon <= 0) {
      this.message.warning(`Sản phẩm "${sp.ten}" đã hết hàng!`);
      return;
    }
    const thanhCong = this.duLieuService.themVaoGioHang(sp, 1);
    if (thanhCong) {
      this.message.success(`Đã thêm "${sp.ten}" vào giỏ hàng!`);
    } else {
      this.message.warning(`Đã đạt giới hạn số lượng tồn kho khả dụng (${sp.soLuongTon})!`);
    }
  }

  formatTien(gia: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(gia);
  }
}
