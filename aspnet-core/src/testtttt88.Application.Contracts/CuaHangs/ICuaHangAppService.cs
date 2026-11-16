using System;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace testtttt88.CuaHangs;

public interface ICuaHangAppService : IApplicationService
{
    Task<CuaHangDto> GetAsync(Guid id);
    Task<CuaHangDto?> GetMyStoreAsync();
    Task<CuaHangDto> GetBySlugAsync(string slug);
    Task<CuaHangDto> DangKyAsync(DangKyCuaHangDto input);
    Task<CuaHangDto> CapNhatThongTinAsync(Guid id, DangKyCuaHangDto input);
    Task<CuaHangDto> CapNhatNganHangAsync(CapNhatNganHangCuaHangDto input);
    Task<PagedResultDto<CuaHangDto>> GetListAsync(PagedAndSortedResultRequestDto input);
    Task<CuaHangDto> DuyetShopAsync(Guid id);
    Task<CuaHangDto> KhoaShopAsync(Guid id);
    Task<CuaHangDto> MoKhoaShopAsync(Guid id);
}

