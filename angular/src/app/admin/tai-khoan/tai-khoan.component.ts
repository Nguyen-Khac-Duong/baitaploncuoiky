import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';

import { DuLieuService } from '../../he-thong/dich-vu/du-lieu.service';
import { NguoiDungHeThong } from '../../shared/mo-hinh/du-lieu.model';
import { trichXuatThongBaoLoi } from '../../he-thong/tien-ich/loi-api.helper';

@Component({
  selector: 'app-admin-tai-khoan',
  standalone: true,
  imports: [CommonModule, NzTableModule, NzTagModule, NzButtonModule, NzCardModule, NzIconModule],
  template: `
    <div class="admin-page-container">
      <div class="page-header">
        <div>
          <h2>👥 Quản Lý Tài Khoản & Người Dùng Toàn Sàn</h2>
          <p class="desc">Kiểm soát danh sách người dùng đăng ký, trạng thái kích hoạt và phân quyền tài khoản.</p>
        </div>
        <button nz-button nzType="primary" (click)="taiDanhSach()">
          <span nz-icon nzType="reload"></span> Làm mới
        </button>
      </div>

      <div class="table-card">
        <nz-table #userTable [nzData]="danhSach()" [nzLoading]="dangTai()" [nzBordered]="true" [nzPageSize]="10">
          <thead>
            <tr>
              <th>Người Dùng</th>
              <th>Tên Đăng Nhập</th>
              <th>Email</th>
              <th>Số Điện Thoại</th>
              <th>Trạng Thái</th>
              <th>Ngày Đăng Ký</th>
            </tr>
          </thead>
          <tbody>
            @for (user of userTable.data; track user.id) {
              <tr>
                <td>
                  <div class="user-cell">
                    <span class="user-icon">👤</span>
                    <div>
                      <strong>{{ user.name ? (user.name + ' ' + (user.surname || '')) : user.userName }}</strong>
                      <div><small class="text-muted">ID: {{ user.id.substring(0, 8) }}...</small></div>
                    </div>
                  </div>
                </td>
                <td><code>{{ user.userName }}</code></td>
                <td>{{ user.email }}</td>
                <td>{{ user.phoneNumber || 'Chưa cập nhật' }}</td>
                <td>
                  <nz-tag [nzColor]="user.isActive ? 'success' : 'error'">
                    {{ user.isActive ? 'Đang Hoạt Động' : 'Đã Khóa' }}
                  </nz-tag>
                </td>
                <td>{{ user.creationTime | date:'dd/MM/yyyy HH:mm' }}</td>
              </tr>
            }
          </tbody>
        </nz-table>
      </div>
    </div>
  `,
  styles: [`
    .admin-page-container {
      padding: 24px;
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      h2 {
        margin: 0 0 6px 0;
        font-size: 22px;
        font-weight: 700;
        color: var(--text-primary, #1e293b);
      }
      .desc {
        margin: 0;
        color: var(--text-secondary, #64748b);
      }
    }
    .table-card {
      background: var(--bg-card, #ffffff);
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      border: 1px solid var(--border-color, #e2e8f0);
    }
    .user-cell {
      display: flex;
      align-items: center;
      gap: 12px;
      .user-icon {
        font-size: 24px;
      }
    }
  `]
})
export class TaiKhoanComponent implements OnInit {
  private readonly duLieuService = inject(DuLieuService);
  private readonly message = inject(NzMessageService);

  readonly danhSach = signal<NguoiDungHeThong[]>([]);
  readonly dangTai = signal<boolean>(true);

  ngOnInit(): void {
    this.taiDanhSach();
  }

  taiDanhSach(): void {
    this.dangTai.set(true);
    this.duLieuService.getDanhSachNguoiDung().subscribe({
      next: (res) => {
        this.danhSach.set(res?.items || []);
        this.dangTai.set(false);
      },
      error: (err) => {
        this.dangTai.set(false);
        this.message.error(trichXuatThongBaoLoi(err, 'Lỗi nạp danh sách tài khoản!'));
      }
    });
  }
}

