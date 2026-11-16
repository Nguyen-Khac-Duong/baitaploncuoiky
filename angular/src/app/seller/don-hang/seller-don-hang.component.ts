import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzInputModule } from 'ng-zorro-antd/input';

import { DuLieuService } from '../../he-thong/dich-vu/du-lieu.service';
import { SellerStateService } from '../services/seller-state.service';
import { DonHang, TrangThaiDonHang } from '../../shared/mo-hinh/du-lieu.model';
import { trichXuatThongBaoLoi } from '../../he-thong/tien-ich/loi-api.helper';

@Component({
  selector: 'app-seller-don-hang',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzTableModule,
    NzTagModule,
    NzButtonModule,
    NzIconModule,
    NzModalModule,
    NzInputModule
  ],
  template: `
    <div class="seller-page-container">
      <div class="page-header">
        <div>
          <h2>📑 Đơn Hàng Cần Đóng Gói & Vận Chuyển</h2>
          <p class="desc">Tiếp nhận đơn hàng của khách, đóng gói và xác nhận giao hàng để quyết toán doanh thu Escrow.</p>
        </div>
        <button nz-button nzType="default" (click)="taiDanhSach()">
          <span nz-icon nzType="reload"></span> Làm mới
        </button>
      </div>

      <div class="table-card">
        <nz-table #orderTable [nzData]="danhSach()" [nzLoading]="dangTai()" [nzBordered]="true" [nzPageSize]="10">
          <thead>
            <tr>
              <th>Mã Đơn Con</th>
              <th>Khách Hàng & Giao Nhận</th>
              <th>Sản Phẩm Đặt</th>
              <th>Dòng Tiền Shop</th>
              <th>Trạng Thái</th>
              <th>Thao Tác Xử Lý</th>
            </tr>
          </thead>
          <tbody>
            @for (dh of orderTable.data; track dh.id) {
              <tr>
                <td>
                  <div class="font-bold">#{{ dh.maDon }}</div>
                  <small class="text-muted">{{ dh.ngayTao | date:'dd/MM/yyyy HH:mm' }}</small>
                  @if (dh.donHangTongId) {
                    <div><nz-tag nzColor="purple">Đơn tổng: #{{ dh.maDonTong || dh.donHangTongId.substring(0, 8) }}</nz-tag></div>
                  }
                </td>
                <td>
                  <div class="font-bold">{{ dh.tenKhachHang }}</div>
                  <div>📞 {{ dh.soDienThoai }}</div>
                  <small class="text-muted">📍 {{ dh.diaChi }}</small>
                </td>
                <td>
                  <ul class="order-items-list">
                    @for (ct of dh.chiTiet; track ct.sanPhamId) {
                      <li>
                        {{ ct.tenSanPham }} × <strong>{{ ct.soLuong }}</strong>
                        <span class="item-price">({{ formatTien(ct.thanhTien) }})</span>
                      </li>
                    }
                  </ul>
                </td>
                <td>
                  <div>Tiền hàng: <strong>{{ formatTien(dh.tienHang || dh.tongTien) }}</strong></div>
                  <small class="text-danger">Hoa hồng sàn: -{{ formatTien(dh.tienHoaHongSan) }}</small>
                  <div class="text-success font-bold">Shop thực nhận: {{ formatTien(dh.thucNhanCuaShop || dh.tongTien) }}</div>
                </td>
                <td>
                  <nz-tag [nzColor]="layMauTrangThai(dh.trangThai)">
                    {{ layTenTrangThai(dh.trangThai) }}
                  </nz-tag>
                  @if (dh.lyDoTraHang) {
                    <div class="return-note-cell">
                      <small><strong>Lý do:</strong> {{ dh.lyDoTraHang }}</small>
                    </div>
                  }
                </td>
                <td>
                  <div class="status-actions">
                    @if (dh.trangThai === 'cho_xu_ly') {
                      <button nz-button nzSize="small" nzType="primary" (click)="chuyenTrangThai(dh, 'dang_giao')">
                        🚚 Giao Hàng
                      </button>
                      <button nz-button nzSize="small" nzDanger (click)="chuyenTrangThai(dh, 'da_huy')">
                        ✕ Hủy Đơn
                      </button>
                    } @else if (dh.trangThai === 'dang_giao') {
                      <button nz-button nzSize="small" nzType="primary" style="background: #10b981; border-color: #10b981;" (click)="chuyenTrangThai(dh, 'hoan_thanh')">
                        ✅ Hoàn Tất
                      </button>
                    } @else if (dh.trangThai === 'yeu_cau_tra_hang') {
                      <button nz-button nzSize="small" nzType="primary" nzDanger (click)="moModalDuyetTraHang(dh)">
                        ↩️ Duyệt Trả Hàng
                      </button>
                    } @else {
                      <span class="text-muted"><small>Đã đóng</small></span>
                    }
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </nz-table>
      </div>

      <!-- MODAL XÉT DUYỆT TRẢ HÀNG / HOÀN TIỀN -->
      <nz-modal
        [(nzVisible)]="hienModalDuyet"
        nzTitle="↩️ Xét Duyệt Yêu Cầu Trả Hàng & Hoàn Tiền"
        (nzOnCancel)="hienModalDuyet = false"
        [nzFooter]="null"
        [nzWidth]="560"
      >
        <ng-container *nzModalContent>
          @if (dhDangXetDuyet) {
            <div class="review-return-box">
              <div class="order-summary-row">
                <div><strong>Mã đơn:</strong> #{{ dhDangXetDuyet.maDon }}</div>
                <div><strong>Khách hàng:</strong> {{ dhDangXetDuyet.tenKhachHang }} ({{ dhDangXetDuyet.soDienThoai }})</div>
                <div><strong>Số tiền hoàn trả:</strong> <span class="text-danger font-bold">{{ formatTien(dhDangXetDuyet.tongTien) }}</span></div>
              </div>

              <div class="customer-claim">
                <div class="claim-title">Lý do khách hàng yêu cầu hoàn trả:</div>
                <div class="claim-reason">{{ dhDangXetDuyet.lyDoTraHang }}</div>
                @if (dhDangXetDuyet.ghiChuTraHang) {
                  <div class="claim-desc">{{ dhDangXetDuyet.ghiChuTraHang }}</div>
                }
                @if (dhDangXetDuyet.hinhAnhTraHang) {
                  <div class="claim-img">
                    <img [src]="dhDangXetDuyet.hinhAnhTraHang" alt="Ảnh bằng chứng khách gửi" />
                  </div>
                }
              </div>

              <div class="form-group">
                <label>Lời nhắn / Phản hồi của Shop gửi tới khách:</label>
                <textarea
                  nz-input
                  rows="3"
                  [(ngModel)]="noiDungPhanHoiShop"
                  placeholder="Ví dụ: Shop đồng ý nhận lại hàng, shipper sẽ qua lấy... hoặc Lý do từ chối..."
                ></textarea>
              </div>

              <div class="modal-footer-btns">
                <button nz-button nzType="default" (click)="hienModalDuyet = false">Đóng</button>
                <button
                  nz-button
                  nzDanger
                  [nzLoading]="dangXuLyTraHang"
                  (click)="xacNhanXuLyTraHang(false)"
                >
                  ✕ Từ Chối Yêu Cầu
                </button>
                <button
                  nz-button
                  nzType="primary"
                  style="background: #10b981; border-color: #10b981;"
                  [nzLoading]="dangXuLyTraHang"
                  (click)="xacNhanXuLyTraHang(true)"
                >
                  ✓ Chấp Nhận & Hoàn Tiền
                </button>
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
    .order-items-list {
      list-style: none;
      padding: 0;
      margin: 0;
      font-size: 13px;
      li {
        margin-bottom: 4px;
        .item-price {
          color: var(--text-secondary, #64748b);
          font-size: 12px;
        }
      }
    }
    .status-actions {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .return-note-cell {
      margin-top: 4px;
      color: #c2410c;
    }
    .review-return-box {
      display: flex;
      flex-direction: column;
      gap: 16px;

      .order-summary-row {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 12px;
        font-size: 13px;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .customer-claim {
        background: #fffbeb;
        border: 1px solid #fde68a;
        border-radius: 8px;
        padding: 12px;

        .claim-title {
          font-weight: 700;
          color: #92400e;
          font-size: 13px;
          margin-bottom: 4px;
        }

        .claim-reason {
          font-weight: 600;
          color: #b45309;
          font-size: 14px;
        }

        .claim-desc {
          margin-top: 6px;
          font-size: 13px;
          color: #78350f;
        }

        .claim-img {
          margin-top: 8px;
          img {
            max-width: 140px;
            max-height: 90px;
            border-radius: 6px;
            object-fit: cover;
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

      .modal-footer-btns {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 10px;
      }
    }
  `]
})
export class SellerDonHangComponent implements OnInit {
  private readonly duLieuService = inject(DuLieuService);
  readonly sellerState = inject(SellerStateService);
  private readonly message = inject(NzMessageService);

