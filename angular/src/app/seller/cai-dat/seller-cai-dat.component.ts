import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTagModule } from 'ng-zorro-antd/tag';

import { DuLieuService } from '../../he-thong/dich-vu/du-lieu.service';
import { SellerStateService } from '../services/seller-state.service';
import { trichXuatThongBaoLoi } from '../../he-thong/tien-ich/loi-api.helper';

@Component({
  selector: 'app-seller-cai-dat',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NzInputModule, NzButtonModule, NzCardModule, NzTagModule],
  template: `
    <div class="seller-page-container">
      <div class="page-header">
        <div>
          <h2>⚙️ Thiết Lập Hồ Sơ Gian Hàng & Tài Khoản</h2>
          <p class="desc">Chỉnh sửa thông tin liên hệ, địa chỉ kho nhận hàng và chính sách ngân hàng của gian hàng bạn.</p>
        </div>
      </div>

      <div class="settings-grid">
        <!-- Card 1: Thông tin shop -->
        <div class="settings-card">
          <h3>🏬 Thông Tin Cơ Bản Gian Hàng</h3>
          <form [formGroup]="formShop" (ngSubmit)="luuThongTinShop()" class="form-layout">
            <div class="form-group">
              <label>Tên Gian Hàng *</label>
              <input nz-input formControlName="ten" placeholder="Ví dụ: TechZone Store" />
            </div>

            <div class="form-group">
              <label>Đường Dẫn Slug</label>
              <input nz-input formControlName="slug" [readonly]="true" />
              <small class="text-muted">Đường dẫn cố định định danh shop trên sàn.</small>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Số Điện Thoại Liên Hệ *</label>
                <input nz-input formControlName="soDienThoai" />
              </div>
              <div class="form-group">
                <label>Email Nhận Thông Báo *</label>
                <input nz-input formControlName="email" />
              </div>
            </div>

            <div class="form-group">
              <label>Địa Chỉ Kho Hàng / Gửi Hàng *</label>
              <input nz-input formControlName="diaChi" />
            </div>

            <div class="form-group">
              <label>Mô Tả Giới Thiệu Shop</label>
              <textarea nz-input rows="3" formControlName="moTa"></textarea>
            </div>

            <button nz-button nzType="primary" [nzLoading]="dangLuuShop" type="submit">
              💾 Lưu Cập Nhật Hồ Sơ
            </button>
          </form>
        </div>

        <!-- Card 2: Tài khoản ngân hàng -->
        <div class="settings-card">
          <h3>🏦 Tài Khoản Ngân Hàng Thụ Hưởng</h3>
          <p class="sub-desc">Doanh thu khi bạn rút tiền sẽ được Admin sàn chuyển khoản trực tiếp vào tài khoản này.</p>

          <form [formGroup]="formBank" (ngSubmit)="luuNganHang()" class="form-layout">
            <div class="form-group">
              <label>Tên Ngân Hàng *</label>
              <input nz-input formControlName="tenNganHang" placeholder="Vietcombank, MBBank, TPBank..." />
            </div>

            <div class="form-group">
              <label>Số Tài Khoản Ngân Hàng *</label>
              <input nz-input formControlName="soTaiKhoanNganHang" placeholder="0123456789" />
            </div>

            <div class="form-group">
              <label>Tên Chủ Tài Khoản *</label>
              <input nz-input formControlName="tenChuTaiKhoan" placeholder="NGUYEN VAN A" />
            </div>

            <button nz-button nzType="primary" [nzLoading]="dangLuuBank" type="submit">
              🏦 Cập Nhật Tài Khoản Ngân Hàng
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .seller-page-container {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .page-header {
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
    .settings-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      @media (max-width: 900px) {
        grid-template-columns: 1fr;
      }
    }
    .settings-card {
      background: var(--bg-card, #ffffff);
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      border: 1px solid var(--border-color, #e2e8f0);
      h3 {
        margin: 0 0 16px 0;
        font-size: 18px;
        font-weight: 700;
        color: var(--text-primary, #1e293b);
      }
      .sub-desc {
        color: var(--text-secondary, #64748b);
        font-size: 13px;
        margin-bottom: 16px;
      }
    }
    .form-layout {
      display: flex;
      flex-direction: column;
      gap: 14px;
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
export class SellerCaiDatComponent implements OnInit {
  private readonly duLieuService = inject(DuLieuService);
  readonly sellerState = inject(SellerStateService);
  private readonly fb = inject(FormBuilder);
  private readonly message = inject(NzMessageService);

  formShop!: FormGroup;
  formBank!: FormGroup;
  dangLuuShop = false;
  dangLuuBank = false;

  ngOnInit(): void {
    this.khoiTaoForms();
    this.sellerState.taiThongTinShop().subscribe({
      next: (shop) => {
        if (shop) {
          this.formShop.patchValue({
            ten: shop.ten,
            slug: shop.slug,
            soDienThoai: shop.soDienThoai,
            email: shop.email,
            diaChi: shop.diaChi,
            moTa: shop.moTa || ''
          });

          this.formBank.patchValue({
            tenNganHang: shop.tenNganHang || '',
            soTaiKhoanNganHang: shop.soTaiKhoanNganHang || '',
            tenChuTaiKhoan: shop.tenChuTaiKhoan || ''
          });
        }
      }
    });
  }

  khoiTaoForms(): void {
    this.formShop = this.fb.group({
      ten: ['', [Validators.required, Validators.maxLength(256)]],
      slug: [''],
      soDienThoai: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      diaChi: ['', [Validators.required]],
      moTa: ['']
    });

    this.formBank = this.fb.group({
      tenNganHang: ['', [Validators.required]],
      soTaiKhoanNganHang: ['', [Validators.required]],
      tenChuTaiKhoan: ['', [Validators.required]]
    });
  }

  luuThongTinShop(): void {
    if (this.formShop.invalid) {
      this.formShop.markAllAsTouched();
      this.message.warning('Vui lòng kiểm tra lại thông tin gian hàng!');
      return;
    }

    const shop = this.sellerState.cuaHang();
    if (!shop) return;

    this.dangLuuShop = true;
    this.duLieuService.capNhatThongTinCuaHang(shop.id, this.formShop.value).subscribe({
      next: () => {
        this.dangLuuShop = false;
        this.message.success('Cập nhật thông tin gian hàng thành công!');
        this.sellerState.taiThongTinShop().subscribe();
      },
      error: (err) => {
        this.dangLuuShop = false;
        this.message.error(trichXuatThongBaoLoi(err, 'Lỗi lưu thông tin gian hàng!'));
      }
    });
  }

  luuNganHang(): void {
    if (this.formBank.invalid) {
      this.formBank.markAllAsTouched();
      this.message.warning('Vui lòng điền đầy đủ thông tin tài khoản ngân hàng!');
      return;
    }

    this.dangLuuBank = true;
    this.duLieuService.capNhatNganHangCuaHang(this.formBank.value).subscribe({
      next: () => {
        this.dangLuuBank = false;
        this.message.success('Cập nhật tài khoản ngân hàng thụ hưởng thành công!');
        this.sellerState.taiThongTinShop().subscribe();
      },
      error: (err) => {
        this.dangLuuBank = false;
        this.message.error(trichXuatThongBaoLoi(err, 'Lỗi cập nhật ngân hàng!'));
      }
    });
  }
}
