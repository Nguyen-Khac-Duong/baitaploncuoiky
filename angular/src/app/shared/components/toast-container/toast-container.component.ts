import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThongBaoService } from '../../../he-thong/dich-vu/thong-bao.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of thongBaoService.danhSachToast(); track toast.id) {
        <div class="toast-item" [ngClass]="toast.loai">
          <div class="toast-icon">
            @switch (toast.loai) {
              @case ('success') { <span>✅</span> }
              @case ('error') { <span>❌</span> }
              @case ('warning') { <span>⚠️</span> }
              @case ('info') { <span>ℹ️</span> }
            }
          </div>
          <div class="toast-content">
            @if (toast.tieuDe) {
              <div class="toast-title">{{ toast.tieuDe }}</div>
            }
            <div class="toast-message">{{ toast.noiDung }}</div>
          </div>
          <button class="toast-close" (click)="thongBaoService.dongToast(toast.id)" title="Đóng">✕</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 24px;
      right: 24px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
      max-width: 400px;
      width: calc(100vw - 48px);
    }

    .toast-item {
      pointer-events: auto;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 16px;
      border-radius: 12px;
      background: var(--bg-card, #ffffff);
      color: var(--text-primary, #1e293b);
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
      border-left: 5px solid #64748b;
      animation: toastSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      transition: all 0.2s ease;

      &.success {
        border-left-color: #10b981;
        background: var(--bg-card, #ffffff);
      }
      &.error {
        border-left-color: #ef4444;
        background: var(--bg-card, #ffffff);
      }
      &.warning {
        border-left-color: #f59e0b;
        background: var(--bg-card, #ffffff);
      }
      &.info {
        border-left-color: #3b82f6;
        background: var(--bg-card, #ffffff);
      }

      .toast-icon {
        font-size: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .toast-content {
        flex: 1;
        font-size: 13.5px;
        line-height: 1.4;

        .toast-title {
          font-weight: 700;
          margin-bottom: 2px;
        }

        .toast-message {
          color: var(--text-secondary, #64748b);
        }
      }

      .toast-close {
        background: transparent;
        border: none;
        color: var(--text-muted, #94a3b8);
        cursor: pointer;
        padding: 4px;
        font-size: 14px;
        line-height: 1;
        border-radius: 4px;
        transition: color 0.2s;

        &:hover {
          color: var(--text-primary, #1e293b);
        }
      }
    }

    @keyframes toastSlideIn {
      from {
        opacity: 0;
        transform: translateX(50px) scale(0.9);
      }
      to {
        opacity: 1;
        transform: translateX(0) scale(1);
      }
    }
  `]
})
export class ToastContainerComponent {
  readonly thongBaoService = inject(ThongBaoService);
}
