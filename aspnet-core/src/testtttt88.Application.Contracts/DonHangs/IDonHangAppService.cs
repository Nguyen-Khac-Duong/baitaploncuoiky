using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Volo.Abp.Application.Services;

namespace testtttt88.DonHangs;

public interface IDonHangAppService : IApplicationService
{
    Task<List<DonHangDto>> GetListAsync();
    Task<DonHangDto> GetAsync(Guid id);
    Task<List<DonHangDto>> GetByNguoiDungAsync(string nguoiDungId);
    Task<DonHangDto> CreateAsync(CreateDonHangDto input);
    Task<DonHangDto> DoiTrangThaiAsync(Guid id, DoiTrangThaiDonHangDto input);
    Task<ThongKeDashboardDto> GetThongKeDashboardAsync();
}
