using System;
using Volo.Abp.Domain.Entities;

namespace testtttt88.DonHangs;

public class ChiTietDonHang : Entity<Guid>
{
    public Guid DonHangId { get; set; }
    public Guid SanPhamId { get; set; }
    public string TenSanPham { get; set; } = string.Empty;
    public int SoLuong { get; set; }
    public decimal DonGia { get; set; }
    public decimal ThanhTien { get; set; }
    public string? HinhAnh { get; set; }

    public ChiTietDonHang()
    {
    }

    public ChiTietDonHang(
        Guid id,
        Guid donHangId,
        Guid sanPhamId,
        string tenSanPham,
        int soLuong,
        decimal donGia,
        decimal thanhTien,
        string? hinhAnh = null)
        : base(id)
    {
        DonHangId = donHangId;
        SanPhamId = sanPhamId;
        TenSanPham = tenSanPham;
        SoLuong = soLuong;
        DonGia = donGia;
        ThanhTien = thanhTien;
        HinhAnh = hinhAnh;
    }
}
