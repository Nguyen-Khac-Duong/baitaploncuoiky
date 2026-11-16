import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { FormsModule } from '@angular/forms';

import { DuLieuService } from '../../he-thong/dich-vu/du-lieu.service';
import { YeuCauRutTien } from '../../shared/mo-hinh/du-lieu.model';
import { trichXuatThongBaoLoi } from '../../he-thong/tien-ich/loi-api.helper';

@Component({
  selector: 'app-admin-rut-tien',
  standalone: true,
  imports: [CommonModule, NzTableModule, NzTagModule, NzButtonModule, NzModalModule, FormsModule],
  template: `
    <div class="admin-page-container">
      <div class="page-header">
        <div>
          <h2>💳 Duyệt Yêu Cầu Rút Tiền Từ Gian Hàng (Seller Payout)</h2>
          <p class="desc">Kiểm tra thông tin số tài khoản ngân hàng và giải ngân doanh thu cho các chủ gian hàng.</p>
        </div>
      </div>

      <div class="table-card">
        <nz-table #payoutTable [nzData]="danhSachRut()" [nzLoading]="dangTai()" [nzBordered]="true">
          <thead>
            <tr>
              <th>Thời Gian</th>
              <th>Gian Hàng</th>
              <th>Số Tiền Rút</th>
              <th>Tài Khoản Thụ Hưởng</th>
              <th>Ghi Chú</th>
              <th>Trạng Thái</th>
              <th>Thao Tác Duyệt</th>
            </tr>
          </thead>
          <tbody>
            @for (item of payoutTable.data; track item.id) {
              <tr>
                <td>{{ item.creationTime | date:'dd/MM/yyyy HH:mm' }}</td>
                <td>
                  <strong>🏪 {{ item.tenCuaHang }}</strong>
                </td>
                <td class="font-bold text-primary">
                  {{ formatTien(item.soTien) }}
                </td>
                <td>
                  <div>Ngân hàng: <strong>{{ item.tenNganHang }}</strong></div>
                  <div>STK: <code>{{ item.soTaiKhoan }}</code></div>
                  <small>CTK: {{ item.tenChuTaiKhoan }}</small>
                </td>
                <td>{{ item.ghiChu || 'Không có' }}</td>
                <td>
                  <nz-tag [nzColor]="layMauTrangThai(item.trangThai)">
                    {{ layTenTrangThai(item.trangThai) }}
                  </nz-tag>
                  @if (item.lyDoTuChoi) {
                    <div class="text-danger small">Lý do: {{ item.lyDoTuChoi }}</div>
                  }
                </td>
                <td>
                  @if (item.trangThai === 'ChoDuyet') {
                    <div class="action-buttons">
                      <button class="btn-action btn-approve" (click)="duyetChuyenTien(item)">
                        ✓ Đã Chuyển Tiền
                      </button>
                      <button class="btn-action btn-reject" (click)="moModalTuChoi(item)">
                        ✕ Từ Chối
                      </button>
                    </div>
                  } @else {
                    <span class="text-muted">Đã xử lý ({{ item.ngayXuLy | date:'dd/MM HH:mm' }})</span>
                  }
                </td>
              </tr>
            }
          </tbody>
        </nz-table>
      </div>

      <!-- MODAL TỪ CHỐI -->
      <nz-modal
        [(nzVisible)]="hienModalTuChoi"
        nzTitle="Từ Chối Yêu Cầu Rút Tiền"
        (nzOnCancel)="hienModalTuChoi = false"
        (nzOnOk)="xacNhanTuChoi()"
        nzOkText="Xác Nhận Từ Chối & Hoàn Tiền"
      >
        <ng-container *nzModalContent>
          <p>Hệ thống sẽ tự động hoàn lại <strong>{{ formatTien(yeuCauDangXuLy?.soTien) }}</strong> vào số dư khả dụng của shop.</p>
          <label><strong>Lý do từ chối:</strong></label>
          <input type="text" [(ngModel)]="lyDoTuChoi" class="reject-input" placeholder="Ví dụ: Sai tên chủ tài khoản ngân hàng..." />
        </ng-container>
      </nz-modal>
    </div>
  `,
  styles: [`
    .admin-page-container { padding: 24px; }
    .page-header {
      margin-bottom: 24px;
      h2 { font-size: 22px; font-weight: 700; margin-bottom: 6px; }
      .desc { color: #64748b; font-size: 14px; }
    }
    .table-card {
      background: white;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      padding: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    }
    .action-buttons { display: flex; gap: 6px; }
    .btn-action {
      padding: 5px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      border: none;
      cursor: pointer;
      &.btn-approve { background: #10b981; color: white; }
      &.btn-reject { background: #ef4444; color: white; }
    }
    .reject-input {
      width: 100%;
      padding: 8px 12px;
      margin-top: 8px;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
    }
    .font-bold { font-weight: 700; }
    .text-primary { color: #2563eb; }
    .text-danger { color: #ef4444; }
    .text-muted { color: #94a3b8; font-size: 12px; }
    .small { font-size: 12px; margin-top: 4px; }
  `]
})
export class AdminRutTienComponent implements OnInit {
  private readonly duLieuService = inject(DuLieuService);
  private readonly message = inject(NzMessageService);

