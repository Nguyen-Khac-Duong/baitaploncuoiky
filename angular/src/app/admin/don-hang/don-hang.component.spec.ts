import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { of } from 'rxjs';
import { DonHangComponent } from './don-hang.component';
import { DuLieuService } from '../../he-thong/dich-vu/du-lieu.service';
import { DonHang } from '../../shared/mo-hinh/du-lieu.model';

describe('DonHangComponent', () => {
  let component: DonHangComponent;
  let fixture: ComponentFixture<DonHangComponent>;
  let duLieuServiceMock: any;

  const mockDonHangList: DonHang[] = [
    {
      id: 'dh-1',
      maDon: 'DH1001',
      tenKhachHang: 'Nguyễn Văn An',
      soDienThoai: '0901234567',
      diaChi: '123 Nguyễn Huệ',
      tongTien: 10000000,
      trangThai: 'cho_xu_ly',
      ngayTao: '2026-08-24',
      chiTiet: []
    }
  ];

  beforeEach(async () => {
    duLieuServiceMock = {
      getDanhSachDonHang: () => of(mockDonHangList),
      doiTrangThaiDonHang: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [DonHangComponent],
      providers: [
        { provide: DuLieuService, useValue: duLieuServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DonHangComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('nên khởi tạo component thành công', () => {
    expect(component).toBeTruthy();
  });

  it('nên mở modal chi tiết đơn hàng', () => {
    const dh = mockDonHangList[0];
    component.xemChiTiet(dh);
    expect(component.hienModalChiTiet).toBe(true);
    expect(component.donHangChiTiet).toEqual(dh);

    component.dongModalChiTiet();
    expect(component.hienModalChiTiet).toBe(false);
    expect(component.donHangChiTiet).toBeNull();
  });

  it('nên gọi service đổi trạng thái đơn hàng', () => {
    const dh = mockDonHangList[0];
    component.doiTrangThai(dh, 'dang_giao');
    expect(duLieuServiceMock.doiTrangThaiDonHang).toHaveBeenCalledWith(dh.id, 'dang_giao');
  });
});
