using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace testtttt88.DanhMucs;

public interface IDanhMucAppService : IApplicationService
{
    /// <summary>
    /// Lấy toàn bộ cây danh mục đa cấp (Dành cho Menu Header / Bộ lọc sàn TMĐT)
    /// </summary>
    Task<List<DanhMucTreeDto>> GetTreeAsync();

    /// <summary>
    /// Lấy danh sách danh mục có phân trang (Dành cho Quản trị viên / Người bán chọn)
    /// </summary>
    Task<PagedResultDto<DanhMucDto>> GetListAsync(PagedAndSortedResultRequestDto input);

    /// <summary>
    /// Lấy thông tin chi tiết danh mục theo Id
    /// </summary>
    Task<DanhMucDto> GetAsync(Guid id);

    /// <summary>
    /// Lấy thông tin chi tiết danh mục theo Slug
    /// </summary>
    Task<DanhMucDto> GetBySlugAsync(string slug);

    /// <summary>
    /// Tạo mới một danh mục (Quản trị viên)
    /// </summary>
    Task<DanhMucDto> CreateAsync(CreateUpdateDanhMucDto input);

    /// <summary>
    /// Cập nhật thông tin danh mục (Quản trị viên)
    /// </summary>
    Task<DanhMucDto> UpdateAsync(Guid id, CreateUpdateDanhMucDto input);

    /// <summary>
    /// Xóa danh mục
    /// </summary>
    Task DeleteAsync(Guid id);
}

