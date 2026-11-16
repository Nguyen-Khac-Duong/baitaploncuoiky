import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzCardModule } from 'ng-zorro-antd/card';

import { DuLieuService } from '../../he-thong/dich-vu/du-lieu.service';
import { SellerStateService } from '../services/seller-state.service';
import { GiaoDichVi, YeuCauRutTien } from '../../shared/mo-hinh/du-lieu.model';
import { trichXuatThongBaoLoi } from '../../he-thong/tien-ich/loi-api.helper';

@Component({
  selector: 'app-seller-vi-tien',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzTableModule,
    NzTagModule,
    NzButtonModule,
    NzModalModule,
    NzInputModule,
    NzInputNumberModule,
    NzIconModule,
    NzStatisticModule,
    NzGridModule,
    NzCardModule
  ],
  template: `
    <div class="seller-page-container">
      <div class="page-header">
        <div>
          <h2>💰 Quản Lý Dòng Tiền, Ví Shop & Đối Soát Escrow</h2>
          <p class="desc">Kiểm soát doanh thu bán hàng, quỹ tạm giữ và yêu cầu chuyển tiền về tài khoản ngân hàng của bạn.</p>
        </div>
        <div class="header-actions">
          <button nz-button nzType="default" (click)="moModalNganHang()">
            <span nz-icon nzType="bank"></span> Tài Khoản Ngân Hàng
          </button>
          <button nz-button nzType="primary" (click)="moModalRutTien()">
            <span nz-icon nzType="dollar"></span> Rút Tiền Về Ngân Hàng
          </button>
        </div>
      </div>

      <!-- CARDS DÒNG TIỀN (CHUẨN BẸT BẸT ĐẸP NHƯ ADMIN) -->
      <div nz-row [nzGutter]="[16, 16]" class="kpi-row wallet-kpi-row">
        <!-- Thẻ 1: Khả Dụng -->
        <div nz-col [nzXs]="24" [nzSm]="12" [nzLg]="6">
          <nz-card [nzBordered]="false" class="kpi-card card-green">
            <nz-statistic
              [nzValue]="formatTien(sellerState.viCuaHang()?.soDuKhaDung)"
              [nzTitle]="'Số Dư Khả Dụng'"
              [nzPrefix]="iconAvailable"
              [nzValueStyle]="{ color: '#10b981', fontWeight: '800', fontSize: '1.4rem' }"
            ></nz-statistic>
            <ng-template #iconAvailable><span class="kpi-emoji">💵</span></ng-template>
            <div class="kpi-extra text-muted">Có thể rút về ngay</div>
          </nz-card>
        </div>

        <!-- Thẻ 2: Tạm Giữ Escrow -->
        <div nz-col [nzXs]="24" [nzSm]="12" [nzLg]="6">
          <nz-card [nzBordered]="false" class="kpi-card card-yellow">
            <nz-statistic
              [nzValue]="formatTien(sellerState.viCuaHang()?.soDuTamGiu)"
              [nzTitle]="'Tạm Giữ Escrow'"
              [nzPrefix]="iconEscrow"
              [nzValueStyle]="{ color: '#f59e0b', fontWeight: '800', fontSize: '1.4rem' }"
            ></nz-statistic>
            <ng-template #iconEscrow><span class="kpi-emoji">⏳</span></ng-template>
            <div class="kpi-extra text-muted">Đang giao hàng</div>
          </nz-card>
        </div>

        <!-- Thẻ 3: Đang Chờ Duyệt Rút -->
        <div nz-col [nzXs]="24" [nzSm]="12" [nzLg]="6">
          <nz-card [nzBordered]="false" class="kpi-card card-orange">
            <nz-statistic
              [nzValue]="formatTien(sellerState.viCuaHang()?.tongTienDangChoDuyet ?? tongTienDangChoDuyet())"
              [nzTitle]="'Đang Chờ Duyệt Rút'"
              [nzPrefix]="iconPending"
              [nzValueStyle]="{ color: '#ea580c', fontWeight: '800', fontSize: '1.4rem' }"
            ></nz-statistic>
            <ng-template #iconPending><span class="kpi-emoji">🕒</span></ng-template>
            <div class="kpi-extra" style="color: #ea580c; font-weight: 600;">Admin đang xử lý giải ngân</div>
          </nz-card>
        </div>

        <!-- Thẻ 4: Đã Rút Thành Công -->
        <div nz-col [nzXs]="24" [nzSm]="12" [nzLg]="6">
          <nz-card [nzBordered]="false" class="kpi-card card-blue">
            <nz-statistic
              [nzValue]="formatTien(sellerState.viCuaHang()?.tongTienDaRut)"
              [nzTitle]="'Đã Rút Thành Công'"
              [nzPrefix]="iconWithdrawn"
              [nzValueStyle]="{ color: '#3b82f6', fontWeight: '800', fontSize: '1.4rem' }"
            ></nz-statistic>
            <ng-template #iconWithdrawn><span class="kpi-emoji">🏦</span></ng-template>
            <div class="kpi-extra text-muted">Đã chuyển khoản thành công</div>
          </nz-card>
        </div>
      </div>

      <!-- 2 BẢNG LỊCH SỬ -->
      <div class="tables-grid">
        <!-- Bảng 1: Lịch sử biến động Ledger -->
        <div class="sub-table-card">
          <h3>📜 Lịch Sử Biến Động Số Dư (Ledger)</h3>
          <nz-table #gdTable [nzData]="giaoDichList()" [nzLoading]="dangTai()" [nzBordered]="true" [nzPageSize]="5">
            <thead>
              <tr>
                <th>Thời Gian</th>
                <th>Loại Giao Dịch</th>
                <th>Biến Động</th>
                <th>Nội Dung</th>
              </tr>
            </thead>
            <tbody>
              @for (item of gdTable.data; track item.id) {
                <tr>
                  <td>{{ item.creationTime | date:'dd/MM/yyyy HH:mm' }}</td>
                  <td>
                    <nz-tag [nzColor]="item.soTien >= 0 ? 'green' : 'red'">{{ item.loaiGiaoDich }}</nz-tag>
                  </td>
                  <td [class.text-success]="item.soTien > 0" [class.text-danger]="item.soTien < 0" class="font-bold">
                    {{ item.soTien > 0 ? '+' : '' }}{{ formatTien(item.soTien) }}
                  </td>
                  <td>{{ item.moTa }}</td>
                </tr>
              }
            </tbody>
          </nz-table>
        </div>

        <!-- Bảng 2: Lịch sử yêu cầu rút tiền -->
        <div class="sub-table-card">
          <h3>💳 Lịch Sử Yêu Cầu Rút Tiền</h3>
          <nz-table #rtTable [nzData]="rutTienList()" [nzLoading]="dangTai()" [nzBordered]="true" [nzPageSize]="5">
            <thead>
              <tr>
                <th>Thời Gian</th>
                <th>Số Tiền</th>
                <th>Ngân Hàng Nhận</th>
                <th>Trạng Thái</th>
              </tr>
            </thead>
            <tbody>
              @for (item of rtTable.data; track item.id) {
                <tr>
                  <td>{{ item.creationTime | date:'dd/MM/yyyy HH:mm' }}</td>
                  <td class="font-bold text-danger">-{{ formatTien(item.soTien) }}</td>
                  <td>
                    <div>{{ item.tenNganHang }}</div>
                    <small class="text-muted">{{ item.soTaiKhoan }} ({{ item.tenChuTaiKhoan }})</small>
                  </td>
                  <td>
                    <nz-tag [nzColor]="layMauRut(item.trangThai)">
                      {{ item.trangThai === 'ChoDuyet' ? 'Chờ Duyệt' : (item.trangThai === 'DaChuyenTien' ? 'Đã Giải Ngân' : 'Từ Chối') }}
                    </nz-tag>
                    @if (item.lyDoTuChoi) {
                      <div class="reject-text"><small>Lý do: {{ item.lyDoTuChoi }}</small></div>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </nz-table>
        </div>
      </div>

      <!-- MODAL RÚT TIỀN -->
      <nz-modal
        [(nzVisible)]="hienModalRutTien"
        nzTitle="💰 Yêu Cầu Rút Tiền Về Ngân Hàng"
        (nzOnCancel)="hienModalRutTien = false"
        (nzOnOk)="guiYeuCauRutTien()"
        [nzOkLoading]="dangRut"
      >
        <ng-container *nzModalContent>
          @if (!sellerState.cuaHang()?.soTaiKhoanNganHang) {
            <div class="alert-warning">
              ⚠️ Bạn chưa cập nhật tài khoản ngân hàng thụ hưởng! Vui lòng liên kết ngân hàng trước khi rút tiền.
            </div>
          } @else {
            <form [formGroup]="formRutTien" class="modal-form">
              <div class="bank-preview">
                <div>Ngân hàng: <strong>{{ sellerState.cuaHang()?.tenNganHang }}</strong></div>
                <div>Số tài khoản: <strong>{{ sellerState.cuaHang()?.soTaiKhoanNganHang }}</strong></div>
                <div>Chủ tài khoản: <strong>{{ sellerState.cuaHang()?.tenChuTaiKhoan }}</strong></div>
              </div>

              <div class="form-group">
                <label>Số Tiền Rút (VNĐ) *</label>
                <input
                  nz-input
                  type="text"
                  [value]="dinhDangSo(formRutTien.get('soTien')?.value)"
                  (input)="onTienInput($event, 'soTien')"
                  placeholder="VD: 500.000 (Tối thiểu 50.000đ)"
                />
                <small class="text-muted">Khả dụng: {{ formatTien(sellerState.viCuaHang()?.soDuKhaDung) }}</small>
              </div>

              <div class="form-group">
                <label>Ghi Chú Gửi Admin</label>
                <textarea nz-input rows="2" formControlName="ghiChu" placeholder="Nội dung chuyển khoản..."></textarea>
              </div>
            </form>
          }
        </ng-container>
      </nz-modal>

      <!-- MODAL LIÊN KẾT NGÂN HÀNG -->
      <nz-modal
        [(nzVisible)]="hienModalNganHang"
        nzTitle="🏦 Cập Nhật Tài Khoản Ngân Hàng Thụ Hưởng"
        (nzOnCancel)="hienModalNganHang = false"
        (nzOnOk)="luuNganHang()"
        [nzOkLoading]="dangLuuNganHang"
      >
        <ng-container *nzModalContent>
          <form [formGroup]="formNganHang" class="modal-form">
            <div class="form-group">
              <label>Tên Ngân Hàng (VD: Vietcombank, MBBank, Techcombank) *</label>
              <input nz-input formControlName="tenNganHang" placeholder="MBBank Quân Đội" />
            </div>

            <div class="form-group">
              <label>Số Tài Khoản Ngân Hàng *</label>
              <input nz-input formControlName="soTaiKhoanNganHang" placeholder="0987654321" />
            </div>

            <div class="form-group">
              <label>Tên Chủ Tài Khoản (In hoa không dấu) *</label>
              <input nz-input formControlName="tenChuTaiKhoan" placeholder="NGUYEN VAN A" />
            </div>
          </form>
        </ng-container>
      </nz-modal>
    </div>
  `,
  styles: [`
    .seller-page-container {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
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
      .header-actions {
        display: flex;
        gap: 10px;
      }
    }
    .wallet-kpi-row {
      margin-bottom: 8px;
    }
    .kpi-card {
      border-radius: 1.25rem;
      background: var(--bg-card, #ffffff);
      border: 1px solid var(--border-color, #e2e8f0);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.04);
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      border-left: 5px solid transparent;

      &:hover {
        transform: translateY(-3px);
        box-shadow: 0 12px 25px rgba(0, 0, 0, 0.08);
      }

      &.card-green { border-left-color: #10b981; }
      &.card-yellow { border-left-color: #f59e0b; }
      &.card-orange { border-left-color: #ea580c; }
      &.card-blue { border-left-color: #3b82f6; }

      .kpi-emoji { font-size: 1.35rem; margin-right: 6px; vertical-align: middle; }
      .kpi-extra {
        margin-top: 0.5rem;
        font-size: 0.8rem;
        color: var(--text-secondary, #64748b);
      }
    }
    .tables-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      @media (max-width: 1024px) {
        grid-template-columns: 1fr;
      }
    }
    .sub-table-card {
      background: var(--bg-card, #ffffff);
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      border: 1px solid var(--border-color, #e2e8f0);
      h3 {
        margin: 0 0 16px 0;
        font-size: 16px;
        font-weight: 700;
        color: var(--text-primary, #1e293b);
      }
    }
    .modal-form {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
      label {
        font-weight: 600;
        font-size: 13px;
        color: var(--text-primary, #1e293b);
      }
    }
    .bank-preview {
      background: var(--bg-app, #f8fafc);
      padding: 12px;
      border-radius: 8px;
      border: 1px solid var(--border-color, #e2e8f0);
      font-size: 13px;
      line-height: 1.6;
    }
    .alert-warning {
      background: #fffbe6;
      border: 1px solid #ffe58f;
      padding: 12px;
      border-radius: 8px;
      color: #d48806;
      font-size: 14px;
    }
    .reject-text {
      color: #ef4444;
      margin-top: 2px;
    }
  `]
})
export class SellerViTienComponent implements OnInit {
  private readonly duLieuService = inject(DuLieuService);
  readonly sellerState = inject(SellerStateService);
  private readonly fb = inject(FormBuilder);
  private readonly message = inject(NzMessageService);

