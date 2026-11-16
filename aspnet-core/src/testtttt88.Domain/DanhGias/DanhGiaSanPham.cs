using System;
using Volo.Abp;
using Volo.Abp.Domain.Entities.Auditing;

namespace testtttt88.DanhGias;

/// <summary>
/// Thực thể Đánh giá & Nhận xét sản phẩm theo chuẩn DDD
/// Kế thừa FullAuditedAggregateRoot để tự động hỗ trợ Audit Logs và Soft Delete
/// </summary>
public class DanhGiaSanPham : FullAuditedAggregateRoot<Guid>
{
    public Guid SanPhamId { get; set; }
    public Guid DonHangId { get; set; }
    public Guid CuaHangId { get; set; }
    public Guid NguoiDungId { get; set; }
    public string TenNguoiDung { get; set; } = string.Empty;
    public string? AvatarNguoiDung { get; set; }
    public int SoSao { get; set; } // 1 - 5 sao
    public string NoiDung { get; set; } = string.Empty;
    public string? HinhAnh { get; set; }
    
    // Đánh dấu nếu đơn hàng này có phát sinh hoàn hàng/đổi trả
    public bool DonHangCoHoanTra { get; set; }

    // Phản hồi từ chủ gian hàng
    public string? PhanHoiShop { get; set; }
    public DateTime? ThoiGianPhanHoi { get; set; }

    public DanhGiaSanPham()
    {
    }

    public DanhGiaSanPham(
        Guid id,
        Guid sanPhamId,
        Guid donHangId,
        Guid cuaHangId,
        Guid nguoiDungId,
        string tenNguoiDung,
        int soSao,
        string noiDung,
        string? hinhAnh = null,
        bool donHangCoHoanTra = false,
        string? avatarNguoiDung = null)
        : base(id)
    {
        SanPhamId = sanPhamId;
        DonHangId = donHangId;
        CuaHangId = cuaHangId;
        NguoiDungId = nguoiDungId;
        TenNguoiDung = Check.NotNullOrWhiteSpace(tenNguoiDung, nameof(tenNguoiDung));
        SoSao = (soSao >= 1 && soSao <= 5) ? soSao : throw new UserFriendlyException("Số sao đánh giá phải từ 1 đến 5 sao!");
        NoiDung = Check.NotNullOrWhiteSpace(noiDung, nameof(noiDung));
        HinhAnh = hinhAnh;
        DonHangCoHoanTra = donHangCoHoanTra;
        AvatarNguoiDung = avatarNguoiDung;
    }

    public void CapNhatPhanHoiShop(string phanHoi)
    {
        PhanHoiShop = Check.NotNullOrWhiteSpace(phanHoi, nameof(phanHoi));
        ThoiGianPhanHoi = DateTime.Now;
    }
}

