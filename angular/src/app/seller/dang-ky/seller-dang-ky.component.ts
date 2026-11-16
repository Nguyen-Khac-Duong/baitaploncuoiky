import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTagModule } from 'ng-zorro-antd/tag';

import { DuLieuService } from '../../he-thong/dich-vu/du-lieu.service';
import { XacThucService } from '../../he-thong/dich-vu/xac-thuc.service';
import { SellerStateService } from '../services/seller-state.service';
import { trichXuatThongBaoLoi } from '../../he-thong/tien-ich/loi-api.helper';

@Component({
  selector: 'app-seller-dang-ky',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, NzButtonModule, NzTagModule],
  template: `
    <div class="register-wrapper">
      @if (sellerState.dangTai()) {
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Đang kiểm tra hồ sơ gian hàng...</p>
        </div>
      } @else {
        <!-- TRƯỜNG HỢP 1: ĐÃ ĐĂNG KÝ VÀ ĐANG CHỜ DUYỆT -->
        @if (sellerState.cuaHang(); as shop) {
          @if (shop.trangThai === 'ChoDuyet') {
            <div class="pending-card">
              <div class="pending-icon">⏳</div>
              <div class="status-badge">
                <nz-tag nzColor="warning">Hồ Sơ Đang Chờ Phê Duyệt</nz-tag>
              </div>
              <h2>Gian Hàng Của Bạn Đang Được Admin Xét Duyệt!</h2>
              <p class="pending-desc">
                Hồ sơ gian hàng <strong>{{ shop.ten }}</strong> của bạn đã được gửi thành công.
                Đội ngũ Quản trị viên sàn đang kiểm tra thông tin eKYC và sẽ kích hoạt gian hàng của bạn trong thời gian sớm nhất.
              </p>

              <div class="shop-summary-box">
                <div class="summary-item">
                  <span class="label">Tên gian hàng:</span>
                  <strong>{{ shop.ten }}</strong>
                </div>
                <div class="summary-item">
                  <span class="label">Đường dẫn:</span>
                  <code>shoptech.vn/shop/{{ shop.slug }}</code>
                </div>
                <div class="summary-item">
                  <span class="label">Số điện thoại:</span>
                  <span>{{ shop.soDienThoai }}</span>
                </div>
                <div class="summary-item">
                  <span class="label">Kho hàng:</span>
                  <span>{{ shop.diaChi }}</span>
                </div>
              </div>

              <div class="pending-actions">
                <button nz-button nzType="primary" (click)="kiemTraTrangThai()">
                  🔄 Kiểm Tra Lại Trạng Thái
                </button>
                <a routerLink="/cua-hang" nz-button nzType="default">
                  🏠 Về Sàn Mua Sắm
                </a>
              </div>
            </div>
          } @else if (shop.trangThai === 'TamKhoa') {
            <div class="pending-card error">
              <div class="pending-icon">🔒</div>
              <h2>Gian Hàng Của Bạn Đang Bị Tạm Khóa</h2>
              <p>Vui lòng liên hệ với Quản Trị Viên sàn để được hỗ trợ mở khóa gian hàng.</p>
              <a routerLink="/cua-hang" nz-button nzType="primary">Về Trang Chủ</a>
            </div>
          }
        } @else {
          <!-- TRƯỜNG HỢP 2: CHƯA CÓ GIAN HÀNG -> FORM ĐĂNG KÝ EKYC -->
          <div class="register-card">
            <div class="register-header">
              <div class="shop-badge">🏪 Kênh Người Bán (Seller Center)</div>
              <h1>Đăng Ký Mở Gian Hàng Bán Hàng Trực Tuyến</h1>
              <p>Mở gian hàng riêng, tiếp cận hàng triệu khách hàng và quản lý doanh thu minh bạch với quỹ Escrow an toàn.</p>
            </div>

            <form [formGroup]="form" (ngSubmit)="xuLyDangKy()" class="form-layout">
              <div class="form-grid">
                <div class="form-group">
                  <label>Tên Gian Hàng *</label>
                  <input type="text" formControlName="ten" placeholder="Ví dụ: TechZone Official Store" />
                </div>

                <div class="form-group">
                  <label>Đường Dẫn Shop (Slug duy nhất) *</label>
                  <div class="slug-input-wrapper">
                    <span class="prefix">shoptech.vn/shop/</span>
                    <input type="text" formControlName="slug" placeholder="techzone-store" />
                  </div>
                </div>

                <div class="form-group">
                  <label>Số Điện Thoại Liên Hệ *</label>
                  <input type="text" formControlName="soDienThoai" placeholder="0987654321" />
                </div>

                <div class="form-group">
                  <label>Email Liên Hệ *</label>
                  <input type="email" formControlName="email" placeholder="contact@shop.com" />
                </div>

                <div class="form-group full-width">
                  <label>Địa Chỉ Kho Hàng / Gửi Hàng *</label>
                  <input type="text" formControlName="diaChi" placeholder="Số nhà, đường, quận huyện, tỉnh thành..." />
                </div>

                <div class="form-group full-width">
                  <label>Mô Tả Ngắn Về Gian Hàng</label>
                  <textarea rows="3" formControlName="moTa" placeholder="Giới thiệu thương hiệu, uy tín và thế mạnh sản phẩm..."></textarea>
                </div>
              </div>

              <div class="form-actions">
                <button type="submit" class="btn btn-primary" [disabled]="dangXuLy">
                  {{ dangXuLy ? 'Đang Gửi Hồ Sơ...' : '🚀 Gửi Hồ Sơ Đăng Ký Gian Hàng' }}
                </button>
                <a routerLink="/cua-hang" class="btn btn-default">Quay Lại Mua Sắm</a>
              </div>
            </form>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .register-wrapper {
      max-width: 800px;
      margin: 2rem auto;
      padding: 0 1rem;
    }
    .loading-state {
      text-align: center;
      padding: 3rem;
      .spinner {
        width: 40px;
        height: 40px;
        border: 3px solid #e2e8f0;
        border-top-color: #2563eb;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
        margin: 0 auto 1rem;
      }
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .pending-card {
      background: var(--bg-card, #ffffff);
      border: 1px solid var(--border-color, #e2e8f0);
      border-radius: 1.5rem;
      padding: 3rem 2rem;
      text-align: center;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);

      .pending-icon {
        font-size: 4rem;
        margin-bottom: 1rem;
      }
      h2 {
        font-size: 1.6rem;
        font-weight: 800;
        color: var(--text-primary, #1e293b);
        margin: 0.5rem 0 1rem;
      }
      .pending-desc {
        color: var(--text-secondary, #64748b);
        font-size: 1rem;
        line-height: 1.6;
        max-width: 580px;
        margin: 0 auto 2rem;
      }
      .shop-summary-box {
        background: var(--bg-app, #f8fafc);
        border: 1px solid var(--border-color, #e2e8f0);
        border-radius: 1rem;
        padding: 1.5rem;
        max-width: 480px;
        margin: 0 auto 2rem;
        text-align: left;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;

        .summary-item {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
          .label { color: #64748b; }
        }
      }
      .pending-actions {
        display: flex;
        gap: 1rem;
        justify-content: center;
      }
    }
    .register-card {
      background: var(--bg-card, #ffffff);
      border: 1px solid var(--border-color, #e2e8f0);
      border-radius: 1.5rem;
      padding: 2.5rem;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);

      .register-header {
        margin-bottom: 2rem;
        .shop-badge {
          display: inline-block;
          background: rgba(37, 99, 235, 0.1);
          color: #2563eb;
          padding: 0.35rem 0.85rem;
          border-radius: 20px;
          font-weight: 700;
          font-size: 0.85rem;
          margin-bottom: 0.75rem;
        }
        h1 {
          font-size: 1.8rem;
          font-weight: 800;
          color: var(--text-primary, #1e293b);
          margin: 0 0 0.5rem;
        }
        p {
          color: var(--text-secondary, #64748b);
          font-size: 0.95rem;
          margin: 0;
        }
      }
    }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.25rem;
      @media (max-width: 640px) {
        grid-template-columns: 1fr;
      }
    }
    .full-width {
      grid-column: 1 / -1;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      label {
        font-weight: 600;
        font-size: 0.85rem;
        color: var(--text-primary, #1e293b);
      }
      input, textarea {
        padding: 0.65rem 0.85rem;
        border: 1px solid var(--border-color, #cbd5e1);
        border-radius: 0.5rem;
        font-size: 0.95rem;
        background: var(--bg-card, #ffffff);
        color: var(--text-primary, #1e293b);
        &:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
        }
      }
    }
    .slug-input-wrapper {
      display: flex;
      align-items: center;
      border: 1px solid var(--border-color, #cbd5e1);
      border-radius: 0.5rem;
      overflow: hidden;
      .prefix {
        background: var(--bg-app, #f1f5f9);
        padding: 0.65rem 0.75rem;
        font-size: 0.85rem;
        color: #64748b;
        border-right: 1px solid var(--border-color, #cbd5e1);
      }
      input {
        border: none;
        flex: 1;
        border-radius: 0;
        &:focus {
          box-shadow: none;
        }
      }
    }
    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;
      .btn {
        padding: 0.75rem 1.5rem;
        border-radius: 0.5rem;
        font-weight: 700;
        font-size: 0.95rem;
        cursor: pointer;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: none;
        &.btn-primary {
          background: #2563eb;
          color: #ffffff;
          &:hover { background: #1d4ed8; }
        }
        &.btn-default {
          background: var(--bg-app, #f1f5f9);
          color: var(--text-primary, #1e293b);
          border: 1px solid var(--border-color, #cbd5e1);
        }
      }
    }
  `]
})
export class SellerDangKyComponent implements OnInit {
  private readonly duLieuService = inject(DuLieuService);
  readonly xacThucService = inject(XacThucService);
  readonly sellerState = inject(SellerStateService);
  private readonly fb = inject(FormBuilder);
  private readonly message = inject(NzMessageService);
  private readonly router = inject(Router);

