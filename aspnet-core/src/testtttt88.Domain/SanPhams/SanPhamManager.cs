using System;
using System.Threading.Tasks;
using Volo.Abp;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Domain.Services;

namespace testtttt88.SanPhams;

/// <summary>
/// Domain Service quản lý các nghiệp vụ cốt lõi của SanPham theo chuẩn DDD
/// </summary>
public class SanPhamManager : DomainService
{
    private readonly IRepository<SanPham, Guid> _sanPhamRepository;

    public SanPhamManager(IRepository<SanPham, Guid> sanPhamRepository)
    {
        _sanPhamRepository = sanPhamRepository;
    }

    /// <summary>
    /// Tạo mới sản phẩm: Kiểm tra trùng lặp mã sản phẩm trước khi khởi tạo
    /// </summary>
    public async Task<SanPham> CreateAsync(
        string maSp,
        string ten,
        decimal gia,
        int soLuongTon,
        string danhMuc,
        string? hinhAnh = null,
        string? moTa = null)
    {
        Check.NotNullOrWhiteSpace(maSp, nameof(maSp));
        Check.NotNullOrWhiteSpace(ten, nameof(ten));

        var existing = await _sanPhamRepository.FirstOrDefaultAsync(x => x.MaSp == maSp);
        if (existing != null)
        {
            throw new UserFriendlyException($"Mã sản phẩm '{maSp}' đã tồn tại trong hệ thống. Vui lòng chọn mã khác!");
        }

        var sanPham = new SanPham(
            GuidGenerator.Create(),
            maSp,
            ten,
            gia,
            soLuongTon,
            danhMuc,
            hinhAnh,
            moTa
        );

        return await _sanPhamRepository.InsertAsync(sanPham);
    }

    /// <summary>
    /// Cập nhật thông tin sản phẩm: Kiểm tra không trùng mã SP với sản phẩm khác
    /// </summary>
    public async Task<SanPham> UpdateAsync(
        Guid id,
        string maSp,
        string ten,
        decimal gia,
        int soLuongTon,
        string danhMuc,
        string? hinhAnh = null,
        string? moTa = null)
    {
        Check.NotNullOrWhiteSpace(maSp, nameof(maSp));
        Check.NotNullOrWhiteSpace(ten, nameof(ten));

        var sanPham = await _sanPhamRepository.GetAsync(id);

        var existing = await _sanPhamRepository.FirstOrDefaultAsync(x => x.MaSp == maSp && x.Id != id);
        if (existing != null)
        {
            throw new UserFriendlyException($"Mã sản phẩm '{maSp}' đã thuộc về một sản phẩm khác!");
        }

        sanPham.MaSp = maSp;
        sanPham.Ten = ten;
        sanPham.Gia = gia;
        sanPham.SoLuongTon = soLuongTon;
        sanPham.DanhMuc = danhMuc;
        sanPham.HinhAnh = hinhAnh;
        sanPham.MoTa = moTa;

        return await _sanPhamRepository.UpdateAsync(sanPham);
    }
}