  readonly giaoDichList = signal<GiaoDichVi[]>([]);
  readonly rutTienList = signal<YeuCauRutTien[]>([]);
  readonly dangTai = signal<boolean>(true);

  readonly tongTienDangChoDuyet = computed(() => {
    return this.rutTienList()
      .filter(item => item.trangThai === 'ChoDuyet')
      .reduce((sum, item) => sum + (Number(item.soTien) || 0), 0);
  });

  hienModalRutTien = false;
  dangRut = false;
  formRutTien!: FormGroup;

  hienModalNganHang = false;
  dangLuuNganHang = false;
  formNganHang!: FormGroup;

  ngOnInit(): void {
    this.khoiTaoForms();
    this.taiDuLieu();
  }

  khoiTaoForms(): void {
    this.formRutTien = this.fb.group({
      soTien: [100000, [Validators.required, Validators.min(50000)]],
      ghiChu: ['']
    });

    this.formNganHang = this.fb.group({
      tenNganHang: ['', [Validators.required]],
      soTaiKhoanNganHang: ['', [Validators.required]],
      tenChuTaiKhoan: ['', [Validators.required]]
    });
  }

  taiDuLieu(): void {
    this.dangTai.set(true);
    this.sellerState.taiDuLieuPhu();

    this.duLieuService.getMyTransactions().subscribe({
      next: (res) => this.giaoDichList.set(res?.items || []),
      error: (e) => console.warn('Lỗi giao dịch:', e)
    });

    this.duLieuService.getMyPayoutRequests().subscribe({
      next: (res) => {
        this.rutTienList.set(res?.items || []);
        this.dangTai.set(false);
      },
      error: (e) => {
        console.warn('Lỗi rút tiền:', e);
        this.dangTai.set(false);
      }
    });
  }