  form!: FormGroup;
  dangXuLy = false;

  ngOnInit(): void {
    this.khoiTaoForm();
    this.sellerState.taiThongTinShop().subscribe({
      next: (shop) => {
        if (shop && shop.trangThai === 'HoatDong') {
          this.router.navigate(['/seller/tong-quan']);
        }
      }
    });
  }

  khoiTaoForm(): void {
    const user = this.xacThucService.currentUser();
    const defaultName = user ? `${user.hoTen} Store` : '';
    const defaultSlug = user ? user.hoTen.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.floor(Math.random() * 1000) : '';

    this.form = this.fb.group({
      ten: [defaultName, [Validators.required, Validators.maxLength(256)]],
      slug: [defaultSlug, [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]],
      soDienThoai: [user?.soDienThoai || '', [Validators.required, Validators.maxLength(32)]],
      email: [user?.email || '', [Validators.required, Validators.email]],
      diaChi: [user?.diaChi || '', [Validators.required, Validators.maxLength(512)]],
      moTa: ['']
    });
  }

  xuLyDangKy(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.message.warning('Vui lòng kiểm tra lại thông tin gian hàng!');
      return;
    }

    this.dangXuLy = true;
    this.duLieuService.dangKyCuaHang(this.form.value).subscribe({
      next: () => {
        this.dangXuLy = false;
        this.message.success('Gửi hồ sơ mở gian hàng thành công! Vui lòng chờ Admin sàn duyệt.');
        this.sellerState.taiThongTinShop().subscribe();
      },
      error: (err) => {
        this.dangXuLy = false;
        this.message.error(trichXuatThongBaoLoi(err, 'Lỗi gửi hồ sơ đăng ký gian hàng!'));
      }
    });
  }

  kiemTraTrangThai(): void {
    this.sellerState.taiThongTinShop().subscribe({
      next: (shop) => {
        if (shop && shop.trangThai === 'HoatDong') {
          this.message.success('Chúc mừng! Gian hàng của bạn đã được phê duyệt hoạt động!');
          this.router.navigate(['/seller/tong-quan']);
        } else {
          this.message.info('Hồ sơ vẫn đang ở trạng thái Chờ Duyệt. Vui lòng thử lại sau ít phút!');
        }
      }
    });
  }
}
