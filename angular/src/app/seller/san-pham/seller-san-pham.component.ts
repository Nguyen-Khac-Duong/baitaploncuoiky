import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzIconModule } from 'ng-zorro-antd/icon';

import { DuLieuService } from '../../he-thong/dich-vu/du-lieu.service';
import { SellerStateService } from '../services/seller-state.service';
import { SanPham } from '../../shared/mo-hinh/du-lieu.model';
import { trichXuatThongBaoLoi } from '../../he-thong/tien-ich/loi-api.helper';

@Component({
  selector: 'app-seller-san-pham',
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
    NzSelectModule,
    NzIconModule
  ],
  template: `
    <div class="seller-page-container">
      <div class="page-header">
        <div>
          <h2>📦 Quản Lý Kho Hàng & Sản Phẩm Của Shop</h2>
          <p class="desc">Thêm mới, điều chỉnh giá bán và cập nhật số lượng tồn kho sản phẩm của gian hàng bạn.</p>
        </div>
        <button nz-button nzType="primary" (click)="moModalThem()">
          <span nz-icon nzType="plus"></span> Thêm Sản Phẩm Mới
        </button>
      </div>

      <div class="table-card">
        <nz-table #spTable [nzData]="danhSach()" [nzLoading]="dangTai()" [nzBordered]="true" [nzPageSize]="10">
          <thead>
            <tr>
              <th>Hình Ảnh</th>
              <th>Mã SP</th>
              <th>Tên Sản Phẩm</th>
              <th>Danh Mục</th>
              <th>Giá Bán</th>
              <th>Tồn Kho</th>
              <th>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            @for (sp of spTable.data; track sp.id) {
              <tr>
                <td>
                  <img [src]="sp.hinhAnh || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=60'" class="table-thumb" [alt]="sp.ten" />
                </td>
                <td><code>{{ sp.maSp }}</code></td>
                <td><strong>{{ sp.ten }}</strong></td>
                <td><nz-tag>{{ sp.danhMuc }}</nz-tag></td>
                <td class="font-bold text-primary">{{ formatTien(sp.gia) }}</td>
                <td>
                  <nz-tag [nzColor]="sp.soLuongTon > 0 ? 'blue' : 'red'">
                    {{ sp.soLuongTon }} chiếc
                  </nz-tag>
                </td>
                <td>
                  <div class="action-btns">
                    <button nz-button nzSize="small" nzType="default" (click)="moModalSua(sp)">Sửa</button>
                    <button nz-button nzSize="small" nzDanger (click)="xoaSp(sp.id)">Xóa</button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </nz-table>
      </div>

      <!-- MODAL THÊM / SỬA SẢN PHẨM -->
      <nz-modal
        [(nzVisible)]="hienModal"
        [nzTitle]="dangSua ? 'Cập Nhật Sản Phẩm' : 'Thêm Mới Sản Phẩm Vào Kho'"
        (nzOnCancel)="hienModal = false"
        (nzOnOk)="luuSanPham()"
        [nzOkLoading]="dangLuu"
      >
        <ng-container *nzModalContent>
          <form [formGroup]="form" class="modal-form">
            <div class="form-row">
              <div class="form-group">
                <label>Mã Sản Phẩm *</label>
                <input nz-input formControlName="maSp" placeholder="SP001" [readonly]="!!dangSua" />
              </div>
              <div class="form-group">
                <label>Ngành Hàng & Danh Mục *</label>
                <nz-select formControlName="danhMuc" style="width: 100%;" nzShowSearch nzPlaceHolder="Chọn ngành hàng phù hợp...">
                  @for (cat of cayDanhMuc(); track cat.id) {
                    @if (cat.children && cat.children.length > 0) {
                      <nz-option-group [nzLabel]="(cat.icon || '📦') + ' ' + cat.ten">
                        @for (child of cat.children; track child.id) {
                          <nz-option [nzValue]="child.ten" [nzLabel]="(child.icon || '🔹') + ' ' + child.ten"></nz-option>
                        }
                      </nz-option-group>
                    } @else {
                      <nz-option [nzValue]="cat.ten" [nzLabel]="(cat.icon || '📦') + ' ' + cat.ten"></nz-option>
                    }
                  }
                </nz-select>
              </div>
            </div>

            <div class="form-group">
              <label>Tên Sản Phẩm *</label>
              <input nz-input formControlName="ten" placeholder="Ví dụ: iPhone 15 Pro Max 256GB" />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Giá Bán (VNĐ) *</label>
                <input
                  nz-input
                  type="text"
                  [value]="dinhDangSo(form.get('gia')?.value)"
                  (input)="onTienInput($event, 'gia')"
                  placeholder="VD: 1.100.000"
                />
              </div>
              <div class="form-group">
                <label>Số Lượng Tồn Kho *</label>
                <input
                  nz-input
                  type="text"
                  [value]="dinhDangSo(form.get('soLuongTon')?.value)"
                  (input)="onTienInput($event, 'soLuongTon')"
                  placeholder="VD: 10"
                />
              </div>
            </div>

            <div class="form-group">
              <label>Đường Dẫn Hình Ảnh (URL)</label>
              <input nz-input formControlName="hinhAnh" placeholder="https://..." />
            </div>

            <div class="form-group">
              <label>Mô Tả Sản Phẩm</label>
              <textarea nz-input rows="3" formControlName="moTa" placeholder="Thông số kỹ thuật, bảo hành..."></textarea>
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
    }
    .table-card {
      background: var(--bg-card, #ffffff);
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      border: 1px solid var(--border-color, #e2e8f0);
    }
    .table-thumb {
      width: 48px;
      height: 48px;
      border-radius: 6px;
      object-fit: cover;
      border: 1px solid var(--border-color, #e2e8f0);
    }
    .action-btns {
      display: flex;
      gap: 8px;
    }
    .modal-form {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
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
        color: var(--text-primary, #1e293b);
      }
    }
  `]
})
export class SellerSanPhamComponent implements OnInit {
  private readonly duLieuService = inject(DuLieuService);
  readonly sellerState = inject(SellerStateService);
  private readonly fb = inject(FormBuilder);
  private readonly message = inject(NzMessageService);

