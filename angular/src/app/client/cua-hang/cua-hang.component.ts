import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DuLieuService } from '../../he-thong/dich-vu/du-lieu.service';
import { ThongBaoService } from '../../he-thong/dich-vu/thong-bao.service';
import { SanPham } from '../../shared/mo-hinh/du-lieu.model';

@Component({
  selector: 'app-cua-hang',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cua-hang.component.html',
  styleUrl: './cua-hang.component.scss'
})
export class CuaHangComponent {
  private readonly duLieuService = inject(DuLieuService);
  private readonly thongBaoService = inject(ThongBaoService);

  readonly tuKhoaSearch = signal<string>('');
  readonly danhMucDuocChon = signal<string>('all');
  readonly danhMucList: string[] = ['Tất cả', 'Điện thoại', 'Laptop', 'Phụ kiện', 'Âm thanh', 'Màn hình'];

  // Signal danh sách sản phẩm hiển thị, lọc tự động theo Signal tức thì
  readonly danhSachSanPhamHienThi = computed(() => {
    const list = this.duLieuService.sanPhamListSignal() || [];
    const tuKhoa = this.tuKhoaSearch().trim().toLowerCase();
    const danhMuc = this.danhMucDuocChon();

    return list.filter(sp => {
      const matchTuKhoa = !tuKhoa || sp.ten.toLowerCase().includes(tuKhoa) || (sp.moTa && sp.moTa.toLowerCase().includes(tuKhoa));
      const matchDanhMuc = danhMuc === 'all' || danhMuc === 'Tất cả' || sp.danhMuc === danhMuc;
      return matchTuKhoa && matchDanhMuc;
    });
  });

  onSearchChange(val: string): void {
    this.tuKhoaSearch.set(val);
  }

  chonDanhMuc(dm: string): void {
    this.danhMucDuocChon.set(dm === 'Tất cả' ? 'all' : dm);
  }

  themVaoGio(sp: SanPham): void {
    const thanhCong = this.duLieuService.themVaoGioHang(sp, 1);
    if (thanhCong) {
      this.thongBaoService.thanhCong(`Đã thêm "${sp.ten}" vào giỏ hàng!`, 'Giỏ hàng');
    } else {
      this.thongBaoService.canhBao(`Sản phẩm "${sp.ten}" đã hết hàng!`, 'Kho hàng');
    }
  }

  formatTien(gia: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(gia);
  }
}
