using System;
using Volo.Abp;
using Volo.Abp.Domain.Entities.Auditing;

namespace testtttt88.SanPhams;

public class SanPham : FullAuditedAggregateRoot<Guid>
{
    public string MaSp { get; set; } = string.Empty;
    public string Ten { get; set; } = string.Empty;
    public decimal Gia { get; set; }
    public int SoLuongTon { get; set; }
    public string DanhMuc { get; set; } = string.Empty;
    public string? HinhAnh { get; set; }
    public string? MoTa { get; set; }
    public DateTime NgayTao { get; set; }

    public SanPham()
    {
    }

    public SanPham(
        Guid id,
        string maSp,
        string ten,
        decimal gia,
        int soLuongTon,
        string danhMuc,
        string? hinhAnh = null,
        string? moTa = null)
        : base(id)
    {
        MaSp = Check.NotNullOrWhiteSpace(maSp, nameof(maSp));
        Ten = Check.NotNullOrWhiteSpace(ten, nameof(ten));
        Gia = gia >= 0 ? gia : throw new ArgumentException("Giá sản phẩm không được âm.", nameof(gia));
        SoLuongTon = soLuongTon >= 0 ? soLuongTon : throw new ArgumentException("Số lượng tồn không được âm.", nameof(soLuongTon));
        DanhMuc = Check.NotNullOrWhiteSpace(danhMuc, nameof(danhMuc));
        HinhAnh = hinhAnh;
        MoTa = moTa;
    }

    /// <summary>
    /// Giảm số lượng tồn kho và kiểm tra tính toàn vẹn (Invariants)
    /// </summary>
    public void GiamSoLuongTon(int soLuong)
    {
        if (soLuong <= 0)
        {
            throw new ArgumentException("Số lượng trừ kho phải lớn hơn 0.", nameof(soLuong));
        }

        if (SoLuongTon < soLuong)
        {
            throw new BusinessException(testtttt88DomainErrorCodes.KhongDuSoLuongTon)
                .WithData("TenSanPham", Ten)
                .WithData("SoLuongTon", SoLuongTon)
                .WithData("SoLuongYeuCau", soLuong);
        }

        SoLuongTon -= soLuong;
    }

    /// <summary>
    /// Hoàn trả số lượng tồn kho (ví dụ khi hủy đơn hàng)
    /// </summary>
    public void TangSoLuongTon(int soLuong)
    {
        if (soLuong <= 0)
        {
            throw new ArgumentException("Số lượng hoàn kho phải lớn hơn 0.", nameof(soLuong));
        }

        SoLuongTon += soLuong;
    }

    /// <summary>
    /// Cập nhật thông tin nghiệp vụ sản phẩm
    /// </summary>
    public void CapNhatThongTin(
        string maSp,
        string ten,
        decimal gia,
        int soLuongTon,
        string danhMuc,
        string? hinhAnh = null,
        string? moTa = null)
    {
        MaSp = Check.NotNullOrWhiteSpace(maSp, nameof(maSp));
        Ten = Check.NotNullOrWhiteSpace(ten, nameof(ten));
        Gia = gia >= 0 ? gia : throw new ArgumentException("Giá sản phẩm không được âm.", nameof(gia));
        SoLuongTon = soLuongTon >= 0 ? soLuongTon : throw new ArgumentException("Số lượng tồn không được âm.", nameof(soLuongTon));
        DanhMuc = Check.NotNullOrWhiteSpace(danhMuc, nameof(danhMuc));
        HinhAnh = hinhAnh;
        MoTa = moTa;
    }
}
