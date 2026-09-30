import { Component, inject, Output, EventEmitter, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { GiaoDienService } from '../../../he-thong/dich-vu/giao-dien.service';
import { XacThucService } from '../../../he-thong/dich-vu/xac-thuc.service';
import { DuLieuService } from '../../../he-thong/dich-vu/du-lieu.service';
import { ThongBaoService } from '../../../he-thong/dich-vu/thong-bao.service';

export interface ThongBaoItem {
  id: string;
  tieuDe: string;
  noiDung: string;
  thoiGian: string;
  loai: 'don_hang' | 'kho' | 'he_thong';
  daDoc: boolean;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  readonly giaoDienService = inject(GiaoDienService);
  readonly xacThucService = inject(XacThucService);
  readonly thongBaoService = inject(ThongBaoService);
  private readonly duLieuService = inject(DuLieuService);
  private readonly router = inject(Router);

  @Output() readonly toggleSidebar = new EventEmitter<void>();

  // State menu Dropdown
  hienThongBao: boolean = false;
  hienUserMenu: boolean = false;
  tieuDeTrangHienTai: string = 'Tổng Quan Hệ Thống';

  // Thông báo Real-time
  thongBaoList: ThongBaoItem[] = [];

  ngOnInit(): void {
    this.theoDoiRoute();
    this.khoiTaoThongBao();
  }

  // Tự động đóng dropdown khi click ra ngoài
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.notify-wrapper')) {
      this.hienThongBao = false;
    }
    if (!target.closest('.user-wrapper')) {
      this.hienUserMenu = false;
    }
  }

  toggleDropdownThongBao(event: MouseEvent): void {
    event.stopPropagation();
    this.hienThongBao = !this.hienThongBao;
    this.hienUserMenu = false;
  }

  toggleDropdownUser(event: MouseEvent): void {
    event.stopPropagation();
    this.hienUserMenu = !this.hienUserMenu;
    this.hienThongBao = false;
  }

  get soThongBaoChuaDoc(): number {
    return this.thongBaoList.filter(t => !t.daDoc).length;
  }

  danhDauDaDocTatCa(): void {
    this.thongBaoList = this.thongBaoList.map(t => ({ ...t, daDoc: true }));
  }

  dangXuat(): void {
    this.hienUserMenu = false;
    this.hienThongBao = false;
    this.xacThucService.dangXuat();
    this.thongBaoService.thongTin('Đã đăng xuất khỏi tài khoản Quản trị thành công.', 'Đăng xuất');
    this.router.navigate(['/dang-nhap']);
  }

  private theoDoiRoute(): void {
    const mapTieuDe: Record<string, string> = {
      '/tong-quan': '📊 Bảng Điều Khiển Tổng Quan',
      '/san-pham': '📦 Quản Lý Danh Mục Sản Phẩm',
      '/don-hang': '🛒 Quản Lý Tiến Trình Đơn Hàng'
    };

    this.tieuDeTrangHienTai = mapTieuDe[this.router.url] || 'Hệ Thống Quản Trị Bán Hàng';

    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => {
        this.tieuDeTrangHienTai = mapTieuDe[e.urlAfterRedirects] || 'Hệ Thống Quản Trị Bán Hàng';
      });
  }

  private khoiTaoThongBao(): void {
    this.duLieuService.getDanhSachDonHang().subscribe(donHangs => {
      const donCho = donHangs.filter(dh => dh.trangThai === 'cho_xu_ly');
      this.thongBaoList = [
        ...donCho.map(dh => ({
          id: 'tb-' + dh.id,
          tieuDe: `Đơn hàng mới #${dh.maDon}`,
          noiDung: `${dh.tenKhachHang} vừa đặt đơn trị giá ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(dh.tongTien)}`,
          thoiGian: dh.ngayTao,
          loai: 'don_hang' as const,
          daDoc: false
        })),
        {
          id: 'tb-system-1',
          tieuDe: 'Hệ thống sẵn sàng',
          noiDung: 'Chào mừng quay trở lại hệ thống quản trị bán hàng!',
          thoiGian: 'Vừa xong',
          loai: 'he_thong' as const,
          daDoc: true
        }
      ];
    });
  }
}
