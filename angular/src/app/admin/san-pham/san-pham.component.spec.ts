import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { of } from 'rxjs';
import { SanPhamComponent } from './san-pham.component';
import { DuLieuService } from '../../he-thong/dich-vu/du-lieu.service';
import { SanPham } from '../../shared/mo-hinh/du-lieu.model';

describe('SanPhamComponent', () => {
  let component: SanPhamComponent;
  let fixture: ComponentFixture<SanPhamComponent>;
  let duLieuServiceMock: any;

  const mockSanPhamList: SanPham[] = [
    {
      id: 'sp-1',
      maSp: 'SP001',
      ten: 'iPhone 15 Pro',
      gia: 25000000,
      soLuongTon: 10,
      danhMuc: 'Điện thoại',
      ngayTao: '2026-01-01'
    }
  ];

  beforeEach(async () => {
    duLieuServiceMock = {
      getDanhSachSanPham: () => of(mockSanPhamList),
      themSanPham: vi.fn(),
      capNhatThongTinSanPham: vi.fn(),
      xoaSanPham: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [SanPhamComponent],
      providers: [
        { provide: DuLieuService, useValue: duLieuServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SanPhamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('nên khởi tạo component và form thành công', () => {
    expect(component).toBeTruthy();
    expect(component.formSanPham).toBeDefined();
  });

  it('nên mở modal thêm mới và reset form', () => {
    component.moModalThem();
    expect(component.hienModal).toBe(true);
    expect(component.dangChinhSua).toBe(false);
  });

  it('nên mở modal sửa với dữ liệu được patch vào form', () => {
    const sp = mockSanPhamList[0];
    component.moModalSua(sp);
    expect(component.hienModal).toBe(true);
    expect(component.dangChinhSua).toBe(true);
    expect(component.formSanPham.get('ten')?.value).toBe(sp.ten);
  });

  it('nên gọi service thêm sản phẩm khi submit form hợp lệ', () => {
    component.moModalThem();
    component.formSanPham.patchValue({
      maSp: 'SP002',
      ten: 'Sản phẩm mới',
      gia: 2000000,
      soLuongTon: 5,
      danhMuc: 'Laptop'
    });

    component.luuSanPham();

    expect(duLieuServiceMock.themSanPham).toHaveBeenCalled();
    expect(component.hienModal).toBe(false);
  });

  it('nên xác nhận xóa sản phẩm qua modal', () => {
    const sp = mockSanPhamList[0];
    component.yeuCauXoa(sp);
    expect(component.hienModalXacNhanXoa).toBe(true);

    component.xacNhanXoa();
    expect(duLieuServiceMock.xoaSanPham).toHaveBeenCalledWith(sp.id);
    expect(component.hienModalXacNhanXoa).toBe(false);
  });
});
