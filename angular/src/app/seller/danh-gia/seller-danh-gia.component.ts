import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';

import { DuLieuService } from '../../he-thong/dich-vu/du-lieu.service';
import { SellerStateService } from '../services/seller-state.service';
import { DanhGiaSanPham } from '../../shared/mo-hinh/du-lieu.model';
import { trichXuatThongBaoLoi } from '../../he-thong/tien-ich/loi-api.helper';

@Component({
  selector: 'app-seller-danh-gia',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzTableModule,
    NzTagModule,
    NzButtonModule,
    NzModalModule,
    NzInputModule,
    NzIconModule,
    NzCardModule,
    NzGridModule,
    NzStatisticModule
  ],
  template: `
    <div class="seller-page-container">
      <div class="page-header">
        <div>
          <h2>⭐ Quản Lý Đánh Giá & Chăm Sóc Khách Hàng</h2>
          <p class="desc">Kiểm soát trải nghiệm khách hàng, phản hồi thắc mắc và xử lý kịp thời các đơn hàng phát sinh đổi trả/hoàn tiền.</p>
        </div>
      </div>

      <!-- 3 KPI CARDS BẸT CHUẨN ADMIN -->
      <div nz-row [nzGutter]="[16, 16]" class="kpi-row">
        <div nz-col [nzXs]="24" [nzSm]="8">
          <nz-card [nzBordered]="false" class="kpi-card card-orange">
            <nz-statistic
              [nzValue]="diemTrungBinh()"
              [nzTitle]="'Điểm Đánh Giá Shop'"
              [nzPrefix]="iconStar"
              [nzValueStyle]="{ color: '#ea580c', fontWeight: '800', fontSize: '1.4rem' }"
            ></nz-statistic>
            <ng-template #iconStar><span class="kpi-emoji">⭐</span></ng-template>
            <div class="kpi-extra">Dựa trên {{ danhSach().length }} đánh giá</div>
          </nz-card>
        </div>

        <div nz-col [nzXs]="24" [nzSm]="8">
          <nz-card [nzBordered]="false" class="kpi-card card-green">
            <nz-statistic
              [nzValue]="soChuaPhanHoi()"
              [nzTitle]="'Cần Shop Phản Hồi'"
              [nzPrefix]="iconReply"
              [nzValueStyle]="{ color: '#10b981', fontWeight: '800', fontSize: '1.4rem' }"
            ></nz-statistic>
            <ng-template #iconReply><span class="kpi-emoji">💬</span></ng-template>
            <div class="kpi-extra">Khách hàng đang chờ lời phản hồi</div>
          </nz-card>
        </div>

        <div nz-col [nzXs]="24" [nzSm]="8">
          <nz-card [nzBordered]="false" class="kpi-card card-yellow">
            <nz-statistic
              [nzValue]="soDonHoanTra()"
              [nzTitle]="'Đơn Hoàn / Đổi Trả'"
              [nzPrefix]="iconRefund"
              [nzValueStyle]="{ color: '#f59e0b', fontWeight: '800', fontSize: '1.4rem' }"
            ></nz-statistic>
            <ng-template #iconRefund><span class="kpi-emoji">⚠️</span></ng-template>
            <div class="kpi-extra">Đánh giá từ đơn có sự cố hoàn hàng</div>
          </nz-card>
        </div>
      </div>

      <!-- THANH LỌC ĐA CHIỀU -->
      <div class="filter-bar">
        <div class="filter-pills">
          <button
            class="pill-btn"
            [class.active]="locTab() === 'all'"
            (click)="locTab.set('all')"
          >
            Tất Cả ({{ danhSach().length }})
          </button>
          <button
            class="pill-btn"
            [class.active]="locTab() === 'chua_tl'"
            (click)="locTab.set('chua_tl')"
          >
            Chưa Phản Hồi ({{ soChuaPhanHoi() }})
          </button>
          <button
            class="pill-btn"
            [class.active]="locTab() === 'hoan_tra'"
            (click)="locTab.set('hoan_tra')"
          >
            ⚠️ Đơn Hoàn Trả ({{ soDonHoanTra() }})
          </button>
          <button
            class="pill-btn"
            [class.active]="locTab() === 'tieu_cuc'"
            (click)="locTab.set('tieu_cuc')"
          >
            1-2 Sao ({{ soTieuCuc() }})
          </button>
        </div>
      </div>

      <!-- DANH SÁCH ĐÁNH GIÁ -->
      <div class="table-card">
        <nz-table #dgTable [nzData]="danhSachHienThi()" [nzLoading]="dangTai()" [nzBordered]="true" [nzPageSize]="10">
          <thead>
            <tr>
              <th style="width: 180px;">Sản Phẩm & Đơn</th>
              <th style="width: 140px;">Khách Hàng</th>
              <th style="width: 120px;">Số Sao</th>
              <th>Nội Dung Đánh Giá</th>
              <th>Phản Hồi Của Shop</th>
              <th style="width: 110px;">Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            @for (dg of dgTable.data; track dg.id) {
              <tr>
                <td>
                  <div class="prod-col">
                    <strong>{{ dg.tenSanPham }}</strong>
                    <small class="text-muted">Đơn #{{ dg.maDonHang }}</small>
                    @if (dg.donHangCoHoanTra) {
                      <nz-tag nzColor="orange" style="margin-top: 4px;">⚠️ Đơn hoàn/trả</nz-tag>
                    }
                  </div>
                </td>
                <td>
                  <div><strong>{{ dg.tenNguoiDung }}</strong></div>
                  <small class="text-muted">{{ dg.creationTime | date:'dd/MM/yyyy' }}</small>
                </td>
                <td>
                  <div class="stars-val">
                    @for (i of [1,2,3,4,5]; track i) {
                      <span [style.color]="i <= dg.soSao ? '#f59e0b' : '#cbd5e1'">★</span>
                    }
                  </div>
                </td>
                <td>
                  <p class="review-text-cell">{{ dg.noiDung }}</p>
                  @if (dg.hinhAnh) {
                    <img [src]="dg.hinhAnh" class="table-img-preview" alt="review" />
                  }
                </td>
                <td>
                  @if (dg.phanHoiShop) {
                    <div class="shop-reply-cell">
                      <p class="reply-text">💬 {{ dg.phanHoiShop }}</p>
                      <small class="text-muted">{{ dg.thoiGianPhanHoi | date:'dd/MM/yyyy HH:mm' }}</small>
                    </div>
                  } @else {
                    <span class="text-muted" style="font-style: italic;">Chưa có phản hồi</span>
                  }
                </td>
                <td>
                  <button
                    nz-button
                    nzSize="small"
                    [nzType]="dg.phanHoiShop ? 'default' : 'primary'"
                    (click)="moModalPhanHoi(dg)"
                  >
                    {{ dg.phanHoiShop ? 'Sửa' : '💬 Trả lời' }}
                  </button>
                </td>
              </tr>
            }
          </tbody>
        </nz-table>
      </div>

      <!-- MODAL TRẢ LỜI ĐÁNH GIÁ -->
      <nz-modal
        [(nzVisible)]="hienModalPhanHoi"
        nzTitle="💬 Phản Hồi Đánh Giá Của Khách Hàng"
        (nzOnCancel)="hienModalPhanHoi = false"
        (nzOnOk)="guiPhanHoi()"
        [nzOkLoading]="dangLuuPhanHoi"
        nzOkText="Đăng Phản Hồi"
        nzCancelText="Đóng"
      >
        <ng-container *nzModalContent>
          @if (danhGiaDangChon) {
            <div class="reply-modal-box">
              <div class="review-summary">
                <div><strong>{{ danhGiaDangChon.tenNguoiDung }}</strong> đã chấm:</div>
                <div class="stars-preview">
                  @for (i of [1,2,3,4,5]; track i) {
                    <span [style.color]="i <= danhGiaDangChon.soSao ? '#f59e0b' : '#cbd5e1'">★</span>
                  }
                </div>
                <blockquote class="customer-quote">"{{ danhGiaDangChon.noiDung }}"</blockquote>
              </div>

              <!-- Gợi ý phản hồi nhanh -->
              <div class="quick-templates">
                <span class="quick-title">Mẫu trả lời nhanh:</span>
                <div class="template-btns">
                  <button type="button" class="tmpl-chip" (click)="dungMau(1)">Cảm ơn khen ngợi</button>
                  <button type="button" class="tmpl-chip" (click)="dungMau(2)">Xin lỗi đơn hoàn hàng</button>
                  <button type="button" class="tmpl-chip" (click)="dungMau(3)">Hỗ trợ kỹ thuật/bảo hành</button>
                </div>
              </div>

              <div class="form-group">
                <label>Nội dung phản hồi từ Shop *</label>
                <textarea
                  nz-input
                  rows="4"
                  [(ngModel)]="noiDungPhanHoi"
                  placeholder="Nhập lời cảm ơn hoặc giải đáp của shop gửi đến khách hàng..."
                ></textarea>
              </div>
            </div>
          }
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
    .kpi-row {
      margin-bottom: 0.5rem;
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

      &.card-orange { border-left-color: #ea580c; }
      &.card-green { border-left-color: #10b981; }
      &.card-yellow { border-left-color: #f59e0b; }

      .kpi-emoji { font-size: 1.35rem; margin-right: 6px; vertical-align: middle; }
      .kpi-extra {
        margin-top: 0.5rem;
        font-size: 0.8rem;
        color: var(--text-secondary, #64748b);
      }
    }
    .filter-bar {
      .filter-pills {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;

        .pill-btn {
          padding: 6px 14px;
          border-radius: 20px;
          border: 1px solid var(--border-color, #e2e8f0);
          background: #ffffff;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary, #64748b);
          cursor: pointer;
          transition: all 0.2s ease;

          &:hover {
            border-color: #ea580c;
            color: #ea580c;
          }

          &.active {
            background: #ea580c;
            border-color: #ea580c;
            color: #ffffff;
          }
        }
      }
    }
    .table-card {
      background: var(--bg-card, #ffffff);
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      border: 1px solid var(--border-color, #e2e8f0);
    }
    .prod-col {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .stars-val {
      font-size: 14px;
      letter-spacing: 1px;
    }
    .review-text-cell {
      margin: 0;
      font-size: 13px;
      line-height: 1.4;
    }
    .table-img-preview {
      width: 48px;
      height: 48px;
      border-radius: 6px;
      object-fit: cover;
      margin-top: 6px;
      border: 1px solid #e2e8f0;
    }
    .shop-reply-cell {
      background: #f8fafc;
      padding: 8px 10px;
      border-radius: 6px;
      border-left: 3px solid #2563eb;
      .reply-text {
        margin: 0;
        font-size: 13px;
        color: var(--text-primary, #1e293b);
      }
    }
    .reply-modal-box {
      display: flex;
      flex-direction: column;
      gap: 14px;

      .review-summary {
        padding: 12px;
        background: #f8fafc;
        border-radius: 8px;
        border: 1px solid #e2e8f0;

        .stars-preview {
          font-size: 16px;
          margin: 4px 0;
        }

        .customer-quote {
          margin: 4px 0 0 0;
          font-style: italic;
          color: #475569;
        }
      }

      .quick-templates {
        display: flex;
        flex-direction: column;
        gap: 6px;
        .quick-title {
          font-size: 12px;
          font-weight: 600;
          color: #64748b;
        }
        .template-btns {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;

          .tmpl-chip {
            padding: 4px 10px;
            border-radius: 6px;
            border: 1px dashed #94a3b8;
            background: #ffffff;
            font-size: 12px;
            cursor: pointer;
            color: #334155;
            transition: all 0.2s ease;

            &:hover {
              border-color: #2563eb;
              color: #2563eb;
              background: #eff6ff;
            }
          }
        }
      }

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 6px;

        label {
          font-weight: 600;
          font-size: 13px;
        }
      }
    }
  `]
})
export class SellerDanhGiaComponent implements OnInit {
  private readonly duLieuService = inject(DuLieuService);
  private readonly message = inject(NzMessageService);
  readonly sellerState = inject(SellerStateService);

