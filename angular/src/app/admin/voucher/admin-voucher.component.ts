import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzIconModule } from 'ng-zorro-antd/icon';

import { DuLieuService } from '../../he-thong/dich-vu/du-lieu.service';
import { VoucherItem, TaoCapNhatVoucherInput } from '../../shared/mo-hinh/du-lieu.model';
import { trichXuatThongBaoLoi } from '../../he-thong/tien-ich/loi-api.helper';

@Component({
  selector: 'app-admin-voucher',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzTableModule,
    NzTagModule,
    NzButtonModule,
    NzModalModule,
    NzInputModule,
    NzSelectModule,
    NzIconModule
  ],
  template: `
    <div class="admin-voucher-container">
      <div class="page-header">
        <div>
          <h2>🎟️ Quản Lý Chương Trình Khuyến Mãi & Voucher Sàn</h2>
          <p class="desc">Phát hành và quản lý các mã giảm giá toàn sàn (Sàn tài trợ ngân sách) và giám sát voucher của các gian hàng.</p>
        </div>
        <button nz-button nzType="primary" (click)="moModalThem()">
          <span nz-icon nzType="plus"></span> + Phát Hành Voucher Sàn Mới
        </button>
      </div>

      <!-- KPI METRICS -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon purple">🏛️</div>
          <div class="stat-info">
            <span class="stat-label">Voucher Toàn Sàn</span>
            <span class="stat-val">{{ danhSachSan().length }}</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon green">⚡</div>
          <div class="stat-info">
            <span class="stat-label">Đang Hoạt Động</span>
            <span class="stat-val">{{ tongDangHoatDong() }}</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon blue">🛍️</div>
          <div class="stat-info">
            <span class="stat-label">Voucher Gian Hàng</span>
            <span class="stat-val">{{ danhSachShop().length }}</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon orange">🔥</div>
          <div class="stat-info">
            <span class="stat-label">Tổng Lượt Sử Dụng</span>
            <span class="stat-val">{{ tongLuotSuDung() }}</span>
          </div>
        </div>
      </div>

      <!-- TAB NAVIGATION -->
      <div class="tab-pills-bar">
        <button 
          type="button" 
          class="tab-pill" 
          [class.active]="tabHienTai() === 'san'"
          (click)="tabHienTai.set('san')"
        >
          🌐 Voucher Toàn Sàn (Sàn Tài Trợ)
          <span class="count-badge">{{ danhSachSan().length }}</span>
        </button>
        <button 
          type="button" 
          class="tab-pill" 
          [class.active]="tabHienTai() === 'shop'"
          (click)="tabHienTai.set('shop')"
        >
          🏪 Voucher Gian Hàng (Seller Phát Hành)
          <span class="count-badge">{{ danhSachShop().length }}</span>
        </button>
      </div>

      <!-- TABS CONTENT -->
      <div class="card-content">
        @if (tabHienTai() === 'san') {
          <nz-table #tableSan [nzData]="danhSachSan()" [nzLoading]="dangTai()" [nzBordered]="true" [nzPageSize]="10">
            <thead>
              <tr>
                <th>Mã Voucher</th>
                <th>Chương Trình Khuyến Mãi</th>
                <th>Mức Giảm</th>
                <th>Đơn Tối Thiểu</th>
                <th>Số Lượng / Đã Dùng</th>
                <th>Hiệu Lực</th>
                <th>Trạng Thái</th>
                <th>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              @for (v of tableSan.data; track v.id) {
                <tr>
                  <td>
                    <span class="voucher-code-badge san">{{ v.maVoucher }}</span>
                  </td>
                  <td>
                    <div class="voucher-title">{{ v.tieuDe }}</div>
                    @if (v.moTa) {
                      <small class="voucher-desc">{{ v.moTa }}</small>
                    }
                  </td>
                  <td>
                    <strong class="discount-val">
                      @if (v.loaiGiamGia === 'PhanTram') {
                        Giảm {{ v.giaTriGiam }}%
                        @if (v.giamToiDa) {
                          <br><small class="text-muted">(tối đa {{ formatTien(v.giamToiDa) }})</small>
                        }
                      } @else {
                        Giảm {{ formatTien(v.giaTriGiam) }}
                      }
                    </strong>
                  </td>
                  <td>{{ v.giaTriDonToiThieu > 0 ? formatTien(v.giaTriDonToiThieu) : 'Không giới hạn' }}</td>
                  <td>
                    <div class="usage-col">
                      <span><strong>{{ v.soLuongDaDung }}</strong> / {{ v.soLuong }}</span>
                      <div class="progress-bar-wrap">
                        <div class="progress-fill" [style.width.%]="tinhPhanTram(v.soLuongDaDung, v.soLuong)"></div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="date-col">
                      <span>Từ: {{ v.ngayBatDau | date:'dd/MM/yyyy' }}</span>
                      <span>Đến: {{ v.ngayKetThuc | date:'dd/MM/yyyy' }}</span>
                    </div>
                  </td>
                  <td>
                    <button 
                      nz-button 
                      [nzType]="v.kichHoat ? 'primary' : 'default'" 
                      nzSize="small" 
                      [class.btn-active-voucher]="v.kichHoat"
                      (click)="doiTrangThai(v.id)"
                    >
                      {{ v.kichHoat ? '✓ Hoạt Động' : 'Tạm Khóa' }}
                    </button>
                  </td>
                  <td>
                    <div class="action-btns">
                      <button nz-button nzType="link" nzSize="small" (click)="moModalSua(v)">
                        <span nz-icon nzType="edit"></span> Sửa
                      </button>
                      <button nz-button nzType="link" nzDanger nzSize="small" (click)="xoaVoucher(v.id, v.maVoucher)">
                        <span nz-icon nzType="delete"></span> Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </nz-table>
        } @else {
          <nz-table #tableShop [nzData]="danhSachShop()" [nzLoading]="dangTai()" [nzBordered]="true" [nzPageSize]="10">
            <thead>
              <tr>
                <th>Gian Hàng</th>
                <th>Mã Voucher</th>
                <th>Chương Trình</th>
                <th>Mức Giảm</th>
                <th>Đơn Tối Thiểu</th>
                <th>Đã Dùng / Tổng</th>
                <th>Hiệu Lực</th>
                <th>Trạng Thái</th>
                <th>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              @for (v of tableShop.data; track v.id) {
                <tr>
                  <td>
                    <strong class="shop-name-tag">🏪 {{ v.tenCuaHang || 'Shop Đối Tác' }}</strong>
                  </td>
                  <td>
                    <span class="voucher-code-badge shop">{{ v.maVoucher }}</span>
                  </td>
                  <td>
                    <div class="voucher-title">{{ v.tieuDe }}</div>
                    @if (v.moTa) {
                      <small class="voucher-desc">{{ v.moTa }}</small>
                    }
                  </td>
                  <td>
                    <strong class="discount-val">
                      @if (v.loaiGiamGia === 'PhanTram') {
                        Giảm {{ v.giaTriGiam }}%
                        @if (v.giamToiDa) {
                          <br><small class="text-muted">(tối đa {{ formatTien(v.giamToiDa) }})</small>
                        }
                      } @else {
                        Giảm {{ formatTien(v.giaTriGiam) }}
                      }
                    </strong>
                  </td>
                  <td>{{ v.giaTriDonToiThieu > 0 ? formatTien(v.giaTriDonToiThieu) : 'Không giới hạn' }}</td>
                  <td>
                    <div class="usage-col">
                      <span><strong>{{ v.soLuongDaDung }}</strong> / {{ v.soLuong }}</span>
                      <div class="progress-bar-wrap">
                        <div class="progress-fill shop" [style.width.%]="tinhPhanTram(v.soLuongDaDung, v.soLuong)"></div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="date-col">
                      <span>Từ: {{ v.ngayBatDau | date:'dd/MM/yyyy' }}</span>
                      <span>Đến: {{ v.ngayKetThuc | date:'dd/MM/yyyy' }}</span>
                    </div>
                  </td>
                  <td>
                    <button 
                      nz-button 
                      [nzType]="v.kichHoat ? 'primary' : 'default'" 
                      nzSize="small" 
                      [class.btn-active-voucher]="v.kichHoat"
                      (click)="doiTrangThai(v.id)"
                    >
                      {{ v.kichHoat ? '✓ Đang Bật' : 'Tạm Khóa' }}
                    </button>
                  </td>
                  <td>
                    <button nz-button nzType="link" nzDanger nzSize="small" (click)="xoaVoucher(v.id, v.maVoucher)">
                      <span nz-icon nzType="delete"></span> Xóa
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </nz-table>
        }
      </div>

      <!-- MODAL TẠO / SỬA VOUCHER TOÀN SÀN -->
      <nz-modal
        [(nzVisible)]="hienModal"
        [nzTitle]="dangSua ? '✏️ Cập Nhật Voucher Toàn Sàn' : '➕ Phát Hành Voucher Toàn Sàn Mới'"
        (nzOnCancel)="hienModal = false"
        (nzOnOk)="luuVoucher()"
        [nzOkLoading]="dangLuu"
        nzOkText="Lưu & Phát Hành"
        nzCancelText="Hủy Bỏ"
        [nzWidth]="640"
      >
        <ng-container *nzModalContent>
          <form [formGroup]="form" class="modal-form">
            <div class="form-row">
              <div class="form-group">
                <label>Mã Voucher Toàn Sàn *</label>
                <input
                  nz-input
                  formControlName="maVoucher"
                  placeholder="VD: FREESHIP, SUPERMALL, GIAM50K..."
                  style="text-transform: uppercase; font-weight: 700; letter-spacing: 1px;"
                />
              </div>

              <div class="form-group">
                <label>Loại Giảm Giá *</label>
                <nz-select formControlName="loaiGiamGia" style="width: 100%;">
                  <nz-option nzValue="SoTien" nzLabel="💵 Số tiền cố định (VNĐ)"></nz-option>
                  <nz-option nzValue="PhanTram" nzLabel="📊 Phần trăm (%) giá trị đơn"></nz-option>
                </nz-select>
              </div>
            </div>

            <div class="form-group">
              <label>Tên / Tiêu Đề Chương Trình *</label>
              <input nz-input formControlName="tieuDe" placeholder="VD: Miễn phí vận chuyển toàn sàn 30.000đ" />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>
                  Mức Giảm *
                  <span class="text-hint">({{ form.get('loaiGiamGia')?.value === 'PhanTram' ? '%' : 'VNĐ' }})</span>
                </label>
                <input
                  nz-input
                  type="text"
                  [value]="dinhDangSo(form.get('giaTriGiam')?.value)"
                  (input)="onTienInput($event, 'giaTriGiam')"
                  [placeholder]="form.get('loaiGiamGia')?.value === 'PhanTram' ? 'VD: 15' : 'VD: 30.000'"
                />
              </div>

              <div class="form-group">
                <label>Đơn Hàng Tối Thiểu (VNĐ)</label>
                <input
                  nz-input
                  type="text"
                  [value]="dinhDangSo(form.get('giaTriDonToiThieu')?.value)"
                  (input)="onTienInput($event, 'giaTriDonToiThieu')"
                  placeholder="VD: 100.000 (0 = Không yêu cầu)"
                />
              </div>
            </div>

            <div class="form-row">
              @if (form.get('loaiGiamGia')?.value === 'PhanTram') {
                <div class="form-group">
                  <label>Giảm Tối Đa (VNĐ) <small>(cho mã %)</small></label>
                  <input
                    nz-input
                    type="text"
                    [value]="dinhDangSo(form.get('giamToiDa')?.value)"
                    (input)="onTienInput($event, 'giamToiDa')"
                    placeholder="VD: 100.000"
                  />
                </div>
              }

              <div class="form-group">
                <label>Tổng Số Lượng Mã Phát Hành *</label>
                <input nz-input type="number" formControlName="soLuong" placeholder="VD: 500" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Ngày Bắt Đầu *</label>
                <input nz-input type="date" formControlName="ngayBatDau" />
              </div>

              <div class="form-group">
                <label>Ngày Hết Hạn *</label>
                <input nz-input type="date" formControlName="ngayKetThuc" />
              </div>
            </div>

            <div class="form-group">
              <label>Mô Tả / Điều Kiện Áp Dụng Toàn Sàn</label>
              <textarea nz-input rows="2" formControlName="moTa" placeholder="VD: Áp dụng cho mọi đơn hàng từ 100.000đ đặt trên toàn hệ thống sàn..."></textarea>
            </div>
          </form>
        </ng-container>
      </nz-modal>
    </div>
  `,
  styles: [`
    .admin-voucher-container {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;

      h2 {
        margin: 0;
        font-size: 1.35rem;
        font-weight: 800;
        color: #1e293b;
      }

      .desc {
        margin: 4px 0 0 0;
        font-size: 0.85rem;
        color: #64748b;
      }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;

      .stat-card {
        display: flex;
        align-items: center;
        gap: 1rem;
        background: #ffffff;
        border-radius: 12px;
        padding: 1.2rem;
        border: 1px solid #e2e8f0;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.4rem;

          &.purple { background: #f3e8ff; color: #7e22ce; }
          &.green { background: #dcfce7; color: #15803d; }
          &.blue { background: #dbeafe; color: #1d4ed8; }
          &.orange { background: #ffedd5; color: #c2410c; }
        }

        .stat-info {
          display: flex;
          flex-direction: column;

          .stat-label {
            font-size: 0.8rem;
            color: #64748b;
            font-weight: 600;
          }

          .stat-val {
            font-size: 1.4rem;
            font-weight: 800;
            color: #0f172a;
          }
        }
      }
    }

    .tab-pills-bar {
      display: flex;
      gap: 0.75rem;
      background: #f1f5f9;
      padding: 6px;
      border-radius: 10px;
      width: fit-content;

      .tab-pill {
        border: none;
        background: transparent;
        padding: 8px 16px;
        border-radius: 8px;
        font-weight: 700;
        font-size: 0.85rem;
        color: #64748b;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: all 0.2s ease;

        .count-badge {
          background: #cbd5e1;
          color: #334155;
          padding: 1px 7px;
          border-radius: 999px;
          font-size: 0.75rem;
        }

        &.active {
          background: #ffffff;
          color: #1e293b;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

          .count-badge {
            background: #2563eb;
            color: #ffffff;
          }
        }
      }
    }

    .card-content {
      background: #ffffff;
      border-radius: 12px;
      padding: 1.5rem;
      border: 1px solid #e2e8f0;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }

    .voucher-code-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 6px;
      font-weight: 800;
      font-size: 0.85rem;
      letter-spacing: 0.5px;

      &.san {
        background: #ede9fe;
        color: #6d28d9;
        border: 1px dashed #8b5cf6;
      }

      &.shop {
        background: #fef3c7;
        color: #b45309;
        border: 1px dashed #f59e0b;
      }
    }

    .shop-name-tag {
      color: #0284c7;
      font-size: 0.85rem;
    }

    .voucher-title {
      font-weight: 600;
      color: #1e293b;
    }

    .voucher-desc {
      color: #64748b;
      font-size: 0.8rem;
    }

    .discount-val {
      color: #dc2626;
      font-size: 0.95rem;
    }

    .usage-col {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 100px;

      .progress-bar-wrap {
        height: 6px;
        background: #e2e8f0;
        border-radius: 999px;
        overflow: hidden;

        .progress-fill {
          height: 100%;
          background: #7c3aed;
          border-radius: 999px;

          &.shop {
            background: #f59e0b;
          }
        }
      }
    }

    .date-col {
      display: flex;
      flex-direction: column;
      font-size: 0.75rem;
      color: #64748b;
    }

    .btn-active-voucher {
      background: #059669;
      border-color: #059669;
    }

    .action-btns {
      display: flex;
      gap: 4px;
    }

    .modal-form {
      display: flex;
      flex-direction: column;
      gap: 12px;

      .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 4px;

        label {
          font-weight: 600;
          font-size: 13px;
          color: #1e293b;

          .text-hint {
            color: #64748b;
            font-weight: normal;
          }
        }
      }
    }
  `]
})
export class AdminVoucherComponent implements OnInit {
  private readonly duLieuService = inject(DuLieuService);
  private readonly fb = inject(FormBuilder);
  private readonly message = inject(NzMessageService);

