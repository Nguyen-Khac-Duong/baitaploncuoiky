using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace testtttt88.ThongBaos;

public class ThongBao : FullAuditedAggregateRoot<Guid>
{
    public const string LoaiDonHang = "don_hang";
    public const string LoaiHoanTien = "hoan_tien";
    public const string LoaiDanhGia = "danh_gia";
    public const string LoaiViTien = "vi_tien";
    public const string LoaiKhoHang = "kho_hang";
    public const string LoaiHeThong = "he_thong";

    public const string DoiTuongBuyer = "buyer";
    public const string DoiTuongSeller = "seller";

    public Guid? NguoiDungId { get; set; }
    public Guid? CuaHangId { get; set; }
    public string DoiTuong { get; set; } = DoiTuongBuyer;
    public string TieuDe { get; set; } = string.Empty;
    public string NoiDung { get; set; } = string.Empty;
    public string Loai { get; set; } = LoaiHeThong;
    public string? LienKet { get; set; }
    public bool DaDoc { get; set; }
    public DateTime? ThoiGianDoc { get; set; }

    public ThongBao()
    {
    }

    public ThongBao(
        Guid id,
        string tieuDe,
        string noiDung,
        string loai = LoaiHeThong,
        string? lienKet = null,
        Guid? nguoiDungId = null,
        Guid? cuaHangId = null,
        string doiTuong = DoiTuongBuyer) : base(id)
    {
        TieuDe = tieuDe;
        NoiDung = noiDung;
        Loai = loai;
        LienKet = lienKet;
        NguoiDungId = nguoiDungId;
        CuaHangId = cuaHangId;
        DoiTuong = doiTuong;
        DaDoc = false;
    }

    public void DanhDauDaDoc()
    {
        DaDoc = true;
        ThoiGianDoc = DateTime.UtcNow;
    }
}