  moModalRutTien(): void {
    this.formRutTien.reset({
      soTien: 100000,
      ghiChu: ''
    });
    this.hienModalRutTien = true;
  }

  moModalNganHang(): void {
    const shop = this.sellerState.cuaHang();
    this.formNganHang.patchValue({
      tenNganHang: shop?.tenNganHang || '',
      soTaiKhoanNganHang: shop?.soTaiKhoanNganHang || '',
      tenChuTaiKhoan: shop?.tenChuTaiKhoan || ''
    });
    this.hienModalNganHang = true;
  }

  guiYeuCauRutTien(): void {
    if (this.formRutTien.invalid) {
      this.formRutTien.markAllAsTouched();
      this.message.warning('Số tiền rút tối thiểu là 50,000 VNĐ!');
      return;
    }

    const val = this.formRutTien.value;
    const soDu = this.sellerState.viCuaHang()?.soDuKhaDung || 0;
    if (val.soTien > soDu) {
      this.message.error('Số dư khả dụng của bạn không đủ để thực hiện yêu cầu rút tiền này!');
      return;
    }

    this.dangRut = true;
    this.duLieuService.taoYeuCauRutTien({ soTien: val.soTien, ghiChu: val.ghiChu }).subscribe({
      next: () => {
        this.dangRut = false;
        this.hienModalRutTien = false;
        this.message.success('Đã gửi yêu cầu rút tiền thành công! Admin sàn sẽ giải ngân sớm.');
        this.taiDuLieu();
      },
      error: (err) => {
        this.dangRut = false;
        this.message.error(trichXuatThongBaoLoi(err, 'Lỗi tạo yêu cầu rút tiền!'));
      }
    });
  }

