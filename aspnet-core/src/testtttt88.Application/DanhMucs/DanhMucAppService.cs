using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using testtttt88.SanPhams;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Domain.Repositories;

namespace testtttt88.DanhMucs;

public class DanhMucAppService : testtttt88AppService, IDanhMucAppService
{
    private readonly IRepository<DanhMuc, Guid> _danhMucRepository;
    private readonly IRepository<SanPham, Guid> _sanPhamRepository;
    private readonly DanhMucManager _danhMucManager;

    public DanhMucAppService(
        IRepository<DanhMuc, Guid> danhMucRepository,
        IRepository<SanPham, Guid> sanPhamRepository,
        DanhMucManager danhMucManager)
    {
        _danhMucRepository = danhMucRepository;
        _sanPhamRepository = sanPhamRepository;
        _danhMucManager = danhMucManager;
    }

    private static DanhMucDto MapToDto(DanhMuc entity, int count = 0, string? parentName = null)
    {
        return new DanhMucDto
        {
            Id = entity.Id,
            Ten = entity.Ten,
            Slug = entity.Slug,
            Icon = entity.Icon,
            MoTa = entity.MoTa,
            ParentId = entity.ParentId,
            TenDanhMucCha = parentName,
            ThuTu = entity.ThuTu,
            TrangThai = entity.TrangThai,
            SoLuongSanPham = count,
            CreationTime = entity.CreationTime
        };
    }

    [AllowAnonymous]
    public virtual async Task<List<DanhMucTreeDto>> GetTreeAsync()
    {
        var allCategories = await _danhMucRepository.GetListAsync(x => x.TrangThai);
        var allProducts = await _sanPhamRepository.GetListAsync();

        // Đếm số lượng sản phẩm theo từng danh mục
        var productCountDict = allProducts
            .Where(x => !string.IsNullOrWhiteSpace(x.DanhMuc))
            .GroupBy(x => x.DanhMuc.Trim().ToLowerInvariant())
            .ToDictionary(g => g.Key, g => g.Count());

        var productCountByIdDict = allProducts
            .Where(x => x.DanhMucId.HasValue)
            .GroupBy(x => x.DanhMucId!.Value)
            .ToDictionary(g => g.Key, g => g.Count());

        int GetCount(DanhMuc d)
        {
            var byId = productCountByIdDict.TryGetValue(d.Id, out var c1) ? c1 : 0;
            var byName = productCountDict.TryGetValue(d.Ten.Trim().ToLowerInvariant(), out var c2) ? c2 : 0;
            return Math.Max(byId, byName);
        }

        var parents = allCategories
            .Where(x => x.ParentId == null)
            .OrderBy(x => x.ThuTu)
            .ThenBy(x => x.Ten)
            .ToList();

        var children = allCategories
            .Where(x => x.ParentId != null)
            .OrderBy(x => x.ThuTu)
            .ThenBy(x => x.Ten)
            .ToList();

        var tree = new List<DanhMucTreeDto>();

        foreach (var p in parents)
        {
            var childList = children.Where(c => c.ParentId == p.Id).Select(c => new DanhMucTreeDto
            {
                Id = c.Id,
                Ten = c.Ten,
                Slug = c.Slug,
                Icon = c.Icon,
                MoTa = c.MoTa,
                ParentId = c.ParentId,
                TenDanhMucCha = p.Ten,
                ThuTu = c.ThuTu,
                TrangThai = c.TrangThai,
                SoLuongSanPham = GetCount(c),
                CreationTime = c.CreationTime,
                Children = new List<DanhMucTreeDto>()
            }).ToList();

            var totalParentCount = GetCount(p) + childList.Sum(c => c.SoLuongSanPham);

            var parentDto = new DanhMucTreeDto
            {
                Id = p.Id,
                Ten = p.Ten,
                Slug = p.Slug,
                Icon = p.Icon,
                MoTa = p.MoTa,
                ParentId = null,
                ThuTu = p.ThuTu,
                TrangThai = p.TrangThai,
                SoLuongSanPham = totalParentCount,
                CreationTime = p.CreationTime,
                Children = childList
            };

            tree.Add(parentDto);
        }

        return tree;
    }

