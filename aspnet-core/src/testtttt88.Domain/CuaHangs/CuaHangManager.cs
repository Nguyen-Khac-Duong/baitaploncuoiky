using System;
using System.Threading.Tasks;
using Volo.Abp;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Domain.Services;

namespace testtttt88.CuaHangs;

/// <summary>
/// Domain Service quản lý nghiệp vụ Gian Hàng (Multi-vendor Shop Manager)
/// </summary>
public class CuaHangManager : DomainService
{
    private readonly IRepository<CuaHang, Guid> _cuaHangRepository;

    public CuaHangManager(IRepository<CuaHang, Guid> cuaHangRepository)
    {
        _cuaHangRepository = cuaHangRepository;
    }

    /// <summary>
    /// Đăng ký mở gian hàng mới (Kiểm tra trùng Slug và trùng Chủ sở hữu)
    /// </summary>
    public async Task<CuaHang> DangKyCuaHangAsync(
        string ten,
        string slug,
        Guid chuSoHuuId,
        string soDienThoai,
        string email,
        string diaChi,
        string? logo = null,
        string? banner = null,
        string? moTa = null)
    {
        var slugChuanHoa = slug.Trim().ToLowerInvariant();

        var existingSlug = await _cuaHangRepository.FirstOrDefaultAsync(x => x.Slug == slugChuanHoa);
        if (existingSlug != null)
        {
            throw new UserFriendlyException($"Đường dẫn gian hàng (Slug) '{slugChuanHoa}' đã được sử dụng. Vui lòng chọn đường dẫn khác!");
        }

        var existingOwner = await _cuaHangRepository.FirstOrDefaultAsync(x => x.ChuSoHuuId == chuSoHuuId);
        if (existingOwner != null)
        {
            throw new UserFriendlyException("Tài khoản của bạn đã sở hữu một gian hàng trên hệ thống!");
        }

        var cuaHang = new CuaHang(
            GuidGenerator.Create(),
            ten,
            slugChuanHoa,
            chuSoHuuId,
            soDienThoai,
            email,
            diaChi,
            logo,
            banner,
            moTa,
            phanTramHoaHong: 5.0m,
            trangThai: CuaHang.TrangThaiChoDuyet
        );

        return await _cuaHangRepository.InsertAsync(cuaHang);
    }

    /// <summary>
    /// Phê duyệt gian hàng (Dành cho Platform Admin)
    /// </summary>
    public async Task<CuaHang> DuyetGianHangAsync(Guid cuaHangId)
    {
        var cuaHang = await _cuaHangRepository.GetAsync(cuaHangId);
        cuaHang.DuyetGianHang();
        return await _cuaHangRepository.UpdateAsync(cuaHang);
    }

    /// <summary>
    /// Tạm khóa gian hàng do vi phạm (Dành cho Platform Admin)
    /// </summary>
    public async Task<CuaHang> KhoaGianHangAsync(Guid cuaHangId)
    {
        var cuaHang = await _cuaHangRepository.GetAsync(cuaHangId);
        cuaHang.KhoaGianHang();
        return await _cuaHangRepository.UpdateAsync(cuaHang);
    }

    /// <summary>
    /// Mở khóa gian hàng (Dành cho Platform Admin)
    /// </summary>
    public async Task<CuaHang> MoKhoaGianHangAsync(Guid cuaHangId)
    {
        var cuaHang = await _cuaHangRepository.GetAsync(cuaHangId);
        cuaHang.MoKhoaGianHang();
        return await _cuaHangRepository.UpdateAsync(cuaHang);
    }
}

