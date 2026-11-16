using System;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace testtttt88.ViCuaHangs;

public interface IViCuaHangAppService : IApplicationService
{
    Task<ViCuaHangDto> GetMyWalletAsync();
    Task<PagedResultDto<GiaoDichViDto>> GetMyTransactionsAsync(PagedAndSortedResultRequestDto input);
    Task<YeuCauRutTienDto> TaoYeuCauRutTienAsync(TaoYeuCauRutTienDto input);
    Task<PagedResultDto<YeuCauRutTienDto>> GetMyPayoutRequestsAsync(PagedAndSortedResultRequestDto input);
    Task<PagedResultDto<YeuCauRutTienDto>> GetAdminPayoutRequestsAsync(PagedAndSortedResultRequestDto input);
    Task<YeuCauRutTienDto> XuLyRutTienAsync(Guid id, XuLyRutTienDto input);
}

