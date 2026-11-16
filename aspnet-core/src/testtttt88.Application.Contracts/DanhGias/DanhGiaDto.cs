using System;
using Volo.Abp.Application.Dtos;

namespace testtttt88.DanhGias;

public class DanhGiaDto : FullAuditedEntityDto<Guid>
{
    public Guid SanPhamId { get; set; }
    public string TenSanPham { get; set; } = string.Empty;
    public string? HinhAnhSanPham { get; set; }
    public Guid DonHangId { get; set; }
    public string MaDonHang { get; set; } = string.Empty;
    public Guid CuaHangId { get; set; }
    public string TenCuaHang { get; set; } = string.Empty;
    public Guid NguoiDungId { get; set; }
    public string TenNguoiDung { get; set; } = string.Empty;
    public string? AvatarNguoiDung { get; set; }
    public int SoSao { get; set; }
    public string NoiDung { get; set; } = string.Empty;
    public string? HinhAnh { get; set; }
    public bool DonHangCoHoanTra { get; set; }
    public string? PhanHoiShop { get; set; }
    public DateTime? ThoiGianPhanHoi { get; set; }
}

public class TaoDanhGiaDto
{
    public Guid SanPhamId { get; set; }
    public Guid DonHangId { get; set; }
    public int SoSao { get; set; }
    public string NoiDung { get; set; } = string.Empty;
    public string? HinhAnh { get; set; }
}

public class PhanHoiDanhGiaDto
{
    public string NoiDungPhanHoi { get; set; } = string.Empty;
}

public class ThongKeDanhGiaDto
{
    public double DiemTrungBinh { get; set; }
    public int TongSoDanhGia { get; set; }
    public int SoLuong5Sao { get; set; }
    public int SoLuong4Sao { get; set; }
    public int SoLuong3Sao { get; set; }
    public int SoLuong2Sao { get; set; }
    public int SoLuong1Sao { get; set; }
    public int SoLuongCoHinhAnh { get; set; }
    public int SoLuongDonHoanTra { get; set; }
}

