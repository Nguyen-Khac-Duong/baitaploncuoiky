using System;
using System.ComponentModel.DataAnnotations;
using Volo.Abp.Application.Dtos;

namespace testtttt88.ViCuaHangs;

public class ViCuaHangDto : FullAuditedEntityDto<Guid>
{
    public Guid CuaHangId { get; set; }
    public decimal SoDuKhaDung { get; set; }
    public decimal SoDuTamGiu { get; set; }
    public decimal TongTienDaRut { get; set; }
    public decimal TongTienDangChoDuyet { get; set; }
}

public class GiaoDichViDto : CreationAuditedEntityDto<Guid>
{
    public Guid ViCuaHangId { get; set; }
    public Guid CuaHangId { get; set; }
    public string LoaiGiaoDich { get; set; } = string.Empty;
    public decimal SoTien { get; set; }
    public decimal SoDuSauGiaoDich { get; set; }
    public string MoTa { get; set; } = string.Empty;
    public string? MaDonHangLienQuan { get; set; }
}

public class YeuCauRutTienDto : FullAuditedEntityDto<Guid>
{
    public Guid CuaHangId { get; set; }
    public string? TenCuaHang { get; set; }
    public decimal SoTien { get; set; }
    public string TenNganHang { get; set; } = string.Empty;
    public string SoTaiKhoan { get; set; } = string.Empty;
    public string TenChuTaiKhoan { get; set; } = string.Empty;
    public string TrangThai { get; set; } = string.Empty;
    public string? GhiChu { get; set; }
    public string? LyDoTuChoi { get; set; }
    public DateTime? NgayXuLy { get; set; }
}

public class TaoYeuCauRutTienDto
{
    [Required]
    [Range(50000, 1000000000, ErrorMessage = "Số tiền rút tối thiểu là 50,000 VNĐ")]
    public decimal SoTien { get; set; }

    [MaxLength(256)]
    public string? GhiChu { get; set; }
}

public class XuLyRutTienDto
{
    [Required]
    public bool DongY { get; set; }

    [MaxLength(512)]
    public string? LyDoTuChoi { get; set; }
}

