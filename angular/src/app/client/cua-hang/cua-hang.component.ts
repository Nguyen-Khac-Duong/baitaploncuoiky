import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { DuLieuService } from '../../he-thong/dich-vu/du-lieu.service';
import { ThongBaoService } from '../../he-thong/dich-vu/thong-bao.service';
import { XacThucService } from '../../he-thong/dich-vu/xac-thuc.service';
import { SanPham, DanhMucTree } from '../../shared/mo-hinh/du-lieu.model';

@Component({
  selector: 'app-cua-hang',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cua-hang.component.html',
  styleUrl: './cua-hang.component.scss'
})
export class CuaHangComponent {
  readonly duLieuService = inject(DuLieuService);
  private readonly thongBaoService = inject(ThongBaoService);
  readonly xacThucService = inject(XacThucService);
  private readonly router = inject(Router);

  readonly tuKhoaSearch = signal<string>('');
  readonly cayDanhMuc = this.duLieuService.cayDanhMucSignal;

  // Lọc ngành hàng cấp 1 (Parent ID hoặc 'all')
  readonly nganhHangChaDuocChon = signal<string>('all');
  // Lọc danh mục cấp 2 (Child ID hoặc 'all')
  readonly danhMucConDuocChon = signal<string>('all');

  // Ngành hàng cha hiện tại đang được chọn
  readonly nganhHangChaHienTai = computed<DanhMucTree | null>(() => {
    const parentId = this.nganhHangChaDuocChon();
    if (parentId === 'all') return null;
    return this.cayDanhMuc().find(c => c.id === parentId) || null;
  });

  // Danh sách các danh mục con của ngành hàng đang chọn
  readonly danhSachDanhMucCon = computed(() => {
    const parent = this.nganhHangChaHienTai();
    return parent?.children || [];
  });

  // Signal danh sách sản phẩm hiển thị, lọc tự động theo Từ khóa + Cây danh mục 2 cấp
  readonly danhSachSanPhamHienThi = computed(() => {
    const list = this.duLieuService.sanPhamListSignal() || [];
    const tuKhoa = this.tuKhoaSearch().trim().toLowerCase();
    const parentId = this.nganhHangChaDuocChon();
    const childId = this.danhMucConDuocChon();

    return list.filter(sp => {
      // 1. Khớp từ khóa tìm kiếm
      const matchTuKhoa = !tuKhoa ||
        sp.ten.toLowerCase().includes(tuKhoa) ||
        (sp.moTa && sp.moTa.toLowerCase().includes(tuKhoa)) ||
        (sp.danhMuc && sp.danhMuc.toLowerCase().includes(tuKhoa)) ||
        (sp.tenCuaHang && sp.tenCuaHang.toLowerCase().includes(tuKhoa));

      if (!matchTuKhoa) return false;

      // 2. Khớp ngành hàng cấp 1
      if (parentId !== 'all') {
        const parent = this.nganhHangChaHienTai();
        if (parent) {
          const validIds = new Set<string>([parent.id, ...(parent.children?.map(c => c.id) || [])]);
          const validNames = new Set<string>([
            parent.ten.toLowerCase(),
            ...(parent.children?.map(c => c.ten.toLowerCase()) || [])
          ]);

          const matchId = sp.danhMucId ? validIds.has(sp.danhMucId) : false;
          const matchName = sp.danhMuc ? validNames.has(sp.danhMuc.toLowerCase()) : false;

          if (!matchId && !matchName) return false;
        }
      }

      // 3. Khớp danh mục con cấp 2
      if (childId !== 'all') {
        const child = this.danhSachDanhMucCon().find(c => c.id === childId);
        if (child) {
          const matchChildId = sp.danhMucId === child.id;
          const matchChildName = sp.danhMuc?.toLowerCase() === child.ten.toLowerCase();
          if (!matchChildId && !matchChildName) return false;
        }
      }

      return true;
    });
  });

  onSearchChange(val: string): void {
    this.tuKhoaSearch.set(val);
  }

  chonNganhHangCha(parentId: string): void {
    this.nganhHangChaDuocChon.set(parentId);
    this.danhMucConDuocChon.set('all'); // Reset bộ lọc con khi đổi ngành hàng cha
  }

  chonDanhMucCon(childId: string): void {
    this.danhMucConDuocChon.set(childId);
  }

  datLaiBoLoc(): void {
    this.tuKhoaSearch.set('');
    this.nganhHangChaDuocChon.set('all');
    this.danhMucConDuocChon.set('all');
  }

  // === ĐIỀU HƯỚNG TRANG CHI TIẾT SẢN PHẨM RIÊNG BIỆT ===
  moChiTiet(sp: SanPham): void {
    this.router.navigate(['/san-pham', sp.id]);
  }

  // === ĐIỀU HƯỚNG ĐẾN TRANG GIAN HÀNG CÔNG KHAI ===
  diDenShop(sp: SanPham, $event?: Event): void {
    if ($event) {
      $event.stopPropagation();
      $event.preventDefault();
    }

    if (sp.cuaHangSlug) {
      this.router.navigate(['/shop', sp.cuaHangSlug]);
      return;
    }

    if (sp.cuaHangId) {
      this.thongBaoService.thongTin('Đang chuyển hướng đến gian hàng...', 'Gian hàng');
      this.duLieuService.getCuaHangById(sp.cuaHangId).subscribe({
        next: (shop) => {
          if (shop && shop.slug) {
            this.router.navigate(['/shop', shop.slug]);
          } else {
            this.thongBaoService.canhBao('Không tìm thấy gian hàng này!', 'Gian hàng');
          }
        },
        error: () => {
          this.thongBaoService.thatBai('Không thể kết nối đến thông tin gian hàng!', 'Lỗi');
        }
      });
    } else {
      this.thongBaoService.canhBao('Sản phẩm này chưa liên kết với gian hàng nào!', 'Thông báo');
    }
  }

  themVaoGio(sp: SanPham, $event?: Event): void {
    if ($event) {
      $event.stopPropagation();
    }

    if (this.xacThucService.laAdmin()) {
      this.thongBaoService.canhBao(
        'Tài khoản Quản Trị Viên Sàn (Admin) không tham gia mua sắm! Nếu muốn mua hàng, vui lòng đăng xuất và dùng tài khoản Người Mua.',
        'Chế độ Admin'
      );
      return;
    }

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
