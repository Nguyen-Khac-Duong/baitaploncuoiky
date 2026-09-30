using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace testtttt88.SanPhams;

public interface ISanPhamAppService : ICrudAppService<SanPhamDto, Guid, PagedAndSortedResultRequestDto, CreateUpdateSanPhamDto>
{
    Task<List<SanPhamDto>> GetAllListAsync();
}
