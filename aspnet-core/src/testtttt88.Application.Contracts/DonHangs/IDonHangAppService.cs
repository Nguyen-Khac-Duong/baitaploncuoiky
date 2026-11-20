using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace testtttt88.DonHangs;

public interface IDonHangAppService : IApplicationService
{
    Task<List<DonHangDto>> GetListAsync();
    Task<PagedResultDto<DonHangDto>> GetPagedListAsync(GetDonHangListFilterDto input);
    Task<PagedResultDto<DonHangDto>> GetMyStoreOrdersAsync(GetDonHangListFilterDto input);
    Task<DonHangDto> GetAsync(Guid id);
    Task<List<DonHangDto>> GetByNguoiDungAsync(string? nguoiDungId = null, string? soDienThoai = null);
    Task<List<DonHangTongDto>> GetDonHangTongByNguoiDungAsync(string? nguoiDungId = null);
    Task<DonHangDto> CreateAsync(CreateDonHangDto input);
    Task<DonHangTongDto> TaoDonHangTongAsync(CreateDonHangDto input);
    Task<DonHangDto> DoiTrangThaiAsync(Guid id, DoiTrangThaiDonHangDto input);
    Task<DonHangDto> YeuCauTraHangAsync(Guid id, YeuCauTraHangDto input);
    Task<DonHangDto> XuLyTraHangAsync(Guid id, XuLyTraHangDto input);
    Task<ThongKeDashboardDto> GetThongKeDashboardAsync();
    Task<ThongKeDashboardDto> GetThongKeMyStoreAsync();
}
