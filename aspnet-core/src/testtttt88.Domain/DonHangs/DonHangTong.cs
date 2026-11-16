using System;
using System.Collections.Generic;
using Volo.Abp;
using Volo.Abp.Domain.Entities.Auditing;

namespace testtttt88.DonHangs;

/// <summary>
/// Đơn hàng Tổng (Master Order) cho phiên thanh toán của Buyer trên Sàn Multi-vendor
/// </summary>
public class DonHangTong : FullAuditedAggregateRoot<Guid>
{
    public const string TTChuaThanhToan = "ChuaThanhToan";
    public const string TTDangXuLy = "DangXuLy";
    public const string TTHoanThanh = "HoanThanh";
    public const string TTDahuy = "DaHuy";

    public string MaDonTong { get; set; } = string.Empty;
    public string? NguoiDungId { get; set; } // Khách hàng (Buyer)

    public string TenKhachHang { get; set; } = string.Empty;
    public string SoDienThoai { get; set; } = string.Empty;
    public string DiaChi { get; set; } = string.Empty;
    public string? GhiChu { get; set; }

    public decimal TongTien { get; set; }
    public string PhuongThucThanhToan { get; set; } = "COD"; // COD, ChuyenKhoan, ViDienTu
    public string TrangThai { get; set; } = TTChuaThanhToan;

    public virtual ICollection<DonHang> DonHangCons { get; set; } = new List<DonHang>();

    public DonHangTong()
    {
    }

    public DonHangTong(
        Guid id,
        string maDonTong,
        string tenKhachHang,
        string soDienThoai,
        string diaChi,
        decimal tongTien,
        string? nguoiDungId = null,
        string? ghiChu = null,
        string phuongThucThanhToan = "COD",
        string trangThai = TTChuaThanhToan)
        : base(id)
    {
        MaDonTong = Check.NotNullOrWhiteSpace(maDonTong, nameof(maDonTong));
        TenKhachHang = Check.NotNullOrWhiteSpace(tenKhachHang, nameof(tenKhachHang));
        SoDienThoai = Check.NotNullOrWhiteSpace(soDienThoai, nameof(soDienThoai));
        DiaChi = Check.NotNullOrWhiteSpace(diaChi, nameof(diaChi));
        TongTien = tongTien >= 0 ? tongTien : throw new BusinessException("TongTienKhongDuocAm");
        NguoiDungId = nguoiDungId;
        GhiChu = ghiChu;
        PhuongThucThanhToan = phuongThucThanhToan;
        TrangThai = trangThai;
    }
}

