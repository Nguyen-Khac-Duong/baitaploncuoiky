import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { XacThucService } from '../../../he-thong/dich-vu/xac-thuc.service';
import { ThongBaoService } from '../../../he-thong/dich-vu/thong-bao.service';

// NG-ZORRO Modules
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, NzMenuModule, NzIconModule, NzTooltipModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  private readonly xacThucService = inject(XacThucService);
  private readonly thongBaoService = inject(ThongBaoService);
  private readonly router = inject(Router);

  @Input() thuGon: boolean = false;

  menuItems = [
    { label: 'Tổng Quan', icon: 'dashboard', route: '/admin/tong-quan' },
    { label: 'Sản Phẩm', icon: 'appstore', route: '/admin/san-pham' },
    { label: 'Đơn Hàng', icon: 'shopping-cart', route: '/admin/don-hang' }
  ];

  dangXuat(): void {
    this.xacThucService.dangXuat();
    this.thongBaoService.thongTin('Đã đăng xuất khỏi tài khoản Quản trị thành công.', 'Đăng xuất');
    this.router.navigate(['/dang-nhap']);
  }
}
