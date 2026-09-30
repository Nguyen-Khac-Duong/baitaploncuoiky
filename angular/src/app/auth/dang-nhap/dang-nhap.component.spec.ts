import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DangNhapComponent } from './dang-nhap.component';
import { XacThucService } from '../../he-thong/dich-vu/xac-thuc.service';

describe('DangNhapComponent', () => {
  let component: DangNhapComponent;
  let fixture: ComponentFixture<DangNhapComponent>;
  let mockXacThucService: { dangNhap: ReturnType<typeof vi.fn> };
  let mockRouter: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    mockXacThucService = {
      dangNhap: vi.fn()
    };
    mockRouter = {
      navigate: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [DangNhapComponent],
      providers: [
        { provide: XacThucService, useValue: mockXacThucService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DangNhapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('nên khởi tạo component thành công', () => {
    expect(component).toBeTruthy();
  });

  it('nên patch đúng thông tin khi chọn tài khoản mẫu', () => {
    component.chonTaiKhoanMau('khachhang@gmail.com', '123456');
    expect(component.formDangNhap.value).toEqual({ email: 'khachhang@gmail.com', matKhau: '123456' });
    expect(component.loiDangNhap).toBe(false);
  });

  it('nên báo lỗi validator email khi để trống hoặc sai định dạng', () => {
    const emailControl = component.emailControl;
    emailControl?.setValue('');
    expect(emailControl?.hasError('required')).toBe(true);

    emailControl?.setValue('invalid-email');
    expect(emailControl?.hasError('email')).toBe(true);

    emailControl?.setValue('admin@gmail.com');
    expect(emailControl?.valid).toBe(true);
  });

  it('nên chuyển hướng sang /tong-quan khi Admin đăng nhập thành công', () => {
    mockXacThucService.dangNhap.mockReturnValue({
      id: 'admin',
      vaiTro: 'admin',
      hoTen: 'Admin'
    });

    component.formDangNhap.setValue({
      email: 'admin@gmail.com',
      matKhau: '123456'
    });

    component.xuLyDangNhap();

    expect(mockXacThucService.dangNhap).toHaveBeenCalledWith('admin@gmail.com', '123456');
    expect(component.loiDangNhap).toBe(false);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/tong-quan']);
  });

  it('nên chuyển hướng sang /cua-hang khi Khách hàng đăng nhập thành công', () => {
    mockXacThucService.dangNhap.mockReturnValue({
      id: 'khach',
      vaiTro: 'khach_hang',
      hoTen: 'Khach Hang'
    });

    component.formDangNhap.setValue({
      email: 'khachhang@gmail.com',
      matKhau: '123456'
    });

    component.xuLyDangNhap();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/cua-hang']);
  });

  it('nên hiển thị lỗi đăng nhập khi thông tin đăng nhập sai', () => {
    mockXacThucService.dangNhap.mockReturnValue(null);

    component.formDangNhap.setValue({
      email: 'wrong@gmail.com',
      matKhau: 'wrongpass'
    });

    component.xuLyDangNhap();

    expect(mockXacThucService.dangNhap).toHaveBeenCalledWith('wrong@gmail.com', 'wrongpass');
    expect(component.loiDangNhap).toBe(true);
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });
});
