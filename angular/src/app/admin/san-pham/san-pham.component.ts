import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Observable, Subject, combineLatest } from 'rxjs';
import { map, startWith, takeUntil, debounceTime } from 'rxjs/operators';
import { DuLieuService } from '../../he-thong/dich-vu/du-lieu.service';
import { SanPham } from '../../shared/mo-hinh/du-lieu.model';

@Component({
  selector: 'app-san-pham',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './san-pham.component.html',
  styleUrl: './san-pham.component.scss'
})
export class SanPhamComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly duLieuService = inject(DuLieuService);
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

  // Stream danh sách sản phẩm sau lọc/tìm kiếm
  sanPhamHienThi$!: Observable<SanPham[]>;
  danhMucList: string[] = ['Tất cả', 'Điện thoại', 'Laptop', 'Phụ kiện', 'Âm thanh', 'Màn hình'];

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
      maSp: 'SP' + Math.floor(100 + Math.random() * 900),
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
  }

  luuSanPham(): void {
    if (this.formSanPham.invalid) {
      this.formSanPham.markAllAsTouched();
      return;
    }

    const giaTri = this.formSanPham.value;

    if (this.dangChinhSua && this.sanPhamIdDangSua) {
      this.duLieuService.capNhatThongTinSanPham(this.sanPhamIdDangSua, giaTri);
    } else {
      this.duLieuService.themSanPham({
        maSp: giaTri.maSp,
        ten: giaTri.ten,
        gia: Number(giaTri.gia),
        soLuongTon: Number(giaTri.soLuongTon),
        danhMuc: giaTri.danhMuc,
        moTa: giaTri.moTa
      });
    }

    this.dongModal();
  }

  // === CONFIRM DELETE MODAL ===
  yeuCauXoa(sp: SanPham): void {
    this.sanPhamDangXoa = sp;
    this.hienModalXacNhanXoa = true;
  }

  xacNhanXoa(): void {
    if (this.sanPhamDangXoa) {
      this.duLieuService.xoaSanPham(this.sanPhamDangXoa.id);
      this.sanPhamDangXoa = null;
      this.hienModalXacNhanXoa = false;
    }
  }

  dongModalXoa(): void {
    this.sanPhamDangXoa = null;
    this.hienModalXacNhanXoa = false;
  }

  formatTien(gia: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(gia);
  }
}