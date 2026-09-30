using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using testtttt88.Permissions;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Domain.Entities;
using Volo.Abp.Domain.Repositories;

namespace testtttt88.SanPhams;

/// <summary>
/// Application Service quản lý sản phẩm theo chuẩn DDD của công ty
/// </summary>
public class SanPhamAppService : testtttt88AppService, ISanPhamAppService
{
    private readonly IRepository<SanPham, Guid> _sanPhamRepository;
    private readonly SanPhamManager _sanPhamManager;

    public SanPhamAppService(
        IRepository<SanPham, Guid> sanPhamRepository,
        SanPhamManager sanPhamManager)
    {
        _sanPhamRepository = sanPhamRepository;
        _sanPhamManager = sanPhamManager;
    }

    /// <summary>
    /// Lấy thông tin chi tiết một sản phẩm theo Id
    /// </summary>
    public virtual async Task<SanPhamDto> GetAsync(Guid id)
    {
        var sanPham = await _sanPhamRepository.FindAsync(id);
        if (sanPham == null)
        {
            throw new EntityNotFoundException(typeof(SanPham), id);
        }

        return ObjectMapper.Map<SanPham, SanPhamDto>(sanPham);
    }

    /// <summary>
    /// Lấy danh sách sản phẩm có phân trang và sắp xếp
    /// </summary>
    public virtual async Task<PagedResultDto<SanPhamDto>> GetListAsync(PagedAndSortedResultRequestDto input)
    {
        var totalCount = await _sanPhamRepository.GetCountAsync();
        var entities = await _sanPhamRepository.GetPagedListAsync(
            input.SkipCount,
            input.MaxResultCount,
            string.IsNullOrWhiteSpace(input.Sorting) ? nameof(SanPham.CreationTime) + " desc" : input.Sorting
        );

        var dtos = entities.Select(x => ObjectMapper.Map<SanPham, SanPhamDto>(x)).ToList();
        return new PagedResultDto<SanPhamDto>(totalCount, dtos);
    }

    /// <summary>
    /// Lấy toàn bộ danh sách sản phẩm
    /// </summary>
    public virtual async Task<List<SanPhamDto>> GetAllListAsync()
    {
        var entities = await _sanPhamRepository.GetListAsync();
        return entities.Select(x => ObjectMapper.Map<SanPham, SanPhamDto>(x)).ToList();
    }

    /// <summary>
    /// Tạo mới một sản phẩm vào kho (sử dụng SanPhamManager để kiểm tra nghiệp vụ)
    /// </summary>
    [Authorize(testtttt88Permissions.SanPhams.Create)]
    public virtual async Task<SanPhamDto> CreateAsync(CreateUpdateSanPhamDto input)
    {
        var createdSanPham = await _sanPhamManager.CreateAsync(
            maSp: input.MaSp,
            ten: input.Ten,
            gia: input.Gia,
            soLuongTon: input.SoLuongTon,
            danhMuc: input.DanhMuc,
            hinhAnh: input.HinhAnh,
            moTa: input.MoTa
        );

        return ObjectMapper.Map<SanPham, SanPhamDto>(createdSanPham);
    }

    /// <summary>
    /// Cập nhật thông tin sản phẩm (sử dụng SanPhamManager để kiểm tra nghiệp vụ)
    /// </summary>
    [Authorize(testtttt88Permissions.SanPhams.Edit)]
    public virtual async Task<SanPhamDto> UpdateAsync(Guid id, CreateUpdateSanPhamDto input)
    {
        var updatedSanPham = await _sanPhamManager.UpdateAsync(
            id: id,
            maSp: input.MaSp,
            ten: input.Ten,
            gia: input.Gia,
            soLuongTon: input.SoLuongTon,
            danhMuc: input.DanhMuc,
            hinhAnh: input.HinhAnh,
            moTa: input.MoTa
        );

        return ObjectMapper.Map<SanPham, SanPhamDto>(updatedSanPham);
    }

    /// <summary>
    /// Xóa sản phẩm khỏi kho (kích hoạt Soft Delete của FullAuditedAggregateRoot)
    /// </summary>
    [Authorize(testtttt88Permissions.SanPhams.Delete)]
    public virtual async Task DeleteAsync(Guid id)
    {
        await _sanPhamRepository.DeleteAsync(id);
    }
}
