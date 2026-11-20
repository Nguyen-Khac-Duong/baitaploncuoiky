using System;
using Volo.Abp.Application.Dtos;

namespace testtttt88.Vouchers;

public class VoucherDto : FullAuditedEntityDto<Guid>
{
    public string MaVoucher { get; set; } = string.Empty;
    public string TieuDe { get; set; } = string.Empty;
    public string? MoTa { get; set; }
    public string LoaiGiamGia { get; set; } = string.Empty;
    public decimal GiaTriGiam { get; set; }
    public decimal GiaTriDonToiThieu { get; set; }
    public decimal? GiamToiDa { get; set; }
    public int SoLuong { get; set; }
    public int SoLuongDaDung { get; set; }
    public int SoLuongConLai => Math.Max(0, SoLuong - SoLuongDaDung);
    public DateTime NgayBatDau { get; set; }
    public DateTime NgayKetThuc { get; set; }
    public Guid? CuaHangId { get; set; }
    public string? TenCuaHang { get; set; }
    public bool LaVoucherSan => !CuaHangId.HasValue;
    public bool KichHoat { get; set; }
}

public class KiemTraVoucherInputDto
{
    public string MaVoucher { get; set; } = string.Empty;
    public decimal TongTienHang { get; set; }
    public Guid? CuaHangId { get; set; }
}

public class KetQuaKiemTraVoucherDto
{
    public bool HopLe { get; set; }
    public decimal SoTienGiam { get; set; }
    public decimal TongTienSauGiam { get; set; }
    public string ThongBao { get; set; } = string.Empty;
    public bool LaVoucherSan { get; set; }
    public Guid? CuaHangId { get; set; }
    public VoucherDto? Voucher { get; set; }
}

public class TaoCapNhatVoucherDto
{
    public string MaVoucher { get; set; } = string.Empty;
    public string TieuDe { get; set; } = string.Empty;
    public string? MoTa { get; set; }
    public string LoaiGiamGia { get; set; } = "SoTien";
    public decimal GiaTriGiam { get; set; }
    public decimal GiaTriDonToiThieu { get; set; }
    public decimal? GiamToiDa { get; set; }
    public int SoLuong { get; set; } = 100;
    public DateTime NgayBatDau { get; set; }
    public DateTime NgayKetThuc { get; set; }
    public Guid? CuaHangId { get; set; }
    public bool KichHoat { get; set; } = true;
}
