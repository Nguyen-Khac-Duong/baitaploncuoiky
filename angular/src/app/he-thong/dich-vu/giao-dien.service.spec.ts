import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { GiaoDienService } from './giao-dien.service';

describe('GiaoDienService (Theme Switching Service)', () => {
  let service: GiaoDienService;

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    document.body?.removeAttribute('data-theme');
    TestBed.configureTestingModule({});
    service = TestBed.inject(GiaoDienService);
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    document.body?.removeAttribute('data-theme');
  });

  it('nên khởi tạo service thành công với trạng thái mặc định', () => {
    expect(service).toBeTruthy();
    expect(typeof service.cheDoToi()).toBe('boolean');
  });

  it('nên chuyển đổi từ Sáng sang Tối thành công khi gọi chuyenDoiGiaoDien', () => {
    if (service.cheDoToi()) {
      service.chuyenDoiGiaoDien();
    }
    expect(service.cheDoToi()).toBe(false);

    service.chuyenDoiGiaoDien();
    expect(service.cheDoToi()).toBe(true);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(document.body.getAttribute('data-theme')).toBe('dark');
    expect(localStorage.getItem('app_theme_mode')).toBe('toi');
  });

  it('nên chuyển đổi từ Tối về lại Sáng thành công', () => {
    if (!service.cheDoToi()) {
      service.chuyenDoiGiaoDien();
    }
    expect(service.cheDoToi()).toBe(true);

    service.chuyenDoiGiaoDien();
    expect(service.cheDoToi()).toBe(false);
    expect(document.documentElement.getAttribute('data-theme')).toBeNull();
    expect(document.body.getAttribute('data-theme')).toBeNull();
    expect(localStorage.getItem('app_theme_mode')).toBe('sang');
  });

  it('nên lưu cấu hình theme vào localStorage và khôi phục khi khởi động', () => {
    localStorage.setItem('app_theme_mode', 'toi');
    const newService = new GiaoDienService();
    expect(newService.cheDoToi()).toBe(true);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});

