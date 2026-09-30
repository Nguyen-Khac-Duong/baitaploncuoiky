import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../components/header/header.component';
import { SidebarComponent } from '../components/sidebar/sidebar.component';

@Component({
  selector: 'app-khung-chinh',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, SidebarComponent],
  templateUrl: './khung-chinh.component.html',
  styleUrl: './khung-chinh.component.scss'
})
export class KhungChinhComponent {
  sidebarThuGon: boolean = false;

  onToggleSidebar(): void {
    this.sidebarThuGon = !this.sidebarThuGon;
  }
}
