import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';

import { DuLieuService } from '../../he-thong/dich-vu/du-lieu.service';
import { DanhMucTree, DanhMuc } from '../../shared/mo-hinh/du-lieu.model';
import { trichXuatThongBaoLoi } from '../../he-thong/tien-ich/loi-api.helper';

export interface DanhMucHienThiBang {
  id: string;
  ten: string;
  slug: string;
  icon?: string;
  moTa?: string;
  parentId?: string;
  tenCha?: string;
  laCap1: boolean;
  thuTu: number;
  trangThai: boolean;
  soLuongSanPham: number;
}

@Component({
  selector: 'app-admin-danh-muc',
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
    NzSwitchModule,
    NzPopconfirmModule,
    NzIconModule,
    NzCardModule,
    NzTooltipModule
  ],
  templateUrl: './danh-muc.component.html',
  styleUrl: './danh-muc.component.scss'
})
export class AdminDanhMucComponent implements OnInit {
  private readonly duLieuService = inject(DuLieuService);
  private readonly fb = inject(FormBuilder);
  private readonly message = inject(NzMessageService);

  readonly dangTai = signal<boolean>(true);
  readonly cayDanhMuc = signal<DanhMucTree[]>([]);

  // Danh sách phẳng hiển thị trong bảng
  readonly danhSachBang = computed<DanhMucHienThiBang[]>(() => {
    const tree = this.cayDanhMuc();
    const result: DanhMucHienThiBang[] = [];

    for (const parent of tree) {
      result.push({
        id: parent.id,
        ten: parent.ten,
        slug: parent.slug,
        icon: parent.icon,
        moTa: parent.moTa,
        parentId: undefined,
        laCap1: true,
        thuTu: parent.thuTu,
        trangThai: parent.trangThai,
        soLuongSanPham: parent.soLuongSanPham
      });

      if (parent.children && parent.children.length > 0) {
        for (const child of parent.children) {
          result.push({
            id: child.id,
            ten: child.ten,
            slug: child.slug,
            icon: child.icon,
            moTa: child.moTa,
            parentId: parent.id,
            tenCha: parent.ten,
            laCap1: false,
            thuTu: child.thuTu,
            trangThai: child.trangThai,
            soLuongSanPham: child.soLuongSanPham
          });
        }
      }
    }

    return result;
  });

  // Danh sách các danh mục cha cấp 1 (cho select cha)
  readonly danhMucChaList = computed(() => {
    return this.cayDanhMuc().map(p => ({ id: p.id, ten: p.ten, icon: p.icon }));
  });

  // Gợi ý emoji nhanh
  readonly emojiGoiY: string[] = ['📱', '💻', '👕', '👗', '👟', '🏠', '🍳', '🛋️', '💄', '💊', '🍎', '🍪', '⚽', '🎒', '🧸', '📚', '🎮', '🚗', '✈️', '🎁', '📦'];

  // Modal State
  hienModal: boolean = false;
  dangSuaId: string | null = null;
  dangLuu: boolean = false;
  form!: FormGroup;

  ngOnInit(): void {
    this.khoiTaoForm();
    this.taiCayDanhMuc();
  }

  khoiTaoForm(): void {
    this.form = this.fb.group({
      ten: ['', [Validators.required, Validators.maxLength(256)]],
      slug: [''],
      icon: ['📦', [Validators.maxLength(128)]],
      parentId: [null],
      thuTu: [1, [Validators.min(0)]],
      moTa: [''],
      trangThai: [true]
    });
  }

  taiCayDanhMuc(): void {
    this.dangTai.set(true);
    this.duLieuService.getCayDanhMuc().subscribe({
      next: (tree) => {
        this.cayDanhMuc.set(tree);
        this.dangTai.set(false);
      },
      error: (err) => {
        this.dangTai.set(false);
        this.message.error(trichXuatThongBaoLoi(err, 'Lỗi tải cây danh mục!'));
      }
    });
  }

  moModalThem(parentId?: string): void {
    this.dangSuaId = null;
    this.form.reset({
      ten: '',
      slug: '',
      icon: '📦',
      parentId: parentId || null,
      thuTu: 1,
      moTa: '',
      trangThai: true
    });
    this.hienModal = true;
  }

  moModalSua(item: DanhMucHienThiBang): void {
    this.dangSuaId = item.id;
    this.form.patchValue({
      ten: item.ten,
      slug: item.slug,
      icon: item.icon || '📦',
      parentId: item.parentId || null,
      thuTu: item.thuTu,
      moTa: item.moTa || '',
      trangThai: item.trangThai
    });
    this.hienModal = true;
  }

  chonEmoji(emoji: string): void {
    this.form.patchValue({ icon: emoji });
  }

  onTenChange(): void {
    // Tự sinh slug nếu đang tạo mới và chưa tự gõ slug
    if (!this.dangSuaId) {
      const ten = this.form.get('ten')?.value || '';
      const slug = this.taoSlug(ten);
      this.form.patchValue({ slug });
    }
  }

  taoSlug(str: string): string {
    if (!str) return '';
    return str
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  luuDanhMuc(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.message.warning('Vui lòng nhập tên danh mục hợp lệ!');
      return;
    }

    this.dangLuu = true;
    const formVal = this.form.value;
    const payload = {
      ten: formVal.ten.trim(),
      slug: formVal.slug?.trim() || undefined,
      icon: formVal.icon?.trim() || '📦',
      parentId: formVal.parentId || null,
      thuTu: Number(formVal.thuTu) || 0,
      moTa: formVal.moTa?.trim() || undefined,
      trangThai: !!formVal.trangThai
    };

    if (this.dangSuaId) {
      this.duLieuService.capNhatDanhMuc(this.dangSuaId, payload).subscribe({
        next: () => {
          this.dangLuu = false;
          this.hienModal = false;
          this.message.success('Cập nhật danh mục thành công!');
          this.taiCayDanhMuc();
        },
        error: (err) => {
          this.dangLuu = false;
          this.message.error(trichXuatThongBaoLoi(err, 'Lỗi cập nhật danh mục!'));
        }
      });
    } else {
      this.duLieuService.taoDanhMuc(payload).subscribe({
        next: () => {
          this.dangLuu = false;
          this.hienModal = false;
          this.message.success('Thêm danh mục mới thành công!');
          this.taiCayDanhMuc();
        },
        error: (err) => {
          this.dangLuu = false;
          this.message.error(trichXuatThongBaoLoi(err, 'Lỗi thêm danh mục mới!'));
        }
      });
    }
  }

  xoaDanhMuc(id: string): void {
    this.duLieuService.xoaDanhMuc(id).subscribe({
      next: () => {
        this.message.success('Đã xóa danh mục thành công!');
        this.taiCayDanhMuc();
      },
      error: (err) => {
        this.message.error(trichXuatThongBaoLoi(err, 'Không thể xóa danh mục!'));
      }
    });
  }
}
