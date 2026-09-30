import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { HeaderComponent } from './header.component';
import { GiaoDienService } from '../../../he-thong/dich-vu/giao-dien.service';
import { XacThucService } from '../../../he-thong/dich-vu/xac-thuc.service';
import { DuLieuService } from '../../../he-thong/dich-vu/du-lieu.service';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let mockXacThucService: { dangXuat: ReturnType<typeof vi.fn> };
  let mockRouter: { navigate: ReturnType<typeof vi.fn>; events: any; url: string };
  let mockDuLieuService: { getDanhSachDonHang: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    mockXacThucService = { dangXuat: vi.fn() };
    mockRouter = {
      navigate: vi.fn(),
      url: '/tong-quan',
      events: of()
    };
    mockDuLieuService = {
      getDanhSachDonHang: vi.fn().mockReturnValue(of([
        { id: '1', maDon: 'DH01', tenKhachHang: 'An', tongTien: 100000, trangThai: 'cho_xu_ly', ngayTao: '2026-08-24' }
      ]))
    };

    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        { provide: XacThucService, useValue: mockXacThucService },
        { provide: Router, useValue: mockRouter },
        { provide: DuLieuService, useValue: mockDuLieuService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('nên khởi tạo HeaderComponent thành công', () => {
    expect(component).toBeTruthy();
  });

  it('nên đếm đúng số lượng thông báo chưa đọc', () => {
    expect(component.soThongBaoChuaDoc).toBeGreaterThan(0);
  });

  it('nên đánh dấu tất cả thông báo là đã đọc', () => {
    component.danhDauDaDocTatCa();
    expect(component.soThongBaoChuaDoc).toBe(0);
  });

  it('nên emit sự kiện toggleSidebar khi click nút toggle', () => {
    const spyEmit = vi.spyOn(component.toggleSidebar, 'emit');
    const btnToggle = fixture.nativeElement.querySelector('.btn-toggle-sidebar');
    btnToggle.click();
    expect(spyEmit).toHaveBeenCalled();
  });

  it('nên gọi đăng xuất và chuyển về trang đăng nhập', () => {
    component.dangXuat();
    expect(mockXacThucService.dangXuat).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dang-nhap']);
  });
});
