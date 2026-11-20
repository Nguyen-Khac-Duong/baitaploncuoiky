using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using testtttt88.CuaHangs;
using Volo.Abp;
using Volo.Abp.Domain.Entities;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Users;

namespace testtttt88.ThongBaos;

[Authorize]
public class ThongBaoAppService : testtttt88AppService, IThongBaoAppService
{
    private readonly IRepository<ThongBao, Guid> _thongBaoRepository;
    private readonly IRepository<CuaHang, Guid> _cuaHangRepository;

    public ThongBaoAppService(
        IRepository<ThongBao, Guid> thongBaoRepository,
        IRepository<CuaHang, Guid> cuaHangRepository)
    {
        _thongBaoRepository = thongBaoRepository;
        _cuaHangRepository = cuaHangRepository;
    }

    private ThongBaoDto MapToDto(ThongBao entity)
    {
        return new ThongBaoDto
        {
            Id = entity.Id,
            CreationTime = entity.CreationTime,
            CreatorId = entity.CreatorId,
            LastModificationTime = entity.LastModificationTime,
            LastModifierId = entity.LastModifierId,
            NguoiDungId = entity.NguoiDungId,
            CuaHangId = entity.CuaHangId,
            DoiTuong = entity.DoiTuong,
            TieuDe = entity.TieuDe,
            NoiDung = entity.NoiDung,
            Loai = entity.Loai,
            LienKet = entity.LienKet,
            DaDoc = entity.DaDoc,
            ThoiGianDoc = entity.ThoiGianDoc
        };
    }

    private async Task<Guid?> GetCurrentShopIdAsync()
    {
        if (!CurrentUser.Id.HasValue) return null;
        var userId = CurrentUser.GetId();
        var shop = await _cuaHangRepository.FirstOrDefaultAsync(x => x.ChuSoHuuId == userId);
        return shop?.Id;
    }

    /// <summary>
    /// Lấy danh sách thông báo theo phân hệ Buyer hoặc Seller
    /// </summary>
    public virtual async Task<List<ThongBaoDto>> GetDanhSachAsync(string? doiTuong = null)
    {
        var userId = CurrentUser.GetId();
        var isSeller = string.Equals(doiTuong, ThongBao.DoiTuongSeller, StringComparison.OrdinalIgnoreCase);
        var targetDoiTuong = isSeller ? ThongBao.DoiTuongSeller : ThongBao.DoiTuongBuyer;

        var shopId = isSeller ? await GetCurrentShopIdAsync() : null;

        var query = await _thongBaoRepository.GetQueryableAsync();

        List<ThongBao> items;
        if (isSeller)
        {
            items = query
                .Where(x => x.DoiTuong == ThongBao.DoiTuongSeller &&
                            ((shopId.HasValue && x.CuaHangId == shopId.Value) || x.NguoiDungId == userId))
                .OrderByDescending(x => x.CreationTime)
                .Take(50)
                .ToList();
        }
        else
        {
            items = query
                .Where(x => x.DoiTuong == ThongBao.DoiTuongBuyer && x.NguoiDungId == userId)
                .OrderByDescending(x => x.CreationTime)
                .Take(50)
                .ToList();
        }

        return items.Select(MapToDto).ToList();
    }

    /// <summary>
    /// Đếm số thông báo chưa đọc theo phân hệ
    /// </summary>
    public virtual async Task<int> GetSoChuaDocAsync(string? doiTuong = null)
    {
        var userId = CurrentUser.GetId();
        var isSeller = string.Equals(doiTuong, ThongBao.DoiTuongSeller, StringComparison.OrdinalIgnoreCase);
        var shopId = isSeller ? await GetCurrentShopIdAsync() : null;

        var query = await _thongBaoRepository.GetQueryableAsync();

        if (isSeller)
        {
            return query.Count(x => !x.DaDoc && x.DoiTuong == ThongBao.DoiTuongSeller &&
                                    ((shopId.HasValue && x.CuaHangId == shopId.Value) || x.NguoiDungId == userId));
        }

        return query.Count(x => !x.DaDoc && x.DoiTuong == ThongBao.DoiTuongBuyer && x.NguoiDungId == userId);
    }

    /// <summary>
    /// Đánh dấu đã đọc một thông báo
    /// </summary>
    public virtual async Task<ThongBaoDto> DanhDauDaDocAsync(Guid id)
    {
        var tb = await _thongBaoRepository.FindAsync(id);
        if (tb == null)
        {
            throw new EntityNotFoundException(typeof(ThongBao), id);
        }

        tb.DanhDauDaDoc();
        await _thongBaoRepository.UpdateAsync(tb);
        return MapToDto(tb);
    }

    /// <summary>
    /// Đánh dấu toàn bộ thông báo là đã đọc theo phân hệ
    /// </summary>
    public virtual async Task DanhDauTatCaDaDocAsync(string? doiTuong = null)
    {
        var userId = CurrentUser.GetId();
        var isSeller = string.Equals(doiTuong, ThongBao.DoiTuongSeller, StringComparison.OrdinalIgnoreCase);
        var shopId = isSeller ? await GetCurrentShopIdAsync() : null;

        var query = await _thongBaoRepository.GetQueryableAsync();
        List<ThongBao> unread;

        if (isSeller)
        {
            unread = query
                .Where(x => !x.DaDoc && x.DoiTuong == ThongBao.DoiTuongSeller &&
                            ((shopId.HasValue && x.CuaHangId == shopId.Value) || x.NguoiDungId == userId))
                .ToList();
        }
        else
        {
            unread = query
                .Where(x => !x.DaDoc && x.DoiTuong == ThongBao.DoiTuongBuyer && x.NguoiDungId == userId)
                .ToList();
        }

        foreach (var item in unread)
        {
            item.DanhDauDaDoc();
            await _thongBaoRepository.UpdateAsync(item);
        }
    }

    /// <summary>
    /// Xóa một thông báo
    /// </summary>
    public virtual async Task XoaThongBaoAsync(Guid id)
    {
        await _thongBaoRepository.DeleteAsync(id);
    }

    /// <summary>
    /// Xóa toàn bộ thông báo theo phân hệ
    /// </summary>
    public virtual async Task XoaTatCaAsync(string? doiTuong = null)
    {
        var userId = CurrentUser.GetId();
        var isSeller = string.Equals(doiTuong, ThongBao.DoiTuongSeller, StringComparison.OrdinalIgnoreCase);
        var shopId = isSeller ? await GetCurrentShopIdAsync() : null;

        var query = await _thongBaoRepository.GetQueryableAsync();
        List<ThongBao> list;

        if (isSeller)
        {
            list = query
                .Where(x => x.DoiTuong == ThongBao.DoiTuongSeller &&
                            ((shopId.HasValue && x.CuaHangId == shopId.Value) || x.NguoiDungId == userId))
                .ToList();
        }
        else
        {
            list = query
                .Where(x => x.DoiTuong == ThongBao.DoiTuongBuyer && x.NguoiDungId == userId)
                .ToList();
        }

        foreach (var item in list)
        {
            await _thongBaoRepository.DeleteAsync(item);
        }
    }
}
