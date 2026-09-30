using System;
using Volo.Abp.Application.Dtos;

namespace testtttt88.DonHangs;

public class ChiTietDonHangDto : EntityDto<Guid>
{
    public Guid DonHangId { get; set; }
    public Guid SanPhamId { get; set; }
    public string TenSanPham { get; set; } = string.Empty;
    public int SoLuong { get; set; }
    public decimal DonGia { get; set; }
    public decimal ThanhTien { get; set; }
    public string? HinhAnh { get; set; }
}

public class CreateChiTietDonHangDto
{
    public Guid SanPhamId { get; set; }
    public string TenSanPham { get; set; } = string.Empty;
    public int SoLuong { get; set; }
    public decimal DonGia { get; set; }
    public decimal ThanhTien { get; set; }
    public string? HinhAnh { get; set; }
}