  readonly danhSach = signal<DanhGiaSanPham[]>([]);
  readonly dangTai = signal<boolean>(true);
  readonly locTab = signal<'all' | 'chua_tl' | 'hoan_tra' | 'tieu_cuc'>('all');

  hienModalPhanHoi: boolean = false;
  dangLuuPhanHoi: boolean = false;
  danhGiaDangChon: DanhGiaSanPham | null = null;
  noiDungPhanHoi: string = '';

  readonly diemTrungBinh = computed(() => {
    const list = this.danhSach();
    if (!list.length) return 5.0;
    return Math.round((list.reduce((acc, x) => acc + x.soSao, 0) / list.length) * 10) / 10;
  });

  readonly soChuaPhanHoi = computed(() => {
    return this.danhSach().filter(x => !x.phanHoiShop).length;
  });

  readonly soDonHoanTra = computed(() => {
    return this.danhSach().filter(x => x.donHangCoHoanTra).length;
  });

  readonly soTieuCuc = computed(() => {
    return this.danhSach().filter(x => x.soSao <= 2).length;
  });

  readonly danhSachHienThi = computed(() => {
    const tab = this.locTab();
    const list = this.danhSach();
    switch (tab) {
      case 'chua_tl': return list.filter(x => !x.phanHoiShop);
      case 'hoan_tra': return list.filter(x => x.donHangCoHoanTra);
      case 'tieu_cuc': return list.filter(x => x.soSao <= 2);
      default: return list;
    }
  });

