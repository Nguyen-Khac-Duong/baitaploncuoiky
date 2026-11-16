using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using testtttt88.CuaHangs;
using testtttt88.Permissions;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Domain.Entities;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Users;

namespace testtttt88.SanPhams;

/// <summary>
/// Application Service quản lý sản phẩm theo chuẩn DDD của công ty
/// </summary>
public class SanPhamAppService : testtttt88AppService, ISanPhamAppService
{
    private readonly IRepository<SanPham, Guid> _sanPhamRepository;
    private readonly IRepository<CuaHang, Guid> _cuaHangRepository;
    private readonly SanPhamManager _sanPhamManager;

    public SanPhamAppService(
        IRepository<SanPham, Guid> sanPhamRepository,
        IRepository<CuaHang, Guid> cuaHangRepository,
        SanPhamManager sanPhamManager)
    {
        _sanPhamRepository = sanPhamRepository;
        _cuaHangRepository = cuaHangRepository;
        _sanPhamManager = sanPhamManager;
    }

    private static SanPhamDto MapToDto(SanPham x, string? tenCuaHang = null, string? cuaHangSlug = null)
    {
        return new SanPhamDto
        {
            Id = x.Id,
            CuaHangId = x.CuaHangId,
            TenCuaHang = tenCuaHang,
            CuaHangSlug = cuaHangSlug,
            MaSp = x.MaSp,
            Ten = x.Ten,
            Gia = x.Gia,
            SoLuongTon = x.SoLuongTon,
            DanhMuc = x.DanhMuc,
            DanhMucId = x.DanhMucId,
            HinhAnh = x.HinhAnh,
            MoTa = x.MoTa,
            NgayTao = x.CreationTime
        };
    }

    private async Task<Dictionary<Guid, CuaHang>> GetStoresAsync(IEnumerable<Guid> storeIds)
    {
        var distinctIds = storeIds.Where(x => x != Guid.Empty).Distinct().ToList();
        if (!distinctIds.Any()) return new();
        var stores = await _cuaHangRepository.GetListAsync(x => distinctIds.Contains(x.Id));
        return stores.ToDictionary(x => x.Id, x => x);
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

        string? storeName = null;
        string? storeSlug = null;
        if (sanPham.CuaHangId != Guid.Empty)
        {
            var shop = await _cuaHangRepository.FindAsync(sanPham.CuaHangId);
            storeName = shop?.Ten;
            storeSlug = shop?.Slug;
        }

        return MapToDto(sanPham, storeName, storeSlug);
    }

    private static readonly HashSet<string> AllowedProductSortingFields = new(StringComparer.OrdinalIgnoreCase)
    {
        nameof(SanPham.CreationTime),
        nameof(SanPham.Gia),
        nameof(SanPham.Ten),
        nameof(SanPham.MaSp),
        nameof(SanPham.SoLuongTon),
        nameof(SanPham.DanhMuc),
        "NgayTao"
    };

    private static string SanitizeProductSorting(string? sorting)
    {
        if (string.IsNullOrWhiteSpace(sorting))
        {
            return $"{nameof(SanPham.CreationTime)} desc";
        }

        var parts = sorting.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);
        var field = parts[0];
        var direction = parts.Length > 1 && parts[1].Equals("desc", StringComparison.OrdinalIgnoreCase) ? "desc" : "asc";

        if (AllowedProductSortingFields.Contains(field))
        {
            if (field.Equals("NgayTao", StringComparison.OrdinalIgnoreCase))
            {
                field = nameof(SanPham.CreationTime);
            }
            return $"{field} {direction}";
        }