  readonly dangTai = signal<boolean>(true);
  readonly danhSachRut = signal<YeuCauRutTien[]>([]);

  hienModalTuChoi = false;
  yeuCauDangXuLy: YeuCauRutTien | null = null;
  lyDoTuChoi = '';

  ngOnInit(): void {
    this.taiDanhSachRutTien();
  }

  taiDanhSachRutTien(): void {
    this.dangTai.set(true);
    this.duLieuService.getAdminPayoutRequests().subscribe({
      next: (res) => {
        this.danhSachRut.set(res.items || []);
        this.dangTai.set(false);
      },
      error: (err) => {
        this.dangTai.set(false);
        this.message.error(trichXuatThongBaoLoi(err, 'Lỗi nạp danh sách rút tiền!'));
      }
    });
  }

  duyetChuyenTien(item: YeuCauRutTien): void {
    if (!confirm(`Xác nhận bạn đã chuyển khoản ${this.formatTien(item.soTien)} cho ${item.tenChuTaiKhoan} (${item.tenNganHang})?`)) return;

    this.duLieuService.xuLyRutTien(item.id, { dongY: true }).subscribe({
      next: () => {
        this.message.success('Đã xác nhận chuyển tiền thành công!');
        this.taiDanhSachRutTien();
      },
      error: (err) => {
        this.message.error(trichXuatThongBaoLoi(err, 'Lỗi duyệt rút tiền!'));
      }
    });
  }

  moModalTuChoi(item: YeuCauRutTien): void {
    this.yeuCauDangXuLy = item;
    this.lyDoTuChoi = '';
    this.hienModalTuChoi = true;
  }

  xacNhanTuChoi(): void {
    if (!this.yeuCauDangXuLy) return;
    if (!this.lyDoTuChoi.trim()) {
      this.message.warning('Vui lòng nhập lý do từ chối!');
      return;
    }

    this.duLieuService.xuLyRutTien(this.yeuCauDangXuLy.id, {
      dongY: false,
      lyDoTuChoi: this.lyDoTuChoi
    }).subscribe({
      next: () => {
        this.hienModalTuChoi = false;
        this.message.success('Đã từ chối và hoàn tiền về ví của shop!');
        this.taiDanhSachRutTien();
      },
      error: (err) => {
        this.message.error(trichXuatThongBaoLoi(err, 'Lỗi từ chối rút tiền!'));
      }
    });
  }

  formatTien(soTien?: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(soTien || 0);
  }

  layMauTrangThai(tt: string): string {
    const map: Record<string, string> = {
      ChoDuyet: 'warning',
      DaChuyenTien: 'success',
      TuChoi: 'error'
    };
    return map[tt] || 'default';
  }

  layTenTrangThai(tt: string): string {
    const map: Record<string, string> = {
      ChoDuyet: 'Chờ Duyệt & Chuyển Tiền',
      DaChuyenTien: 'Đã Giải Ngân',
      TuChoi: 'Từ Chối'
    };
    return map[tt] || tt;
  }
}

