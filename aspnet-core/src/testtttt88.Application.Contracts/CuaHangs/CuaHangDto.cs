using System;
using System.ComponentModel.DataAnnotations;
using Volo.Abp.Application.Dtos;

namespace testtttt88.CuaHangs;

public class CuaHangDto : FullAuditedEntityDto<Guid>
{
    public string Ten { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public Guid ChuSoHuuId { get; set; }
    public string SoDienThoai { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string DiaChi { get; set; } = string.Empty;
    public string? Logo { get; set; }
    public string? Banner { get; set; }
    public string? MoTa { get; set; }
    public string TrangThai { get; set; } = string.Empty;
    public decimal PhanTramHoaHong { get; set; }
    public string? SoTaiKhoanNganHang { get; set; }
    public string? TenNganHang { get; set; }
    public string? TenChuTaiKhoan { get; set; }
    public int TongSanPham { get; set; }
}

public class DangKyCuaHangDto
{
    [Required]
    [MaxLength(256)]
    public string Ten { get; set; } = string.Empty;

    [Required]
    [MaxLength(256)]
    [RegularExpression(@"^[a-z0-9-]+$", ErrorMessage = "Đường dẫn (slug) chỉ gồm chữ thường, số và dấu gạch ngang.")]
    public string Slug { get; set; } = string.Empty;

    [Required]
    [MaxLength(32)]
    public string SoDienThoai { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [MaxLength(128)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MaxLength(512)]
    public string DiaChi { get; set; } = string.Empty;

    [MaxLength(1024)]
    public string? Logo { get; set; }

    [MaxLength(1024)]
    public string? Banner { get; set; }

    [MaxLength(2048)]
    public string? MoTa { get; set; }
}

public class CapNhatNganHangCuaHangDto
{
    [Required]
    [MaxLength(64)]
    public string SoTaiKhoanNganHang { get; set; } = string.Empty;

    [Required]
    [MaxLength(128)]
    public string TenNganHang { get; set; } = string.Empty;

    [Required]
    [MaxLength(128)]
    public string TenChuTaiKhoan { get; set; } = string.Empty;
}

