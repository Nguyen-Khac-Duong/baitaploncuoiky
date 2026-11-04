using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using Volo.Abp;
using Volo.Abp.Domain.Entities.Auditing;

namespace testtttt88.DonHangs;

public class DonHang : FullAuditedAggregateRoot<Guid>
{
    public const string TrangThaiChoXuLy = "cho_xu_ly";
    public const string TrangThaiDangGiao = "dang_giao";
    public const string TrangThaiHoanThanh = "hoan_thanh";
    public const string TrangThaiDaHuy = "da_huy";

    public string MaDon { get; set; } = string.Empty;
    public string? NguoiDungId { get; set; }
    public string TenKhachHang { get; set; } = string.Empty;
    public string SoDienThoai { get; set; } = string.Empty;
    public string DiaChi { get; set; } = string.Empty;
    public string? GhiChu { get; set; }
    public decimal TongTien { get; set; }
    public string TrangThai { get; set; } = TrangThaiChoXuLy;
    public DateTime NgayTao { get; set; }

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
        decimal tongTien = 0,
        string? nguoiDungId = null,
        string? ghiChu = null,
        string trangThai = TrangThaiChoXuLy)
        : base(id)
    {
        MaDon = Check.NotNullOrWhiteSpace(maDon, nameof(maDon));
        TenKhachHang = Check.NotNullOrWhiteSpace(tenKhachHang, nameof(tenKhachHang));
        SoDienThoai = Check.NotNullOrWhiteSpace(soDienThoai, nameof(soDienThoai));
        DiaChi = Check.NotNullOrWhiteSpace(diaChi, nameof(diaChi));
        TongTien = tongTien;
        NguoiDungId = nguoiDungId;
        GhiChu = ghiChu;
        TrangThai = trangThai;
        ChiTiet = new Collection<ChiTietDonHang>();
    }

    /// <summary>
    /// Thêm một dòng chi tiết đơn hàng và tự động cập nhật tổng tiền (Server-calculated TotalAmount)
    /// </summary>
    public void ThemChiTiet(
        Guid id,
        Guid sanPhamId,
        string tenSanPham,
        int soLuong,
        decimal donGia,
        string? hinhAnh = null)
    {
        Check.NotNullOrWhiteSpace(tenSanPham, nameof(tenSanPham));
        if (soLuong <= 0)
        {
            throw new ArgumentException("Số lượng sản phẩm trong đơn phải lớn hơn 0.", nameof(soLuong));
        }
        if (donGia < 0)
        {
            throw new ArgumentException("Đơn giá sản phẩm không được âm.", nameof(donGia));
        }

        var thanhTien = donGia * soLuong;
        var chiTietItem = new ChiTietDonHang(
            id,
            Id,
            sanPhamId,
            tenSanPham,
            soLuong,
            donGia,
            thanhTien,
            hinhAnh
        );

        ChiTiet.Add(chiTietItem);
        TongTien = ChiTiet.Sum(x => x.ThanhTien);
    }

    /// <summary>
    /// Kiểm tra máy trạng thái đơn hàng (State Machine Invariants)
    /// </summary>
    public bool CoTheChuyenSang(string trangThaiMoi)
    {
        if (TrangThai == TrangThaiHoanThanh || TrangThai == TrangThaiDaHuy)
        {
            return false;
        }

        return trangThaiMoi switch
        {
            TrangThaiDangGiao => TrangThai == TrangThaiChoXuLy,
            TrangThaiHoanThanh => TrangThai == TrangThaiDangGiao || TrangThai == TrangThaiChoXuLy,
            TrangThaiDaHuy => TrangThai == TrangThaiChoXuLy || TrangThai == TrangThaiDangGiao,
            _ => false
        };
    }

    /// <summary>
    /// Chuyển đổi trạng thái đơn hàng tuân thủ quy tắc nghiệp vụ
    /// </summary>
    public void ChuyenTrangThai(string trangThaiMoi)
    {
        if (TrangThai == TrangThaiHoanThanh || TrangThai == TrangThaiDaHuy)
        {
            throw new BusinessException(testtttt88DomainErrorCodes.DonHangDaHoanThanhHoacHuy)
                .WithData("TrangThai", TrangThai);
        }

        if (!CoTheChuyenSang(trangThaiMoi))
        {
            throw new BusinessException(testtttt88DomainErrorCodes.TrangThaiDonHangKhongHopLe)
                .WithData("TrangThai", trangThaiMoi);
        }

        TrangThai = trangThaiMoi;
    }
}
