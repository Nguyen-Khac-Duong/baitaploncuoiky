import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Observable, combineLatest, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { DuLieuService } from '../../he-thong/dich-vu/du-lieu.service';
import { XacThucService } from '../../he-thong/dich-vu/xac-thuc.service';
import { DonHang, ChiTietDonHang, DanhGiaSanPham } from '../../shared/mo-hinh/du-lieu.model';
import { trichXuatThongBaoLoi } from '../../he-thong/tien-ich/loi-api.helper';

// NG-ZORRO Modules
import { NzRateModule } from 'ng-zorro-antd/rate';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-don-hang-cua-toi',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    NzRateModule,
    NzModalModule,
    NzButtonModule,
    NzInputModule,
    NzSelectModule
  ],
  templateUrl: './don-hang-cua-toi.component.html',
  styleUrl: './don-hang-cua-toi.component.scss'
})
export class DonHangCuaToiComponent implements OnInit {
  private readonly duLieuService = inject(DuLieuService);
  private readonly route = inject(ActivatedRoute);
  private readonly message = inject(NzMessageService);
  readonly xacThucService = inject(XacThucService);

  tuKhoaTraCuu: string = '';
  daTraCuu: boolean = false;
  donHangList$!: Observable<DonHang[]>;

  // Quản lý trạng thái đánh giá
  readonly danhGiaMap = signal<Record<string, DanhGiaSanPham>>({});
  hienModalDanhGia: boolean = false;
  dangGuiDanhGia: boolean = false;
  dangUploadDanhGia: boolean = false;
  spDangDanhGia: { donHang: DonHang; chiTiet: ChiTietDonHang } | null = null;
  soSao: number = 5;
  noiDung: string = '';
  hinhAnh: string = '';

  // Quản lý trạng thái Yêu cầu Trả hàng / Hoàn tiền
  hienModalTraHang: boolean = false;
  dangGuiTraHang: boolean = false;
  dangUploadTraHang: boolean = false;
  donHangDangTra: DonHang | null = null;
  lyDoTraHang: string = 'Hàng bị hư hỏng / móp méo khi nhận';
  ghiChuTraHang: string = '';
  hinhAnhTraHang: string = '';

  danhSachLyDo = [
    'Hàng bị hư hỏng / móp méo khi nhận',
    'Giao sai sản phẩm / kích thước / màu sắc',
    'Sản phẩm kém chất lượng, không giống mô tả',
    'Thiếu phụ kiện / quà tặng đi kèm',
    'Khác (ghi rõ trong phần mô tả)'
  ];

  ngOnInit(): void {
    const user = this.xacThucService.currentUser();

    // Đọc query param nếu khách vừa đặt hàng từ giỏ hàng sang
    this.route.queryParams.subscribe(params => {
      if (params['maDon']) {
        this.tuKhoaTraCuu = params['maDon'];
        this.daTraCuu = true;
      } else if (params['sdt']) {
        this.tuKhoaTraCuu = params['sdt'];
        this.daTraCuu = true;
      }
      this.taiDanhSachDonHang();
      this.taiDanhSachDanhGia();
    });
  }

  taiDanhSachDanhGia(): void {
    if (!this.xacThucService.currentUser()) return;
    this.duLieuService.getDanhSachDanhGiaCuaToi().subscribe({
      next: (list) => {
        const map: Record<string, DanhGiaSanPham> = {};
        for (const item of list) {
          map[`${item.donHangId}_${item.sanPhamId}`] = item;
        }
        this.danhGiaMap.set(map);
      },
      error: (e) => console.warn('Lỗi tải đánh giá cá nhân:', e)
    });
  }

  getDanhGia(donHangId: string, sanPhamId: string): DanhGiaSanPham | undefined {
    return this.danhGiaMap()[`${donHangId}_${sanPhamId}`];
  }

  choPhepDanhGia(trangThai: string): boolean {
    return trangThai === 'hoan_thanh' || 
           trangThai === 'dang_giao' || 
           trangThai === 'tra_hang' || 
           trangThai === 'yeu_cau_tra_hang' || 
           trangThai === 'tu_choi_tra_hang';
  }

  choPhepTraHang(trangThai: string): boolean {
    return trangThai === 'hoan_thanh' || trangThai === 'dang_giao';
  }

  moModalTraHang(dh: DonHang): void {
    this.donHangDangTra = dh;
    this.lyDoTraHang = this.danhSachLyDo[0];
    this.ghiChuTraHang = '';
    this.hinhAnhTraHang = '';
    this.hienModalTraHang = true;
  }

  guiYeuCauTraHang(): void {
    if (!this.donHangDangTra) return;
    if (!this.lyDoTraHang.trim()) {
      this.message.warning('Vui lòng chọn hoặc nhập lý do hoàn trả hàng!');
      return;
    }

    this.dangGuiTraHang = true;
    this.duLieuService.yeuCauTraHang(this.donHangDangTra.id, {
      lyDoTraHang: this.lyDoTraHang,
      ghiChuTraHang: this.ghiChuTraHang.trim() || undefined,
      hinhAnhTraHang: this.hinhAnhTraHang.trim() || undefined
    }).subscribe({
      next: () => {
        this.dangGuiTraHang = false;
        this.hienModalTraHang = false;
        this.message.success('Đã gửi yêu cầu trả hàng & hoàn tiền! Shop sẽ sớm xử lý cho bạn.');
        this.taiDanhSachDonHang();
      },
      error: (err) => {
        this.dangGuiTraHang = false;
        this.message.error(trichXuatThongBaoLoi(err, 'Lỗi gửi yêu cầu trả hàng!'));
      }
    });
  }

