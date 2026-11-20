import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { XacThucService } from '../../he-thong/dich-vu/xac-thuc.service';
import { DuLieuService } from '../../he-thong/dich-vu/du-lieu.service';
import { GiaoDienService } from '../../he-thong/dich-vu/giao-dien.service';
import { ChatBotComponent } from '../../components/chat-bot/chat-bot.component';
import { ThongBaoItem } from '../../shared/mo-hinh/du-lieu.model';

// NG-ZORRO Modules
import { NzDropdownModule } from 'ng-zorro-antd/dropdown';
import { NzBadgeModule } from 'ng-zorro-antd/badge';

@Component({
  selector: 'app-khung-khach-hang',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    ChatBotComponent,
    NzDropdownModule,
    NzBadgeModule
  ],
  templateUrl: './khung-khach-hang.component.html',
  styleUrl: './khung-khach-hang.component.scss'
})
export class KhungKhachHangComponent implements OnInit {
  readonly xacThucService = inject(XacThucService);
  readonly duLieuService = inject(DuLieuService);
  readonly giaoDienService = inject(GiaoDienService);
  private readonly router = inject(Router);

  // Quản lý thông báo người mua (Buyer Notifications)
  readonly danhSachThongBao = signal<ThongBaoItem[]>([]);
  readonly soChuaDoc = computed(() => this.danhSachThongBao().filter(x => !x.daDoc).length);
  readonly locTabThongBao = signal<'all' | 'unread'>('all');
  hienDropdownThongBao: boolean = false;
  hienDropdownUser: boolean = false;

  readonly thongBaoHienThi = computed(() => {
    const list = this.danhSachThongBao();
    if (this.locTabThongBao() === 'unread') {
      return list.filter(x => !x.daDoc);
    }
    return list;
  });

  ngOnInit(): void {
    if (this.xacThucService.currentUser()) {
      this.taiThongBao();
    }
  }

  taiThongBao(): void {
    if (!this.xacThucService.currentUser()) return;
    this.duLieuService.getDanhSachThongBao('buyer').subscribe({
      next: (list) => this.danhSachThongBao.set(list),
      error: (e) => console.warn('Lỗi tải thông báo người mua:', e)
    });
  }

  onNotificationClick(tb: ThongBaoItem): void {
    if (!tb.daDoc) {
      this.duLieuService.danhDauThongBaoDaDoc(tb.id).subscribe({
        next: () => {
          this.danhSachThongBao.update(list =>
            list.map(x => x.id === tb.id ? { ...x, daDoc: true } : x)
          );
        }
      });
    }

    this.hienDropdownThongBao = false;
    if (tb.lienKet) {
      this.router.navigateByUrl(tb.lienKet);
    }
  }

  danhDauTatCaDaDoc(): void {
    this.duLieuService.danhDauTatCaThongBaoDaDoc('buyer').subscribe({
      next: () => {
        this.danhSachThongBao.update(list => list.map(x => ({ ...x, daDoc: true })));
      }
    });
  }

  xoaThongBao(event: MouseEvent, tbId: string): void {
    event.stopPropagation();
    this.duLieuService.xoaThongBao(tbId).subscribe({
      next: () => {
        this.danhSachThongBao.update(list => list.filter(x => x.id !== tbId));
      }
    });
  }

  xoaTatCaThongBao(): void {
    this.duLieuService.xoaTatCaThongBao('buyer').subscribe({
      next: () => {
        this.danhSachThongBao.set([]);
      }
    });
  }

  layIconLoai(loai: string): string {
    switch (loai) {
      case 'don_hang': return '📦';
      case 'hoan_tien': return '↩️';
      case 'danh_gia': return '⭐';
      case 'vi_tien': return '💰';
      case 'kho_hang': return '⚠️';
      default: return '🔔';
    }
  }

  formatTimeAgo(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSec < 60) return 'Vừa xong';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)} phút trước`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} giờ trước`;
    return `${Math.floor(diffSec / 86400)} ngày trước`;
  }

  dangXuat(): void {
    this.xacThucService.dangXuat();
    this.router.navigate(['/dang-nhap']);
  }
}
