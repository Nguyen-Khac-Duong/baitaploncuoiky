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
    public const string TrangThaiYeuCauTraHang = "yeu_cau_tra_hang";
    public const string TrangThaiTraHang = "tra_hang";
    public const string TrangThaiTuChoiTraHang = "tu_choi_tra_hang";

    public string MaDon { get; set; } = string.Empty;
    public string? NguoiDungId { get; set; }
    public string TenKhachHang { get; set; } = string.Empty;
    public string SoDienThoai { get; set; } = string.Empty;
    public string DiaChi { get; set; } = string.Empty;
    public string? GhiChu { get; set; }
    public decimal TongTien { get; set; }
    public string TrangThai { get; set; } = TrangThaiChoXuLy;
    public DateTime NgayTao { get; set; }

    // Multi-vendor Split Order Fields
    public Guid CuaHangId { get; set; }
    public Guid? DonHangTongId { get; set; }
    public decimal TienHang { get; set; }
    public decimal PhiVanChuyen { get; set; }
    public decimal TienHoaHongSan { get; set; }
    public decimal ThucNhanCuaShop { get; set; }
    public decimal TienGiamVoucher { get; set; }

    // Thông tin Yêu cầu Trả hàng & Hoàn tiền (Return & Refund)
    public string? LyDoTraHang { get; set; }
    public string? GhiChuTraHang { get; set; }
    public string? HinhAnhTraHang { get; set; }
    public DateTime? ThoiGianYeuCauTraHang { get; set; }
    public string? PhanHoiTraHang { get; set; }
    public DateTime? ThoiGianXuLyTraHang { get; set; }

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
        string trangThai = TrangThaiChoXuLy,
        Guid cuaHangId = default,
        Guid? donHangTongId = null,
        decimal phiVanChuyen = 0,
        decimal phanTramHoaHong = 5.0m)
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
        CuaHangId = cuaHangId;
        DonHangTongId = donHangTongId;
        PhiVanChuyen = phiVanChuyen;
        TienHang = tongTien;
        TienHoaHongSan = Math.Round(TienHang * (phanTramHoaHong / 100m), 0);
        ThucNhanCuaShop = TienHang - TienHoaHongSan;
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
            throw new BusinessException(testtttt88DomainErrorCodes.SoLuongPhaiLonHon0);
        }
        if (donGia < 0)
        {
            throw new BusinessException(testtttt88DomainErrorCodes.GiaKhongDuocAm);
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
        TienHang = ChiTiet.Sum(x => x.ThanhTien);
        TongTien = TienHang + PhiVanChuyen;
        TienHoaHongSan = Math.Round(TienHang * 0.05m, 0);
        ThucNhanCuaShop = TienHang - TienHoaHongSan;
    }

    /// <summary>
    /// Áp dụng voucher giảm giá của riêng Shop cho đơn hàng con này
    /// </summary>
    public void ApDungVoucherShop(decimal tienGiam, decimal phanTramHoaHong = 5.0m)
    {
        TienGiamVoucher = Math.Min(tienGiam, TienHang);
        TongTien = Math.Max(0, TienHang - TienGiamVoucher + PhiVanChuyen);
        TienHoaHongSan = Math.Round((TienHang - TienGiamVoucher) * (phanTramHoaHong / 100m), 0);
        ThucNhanCuaShop = Math.Max(0, (TienHang - TienGiamVoucher) - TienHoaHongSan);
    }

    /// <summary>
    /// Kiểm tra máy trạng thái đơn hàng (State Machine Invariants)
    /// </summary>
    public bool CoTheChuyenSang(string trangThaiMoi)
    {
        if (TrangThai == TrangThaiDaHuy || TrangThai == TrangThaiTraHang)
        {
            return false;
        }

        if (trangThaiMoi == TrangThaiYeuCauTraHang)
        {
            return TrangThai == TrangThaiDangGiao || TrangThai == TrangThaiHoanThanh;
        }

        if (TrangThai == TrangThaiYeuCauTraHang)
        {
            return trangThaiMoi == TrangThaiTraHang || 
                   trangThaiMoi == TrangThaiTuChoiTraHang || 
                   trangThaiMoi == TrangThaiHoanThanh;
        }

        return trangThaiMoi switch
        {
            TrangThaiDangGiao => TrangThai == TrangThaiChoXuLy,
            TrangThaiHoanThanh => TrangThai == TrangThaiDangGiao || TrangThai == TrangThaiChoXuLy || TrangThai == TrangThaiTuChoiTraHang,
            TrangThaiDaHuy => TrangThai == TrangThaiChoXuLy || TrangThai == TrangThaiDangGiao,
            _ => false
        };
    }

    /// <summary>
    /// Chuyển đổi trạng thái đơn hàng tuân thủ quy tắc nghiệp vụ
    /// </summary>
    public void ChuyenTrangThai(string trangThaiMoi)
    {
        if (TrangThai == TrangThaiDaHuy || TrangThai == TrangThaiTraHang)
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

    /// <summary>
    /// Khách hàng gửi yêu cầu trả hàng / hoàn tiền
    /// </summary>
    public void GuiYeuCauTraHang(string lyDo, string? ghiChu, string? hinhAnh)
    {
        ChuyenTrangThai(TrangThaiYeuCauTraHang);
        LyDoTraHang = lyDo;
        GhiChuTraHang = ghiChu;
        HinhAnhTraHang = hinhAnh;
        ThoiGianYeuCauTraHang = DateTime.UtcNow;
    }

    /// <summary>
    /// Shop hoặc Sàn xử lý duyệt / từ chối yêu cầu trả hàng
    /// </summary>
    public void XuLyTraHang(bool dongY, string? phanHoi)
    {
        if (dongY)
        {
            ChuyenTrangThai(TrangThaiTraHang);
        }
        else
        {
            ChuyenTrangThai(TrangThaiTuChoiTraHang);
        }
        PhanHoiTraHang = phanHoi;
        ThoiGianXuLyTraHang = DateTime.UtcNow;
    }
}