        return $"{nameof(SanPham.CreationTime)} desc";
    }

    /// <summary>
    /// Lấy danh sách sản phẩm có phân trang và sắp xếp (toàn sàn)
    /// </summary>
    public virtual async Task<PagedResultDto<SanPhamDto>> GetListAsync(PagedAndSortedResultRequestDto input)
    {
        var totalCount = await _sanPhamRepository.GetCountAsync();
        var sorting = SanitizeProductSorting(input.Sorting);
        var entities = await _sanPhamRepository.GetPagedListAsync(
            input.SkipCount,
            input.MaxResultCount,
            sorting
        );

        var storeDict = await GetStoresAsync(entities.Select(x => x.CuaHangId));
        var dtos = entities.Select(x => {
            storeDict.TryGetValue(x.CuaHangId, out var shop);
            return MapToDto(x, shop?.Ten, shop?.Slug);
        }).ToList();
        return new PagedResultDto<SanPhamDto>(totalCount, dtos);
    }

    /// <summary>
    /// Lấy danh sách sản phẩm của một shop cụ thể
    /// </summary>
    public virtual async Task<PagedResultDto<SanPhamDto>> GetListByShopAsync(Guid shopId, PagedAndSortedResultRequestDto input)
    {
        var totalCount = await _sanPhamRepository.CountAsync(x => x.CuaHangId == shopId);
        var query = await _sanPhamRepository.GetQueryableAsync();
        var entities = query
            .Where(x => x.CuaHangId == shopId)
            .OrderByDescending(x => x.CreationTime)
            .Skip(input.SkipCount)
            .Take(input.MaxResultCount)
            .ToList();

        var shop = await _cuaHangRepository.FindAsync(shopId);
        var dtos = entities.Select(x => MapToDto(x, shop?.Ten, shop?.Slug)).ToList();
        return new PagedResultDto<SanPhamDto>(totalCount, dtos);
    }

    /// <summary>
    /// Lấy danh sách sản phẩm của chính gian hàng của người dùng đăng nhập (Seller Center)
    /// </summary>
    [Authorize]
    public virtual async Task<PagedResultDto<SanPhamDto>> GetMyProductsAsync(PagedAndSortedResultRequestDto input)
    {
        var userId = CurrentUser.GetId();
        var cuaHang = await _cuaHangRepository.FirstOrDefaultAsync(x => x.ChuSoHuuId == userId);
        if (cuaHang == null)
        {
            return new PagedResultDto<SanPhamDto>(0, new List<SanPhamDto>());
        }

        return await GetListByShopAsync(cuaHang.Id, input);
    }

    /// <summary>
    /// Lấy toàn bộ danh sách sản phẩm
    /// </summary>
    public virtual async Task<List<SanPhamDto>> GetAllListAsync()
    {
        var entities = await _sanPhamRepository.GetListAsync();
        var storeDict = await GetStoresAsync(entities.Select(x => x.CuaHangId));
        return entities.Select(x => {
            storeDict.TryGetValue(x.CuaHangId, out var shop);
            return MapToDto(x, shop?.Ten, shop?.Slug);
        }).ToList();
    }

    /// <summary>
    /// Tạo mới một sản phẩm vào kho
    /// </summary>
    [Authorize]
    public virtual async Task<SanPhamDto> CreateAsync(CreateUpdateSanPhamDto input)
    {
        if (CurrentUser.IsInRole("admin"))
        {
            throw new UserFriendlyException("Tài khoản Quản trị viên sàn (Admin) không được phép đăng bán sản phẩm! Sản phẩm chỉ có thể được tạo bởi Chủ gian hàng đã được phê duyệt.");
        }

        // Xác định shop của sản phẩm
        Guid targetShopId = Guid.Empty;
        if (input.CuaHangId.HasValue && input.CuaHangId.Value != Guid.Empty)
        {
            targetShopId = input.CuaHangId.Value;
        }
        else if (CurrentUser.Id.HasValue)
        {
            var myShop = await _cuaHangRepository.FirstOrDefaultAsync(x => x.ChuSoHuuId == CurrentUser.GetId());
            if (myShop != null)
            {
                targetShopId = myShop.Id;
            }
        }

        if (targetShopId == Guid.Empty)
        {
            throw new UserFriendlyException("Bạn phải sở hữu một gian hàng đang hoạt động để đăng bán sản phẩm!");
        }

        var createdSanPham = await _sanPhamManager.CreateAsync(
            maSp: input.MaSp,
            ten: input.Ten,
            gia: input.Gia,
            soLuongTon: input.SoLuongTon,
            danhMuc: input.DanhMuc,
            hinhAnh: input.HinhAnh,
            moTa: input.MoTa,
            cuaHangId: targetShopId,
            danhMucId: input.DanhMucId
        );

        string? shopName = null;
        string? shopSlug = null;
        if (targetShopId != Guid.Empty)
        {
            var shop = await _cuaHangRepository.FindAsync(targetShopId);
            shopName = shop?.Ten;
            shopSlug = shop?.Slug;
        }

        return MapToDto(createdSanPham, shopName, shopSlug);
    }

    /// <summary>
    /// Cập nhật thông tin sản phẩm
    /// </summary>
    [Authorize]
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
            moTa: input.MoTa,
            danhMucId: input.DanhMucId
        );

        string? shopName = null;
        string? shopSlug = null;
        if (updatedSanPham.CuaHangId != Guid.Empty)
        {
            var shop = await _cuaHangRepository.FindAsync(updatedSanPham.CuaHangId);
            shopName = shop?.Ten;
            shopSlug = shop?.Slug;
        }

        return MapToDto(updatedSanPham, shopName, shopSlug);
    }

    /// <summary>
    /// Xóa sản phẩm khỏi kho (kích hoạt Soft Delete của FullAuditedAggregateRoot)
    /// </summary>
    [Authorize]
    public virtual async Task DeleteAsync(Guid id)
    {
        await _sanPhamRepository.DeleteAsync(id);
    }
}
