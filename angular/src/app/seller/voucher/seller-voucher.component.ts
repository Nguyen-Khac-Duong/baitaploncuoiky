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
import { NzSwitchModule } from 'ng-zorro-antd/switch';

import { DuLieuService } from '../../he-thong/dich-vu/du-lieu.service';
import { SellerStateService } from '../services/seller-state.service';
import { VoucherItem, TaoCapNhatVoucherInput } from '../../shared/mo-hinh/du-lieu.model';
import { trichXuatThongBaoLoi } from '../../he-thong/tien-ich/loi-api.helper';

@Component({
  selector: 'app-seller-voucher',
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
    NzIconModule,
    NzSwitchModule
  ],
  template: `
    <div class="seller-page-container">
      <div class="page-header">
        <div>
          <h2>🎟️ Quản Lý Chương Trình Khuyến Mãi & Voucher Của Shop</h2>
          <p class="desc">Chủ động tung ra các mã giảm giá riêng của gian hàng để thu hút khách hàng, kích cầu mua sắm và tăng doanh thu.</p>
        </div>
        <button nz-button nzType="primary" (click)="moModalThem()">
          <span nz-icon nzType="plus"></span> + Tạo Mã Voucher Mới
        </button>
      </div>

      <!-- THỐNG KÊ NHANH VOUCHER CỦA SHOP -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon purple">🎫</div>
          <div class="stat-info">
            <span class="stat-label">Tổng số Voucher</span>
            <span class="stat-val">{{ danhSach().length }}</span>
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
          <div class="stat-icon blue">🛒</div>
          <div class="stat-info">
            <span class="stat-label">Lượt Đã Áp Dụng</span>
            <span class="stat-val">{{ tongDaSuDung() }}</span>
          </div>
        </div>
      </div>

      <!-- BẢNG DỮ LIỆU VOUCHER -->
      <div class="table-card">
        <nz-table #voucherTable [nzData]="danhSach()" [nzLoading]="dangTai()" [nzBordered]="true" [nzPageSize]="10">
          <thead>
            <tr>
              <th>Mã Voucher</th>
              <th>Tiêu Đề Khuyến Mãi</th>
              <th>Mức Giảm</th>
              <th>Đơn Tối Thiểu</th>
              <th>Số Lượng / Đã Dùng</th>
              <th>Thời Gian Hiệu Lực</th>
              <th>Trạng Thái</th>
              <th>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            @for (v of voucherTable.data; track v.id) {
              <tr>
                <td>
                  <span class="voucher-code-badge">{{ v.maVoucher }}</span>
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
                <td>
                  <span>{{ v.giaTriDonToiThieu > 0 ? formatTien(v.giaTriDonToiThieu) : 'Không giới hạn' }}</span>
                </td>
                <td>
                  <div class="usage-col">
                    <span class="usage-count"><strong>{{ v.soLuongDaDung }}</strong> / {{ v.soLuong }}</span>
                    <div class="progress-bar-wrap">
                      <div class="progress-fill" [style.width.%]="tinhPhanTramDung(v.soLuongDaDung, v.soLuong)"></div>
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
      </div>

      <!-- MODAL THÊM / SỬA VOUCHER -->
      <nz-modal
        [(nzVisible)]="hienModal"
        [nzTitle]="dangSua ? '✏️ Cập Nhật Mã Khuyến Mãi' : '➕ Tạo Mã Khuyến Mãi Mới Cho Shop'"
        (nzOnCancel)="hienModal = false"
        (nzOnOk)="luuVoucher()"
        [nzOkLoading]="dangLuu"
        nzOkText="Lưu Khuyến Mãi"
        nzCancelText="Hủy Bỏ"
        [nzWidth]="640"
      >
        <ng-container *nzModalContent>
          <form [formGroup]="form" class="voucher-modal-form">
            <div class="form-row">
              <div class="form-group">
                <label>Mã Voucher (In hoa, không khoảng trắng) *</label>
                <input
                  nz-input
                  formControlName="maVoucher"
                  placeholder="VD: SHOP20K, CHAOBAN10..."
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
              <label>Tên / Tiêu Đề Chiến Dịch Khuyến Mãi *</label>
              <input nz-input formControlName="tieuDe" placeholder="VD: Khai xuân giảm 20.000đ cho mọi đơn hàng" />
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
                  placeholder="VD: 200.000 (0 = Không yêu cầu)"
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
                    placeholder="VD: 50.000"
                  />
                </div>
              }

              <div class="form-group">
                <label>Tổng Số Lượng Mã Phát Hành *</label>
                <input
                  nz-input
                  type="number"
                  formControlName="soLuong"
                  placeholder="VD: 100"
                />
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
              <label>Mô Tả / Điều Kiện Áp Dụng (Hiển thị cho khách đọc)</label>
              <textarea nz-input rows="2" formControlName="moTa" placeholder="VD: Áp dụng cho toàn bộ vợt và phụ kiện tại shop..."></textarea>
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
        padding: 1rem;
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 0.75rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;

          &.purple { background: #f3e8ff; }
          &.green { background: #ecfdf5; }
          &.blue { background: #eff6ff; }
        }

        .stat-info {
          display: flex;
          flex-direction: column;

          .stat-label {
            font-size: 0.75rem;
            color: #64748b;
            font-weight: 600;
          }

          .stat-val {
            font-size: 1.35rem;
            font-weight: 800;
            color: #0f172a;
          }
        }
      }
    }

    .table-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 0.75rem;
      padding: 1rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }

    .voucher-code-badge {
      display: inline-block;
      padding: 4px 8px;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 6px;
      font-family: monospace;
      font-weight: 800;
      color: #2563eb;
      font-size: 0.85rem;
    }

    .voucher-title {
      font-weight: 700;
      color: #1e293b;
      font-size: 0.875rem;
    }

    .voucher-desc {
      color: #64748b;
      font-size: 0.75rem;
    }

    .discount-val {
      color: #059669;
      font-size: 0.9rem;
    }

    .usage-col {
      display: flex;
      flex-direction: column;
      gap: 4px;

      .usage-count {
        font-size: 0.8rem;
        color: #475569;
      }

      .progress-bar-wrap {
        width: 100%;
        height: 6px;
        background: #e2e8f0;
        border-radius: 3px;
        overflow: hidden;

        .progress-fill {
          height: 100%;
          background: #2563eb;
          border-radius: 3px;
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

    .voucher-modal-form {
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
export class SellerVoucherComponent implements OnInit {
  private readonly duLieuService = inject(DuLieuService);
  readonly sellerState = inject(SellerStateService);
  private readonly fb = inject(FormBuilder);
  private readonly message = inject(NzMessageService);

  readonly danhSach = signal<VoucherItem[]>([]);
  readonly dangTai = signal<boolean>(true);

  readonly tongDangHoatDong = computed(() => this.danhSach().filter(x => x.kichHoat).length);
  readonly tongDaSuDung = computed(() => this.danhSach().reduce((sum, x) => sum + (x.soLuongDaDung || 0), 0));

  hienModal: boolean = false;
  dangSua: VoucherItem | null = null;
  dangLuu: boolean = false;
  form!: FormGroup;

  ngOnInit(): void {
    this.khoiTaoForm();
    this.taiDanhSach();
  }

  khoiTaoForm(): void {
    const today = new Date().toISOString().substring(0, 10);
    const nextYear = new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().substring(0, 10);

    this.form = this.fb.group({
      maVoucher: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20), Validators.pattern(/^[A-Za-z0-9_-]+$/)]],
      tieuDe: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(256)]],
      moTa: [''],
      loaiGiamGia: ['SoTien', [Validators.required]],
      giaTriGiam: [20000, [Validators.required, Validators.min(1)]],
      giaTriDonToiThieu: [100000, [Validators.required, Validators.min(0)]],
      giamToiDa: [null],
      soLuong: [100, [Validators.required, Validators.min(1)]],
      ngayBatDau: [today, [Validators.required]],
      ngayKetThuc: [nextYear, [Validators.required]]
    });
  }

  taiDanhSach(): void {
    this.dangTai.set(true);
    this.duLieuService.getMyStoreVouchers().subscribe({
      next: (list) => {
        this.danhSach.set(list || []);
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
        this.message.success(updated.kichHoat ? 'Đã bật mã khuyến mãi!' : 'Đã tạm khóa mã khuyến mãi!');
        this.taiDanhSach();
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
      ngayKetThuc: new Date(this.form.value.ngayKetThuc).toISOString()
    };

    if (this.dangSua) {
      this.duLieuService.capNhatVoucher(this.dangSua.id, val).subscribe({
        next: () => {
          this.dangLuu = false;
          this.hienModal = false;
          this.message.success('Cập nhật mã voucher thành công!');
          this.taiDanhSach();
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
          this.message.success('Tạo mã voucher mới thành công!');
          this.taiDanhSach();
        },
        error: (err) => {
          this.dangLuu = false;
          this.message.error(trichXuatThongBaoLoi(err, 'Lỗi tạo mã voucher mới!'));
        }
      });
    }
  }

  xoaVoucher(id: string, ma: string): void {
    if (!confirm(`Bạn có chắc chắn muốn xóa mã voucher '${ma}'?`)) return;
    this.duLieuService.xoaVoucher(id).subscribe({
      next: () => {
        this.message.success(`Đã xóa mã voucher '${ma}'!`);
        this.taiDanhSach();
      },
      error: (err) => {
        this.message.error(trichXuatThongBaoLoi(err, 'Lỗi xóa voucher!'));
      }
    });
  }

  tinhPhanTramDung(daDung: number, tong: number): number {
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
