using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace testtttt88.ViCuaHangs;

/// <summary>
/// Yêu cầu rút tiền từ Ví Gian Hàng về tài khoản Ngân hàng (Payout Request)
/// </summary>
public class YeuCauRutTien : FullAuditedAggregateRoot<Guid>
{
    public const string TrangThaiChoDuyet = "ChoDuyet";
    public const string TrangThaiDaChuyenTien = "DaChuyenTien";
    public const string TrangThaiTuChoi = "TuChoi";

    public Guid CuaHangId { get; set; }
    public decimal SoTien { get; set; }
    public string TenNganHang { get; set; } = string.Empty;
    public string SoTaiKhoan { get; set; } = string.Empty;
    public string TenChuTaiKhoan { get; set; } = string.Empty;
    public string TrangThai { get; set; } = TrangThaiChoDuyet;
    public string? GhiChu { get; set; }
    public string? LyDoTuChoi { get; set; }
    public DateTime? NgayXuLy { get; set; }

    public YeuCauRutTien()
    {
    }

    public YeuCauRutTien(
        Guid id,
        Guid cuaHangId,
        decimal soTien,
        string tenNganHang,
        string soTaiKhoan,
        string tenChuTaiKhoan,
        string? ghiChu = null)
        : base(id)
    {
        CuaHangId = cuaHangId;
        SoTien = soTien;
        TenNganHang = tenNganHang;
        SoTaiKhoan = soTaiKhoan;
        TenChuTaiKhoan = tenChuTaiKhoan;
        GhiChu = ghiChu;
        TrangThai = TrangThaiChoDuyet;
    }

    public void PheDuyet()
    {
        TrangThai = TrangThaiDaChuyenTien;
        NgayXuLy = DateTime.UtcNow;
    }

    public void TuChoi(string lyDo)
    {
        TrangThai = TrangThaiTuChoi;
        LyDoTuChoi = lyDo;
        NgayXuLy = DateTime.UtcNow;
    }
}