  luuNganHang(): void {
    if (this.formNganHang.invalid) {
      this.formNganHang.markAllAsTouched();
      this.message.warning('Vui lòng điền đầy đủ thông tin tài khoản ngân hàng!');
      return;
    }

    this.dangLuuNganHang = true;
    this.duLieuService.capNhatNganHangCuaHang(this.formNganHang.value).subscribe({
      next: () => {
        this.dangLuuNganHang = false;
        this.hienModalNganHang = false;
        this.message.success('Cập nhật tài khoản ngân hàng thụ hưởng thành công!');
        this.sellerState.taiThongTinShop().subscribe();
      },
      error: (err) => {
        this.dangLuuNganHang = false;
        this.message.error(trichXuatThongBaoLoi(err, 'Lỗi cập nhật ngân hàng!'));
      }
    });
  }

  dinhDangSo(val: number | string | null | undefined): string {
    if (val === null || val === undefined || val === '') return '';
    const num = typeof val === 'number' ? val : parseInt(String(val).replace(/\D/g, ''), 10);
    if (isNaN(num)) return '';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  onTienInput(event: Event, controlName: string): void {
    const input = event.target as HTMLInputElement;
    const originalValue = input.value;
    const selectionStart = input.selectionStart || originalValue.length;

    const digitsBeforeCursor = originalValue.slice(0, selectionStart).replace(/\D/g, '').length;

    let raw = originalValue.replace(/\D/g, '');
    if (raw.length > 1 && raw.startsWith('0')) {
      raw = raw.replace(/^0+/, '');
    }

    const num = raw ? parseInt(raw, 10) : 0;
    this.formRutTien.get(controlName)?.setValue(num, { emitEvent: false });
    this.formRutTien.get(controlName)?.markAsDirty();

    const formatted = raw ? raw.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '';
    input.value = formatted;

    let newCursorPos = formatted.length;
    if (digitsBeforeCursor < raw.length) {
      let digitCount = 0;
      for (let i = 0; i < formatted.length; i++) {
        if (/\d/.test(formatted[i])) {
          digitCount++;
        }
        if (digitCount === digitsBeforeCursor) {
          newCursorPos = i + 1;
          break;
        }
      }
    }
    input.setSelectionRange(newCursorPos, newCursorPos);
  }

  formatTien(gia: number | undefined | null): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(gia || 0);
  }

  layMauRut(trangThai: string): string {
    switch (trangThai) {
      case 'ChoDuyet': return 'warning';
      case 'DaChuyenTien': return 'success';
      case 'BiTuChoi': return 'error';
      default: return 'default';
    }
  }
}
