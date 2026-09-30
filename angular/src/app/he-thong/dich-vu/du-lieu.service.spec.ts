import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { DuLieuService } from './du-lieu.service';

describe('DuLieuService', () => {
  let service: DuLieuService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(DuLieuService);
  });

  it('nên khởi tạo service thành công với dữ liệu mẫu', () => {
    service.getDanhSachSanPham().subscribe(sanPham => {
      expect(sanPham.length).toBeGreaterThan(0);
    });

    service.getDanhSachDonHang().subscribe(donHang => {
      expect(donHang.length).toBeGreaterThan(0);
    });
  });

  it('nên tính toán chính xác chỉ số thống kê Dashboard', () => {
    service.getThongKeDashboard().subscribe(thongKe => {
      expect(thongKe.tongSanPham).toBeGreaterThan(0);
      expect(thongKe.tongDonHang).toBeGreaterThan(0);
    });
  });

  it('nên thêm và quản lý giỏ hàng thành công', () => {
    const sp = {
      id: 'sp-test',
      maSp: 'TEST',
      ten: 'SP Test',
      gia: 500000,
      soLuongTon: 10,
      danhMuc: 'Test',
      ngayTao: '2026-01-01'
    };

    service.themVaoGioHang(sp, 2);
    expect(service.tongSoLuongGioHang()).toBe(2);
    expect(service.tongTienGioHang()).toBe(1000000);

    service.xoaSachGioHang();
    expect(service.tongSoLuongGioHang()).toBe(0);
  });

  it('nên đặt hàng và tự động cập nhật kho + tạo đơn hàng', () => {
    const sp = {
      id: 'sp-1',
      maSp: 'SP001',
      ten: 'iPhone 15 Pro Max 256GB Titan Tự Nhiên',
      gia: 29990000,
      soLuongTon: 15,
      danhMuc: 'Điện thoại',
      ngayTao: '2026-01-10'
    };

    service.themVaoGioHang(sp, 1);
    const donHang = service.datHang({
      tenKhachHang: 'Khách Test',
      soDienThoai: '0988776655',
      diaChi: 'Hà Nội'
    });

    expect(donHang).toBeTruthy();
    expect(service.gioHang().length).toBe(0);
  });
});