  moModalDanhGia(dh: DonHang, item: ChiTietDonHang): void {
    this.spDangDanhGia = { donHang: dh, chiTiet: item };
    this.soSao = 5;
    this.noiDung = '';
    this.hinhAnh = '';
    this.hienModalDanhGia = true;
  }

  onFileSelectedDanhGia(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    if (file.size > 10 * 1024 * 1024) {
      this.message.warning('Dung lượng ảnh tối đa là 10MB!');
      return;
    }
    this.dangUploadDanhGia = true;
    this.duLieuService.uploadHinhAnh(file).subscribe({
      next: (res) => {
        this.dangUploadDanhGia = false;
        this.hinhAnh = res.url;
        this.message.success('Tải ảnh thực tế thành công!');
      },
      error: (err) => {
        this.dangUploadDanhGia = false;
        this.message.error(trichXuatThongBaoLoi(err, 'Lỗi tải ảnh lên máy chủ!'));
      }
    });
  }

  onFileSelectedTraHang(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    if (file.size > 10 * 1024 * 1024) {
      this.message.warning('Dung lượng ảnh tối đa là 10MB!');
      return;
    }
    this.dangUploadTraHang = true;
    this.duLieuService.uploadHinhAnh(file).subscribe({
      next: (res) => {
        this.dangUploadTraHang = false;
        this.hinhAnhTraHang = res.url;
        this.message.success('Tải ảnh bằng chứng thành công!');
      },
      error: (err) => {
        this.dangUploadTraHang = false;
        this.message.error(trichXuatThongBaoLoi(err, 'Lỗi tải ảnh lên máy chủ!'));
      }
    });
  }

  guiDanhGia(): void {
    if (!this.spDangDanhGia) return;
    if (!this.noiDung.trim()) {
      this.message.warning('Vui lòng nhập nội dung đánh giá sản phẩm!');
      return;
    }

    this.dangGuiDanhGia = true;
    this.duLieuService.taoDanhGia({
      sanPhamId: this.spDangDanhGia.chiTiet.sanPhamId,
      donHangId: this.spDangDanhGia.donHang.id,
      soSao: this.soSao,
      noiDung: this.noiDung.trim(),
      hinhAnh: this.hinhAnh.trim() || undefined
    }).subscribe({
      next: () => {
        this.dangGuiDanhGia = false;
        this.hienModalDanhGia = false;
        this.message.success('Cảm ơn bạn đã gửi đánh giá sản phẩm!');
        this.taiDanhSachDanhGia();
      },
      error: (err) => {
        this.dangGuiDanhGia = false;
        this.message.error(trichXuatThongBaoLoi(err, 'Lỗi gửi đánh giá sản phẩm!'));
      }
    });
  }

  taiDanhSachDonHang(): void {
    const tuKhoa = this.tuKhoaTraCuu.trim().toLowerCase();
    const user = this.xacThucService.currentUser();

    // Gọi trực tiếp API lấy đơn hàng theo tài khoản hoặc số điện thoại của người dùng
    this.donHangList$ = this.duLieuService.getDonHangCuaKhachHang(user?.id, user?.soDienThoai).pipe(
      map(danhSach => {
        let danhSachDonCuaToi = danhSach || [];

        // Nếu khách hàng có nhập từ khóa tìm kiếm (Mã đơn hoặc Tên sản phẩm trong đơn)
        if (tuKhoa) {
          danhSachDonCuaToi = danhSachDonCuaToi.filter(dh =>
            dh.maDon.toLowerCase().includes(tuKhoa) ||
            dh.chiTiet.some(ct => ct.tenSanPham.toLowerCase().includes(tuKhoa))
          );
        }

        return danhSachDonCuaToi;
      }),
      catchError(err => {
        console.warn('Lỗi tải danh sách đơn hàng:', err);
        return of([]);
      })
    );
  }

  traCuu(): void {
    this.daTraCuu = !!this.tuKhoaTraCuu.trim();
    this.taiDanhSachDonHang();
  }

  xoaTraCuu(): void {
    this.tuKhoaTraCuu = '';
    this.daTraCuu = false;
    this.taiDanhSachDonHang();
  }

  formatTien(gia: number | undefined | null): string {
    const val = Number(gia || 0);
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(isNaN(val) ? 0 : val);
  }

  layTenTrangThai(trangThai: string): string {
    const mapTrangThai: Record<string, string> = {
      cho_xu_ly: 'Chờ xử lý',
      dang_giao: 'Đang giao hàng',
      hoan_thanh: 'Hoàn thành',
      da_huy: 'Đã hủy',
      yeu_cau_tra_hang: '⏳ Chờ duyệt trả hàng',
      tra_hang: '↩️ Đã hoàn tiền & trả hàng',
      tu_choi_tra_hang: '❌ Từ chối trả hàng'
    };
    return mapTrangThai[trangThai] || trangThai;
  }
}

