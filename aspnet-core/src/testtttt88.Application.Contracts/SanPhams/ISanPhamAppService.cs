using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace testtttt88.SanPhams;

/// <summary>
/// Interface định nghĩa các API nghiệp vụ của SanPham theo chuẩn ABP DDD
/// </summary>
public interface ISanPhamAppService : IApplicationService
{
    Task<SanPhamDto> GetAsync(Guid id);
    Task<PagedResultDto<SanPhamDto>> GetListAsync(PagedAndSortedResultRequestDto input);
    Task<List<SanPhamDto>> GetAllListAsync();
    Task<SanPhamDto> CreateAsync(CreateUpdateSanPhamDto input);
    Task<SanPhamDto> UpdateAsync(Guid id, CreateUpdateSanPhamDto input);
    Task DeleteAsync(Guid id);
}
