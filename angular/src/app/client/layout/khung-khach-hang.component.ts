import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { XacThucService } from '../../he-thong/dich-vu/xac-thuc.service';
import { DuLieuService } from '../../he-thong/dich-vu/du-lieu.service';
import { GiaoDienService } from '../../he-thong/dich-vu/giao-dien.service';
import { ChatBotComponent } from '../../components/chat-bot/chat-bot.component';

@Component({
  selector: 'app-khung-khach-hang',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, ChatBotComponent],
  templateUrl: './khung-khach-hang.component.html',
  styleUrl: './khung-khach-hang.component.scss'
})
export class KhungKhachHangComponent {
  readonly xacThucService = inject(XacThucService);
  readonly duLieuService = inject(DuLieuService);
  readonly giaoDienService = inject(GiaoDienService);
  private readonly router = inject(Router);

  dangXuat(): void {
    this.xacThucService.dangXuat();
    this.router.navigate(['/dang-nhap']);
  }
}
