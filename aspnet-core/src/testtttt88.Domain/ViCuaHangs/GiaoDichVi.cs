using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace testtttt88.ViCuaHangs;

/// <summary>
/// Lịch sử biến động số dư ví của Shop (Wallet Transaction Ledger)
/// </summary>
public class GiaoDichVi : CreationAuditedEntity<Guid>
{
    public const string LoaiCongTamGiu = "CongTamGiu";
    public const string LoaiQuyetToan = "QuyetToanDonHang";
    public const string LoaiTruTamGiuHuyDon = "TruTamGiuHuyDon";
    public const string LoaiRutTien = "RutTien";
    public const string LoaiHoanTienRut = "HoanTienRut";

    public Guid ViCuaHangId { get; set; }
    public Guid CuaHangId { get; set; }
    public string LoaiGiaoDich { get; set; } = string.Empty;
    public decimal SoTien { get; set; }
    public decimal SoDuSauGiaoDich { get; set; }
    public string MoTa { get; set; } = string.Empty;
    public string? MaDonHangLienQuan { get; set; }

    public GiaoDichVi()
    {
    }

    public GiaoDichVi(
        Guid id,
        Guid viCuaHangId,
        Guid cuaHangId,
        string loaiGiaoDich,
        decimal soTien,
        decimal soDuSauGiaoDich,
        string moTa,
        string? maDonHangLienQuan = null)
        : base(id)
    {
        ViCuaHangId = viCuaHangId;
        CuaHangId = cuaHangId;
        LoaiGiaoDich = loaiGiaoDich;
        SoTien = soTien;
        SoDuSauGiaoDich = soDuSauGiaoDich;
        MoTa = moTa;
        MaDonHangLienQuan = maDonHangLienQuan;
    }
}