    [AllowAnonymous]
    public virtual async Task<PagedResultDto<DanhMucDto>> GetListAsync(PagedAndSortedResultRequestDto input)
    {
        var totalCount = await _danhMucRepository.GetCountAsync();
        var all = await _danhMucRepository.GetListAsync();
        var allParents = all.ToDictionary(x => x.Id, x => x.Ten);

        var paged = all
            .OrderBy(x => x.ParentId.HasValue ? 1 : 0)
            .ThenBy(x => x.ThuTu)
            .ThenBy(x => x.Ten)
            .Skip(input.SkipCount)
            .Take(input.MaxResultCount)
            .Select(x => {
                string? pName = x.ParentId.HasValue && allParents.TryGetValue(x.ParentId.Value, out var n) ? n : null;
                return MapToDto(x, 0, pName);
            })
            .ToList();

        return new PagedResultDto<DanhMucDto>(totalCount, paged);
    }

    [AllowAnonymous]
    public virtual async Task<DanhMucDto> GetAsync(Guid id)
    {
        var danhMuc = await _danhMucRepository.GetAsync(id);
        string? pName = null;
        if (danhMuc.ParentId.HasValue)
        {
            var p = await _danhMucRepository.FindAsync(danhMuc.ParentId.Value);
            pName = p?.Ten;
        }

        var count = await _sanPhamRepository.CountAsync(x => x.DanhMucId == id || x.DanhMuc == danhMuc.Ten);
        return MapToDto(danhMuc, count, pName);
    }

    [AllowAnonymous]
    public virtual async Task<DanhMucDto> GetBySlugAsync(string slug)
    {
        var cleanSlug = slug.Trim().ToLowerInvariant();
        var danhMuc = await _danhMucRepository.FirstOrDefaultAsync(x => x.Slug == cleanSlug);
        if (danhMuc == null)
        {
            throw new UserFriendlyException($"Không tìm thấy danh mục với đường dẫn '{slug}'");
        }

        string? pName = null;
        if (danhMuc.ParentId.HasValue)
        {
            var p = await _danhMucRepository.FindAsync(danhMuc.ParentId.Value);
            pName = p?.Ten;
        }

        var count = await _sanPhamRepository.CountAsync(x => x.DanhMucId == danhMuc.Id || x.DanhMuc == danhMuc.Ten);
        return MapToDto(danhMuc, count, pName);
    }

    [Authorize]
    public virtual async Task<DanhMucDto> CreateAsync(CreateUpdateDanhMucDto input)
    {
        var danhMuc = await _danhMucManager.CreateAsync(
            ten: input.Ten,
            slug: input.Slug,
            icon: input.Icon,
            moTa: input.MoTa,
            parentId: input.ParentId,
            thuTu: input.ThuTu,
            trangThai: input.TrangThai
        );

        return MapToDto(danhMuc);
    }

    [Authorize]
    public virtual async Task<DanhMucDto> UpdateAsync(Guid id, CreateUpdateDanhMucDto input)
    {
        var danhMuc = await _danhMucManager.UpdateAsync(
            id: id,
            ten: input.Ten,
            slug: input.Slug,
            icon: input.Icon,
            moTa: input.MoTa,
            parentId: input.ParentId,
            thuTu: input.ThuTu,
            trangThai: input.TrangThai
        );

        return MapToDto(danhMuc);
    }

    [Authorize]
    public virtual async Task DeleteAsync(Guid id)
    {
        var hasChildren = await _danhMucRepository.AnyAsync(x => x.ParentId == id);
        if (hasChildren)
        {
            throw new UserFriendlyException("Không thể xóa danh mục này vì đang chứa các danh mục con! Vui lòng xóa hoặc di chuyển danh mục con trước.");
        }

        var hasProducts = await _sanPhamRepository.AnyAsync(x => x.DanhMucId == id);
        if (hasProducts)
        {
            throw new UserFriendlyException("Không thể xóa danh mục này vì đang có sản phẩm thuộc danh mục! Vui lòng chuyển sản phẩm sang danh mục khác trước khi xóa.");
        }

        await _danhMucRepository.DeleteAsync(id);
    }
}