  ngOnInit(): void {
    this.taiDanhSach();
  }

  taiDanhSach(): void {
    this.dangTai.set(true);
    this.duLieuService.getDanhGiaTheoShop().subscribe({
      next: (data) => {
        this.danhSach.set(data);
        this.dangTai.set(false);
      },
      error: (e) => {
        this.dangTai.set(false);
        this.message.error(trichXuatThongBaoLoi(e, 'Lỗi nạp danh sách đánh giá của shop!'));
      }
    });
  }

  moModalPhanHoi(dg: DanhGiaSanPham): void {
    this.danhGiaDangChon = dg;
    this.noiDungPhanHoi = dg.phanHoiShop || '';
    this.hienModalPhanHoi = true;
  }

  dungMau(loai: number): void {
    if (loai === 1) {
      this.noiDungPhanHoi = 'Dạ Shop chân thành cảm ơn bạn đã tin tưởng và đánh giá 5 sao cho sản phẩm! Chúc bạn luôn có những trải nghiệm tuyệt vời cùng Shop ạ ❤️';
    } else if (loai === 2) {
      this.noiDungPhanHoi = 'Dạ Shop thành thật xin lỗi bạn vì sự cố xảy ra với đơn hàng này. Shop đã tiếp nhận ý kiến đóng góp và luôn sẵn sàng hỗ trợ bạn đổi trả/bảo hành chu đáo nhất ạ!';
    } else if (loai === 3) {
      this.noiDungPhanHoi = 'Dạ Shop cảm ơn phản hồi của bạn. Nếu bạn cần hỗ trợ thêm về hướng dẫn sử dụng hay bảo hành sản phẩm, bạn đừng ngần ngại nhắn tin cho Shop ngay nhé!';
    }
  }

  guiPhanHoi(): void {
    if (!this.danhGiaDangChon) return;
    if (!this.noiDungPhanHoi.trim()) {
      this.message.warning('Vui lòng nhập nội dung phản hồi!');
      return;
    }

    this.dangLuuPhanHoi = true;
    this.duLieuService.shopPhanHoiDanhGia(this.danhGiaDangChon.id, this.noiDungPhanHoi.trim()).subscribe({
      next: () => {
        this.dangLuuPhanHoi = false;
        this.hienModalPhanHoi = false;
        this.message.success('Đã gửi phản hồi đánh giá thành công!');
        this.taiDanhSach();
      },
      error: (e) => {
        this.dangLuuPhanHoi = false;
        this.message.error(trichXuatThongBaoLoi(e, 'Lỗi gửi phản hồi đánh giá!'));
      }
    });
  }
}

