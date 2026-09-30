import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { XacThucService } from '../../../he-thong/dich-vu/xac-thuc.service';
import { ThongBaoService } from '../../../he-thong/dich-vu/thong-bao.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  private readonly xacThucService = inject(XacThucService);
  private readonly thongBaoService = inject(ThongBaoService);
  private readonly router = inject(Router);

  @Input() thuGon: boolean = false;

  menuItems = [
    { label: 'Tổng Quan', icon: '📊', route: '/admin/tong-quan' },
    { label: 'Sản Phẩm', icon: '📦', route: '/admin/san-pham' },
    { label: 'Đơn Hàng', icon: '🛒', route: '/admin/don-hang' }
  ];

  dangXuat(): void {
    this.xacThucService.dangXuat();
    this.thongBaoService.thongTin('Đã đăng xuất khỏi tài khoản Quản trị thành công.', 'Đăng xuất');
    this.router.navigate(['/dang-nhap']);
  }
}

