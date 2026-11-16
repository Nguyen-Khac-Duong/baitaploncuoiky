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
    { label: 'Tổng Quan Sàn', icon: 'dashboard', route: '/admin/tong-quan' },
    { label: 'Quản Lý Danh Mục', icon: 'appstore', route: '/admin/danh-muc' },
    { label: 'Duyệt Gian Hàng', icon: 'shop', route: '/admin/gian-hang' },
    { label: 'Duyệt Rút Tiền', icon: 'bank', route: '/admin/rut-tien' },
    { label: 'Quản Lý Tài Khoản', icon: 'user', route: '/admin/tai-khoan' }
  ];

  dangXuat(): void {
    this.xacThucService.dangXuat();
    this.thongBaoService.thongTin('Đã đăng xuất khỏi tài khoản Quản trị thành công.', 'Đăng xuất');
    this.router.navigate(['/dang-nhap']);
  }
}
