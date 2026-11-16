using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Volo.Abp.Application.Dtos;

namespace testtttt88.DonHangs;

public class DonHangDto : FullAuditedEntityDto<Guid>
{
    public Guid CuaHangId { get; set; }
    public string? TenCuaHang { get; set; }
    public Guid? DonHangTongId { get; set; }
    public string? MaDonTong { get; set; }
    public string MaDon { get; set; } = string.Empty;
    public string? NguoiDungId { get; set; }
    public string TenKhachHang { get; set; } = string.Empty;
    public string SoDienThoai { get; set; } = string.Empty;
    public string DiaChi { get; set; } = string.Empty;
    public string? GhiChu { get; set; }
    public decimal TienHang { get; set; }
    public decimal PhiVanChuyen { get; set; }
    public decimal TienHoaHongSan { get; set; }
    public decimal ThucNhanCuaShop { get; set; }
    public decimal TongTien { get; set; }
    public string TrangThai { get; set; } = string.Empty;
    public DateTime NgayTao { get; set; }
    public List<ChiTietDonHangDto> ChiTiet { get; set; } = new();

    // Thông tin Trả hàng & Hoàn tiền
    public string? LyDoTraHang { get; set; }
    public string? GhiChuTraHang { get; set; }
    public string? HinhAnhTraHang { get; set; }
    public DateTime? ThoiGianYeuCauTraHang { get; set; }
    public string? PhanHoiTraHang { get; set; }
    public DateTime? ThoiGianXuLyTraHang { get; set; }
}

public class DonHangTongDto : FullAuditedEntityDto<Guid>
{
    public string MaDonTong { get; set; } = string.Empty;
    public string? NguoiDungId { get; set; }
    public string TenKhachHang { get; set; } = string.Empty;
    public string SoDienThoai { get; set; } = string.Empty;
    public string DiaChi { get; set; } = string.Empty;
    public string? GhiChu { get; set; }
    public decimal TongTien { get; set; }
    public string PhuongThucThanhToan { get; set; } = string.Empty;
    public string TrangThai { get; set; } = string.Empty;
    public List<DonHangDto> DonHangCons { get; set; } = new();
}

public class CreateDonHangDto
{
    public string? NguoiDungId { get; set; }

    [Required]
    [MaxLength(128)]
    public string TenKhachHang { get; set; } = string.Empty;

    [Required]
    [MaxLength(32)]
    public string SoDienThoai { get; set; } = string.Empty;

    [Required]
    [MaxLength(512)]
    public string DiaChi { get; set; } = string.Empty;

    [MaxLength(1024)]
    public string? GhiChu { get; set; }

    [Required]
    [MinLength(1, ErrorMessage = "Đơn hàng phải có ít nhất một sản phẩm.")]
    public List<CreateChiTietDonHangDto> ChiTiet { get; set; } = new();
}

public class DoiTrangThaiDonHangDto
{
    [Required]
    public string TrangThai { get; set; } = string.Empty;
}

public class GetDonHangListFilterDto : PagedAndSortedResultRequestDto
{
    public Guid? CuaHangId { get; set; }
    public string? Filter { get; set; }
    public string? TrangThai { get; set; }
}

public class ThongKeDashboardDto
{
    public int TongSanPham { get; set; }
    public int TongDonHang { get; set; }
    public decimal TongDoanhThu { get; set; }
    public int SanPhamHetHang { get; set; }
}

public class YeuCauTraHangDto
{
    [Required(ErrorMessage = "Vui lòng chọn hoặc nhập lý do yêu cầu trả hàng.")]
    public string LyDoTraHang { get; set; } = string.Empty;

    public string? GhiChuTraHang { get; set; }

    public string? HinhAnhTraHang { get; set; }
}

public class XuLyTraHangDto
{
    public bool DongY { get; set; }

    public string? PhanHoi { get; set; }
}
