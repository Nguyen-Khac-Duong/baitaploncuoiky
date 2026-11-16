import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Observable, Subject, combineLatest } from 'rxjs';
import { map, startWith, debounceTime } from 'rxjs/operators';
import { DuLieuService } from '../../he-thong/dich-vu/du-lieu.service';
import { SanPham } from '../../shared/mo-hinh/du-lieu.model';
import { trichXuatThongBaoLoi } from '../../he-thong/tien-ich/loi-api.helper';

// NG-ZORRO Modules
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-san-pham',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzTableModule,
    NzButtonModule,
    NzInputModule,
    NzInputNumberModule,
    NzSelectModule,
    NzModalModule,
    NzFormModule,
    NzTagModule,
    NzBadgeModule,
    NzPopconfirmModule,
    NzIconModule,
    NzTooltipModule,
    NzCardModule,
    NzSpaceModule,
    NzEmptyModule,
  ],
  templateUrl: './san-pham.component.html',
  styleUrl: './san-pham.component.scss'
})
export class SanPhamComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly duLieuService = inject(DuLieuService);
  private readonly msg = inject(NzMessageService);
  private readonly destroy$ = new Subject<void>();

  // Form & Search
  readonly searchControl = new FormControl<string>('', { nonNullable: true });
  readonly categoryFilterControl = new FormControl<string>('all', { nonNullable: true });
  formSanPham!: FormGroup;

  // Modals & UI States
  hienModal: boolean = false;
  dangChinhSua: boolean = false;
  sanPhamIdDangSua: string | null = null;
  sanPhamDangXoa: SanPham | null = null;
  hienModalXacNhanXoa: boolean = false;
  dangXuLy: boolean = false;

  // Stream danh sách sản phẩm sau lọc/tìm kiếm
  sanPhamHienThi$!: Observable<SanPham[]>;
  danhMucList: string[] = ['Tất cả', 'Điện thoại', 'Laptop', 'Phụ kiện', 'Âm thanh', 'Màn hình'];

  // Sắp xếp
  compareGia = (a: SanPham, b: SanPham): number => a.gia - b.gia;
  compareTon = (a: SanPham, b: SanPham): number => a.soLuongTon - b.soLuongTon;

  ngOnInit(): void {
    this.khoiTaoForm();
    this.khoiTaoStreamSanPham();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private khoiTaoForm(): void {
    this.formSanPham = this.fb.group({
      maSp: ['', [Validators.required, Validators.pattern(/^[A-Z0-9_-]+$/)]],
      ten: ['', [Validators.required, Validators.minLength(3)]],
      gia: [null, [Validators.required, Validators.min(1000)]],
      soLuongTon: [0, [Validators.required, Validators.min(0)]],
      danhMuc: ['Điện thoại', [Validators.required]],
      moTa: ['']
    });
  }

  private khoiTaoStreamSanPham(): void {
    const search$ = this.searchControl.valueChanges.pipe(
      startWith(''),
      debounceTime(250)
    );

    const filter$ = this.categoryFilterControl.valueChanges.pipe(
      startWith('all')
    );

    this.sanPhamHienThi$ = combineLatest([
      this.duLieuService.getDanhSachSanPham(),
      search$,
      filter$
    ]).pipe(
      map(([danhSach, tuKhoa, danhMuc]) => {
        return danhSach.filter(sp => {
          const matchTuKhoa = !tuKhoa || 
            sp.ten.toLowerCase().includes(tuKhoa.toLowerCase()) || 
            sp.maSp.toLowerCase().includes(tuKhoa.toLowerCase());
          const matchDanhMuc = danhMuc === 'all' || danhMuc === 'Tất cả' || sp.danhMuc === danhMuc;
          return matchTuKhoa && matchDanhMuc;
        });
      })
    );
  }

  // === MODAL FORM HANDLERS ===
  moModalThem(): void {
    this.dangChinhSua = false;
    this.sanPhamIdDangSua = null;
    this.formSanPham.reset({
      maSp: 'SP' + Math.floor(100000 + Math.random() * 900000),
      gia: null,
      soLuongTon: 1,
      danhMuc: 'Điện thoại',
      moTa: ''
    });
    this.hienModal = true;
  }

  moModalSua(sp: SanPham): void {
    this.dangChinhSua = true;
    this.sanPhamIdDangSua = sp.id;
    this.formSanPham.patchValue({
      maSp: sp.maSp,
      ten: sp.ten,
      gia: sp.gia,
      soLuongTon: sp.soLuongTon,
      danhMuc: sp.danhMuc,
      moTa: sp.moTa || ''
    });
    this.hienModal = true;
  }

  dongModal(): void {
    this.hienModal = false;
    this.dangXuLy = false;
  }

  luuSanPham(): void {
    if (this.dangXuLy) {
      return;
    }

    if (this.formSanPham.invalid) {
      Object.values(this.formSanPham.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }

    this.dangXuLy = true;
    const giaTri = this.formSanPham.value;

    if (this.dangChinhSua && this.sanPhamIdDangSua) {
      this.duLieuService.capNhatThongTinSanPham(this.sanPhamIdDangSua, giaTri).subscribe({
        next: () => {
          this.dangXuLy = false;
          this.msg.success(`Đã cập nhật sản phẩm "${giaTri.ten}" thành công!`);
          this.dongModal();
        },
        error: (err) => {
          this.dangXuLy = false;
          const msg = trichXuatThongBaoLoi(err, 'Có lỗi xảy ra khi cập nhật thông tin sản phẩm!');
          this.msg.error(msg);
        }
      });
    } else {
      this.duLieuService.themSanPham({
        maSp: giaTri.maSp,
        ten: giaTri.ten,
        gia: Number(giaTri.gia),
        soLuongTon: Number(giaTri.soLuongTon),
        danhMuc: giaTri.danhMuc,
        moTa: giaTri.moTa
      }).subscribe({
        next: () => {
          this.dangXuLy = false;
          this.msg.success(`Đã tạo mới sản phẩm "${giaTri.ten}" thành công!`);
          this.dongModal();
        },
        error: (err) => {
          this.dangXuLy = false;
          const msg = trichXuatThongBaoLoi(err, 'Có lỗi xảy ra khi tạo sản phẩm mới!');
          this.msg.error(msg);
        }
      });
    }
  }

  // === DELETE HANDLERS ===
  yeuCauXoa(sp: SanPham): void {
    this.sanPhamDangXoa = sp;
    this.hienModalXacNhanXoa = true;
  }

  xacNhanXoa(sp?: SanPham): void {
    const spXoa = sp || this.sanPhamDangXoa;
    if (spXoa && !this.dangXuLy) {
      this.dangXuLy = true;
      this.duLieuService.xoaSanPham(spXoa.id).subscribe({
        next: () => {
          this.dangXuLy = false;
          this.msg.success(`Đã xóa sản phẩm "${spXoa.ten}" (${spXoa.maSp})!`);
          this.sanPhamDangXoa = null;
          this.hienModalXacNhanXoa = false;
        },
        error: (err) => {
          this.dangXuLy = false;
          const msg = trichXuatThongBaoLoi(err, 'Có lỗi xảy ra khi xóa sản phẩm!');
          this.msg.error(msg);
        }
      });
    }
  }

  dongModalXoa(): void {
    this.sanPhamDangXoa = null;
    this.hienModalXacNhanXoa = false;
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
    this.formSanPham.get(controlName)?.setValue(num, { emitEvent: false });
    this.formSanPham.get(controlName)?.markAsDirty();

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

  formatTien(gia: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(gia);
  }

  getDanhMucColor(danhMuc: string): string {
    switch (danhMuc) {
      case 'Điện thoại': return 'blue';
      case 'Laptop': return 'purple';
      case 'Phụ kiện': return 'cyan';
      case 'Âm thanh': return 'orange';
      case 'Màn hình': return 'magenta';
      default: return 'geekblue';
    }
  }
}