  readonly danhSach = signal<SanPham[]>([]);
  readonly dangTai = signal<boolean>(true);
  readonly cayDanhMuc = this.duLieuService.cayDanhMucSignal;

  hienModal: boolean = false;
  dangSua: SanPham | null = null;
  dangLuu: boolean = false;
  form!: FormGroup;

  ngOnInit(): void {
    this.khoiTaoForm();
    this.taiDanhSach();
  }

  khoiTaoForm(): void {
    this.form = this.fb.group({
      maSp: ['', [Validators.required, Validators.maxLength(32)]],
      ten: ['', [Validators.required, Validators.maxLength(256)]],
      gia: [0, [Validators.required, Validators.min(1000)]],
      soLuongTon: [10, [Validators.required, Validators.min(0)]],
      danhMuc: ['Điện thoại', [Validators.required]],
      hinhAnh: [''],
      moTa: ['']
    });
  }

  taiDanhSach(): void {
    this.dangTai.set(true);
    this.duLieuService.getMyStoreProducts().subscribe({
      next: (prods) => {
        this.danhSach.set(prods);
        this.dangTai.set(false);
      },
      error: (err) => {
        this.dangTai.set(false);
        this.message.error(trichXuatThongBaoLoi(err, 'Lỗi nạp sản phẩm của shop!'));
      }
    });
  }

  moModalThem(): void {
    this.dangSua = null;
    this.form.reset({
      maSp: 'SP' + Math.floor(100000 + Math.random() * 900000),
      ten: '',
      gia: 100000,
      soLuongTon: 10,
      danhMuc: 'Điện thoại',
      hinhAnh: '',
      moTa: ''
    });
    this.hienModal = true;
  }

  moModalSua(sp: SanPham): void {
    this.dangSua = sp;
    this.form.patchValue({
      maSp: sp.maSp,
      ten: sp.ten,
      gia: sp.gia,
      soLuongTon: sp.soLuongTon,
      danhMuc: sp.danhMuc,
      hinhAnh: sp.hinhAnh || '',
      moTa: sp.moTa || ''
    });
    this.hienModal = true;
  }

  luuSanPham(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.message.warning('Vui lòng điền đầy đủ thông tin hợp lệ!');
      return;
    }

    this.dangLuu = true;
    const shop = this.sellerState.cuaHang();
    const selectedTen = this.form.value.danhMuc;
    let danhMucId: string | undefined;
    for (const parent of this.cayDanhMuc()) {
      if (parent.ten === selectedTen) {
        danhMucId = parent.id;
        break;
      }
      const child = parent.children?.find(c => c.ten === selectedTen);
      if (child) {
        danhMucId = child.id;
        break;
      }
    }

    const val = {
      ...this.form.value,
      cuaHangId: shop?.id,
      danhMucId
    };

    if (this.dangSua) {
      this.duLieuService.capNhatThongTinSanPham(this.dangSua.id, val).subscribe({
        next: () => {
          this.dangLuu = false;
          this.hienModal = false;
          this.message.success('Cập nhật sản phẩm thành công!');
          this.taiDanhSach();
        },
        error: (err) => {
          this.dangLuu = false;
          this.message.error(trichXuatThongBaoLoi(err, 'Lỗi cập nhật sản phẩm!'));
        }
      });
    } else {
      this.duLieuService.themSanPham(val).subscribe({
        next: () => {
          this.dangLuu = false;
          this.hienModal = false;
          this.message.success('Thêm sản phẩm mới vào kho thành công!');
          this.taiDanhSach();
        },
        error: (err) => {
          this.dangLuu = false;
          this.message.error(trichXuatThongBaoLoi(err, 'Lỗi tạo sản phẩm mới!'));
        }
      });
    }
  }

  xoaSp(id: string): void {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này khỏi gian hàng?')) return;
    this.duLieuService.xoaSanPham(id).subscribe({
      next: () => {
        this.message.success('Đã xóa sản phẩm khỏi kho!');
        this.taiDanhSach();
      },
      error: (err) => this.message.error(trichXuatThongBaoLoi(err, 'Lỗi xóa sản phẩm!'))
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

    // Đếm số lượng chữ số nằm trước con trỏ
    const digitsBeforeCursor = originalValue.slice(0, selectionStart).replace(/\D/g, '').length;

    let raw = originalValue.replace(/\D/g, '');
    if (raw.length > 1 && raw.startsWith('0')) {
      raw = raw.replace(/^0+/, '');
    }

    const num = raw ? parseInt(raw, 10) : 0;
    this.form.get(controlName)?.setValue(num, { emitEvent: false });
    this.form.get(controlName)?.markAsDirty();

    const formatted = raw ? raw.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '';
    input.value = formatted;

    // Căn chỉnh vị trí con trỏ chính xác sau khi thêm dấu chấm
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
}