  readonly danhSach = signal<DonHang[]>([]);
  readonly dangTai = signal<boolean>(true);

  // Xử lý hoàn trả
  hienModalDuyet: boolean = false;
  dhDangXetDuyet: DonHang | null = null;
  noiDungPhanHoiShop: string = '';
  dangXuLyTraHang: boolean = false;

  ngOnInit(): void {
    this.taiDanhSach();
  }

  taiDanhSach(): void {
    this.dangTai.set(true);
    this.duLieuService.getMyStoreOrders().subscribe({
      next: (orders) => {
        this.danhSach.set(orders);
        this.dangTai.set(false);
      },
      error: (err) => {
        this.dangTai.set(false);
        this.message.error(trichXuatThongBaoLoi(err, 'Lỗi nạp danh sách đơn hàng!'));
      }
    });
  }

  moModalDuyetTraHang(dh: DonHang): void {
    this.dhDangXetDuyet = dh;
    this.noiDungPhanHoiShop = 'Shop đã tiếp nhận và đồng ý hoàn tiền cho bạn. Đơn vị vận chuyển sẽ liên hệ để thu hồi sản phẩm ạ.';
    this.hienModalDuyet = true;
  }

  xacNhanXuLyTraHang(dongY: boolean): void {
    if (!this.dhDangXetDuyet) return;

    const actionText = dongY ? 'chấp nhận trả hàng và hoàn tiền' : 'từ chối yêu cầu trả hàng';
    if (!confirm(`Bạn có chắc chắn muốn ${actionText} cho đơn #${this.dhDangXetDuyet.maDon}?`)) {
      return;
    }

    this.dangXuLyTraHang = true;
    this.duLieuService.xuLyTraHang(this.dhDangXetDuyet.id, {
      dongY,
      phanHoi: this.noiDungPhanHoiShop.trim() || undefined
    }).subscribe({
      next: () => {
        this.dangXuLyTraHang = false;
        this.hienModalDuyet = false;
        this.message.success(dongY ? 'Đã duyệt hoàn tiền thành công! Hàng đã được cộng lại kho.' : 'Đã từ chối yêu cầu trả hàng.');
        this.taiDanhSach();
        this.sellerState.taiDuLieuPhu();
      },
      error: (err) => {
        this.dangXuLyTraHang = false;
        this.message.error(trichXuatThongBaoLoi(err, 'Lỗi xử lý yêu cầu hoàn trả!'));
      }
    });
  }

