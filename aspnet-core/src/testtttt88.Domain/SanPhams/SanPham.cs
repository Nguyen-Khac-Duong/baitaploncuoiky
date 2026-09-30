using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace testtttt88.SanPhams;

public class SanPham : FullAuditedAggregateRoot<Guid>
{
    public string MaSp { get; set; } = string.Empty;
    public string Ten { get; set; } = string.Empty;
    public decimal Gia { get; set; }
    public int SoLuongTon { get; set; }
    public string DanhMuc { get; set; } = string.Empty;
    public string? HinhAnh { get; set; }
    public string? MoTa { get; set; }
    public DateTime NgayTao { get; set; } = DateTime.Now;

    public SanPham()
    {
    }

    public SanPham(
        Guid id,
        string maSp,
        string ten,
        decimal gia,
        int soLuongTon,
        string danhMuc,
        string? hinhAnh = null,
        string? moTa = null)
        : base(id)
    {
        MaSp = maSp;
        Ten = ten;
        Gia = gia;
        SoLuongTon = soLuongTon;
        DanhMuc = danhMuc;
        HinhAnh = hinhAnh;
        MoTa = moTa;
        NgayTao = DateTime.Now;
    }
}
