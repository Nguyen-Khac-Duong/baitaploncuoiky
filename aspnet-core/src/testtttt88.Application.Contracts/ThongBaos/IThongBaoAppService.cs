using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Volo.Abp.Application.Services;

namespace testtttt88.ThongBaos;

public interface IThongBaoAppService : IApplicationService
{
    Task<List<ThongBaoDto>> GetDanhSachAsync(string? doiTuong = null);
    Task<int> GetSoChuaDocAsync(string? doiTuong = null);
    Task<ThongBaoDto> DanhDauDaDocAsync(Guid id);
    Task DanhDauTatCaDaDocAsync(string? doiTuong = null);
    Task XoaThongBaoAsync(Guid id);
    Task XoaTatCaAsync(string? doiTuong = null);
}

