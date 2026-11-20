using System;
using Volo.Abp;
using Volo.Abp.Domain.Entities.Auditing;

namespace testtttt88.Vouchers;

/// <summary>
/// Thực thể Mã Giảm Giá / Voucher khuyến mãi
/// </summary>
public class Voucher : FullAuditedAggregateRoot<Guid>
{
    public const string LoaiGiamPhanTram = "PhanTram";
    public const string LoaiGiamSoTien = "SoTien";

    public string MaVoucher { get; set; } = string.Empty;
    public string TieuDe { get; set; } = string.Empty;
    public string? MoTa { get; set; }
    public string LoaiGiamGia { get; set; } = LoaiGiamSoTien;
    public decimal GiaTriGiam { get; set; }
    public decimal GiaTriDonToiThieu { get; set; }
    public decimal? GiamToiDa { get; set; }
    public int SoLuong { get; set; } = 100;
    public int SoLuongDaDung { get; set; } = 0;
    public DateTime NgayBatDau { get; set; }
    public DateTime NgayKetThuc { get; set; }
    public Guid? CuaHangId { get; set; } // Null = áp dụng toàn sàn
    public bool KichHoat { get; set; } = true;

    public Voucher()
    {
    }

    public Voucher(
        Guid id,
        string maVoucher,
        string tieuDe,
        string loaiGiamGia,
        decimal giaTriGiam,
        decimal giaTriDonToiThieu = 0,
        decimal? giamToiDa = null,
        int soLuong = 100,
        DateTime? ngayBatDau = null,
        DateTime? ngayKetThuc = null,
        Guid? cuaHangId = null,
        string? moTa = null) : base(id)
    {
        MaVoucher = Check.NotNullOrWhiteSpace(maVoucher, nameof(maVoucher)).Trim().ToUpperInvariant();
        TieuDe = Check.NotNullOrWhiteSpace(tieuDe, nameof(tieuDe));
        LoaiGiamGia = loaiGiamGia;
        GiaTriGiam = giaTriGiam > 0 ? giaTriGiam : throw new BusinessException("Giá trị giảm phải lớn hơn 0");
        GiaTriDonToiThieu = giaTriDonToiThieu;
        GiamToiDa = giamToiDa;
        SoLuong = soLuong;
        SoLuongDaDung = 0;
        NgayBatDau = ngayBatDau ?? DateTime.UtcNow;
        NgayKetThuc = ngayKetThuc ?? DateTime.UtcNow.AddYears(1);
        CuaHangId = cuaHangId;
        MoTa = moTa;
        KichHoat = true;
    }

    public bool KiemTraHopLe(decimal tongTienHang, out string lyDoKhongHopLe)
    {
        if (!KichHoat)
        {
            lyDoKhongHopLe = "Mã voucher hiện đang bị tạm khóa!";
            return false;
        }

        var now = DateTime.UtcNow;
        if (now < NgayBatDau)
        {
            lyDoKhongHopLe = $"Mã voucher chưa đến thời gian áp dụng (bắt đầu từ {NgayBatDau:dd/MM/yyyy})!";
            return false;
        }

        if (now > NgayKetThuc)
        {
            lyDoKhongHopLe = "Mã voucher đã hết hạn sử dụng!";
            return false;
        }

        if (SoLuongDaDung >= SoLuong)
        {
            lyDoKhongHopLe = "Mã voucher đã hết lượt sử dụng!";
            return false;
        }

        if (tongTienHang < GiaTriDonToiThieu)
        {
            lyDoKhongHopLe = $"Đơn hàng chưa đạt giá trị tối thiểu {GiaTriDonToiThieu:N0}đ để áp dụng voucher này!";
            return false;
        }

        lyDoKhongHopLe = string.Empty;
        return true;
    }

    public decimal TinhTienGiam(decimal tongTienHang)
    {
        if (tongTienHang < GiaTriDonToiThieu) return 0;

        decimal tienGiam = 0;
        if (LoaiGiamGia == LoaiGiamPhanTram)
        {
            tienGiam = tongTienHang * (GiaTriGiam / 100m);
            if (GiamToiDa.HasValue && tienGiam > GiamToiDa.Value)
            {
                tienGiam = GiamToiDa.Value;
            }
        }
        else
        {
            tienGiam = GiaTriGiam;
        }

        // Không cho phép giảm vượt quá tổng tiền hàng
        return Math.Min(tienGiam, tongTienHang);
    }

    public void SuDung()
    {
        SoLuongDaDung++;
    }
}
