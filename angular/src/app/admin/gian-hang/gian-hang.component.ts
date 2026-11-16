import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageService } from 'ng-zorro-antd/message';
import { RouterLink } from '@angular/router';

import { DuLieuService } from '../../he-thong/dich-vu/du-lieu.service';
import { CuaHang } from '../../shared/mo-hinh/du-lieu.model';
import { trichXuatThongBaoLoi } from '../../he-thong/tien-ich/loi-api.helper';

@Component({
  selector: 'app-admin-gian-hang',
  standalone: true,
  imports: [CommonModule, NzTableModule, NzTagModule, NzButtonModule, RouterLink],
  template: `
    <div class="admin-page-container">
      <div class="page-header">
        <div>
          <h2>🏪 Quản Lý & Phê Duyệt Gian Hàng (eKYC Vendor)</h2>
          <p class="desc">Kiểm duyệt hồ sơ đăng ký mở gian hàng, chính sách hoa hồng sàn và kiểm soát gian hàng vi phạm.</p>
        </div>
      </div>

      <div class="table-card">
        <nz-table #shopTable [nzData]="danhSachShop()" [nzLoading]="dangTai()" [nzBordered]="true">
          <thead>
            <tr>
              <th>Gian Hàng</th>
              <th>Đường Dẫn (Slug)</th>
              <th>Liên Hệ & Địa Chỉ</th>
              <th>Tài Khoản Ngân Hàng</th>
              <th>Hoa Hồng</th>
              <th>Trạng Thái</th>
              <th>Thao Tác Duyệt</th>
            </tr>
          </thead>
          <tbody>
            @for (shop of shopTable.data; track shop.id) {
              <tr>
                <td>
                  <div class="shop-name-col">
                    <span class="shop-icon">🏬</span>
                    <div>
                      <strong>{{ shop.ten }}</strong>
                      <div><small>{{ shop.moTa || 'Chưa có mô tả' }}</small></div>
                    </div>
                  </div>
                </td>
                <td>
                  <a [routerLink]="['/shop', shop.slug]" target="_blank" class="slug-link">
                    /shop/{{ shop.slug }} ↗
                  </a>
                </td>
                <td>
                  <div>📞 {{ shop.soDienThoai }}</div>
                  <div>✉️ {{ shop.email }}</div>
                  <small>📍 {{ shop.diaChi }}</small>
                </td>
                <td>
                  @if (shop.soTaiKhoanNganHang) {
                    <div><strong>{{ shop.tenNganHang }}</strong></div>
                    <div>STK: <code>{{ shop.soTaiKhoanNganHang }}</code></div>
                    <small>CTK: {{ shop.tenChuTaiKhoan }}</small>
                  } @else {
                    <span class="text-muted">Chưa liên kết</span>
                  }
                </td>
                <td>
                  <nz-tag nzColor="blue">{{ shop.phanTramHoaHong }}%</nz-tag>
                </td>
                <td>
                  <nz-tag [nzColor]="layMauTrangThai(shop.trangThai)">
                    {{ layTenTrangThai(shop.trangThai) }}
                  </nz-tag>
                </td>
                <td>
                  <div class="action-buttons">
                    @if (shop.trangThai === 'ChoDuyet') {
                      <button class="btn-action btn-approve" (click)="duyetShop(shop.id)">
                        ✓ Phê Duyệt
                      </button>
                    }
                    @if (shop.trangThai === 'HoatDong') {
                      <button class="btn-action btn-lock" (click)="khoaShop(shop.id)">
                        🔒 Tạm Khóa
                      </button>
                    }
                    @if (shop.trangThai === 'TamKhoa') {
                      <button class="btn-action btn-unlock" (click)="moKhoaShop(shop.id)">
                        🔓 Mở Khóa
                      </button>
                    }
                  </div>
                </td>
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
      margin-bottom: 24px;
      h2 {
        font-size: 22px;
        font-weight: 700;
        margin-bottom: 6px;
      }
      .desc {
        color: #64748b;
        font-size: 14px;
      }
    }
    .table-card {
      background: white;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      padding: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    }
    .shop-name-col {
      display: flex;
      align-items: center;
      gap: 10px;
      .shop-icon { font-size: 24px; }
    }
    .slug-link {
      color: #2563eb;
      font-weight: 600;
      text-decoration: none;
      &:hover { text-decoration: underline; }
    }
    .action-buttons {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }
    .btn-action {
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      border: none;
      cursor: pointer;
      transition: opacity 0.2s;
      &:hover { opacity: 0.85; }
      &.btn-approve { background: #10b981; color: white; }
      &.btn-lock { background: #f59e0b; color: white; }
      &.btn-unlock { background: #3b82f6; color: white; }
    }
    .text-muted { color: #94a3b8; font-size: 12px; }
  `]
})
export class AdminGianHangComponent implements OnInit {
  private readonly duLieuService = inject(DuLieuService);
  private readonly message = inject(NzMessageService);

  readonly dangTai = signal<boolean>(true);
  readonly danhSachShop = signal<CuaHang[]>([]);

  ngOnInit(): void {
    this.taiDanhSachShop();
  }

  taiDanhSachShop(): void {
    this.dangTai.set(true);
    this.duLieuService.getDanhSachCuaHang().subscribe({
      next: (res) => {
        this.danhSachShop.set(res.items || []);
        this.dangTai.set(false);
      },
      error: (err) => {
        this.dangTai.set(false);
        this.message.error(trichXuatThongBaoLoi(err, 'Lỗi nạp danh sách gian hàng!'));
      }
    });
  }

  duyetShop(id: string): void {
    this.duLieuService.duyetShop(id).subscribe({
      next: () => {
        this.message.success('Đã phê duyệt mở gian hàng!');
        this.taiDanhSachShop();
      },
      error: (err) => {
        this.message.error(trichXuatThongBaoLoi(err, 'Lỗi phê duyệt gian hàng!'));
      }
    });
  }

  khoaShop(id: string): void {
    if (!confirm('Bạn có chắc muốn tạm khóa gian hàng này?')) return;
    this.duLieuService.khoaShop(id).subscribe({
      next: () => {
        this.message.success('Đã tạm khóa gian hàng!');
        this.taiDanhSachShop();
      },
      error: (err) => {
        this.message.error(trichXuatThongBaoLoi(err, 'Lỗi khóa gian hàng!'));
      }
    });
  }

  moKhoaShop(id: string): void {
    this.duLieuService.moKhoaShop(id).subscribe({
      next: () => {
        this.message.success('Đã mở khóa gian hàng!');
        this.taiDanhSachShop();
      },
      error: (err) => {
        this.message.error(trichXuatThongBaoLoi(err, 'Lỗi mở khóa!'));
      }
    });
  }

  layMauTrangThai(tt: string): string {
    const map: Record<string, string> = {
      ChoDuyet: 'warning',
      HoatDong: 'success',
      TamKhoa: 'error',
      BiTuChoi: 'default'
    };
    return map[tt] || 'default';
  }

  layTenTrangThai(tt: string): string {
    const map: Record<string, string> = {
      ChoDuyet: 'Chờ Duyệt Mở Shop',
      HoatDong: 'Đang Hoạt Động',
      TamKhoa: 'Đang Tạm Khóa',
      BiTuChoi: 'Từ Chối'
    };
    return map[tt] || tt;
  }
}