  chuyenTrangThai(dh: DonHang, trangThaiMoi: TrangThaiDonHang): void {
    const textConfirm = trangThaiMoi === 'dang_giao' 
      ? `Xác nhận bạn đã đóng gói và gửi đơn hàng #${dh.maDon} cho đơn vị vận chuyển?`
      : (trangThaiMoi === 'hoan_thanh' 
        ? `Xác nhận giao thành công đơn #${dh.maDon}? Tiền bán hàng sẽ được quyết toán vào Số Dư Khả Dụng của bạn!`
        : `Bạn có chắc chắn muốn hủy đơn hàng #${dh.maDon}? Hàng sẽ được hoàn kho.`);

    if (!confirm(textConfirm)) return;

    this.duLieuService.doiTrangThaiDonHang(dh.id, trangThaiMoi).subscribe({
      next: () => {
        this.message.success(`Đã cập nhật trạng thái đơn #${dh.maDon} thành công!`);
        this.taiDanhSach();
        this.sellerState.taiDuLieuPhu();
      },
      error: (err) => this.message.error(trichXuatThongBaoLoi(err, 'Lỗi đổi trạng thái đơn hàng!'))
    });
  }

  formatTien(gia: number | undefined | null): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(gia || 0);
  }

  layTenTrangThai(trangThai: string): string {
    const map: Record<string, string> = {
      cho_xu_ly: 'Chờ xử lý',
      dang_giao: 'Đang giao hàng',
      hoan_thanh: 'Hoàn thành',
      da_huy: 'Đã hủy',
      yeu_cau_tra_hang: '⏳ Chờ Duyệt Trả Hàng',
      tra_hang: '↩️ Đã Hoàn Tiền',
      tu_choi_tra_hang: '❌ Từ Chối Trả Hàng'
    };
    return map[trangThai] || trangThai;
  }

  layMauTrangThai(trangThai: string): string {
    switch (trangThai) {
      case 'cho_xu_ly': return 'processing';
      case 'dang_giao': return 'warning';
      case 'hoan_thanh': return 'success';
      case 'da_huy': return 'error';
      case 'yeu_cau_tra_hang': return 'magenta';
      case 'tra_hang': return 'purple';
      case 'tu_choi_tra_hang': return 'error';
      default: return 'default';
    }
  }
}
