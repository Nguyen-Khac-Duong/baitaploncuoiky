using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using Volo.Abp.Domain.Entities.Auditing;

namespace testtttt88.DonHangs;

public class DonHang : FullAuditedAggregateRoot<Guid>
{
    public string MaDon { get; set; } = string.Empty;
    public string? NguoiDungId { get; set; }
    public string TenKhachHang { get; set; } = string.Empty;
    public string SoDienThoai { get; set; } = string.Empty;
    public string DiaChi { get; set; } = string.Empty;
    public string? GhiChu { get; set; }
    public decimal TongTien { get; set; }
    public string TrangThai { get; set; } = "cho_xu_ly";
    public DateTime NgayTao { get; set; } = DateTime.Now;

    public virtual ICollection<ChiTietDonHang> ChiTiet { get; set; }

    public DonHang()
    {
        ChiTiet = new Collection<ChiTietDonHang>();
    }

    public DonHang(
        Guid id,
        string maDon,
        string tenKhachHang,
        string soDienThoai,
        string diaChi,
        decimal tongTien,
        string? nguoiDungId = null,
        string? ghiChu = null,
        string trangThai = "cho_xu_ly")
        : base(id)
    {
        MaDon = maDon;
        TenKhachHang = tenKhachHang;
        SoDienThoai = soDienThoai;
        DiaChi = diaChi;
        TongTien = tongTien;
        NguoiDungId = nguoiDungId;
        GhiChu = ghiChu;
        TrangThai = trangThai;
        NgayTao = DateTime.Now;
        ChiTiet = new Collection<ChiTietDonHang>();
    }
}