  readonly danhSachTatCa = signal<VoucherItem[]>([]);
  readonly dangTai = signal<boolean>(true);
  readonly tabHienTai = signal<'san' | 'shop'>('san');

  readonly danhSachSan = computed(() => this.danhSachTatCa().filter(x => !x.cuaHangId));
  readonly danhSachShop = computed(() => this.danhSachTatCa().filter(x => !!x.cuaHangId));

  readonly tongDangHoatDong = computed(() => this.danhSachTatCa().filter(x => x.kichHoat).length);
  readonly tongLuotSuDung = computed(() => this.danhSachTatCa().reduce((sum, x) => sum + (x.soLuongDaDung || 0), 0));

  hienModal: boolean = false;
  dangSua: VoucherItem | null = null;
  dangLuu: boolean = false;
  form!: FormGroup;

  ngOnInit(): void {
    this.khoiTaoForm();
    this.taiDuLieu();
  }

  khoiTaoForm(): void {
    const today = new Date().toISOString().substring(0, 10);
    const nextYear = new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().substring(0, 10);

    this.form = this.fb.group({
      maVoucher: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20), Validators.pattern(/^[A-Za-z0-9_-]+$/)]],
      tieuDe: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(256)]],
      moTa: [''],
      loaiGiamGia: ['SoTien', [Validators.required]],
      giaTriGiam: [30000, [Validators.required, Validators.min(1)]],
      giaTriDonToiThieu: [100000, [Validators.required, Validators.min(0)]],
      giamToiDa: [null],
      soLuong: [500, [Validators.required, Validators.min(1)]],
      ngayBatDau: [today, [Validators.required]],
      ngayKetThuc: [nextYear, [Validators.required]]
    });
  }

  taiDuLieu(): void {
    this.dangTai.set(true);
    this.duLieuService.getDanhSachVouchers().subscribe({
      next: (list) => {
        this.danhSachTatCa.set(list || []);
        this.dangTai.set(false);
      },
      error: () => {
        this.dangTai.set(false);
      }
    });
  }

  moModalThem(): void {
    this.dangSua = null;
    this.khoiTaoForm();
    this.hienModal = true;
  }

  moModalSua(v: VoucherItem): void {
    this.dangSua = v;
    const startStr = v.ngayBatDau ? v.ngayBatDau.substring(0, 10) : '';
    const endStr = v.ngayKetThuc ? v.ngayKetThuc.substring(0, 10) : '';

    this.form.patchValue({
      maVoucher: v.maVoucher,
      tieuDe: v.tieuDe,
      moTa: v.moTa || '',
      loaiGiamGia: v.loaiGiamGia,
      giaTriGiam: v.giaTriGiam,
      giaTriDonToiThieu: v.giaTriDonToiThieu,
      giamToiDa: v.giamToiDa,
      soLuong: v.soLuong,
      ngayBatDau: startStr,
      ngayKetThuc: endStr
    });
    this.hienModal = true;
  }

  doiTrangThai(id: string): void {
    this.duLieuService.doiTrangThaiVoucher(id).subscribe({
      next: (updated) => {
        this.message.success(updated.kichHoat ? 'Đã kích hoạt mã khuyến mãi!' : 'Đã tạm khóa mã khuyến mãi!');
        this.taiDuLieu();
      },
      error: (err) => {
        this.message.error(trichXuatThongBaoLoi(err, 'Lỗi thay đổi trạng thái voucher!'));
      }
    });
  }

  luuVoucher(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.message.warning('Vui lòng kiểm tra lại thông tin mã voucher!');
      return;
    }

    this.dangLuu = true;
    const val: TaoCapNhatVoucherInput = {
      ...this.form.value,
      maVoucher: this.form.value.maVoucher.trim().toUpperCase(),
      giaTriGiam: Number(this.form.value.giaTriGiam || 0),
      giaTriDonToiThieu: Number(this.form.value.giaTriDonToiThieu || 0),
      giamToiDa: this.form.value.giamToiDa ? Number(this.form.value.giamToiDa) : undefined,
      soLuong: Number(this.form.value.soLuong || 100),
      ngayBatDau: new Date(this.form.value.ngayBatDau).toISOString(),
      ngayKetThuc: new Date(this.form.value.ngayKetThuc).toISOString(),
      cuaHangId: undefined // Admin tạo voucher toàn sàn
    };

    if (this.dangSua) {
      this.duLieuService.capNhatVoucher(this.dangSua.id, val).subscribe({
        next: () => {
          this.dangLuu = false;
          this.hienModal = false;
          this.message.success('Cập nhật mã voucher sàn thành công!');
          this.taiDuLieu();
        },
        error: (err) => {
          this.dangLuu = false;
          this.message.error(trichXuatThongBaoLoi(err, 'Lỗi cập nhật mã voucher!'));
        }
      });
    } else {
      this.duLieuService.taoVoucher(val).subscribe({
        next: () => {
          this.dangLuu = false;
          this.hienModal = false;
          this.message.success('Phát hành voucher toàn sàn thành công!');
          this.taiDuLieu();
        },
        error: (err) => {
          this.dangLuu = false;
          this.message.error(trichXuatThongBaoLoi(err, 'Lỗi tạo mã voucher!'));
        }
      });
    }
  }

  xoaVoucher(id: string, ma: string): void {
    if (!confirm(`Bạn có chắc chắn muốn xóa mã voucher '${ma}'?`)) return;
    this.duLieuService.xoaVoucher(id).subscribe({
      next: () => {
        this.message.success(`Đã xóa mã voucher '${ma}'!`);
        this.taiDuLieu();
      },
      error: (err) => {
        this.message.error(trichXuatThongBaoLoi(err, 'Lỗi xóa voucher!'));
      }
    });
  }

  tinhPhanTram(daDung: number, tong: number): number {
    if (!tong || tong <= 0) return 0;
    return Math.min(100, Math.round((daDung / tong) * 100));
  }

  formatTien(gia: number | undefined | null): string {
    const val = Number(gia || 0);
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(isNaN(val) ? 0 : val);
  }

  dinhDangSo(val: number | string | null | undefined): string {
    if (val === null || val === undefined || val === '') return '';
    const num = typeof val === 'number' ? val : Number(val.toString().replace(/[^0-9]/g, ''));
    if (isNaN(num)) return '';
    return num.toLocaleString('vi-VN');
  }

  onTienInput(event: Event, field: string): void {
    const input = event.target as HTMLInputElement;
    const rawVal = input.value.replace(/[^0-9]/g, '');
    const numVal = rawVal ? Number(rawVal) : 0;
    this.form.patchValue({ [field]: numVal }, { emitEvent: false });
    input.value = this.dinhDangSo(numVal);
  }
}
