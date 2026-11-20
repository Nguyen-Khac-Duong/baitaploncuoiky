import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DuLieuService } from '../../he-thong/dich-vu/du-lieu.service';
import { XacThucService } from '../../he-thong/dich-vu/xac-thuc.service';
import { ThongBaoService } from '../../he-thong/dich-vu/thong-bao.service';

@Component({
  selector: 'app-gio-hang',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './gio-hang.component.html',
  styleUrl: './gio-hang.component.scss'
})
export class GioHangComponent {
  readonly duLieuService = inject(DuLieuService);
  readonly xacThucService = inject(XacThucService);
  private readonly thongBaoService = inject(ThongBaoService);
  private readonly router = inject(Router);

  // === THAO TÁC SỐ LƯỢNG VÀ XÓA ===
  tangSoLuong(sanPhamId: string, soLuongHienTai: number, soLuongTon: number): void {
    if (soLuongHienTai < soLuongTon) {
      this.duLieuService.capNhatSoLuongGioHang(sanPhamId, soLuongHienTai + 1);
    } else {
      this.thongBaoService.canhBao('Đã đạt số lượng tồn kho tối đa của sản phẩm!', 'Giỏ hàng');
    }
  }

  giamSoLuong(sanPhamId: string, soLuongHienTai: number): void {
    this.duLieuService.capNhatSoLuongGioHang(sanPhamId, soLuongHienTai - 1);
  }

  xoaMon(sanPhamId: string): void {
    this.duLieuService.xoaKhoiGioHang(sanPhamId);
    this.thongBaoService.thongTin('Đã xóa sản phẩm khỏi giỏ hàng.', 'Giỏ hàng');
  }

  xoaCacMonDaChon(): void {
    const count = this.duLieuService.tongSoLuongDaChon();
    if (count === 0) {
      this.thongBaoService.canhBao('Bạn chưa chọn sản phẩm nào để xóa!', 'Giỏ hàng');
      return;
    }
    this.duLieuService.xoaCacMonDaChon();
    this.thongBaoService.thongTin(`Đã xóa ${count} sản phẩm được chọn khỏi giỏ hàng.`, 'Giỏ hàng');
  }

  // === THAO TÁC CHECKBOX CHỌN MUA (SHOPEE FLOW) ===
  toggleChonMon(sanPhamId: string): void {
    const item = this.duLieuService.gioHang().find(x => x.sanPham.id === sanPhamId);
    if (item && this.duLieuService.laSanPhamCuaShopToi(item.sanPham)) {
      this.thongBaoService.canhBao('Đây là sản phẩm thuộc gian hàng của bạn! Người bán không thể tự mua hàng của chính mình.', 'Chặn mua hàng');
      return;
    }
    this.duLieuService.toggleChonMon(sanPhamId);
  }

  datChonMon(sanPhamId: string, event: Event): void {
    const item = this.duLieuService.gioHang().find(x => x.sanPham.id === sanPhamId);
    if (item && this.duLieuService.laSanPhamCuaShopToi(item.sanPham)) {
      (event.target as HTMLInputElement).checked = false;
      this.thongBaoService.canhBao('Đây là sản phẩm thuộc gian hàng của bạn! Người bán không thể tự mua hàng của chính mình.', 'Chặn mua hàng');
      return;
    }
    const checked = (event.target as HTMLInputElement).checked;
    this.duLieuService.datChonMon(sanPhamId, checked);
  }

  chonTatCa(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.duLieuService.chonTatCaGioHang(checked);
  }

  chonNhomShop(cuaHangId: string, event: Event): void {
    const myShop = this.duLieuService.myStoreSignal();
    if (myShop && myShop.id.toLowerCase() === cuaHangId.toLowerCase()) {
      (event.target as HTMLInputElement).checked = false;
      this.thongBaoService.canhBao('Đây là gian hàng của bạn! Người bán không thể tự mua hàng của chính mình.', 'Chặn mua hàng');
      return;
    }
    const checked = (event.target as HTMLInputElement).checked;
    this.duLieuService.chonNhomShop(cuaHangId, checked);
  }

  // === CHUYỂN HƯỚNG SANG TRANG THANH TOÁN ===
  tienHanhThanhToan(): void {
    // 1. Kiểm tra xem đã chọn sản phẩm chưa
    if (this.duLieuService.cacMonDaChon().length === 0) {
      this.thongBaoService.canhBao('Vui lòng đánh dấu chọn ít nhất 1 sản phẩm để thanh toán!', 'Giỏ hàng');
      return;
    }

    // 2. Chặn Quản Trị Viên (Admin) mua hàng
    if (this.xacThucService.laAdmin()) {
      this.thongBaoService.canhBao(
        'Tài khoản Quản Trị Viên (Admin) không thực hiện mua hàng! Vui lòng đăng nhập tài khoản Khách Hàng.',
        'Chặn mua hàng'
      );
      return;
    }

    // 3. Chặn chủ gian hàng mua hàng của chính mình
    const items = this.duLieuService.cacMonDaChon();
    const hasOwnItem = items.some(item => this.duLieuService.laSanPhamCuaShopToi(item.sanPham));
    if (hasOwnItem) {
      this.thongBaoService.thatBai(
        'Trong các mục đã chọn có sản phẩm thuộc gian hàng của bạn! Người bán không được phép tự mua hàng của chính mình.',
        'Chặn mua hàng'
      );
      return;
    }

    // 4. Chuyển sang trang thanh toán riêng biệt
    this.router.navigate(['/thanh-toan']);
  }

  formatTien(gia: number | undefined | null): string {
    const val = Number(gia || 0);
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(isNaN(val) ? 0 : val);
  }
}
