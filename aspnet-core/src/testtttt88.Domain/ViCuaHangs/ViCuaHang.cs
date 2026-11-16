using System;
using Volo.Abp;
using Volo.Abp.Domain.Entities.Auditing;

namespace testtttt88.ViCuaHangs;

/// <summary>
/// Ví số dư của Gian Hàng (Seller Wallet & Escrow Balance)
/// </summary>
public class ViCuaHang : FullAuditedAggregateRoot<Guid>
{
    public Guid CuaHangId { get; set; }

    /// <summary>
    /// Số dư khả dụng (Đã đối soát xong sau khi đơn hoàn thành, Shop có thể rút tiền)
    /// </summary>
    public decimal SoDuKhaDung { get; set; }

    /// <summary>
    /// Số dư tạm giữ (Escrow - Tiền của các đơn hàng đang giao, chưa hoàn tất)
    /// </summary>
    public decimal SoDuTamGiu { get; set; }

    /// <summary>
    /// Tổng tiền shop đã rút thành công về tài khoản ngân hàng
    /// </summary>
    public decimal TongTienDaRut { get; set; }

    public ViCuaHang()
    {
    }

    public ViCuaHang(Guid id, Guid cuaHangId) : base(id)
    {
        CuaHangId = cuaHangId;
        SoDuKhaDung = 0;
        SoDuTamGiu = 0;
        TongTienDaRut = 0;
    }

    /// <summary>
    /// Nhận tiền đơn hàng mới vào quỹ tạm giữ (Escrow)
    /// </summary>
    public void CongTienTamGiu(decimal soTien)
    {
        if (soTien <= 0) throw new BusinessException("SoTienPhaiLonHon0");
        SoDuTamGiu += soTien;
    }

    /// <summary>
    /// Hoàn tất đơn hàng: Chuyển tiền thực nhận từ quỹ tạm giữ sang số dư khả dụng
    /// </summary>
    public void QuyetToanDonHang(decimal tienThucNhan, decimal tienTamGiuGoc)
    {
        if (SoDuTamGiu < tienTamGiuGoc)
        {
            SoDuTamGiu = 0; // Tránh âm do sai lệch
        }
        else
        {
            SoDuTamGiu -= tienTamGiuGoc;
        }

        SoDuKhaDung += tienThucNhan;
    }

    /// <summary>
    /// Hủy đơn hàng đang giao: Trừ quỹ tạm giữ trả lại Buyer
    /// </summary>
    public void HuyDonTamGiu(decimal soTien)
    {
        if (SoDuTamGiu >= soTien)
        {
            SoDuTamGiu -= soTien;
        }
        else
        {
            SoDuTamGiu = 0;
        }
    }

    /// <summary>
    /// Khấu trừ số dư khả dụng khi tạo lệnh rút tiền (đóng băng số tiền chờ Admin phê duyệt)
    /// </summary>
    public void TruTienRut(decimal soTien)
    {
        if (soTien <= 0) throw new BusinessException("SoTienPhaiLonHon0");
        if (SoDuKhaDung < soTien) throw new BusinessException("SoDuKhaDungKhongDuDeRut");

        SoDuKhaDung -= soTien;
    }

    /// <summary>
    /// Ghi nhận rút tiền thành công sau khi Admin sàn phê duyệt giải ngân thực tế
    /// </summary>
    public void XacNhanRutTienThanhCong(decimal soTien)
    {
        if (soTien <= 0) throw new BusinessException("SoTienPhaiLonHon0");
        TongTienDaRut += soTien;
    }

    /// <summary>
    /// Hoàn lại tiền vào số dư khả dụng nếu lệnh rút tiền bị Admin từ chối
    /// </summary>
    public void HoanTienRutBiTuChoi(decimal soTien)
    {
        SoDuKhaDung += soTien;
    }

    /// <summary>
    /// Khấu trừ số dư khả dụng khi chấp nhận hoàn tiền đơn hàng đã hoàn thành
    /// </summary>
    public void HoanTienDonDaQuyetToan(decimal tienThucNhan)
    {
        if (tienThucNhan <= 0) return;
        SoDuKhaDung = Math.Max(0, SoDuKhaDung - tienThucNhan);
    }
}

