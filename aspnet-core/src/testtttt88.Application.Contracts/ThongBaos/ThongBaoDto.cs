using System;
using Volo.Abp.Application.Dtos;

namespace testtttt88.ThongBaos;

public class ThongBaoDto : FullAuditedEntityDto<Guid>
{
    public Guid? NguoiDungId { get; set; }
    public Guid? CuaHangId { get; set; }
    public string DoiTuong { get; set; } = "buyer";
    public string TieuDe { get; set; } = string.Empty;
    public string NoiDung { get; set; } = string.Empty;
    public string Loai { get; set; } = string.Empty;
    public string? LienKet { get; set; }
    public bool DaDoc { get; set; }
    public DateTime? ThoiGianDoc { get; set; }
}

public class TaoThongBaoDto
{
    public Guid? NguoiDungId { get; set; }
    public Guid? CuaHangId { get; set; }
    public string DoiTuong { get; set; } = "buyer";
    public string TieuDe { get; set; } = string.Empty;
    public string NoiDung { get; set; } = string.Empty;
    public string Loai { get; set; } = "he_thong";
    public string? LienKet { get; set; }
}

public class SoLuongThongBaoChuaDocDto
{
    public int SoLuongChuaDoc { get; set; }
}

