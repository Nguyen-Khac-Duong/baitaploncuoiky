import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { TongQuanComponent } from './tong-quan.component';
import { DuLieuService } from '../../he-thong/dich-vu/du-lieu.service';

describe('TongQuanComponent', () => {
  let component: TongQuanComponent;
  let fixture: ComponentFixture<TongQuanComponent>;

  const mockThongKe = {
    tongSanPham: 10,
    tongDonHang: 5,
    tongDoanhThu: 50000000,
    sanPhamHetHang: 1
  };

  beforeEach(async () => {
    const duLieuServiceMock = {
      getThongKeDashboard: () => of(mockThongKe),
      getDanhSachDonHang: () => of([]),
      getDanhSachSanPham: () => of([])
    };

    await TestBed.configureTestingModule({
      imports: [TongQuanComponent],
      providers: [
        provideRouter([]),
        { provide: DuLieuService, useValue: duLieuServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TongQuanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('nên khởi tạo component thành công', () => {
    expect(component).toBeTruthy();
  });

  it('nên format tiền tệ VND chính xác', () => {
    const formatted = component.formatTien(100000);
    expect(formatted).toContain('100.000');
  });

  it('nên chuyển đổi tên trạng thái đơn hàng chính xác', () => {
    expect(component.layTenTrangThai('cho_xu_ly')).toBe('Chờ xử lý');
    expect(component.layTenTrangThai('dang_giao')).toBe('Đang giao hàng');
    expect(component.layTenTrangThai('hoan_thanh')).toBe('Hoàn thành');
  });
});
