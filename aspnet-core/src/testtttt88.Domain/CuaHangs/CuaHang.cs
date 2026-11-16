using System;
using Volo.Abp;
using Volo.Abp.Domain.Entities.Auditing;

namespace testtttt88.CuaHangs;

/// <summary>
/// Thực thể Gian Hàng (Shop / Vendor) trong mô hình Multi-vendor Marketplace
/// </summary>
public class CuaHang : FullAuditedAggregateRoot<Guid>
{
    public const string TrangThaiChoDuyet = "ChoDuyet";
    public const string TrangThaiHoatDong = "HoatDong";
    public const string TrangThaiTamKhoa = "TamKhoa";
    public const string TrangThaiBiTuChoi = "BiTuChoi";

    public string Ten { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public Guid ChuSoHuuId { get; set; }
    public string SoDienThoai { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string DiaChi { get; set; } = string.Empty;
    public string? Logo { get; set; }
    public string? Banner { get; set; }
    public string? MoTa { get; set; }
    public string TrangThai { get; set; } = TrangThaiChoDuyet;
    public decimal PhanTramHoaHong { get; set; } = 5.0m; // Phí hoa hồng sàn thu (%)

    // Thông tin tài khoản ngân hàng để nhận tiền rút từ ví
    public string? SoTaiKhoanNganHang { get; set; }
    public string? TenNganHang { get; set; }
    public string? TenChuTaiKhoan { get; set; }

    public CuaHang()
    {
    }

    public CuaHang(
        Guid id,
        string ten,
        string slug,
        Guid chuSoHuuId,
        string soDienThoai,
        string email,
        string diaChi,
        string? logo = null,
        string? banner = null,
        string? moTa = null,
        decimal phanTramHoaHong = 5.0m,
        string trangThai = TrangThaiChoDuyet)
        : base(id)
    {
        SetTen(ten);
        SetSlug(slug);
        ChuSoHuuId = chuSoHuuId;
        SoDienThoai = Check.NotNullOrWhiteSpace(soDienThoai, nameof(soDienThoai));
        Email = Check.NotNullOrWhiteSpace(email, nameof(email));
        DiaChi = Check.NotNullOrWhiteSpace(diaChi, nameof(diaChi));
        Logo = logo;
        Banner = banner;
        MoTa = moTa;
        PhanTramHoaHong = phanTramHoaHong;
        TrangThai = trangThai;
    }

    public void SetTen(string ten)
    {
        Ten = Check.NotNullOrWhiteSpace(ten, nameof(ten), maxLength: 256);
    }

    public void SetSlug(string slug)
    {
        Slug = Check.NotNullOrWhiteSpace(slug, nameof(slug), maxLength: 256).ToLowerInvariant();
    }

    public void DuyetGianHang()
    {
        TrangThai = TrangThaiHoatDong;
    }

    public void KhoaGianHang()
    {
        TrangThai = TrangThaiTamKhoa;
    }

    public void MoKhoaGianHang()
    {
        TrangThai = TrangThaiHoatDong;
    }

    public void TuChoiGianHang()
    {
        TrangThai = TrangThaiBiTuChoi;
    }

    public void CapNhatNganHang(string soTaiKhoan, string tenNganHang, string tenChuTaiKhoan)
    {
        SoTaiKhoanNganHang = Check.NotNullOrWhiteSpace(soTaiKhoan, nameof(soTaiKhoan));
        TenNganHang = Check.NotNullOrWhiteSpace(tenNganHang, nameof(tenNganHang));
        TenChuTaiKhoan = Check.NotNullOrWhiteSpace(tenChuTaiKhoan, nameof(tenChuTaiKhoan));
    }
}

