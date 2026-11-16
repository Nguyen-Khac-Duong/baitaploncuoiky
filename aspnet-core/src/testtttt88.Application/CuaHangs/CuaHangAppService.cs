using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using testtttt88.Permissions;
using testtttt88.ViCuaHangs;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Domain.Entities;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Users;

namespace testtttt88.CuaHangs;

public class CuaHangAppService : testtttt88AppService, ICuaHangAppService
{
    private readonly IRepository<CuaHang, Guid> _cuaHangRepository;
    private readonly IRepository<ViCuaHang, Guid> _viCuaHangRepository;
    private readonly CuaHangManager _cuaHangManager;

    public CuaHangAppService(
        IRepository<CuaHang, Guid> cuaHangRepository,
        IRepository<ViCuaHang, Guid> viCuaHangRepository,
        CuaHangManager cuaHangManager)
    {
        _cuaHangRepository = cuaHangRepository;
        _viCuaHangRepository = viCuaHangRepository;
        _cuaHangManager = cuaHangManager;
    }

    private static CuaHangDto MapToDto(CuaHang x)
    {
        return new CuaHangDto
        {
            Id = x.Id,
            Ten = x.Ten,
            Slug = x.Slug,
            ChuSoHuuId = x.ChuSoHuuId,
            SoDienThoai = x.SoDienThoai,
            Email = x.Email,
            DiaChi = x.DiaChi,
            Logo = x.Logo,
            Banner = x.Banner,
            MoTa = x.MoTa,
            TrangThai = x.TrangThai,
            PhanTramHoaHong = x.PhanTramHoaHong,
            SoTaiKhoanNganHang = x.SoTaiKhoanNganHang,
            TenNganHang = x.TenNganHang,
            TenChuTaiKhoan = x.TenChuTaiKhoan
        };
    }

    public virtual async Task<CuaHangDto> GetAsync(Guid id)
    {
        var cuaHang = await _cuaHangRepository.GetAsync(id);
        return MapToDto(cuaHang);
    }

    public virtual async Task<CuaHangDto?> GetMyStoreAsync()
    {
        if (CurrentUser.Id == null)
        {
            return null;
        }

        var userId = CurrentUser.GetId();
        var cuaHang = await _cuaHangRepository.FirstOrDefaultAsync(x => x.ChuSoHuuId == userId);
        return cuaHang == null ? null : MapToDto(cuaHang);
    }

    public virtual async Task<CuaHangDto> GetBySlugAsync(string slug)
    {
        var slugChuanHoa = slug.Trim().ToLowerInvariant();
        var cuaHang = await _cuaHangRepository.FirstOrDefaultAsync(x => x.Slug == slugChuanHoa);
        if (cuaHang == null)
        {
            throw new UserFriendlyException($"Không tìm thấy gian hàng với đường dẫn '{slug}'");
        }

        return MapToDto(cuaHang);
    }

    [Authorize]
    public virtual async Task<CuaHangDto> DangKyAsync(DangKyCuaHangDto input)
    {
        if (CurrentUser.IsInRole("admin"))
        {
            throw new UserFriendlyException("Tài khoản Quản trị viên sàn (Admin) không được phép mở gian hàng! Vui lòng tạo tài khoản Người Dùng riêng để đăng ký Shop.");
        }

        var userId = CurrentUser.GetId();
        var cuaHang = await _cuaHangManager.DangKyCuaHangAsync(
            ten: input.Ten,
            slug: input.Slug,
            chuSoHuuId: userId,
            soDienThoai: input.SoDienThoai,
            email: input.Email,
            diaChi: input.DiaChi,
            logo: input.Logo,
            banner: input.Banner,
            moTa: input.MoTa
        );

        // Khởi tạo ví cho gian hàng nếu chưa có
        var existingWallet = await _viCuaHangRepository.FirstOrDefaultAsync(x => x.CuaHangId == cuaHang.Id);
        if (existingWallet == null)
        {
            await _viCuaHangRepository.InsertAsync(new ViCuaHang(GuidGenerator.Create(), cuaHang.Id));
        }

        return MapToDto(cuaHang);
    }

    [Authorize]
    public virtual async Task<CuaHangDto> CapNhatThongTinAsync(Guid id, DangKyCuaHangDto input)
    {
        var cuaHang = await _cuaHangRepository.GetAsync(id);
        var userId = CurrentUser.GetId();

        // Chỉ chủ shop hoặc Admin mới được cập nhật
        if (cuaHang.ChuSoHuuId != userId && !CurrentUser.IsInRole("admin"))
        {
            throw new UserFriendlyException("Bạn không có quyền chỉnh sửa thông tin gian hàng này!");
        }

        cuaHang.SetTen(input.Ten);
        cuaHang.SoDienThoai = input.SoDienThoai;
        cuaHang.Email = input.Email;
        cuaHang.DiaChi = input.DiaChi;
        cuaHang.Logo = input.Logo;
        cuaHang.Banner = input.Banner;
        cuaHang.MoTa = input.MoTa;

        await _cuaHangRepository.UpdateAsync(cuaHang);
        return MapToDto(cuaHang);
    }

    [Authorize]
    public virtual async Task<CuaHangDto> CapNhatNganHangAsync(CapNhatNganHangCuaHangDto input)
    {
        var userId = CurrentUser.GetId();
        var cuaHang = await _cuaHangRepository.FirstOrDefaultAsync(x => x.ChuSoHuuId == userId);
        if (cuaHang == null)
        {
            throw new UserFriendlyException("Bạn chưa đăng ký gian hàng!");
        }

        cuaHang.CapNhatNganHang(input.SoTaiKhoanNganHang, input.TenNganHang, input.TenChuTaiKhoan);
        await _cuaHangRepository.UpdateAsync(cuaHang);
        return MapToDto(cuaHang);
    }

    [AllowAnonymous]
    public virtual async Task<PagedResultDto<CuaHangDto>> GetListAsync(PagedAndSortedResultRequestDto input)
    {
        var totalCount = await _cuaHangRepository.GetCountAsync();
        var query = await _cuaHangRepository.GetPagedListAsync(
            input.SkipCount,
            input.MaxResultCount,
            $"{nameof(CuaHang.CreationTime)} desc"
        );

        return new PagedResultDto<CuaHangDto>(totalCount, query.Select(MapToDto).ToList());
    }

    [Authorize(testtttt88Permissions.CuaHangs.Approve)]
    public virtual async Task<CuaHangDto> DuyetShopAsync(Guid id)
    {
        var cuaHang = await _cuaHangManager.DuyetGianHangAsync(id);
        return MapToDto(cuaHang);
    }

    [Authorize(testtttt88Permissions.CuaHangs.Manage)]
    public virtual async Task<CuaHangDto> KhoaShopAsync(Guid id)
    {
        var cuaHang = await _cuaHangManager.KhoaGianHangAsync(id);
        return MapToDto(cuaHang);
    }

    [Authorize(testtttt88Permissions.CuaHangs.Manage)]
    public virtual async Task<CuaHangDto> MoKhoaShopAsync(Guid id)
    {
        var cuaHang = await _cuaHangManager.MoKhoaGianHangAsync(id);
        return MapToDto(cuaHang);
    }
}

