using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using testtttt88.CuaHangs;
using testtttt88.Permissions;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Users;

namespace testtttt88.ViCuaHangs;

[Authorize]
public class ViCuaHangAppService : testtttt88AppService, IViCuaHangAppService
{
    private readonly IRepository<ViCuaHang, Guid> _viRepository;
    private readonly IRepository<GiaoDichVi, Guid> _giaoDichRepository;
    private readonly IRepository<YeuCauRutTien, Guid> _rutTienRepository;
    private readonly IRepository<CuaHang, Guid> _cuaHangRepository;
    private readonly ViCuaHangManager _viCuaHangManager;

    public ViCuaHangAppService(
        IRepository<ViCuaHang, Guid> viRepository,
        IRepository<GiaoDichVi, Guid> giaoDichRepository,
        IRepository<YeuCauRutTien, Guid> rutTienRepository,
        IRepository<CuaHang, Guid> cuaHangRepository,
        ViCuaHangManager viCuaHangManager)
    {
        _viRepository = viRepository;
        _giaoDichRepository = giaoDichRepository;
        _rutTienRepository = rutTienRepository;
        _cuaHangRepository = cuaHangRepository;
        _viCuaHangManager = viCuaHangManager;
    }

    private async Task<CuaHang> GetCurrentShopAsync()
    {
        var userId = CurrentUser.GetId();
        var cuaHang = await _cuaHangRepository.FirstOrDefaultAsync(x => x.ChuSoHuuId == userId);
        if (cuaHang == null)
        {
            throw new UserFriendlyException("Bạn chưa đăng ký hoặc chưa sở hữu gian hàng nào!");
        }
        return cuaHang;
    }

    public virtual async Task<ViCuaHangDto> GetMyWalletAsync()
    {
        var cuaHang = await GetCurrentShopAsync();
        var vi = await _viRepository.FirstOrDefaultAsync(x => x.CuaHangId == cuaHang.Id);
        if (vi == null)
        {
            vi = await _viCuaHangManager.TaoViChoCuaHangAsync(cuaHang.Id);
        }

        var rutTienQuery = await _rutTienRepository.GetQueryableAsync();
        var tongChoDuyet = rutTienQuery
            .Where(x => x.CuaHangId == cuaHang.Id && x.TrangThai == YeuCauRutTien.TrangThaiChoDuyet)
            .Sum(x => (decimal?)x.SoTien) ?? 0m;

        return new ViCuaHangDto
        {
            Id = vi.Id,
            CuaHangId = vi.CuaHangId,
            SoDuKhaDung = vi.SoDuKhaDung,
            SoDuTamGiu = vi.SoDuTamGiu,
            TongTienDaRut = vi.TongTienDaRut,
            TongTienDangChoDuyet = tongChoDuyet
        };
    }

    public virtual async Task<PagedResultDto<GiaoDichViDto>> GetMyTransactionsAsync(PagedAndSortedResultRequestDto input)
    {
        var cuaHang = await GetCurrentShopAsync();
        var totalCount = await _giaoDichRepository.CountAsync(x => x.CuaHangId == cuaHang.Id);
        var query = await _giaoDichRepository.GetQueryableAsync();
        var items = query
            .Where(x => x.CuaHangId == cuaHang.Id)
            .OrderByDescending(x => x.CreationTime)
            .Skip(input.SkipCount)
            .Take(input.MaxResultCount)
            .ToList();

        var dtos = items.Select(x => new GiaoDichViDto
        {
            Id = x.Id,
            ViCuaHangId = x.ViCuaHangId,
            CuaHangId = x.CuaHangId,
            LoaiGiaoDich = x.LoaiGiaoDich,
            SoTien = x.SoTien,
            SoDuSauGiaoDich = x.SoDuSauGiaoDich,
            MoTa = x.MoTa,
            MaDonHangLienQuan = x.MaDonHangLienQuan,
            CreationTime = x.CreationTime
        }).ToList();

        return new PagedResultDto<GiaoDichViDto>(totalCount, dtos);
    }

    public virtual async Task<YeuCauRutTienDto> TaoYeuCauRutTienAsync(TaoYeuCauRutTienDto input)
    {
        var cuaHang = await GetCurrentShopAsync();
        if (string.IsNullOrWhiteSpace(cuaHang.SoTaiKhoanNganHang) ||
            string.IsNullOrWhiteSpace(cuaHang.TenNganHang) ||
            string.IsNullOrWhiteSpace(cuaHang.TenChuTaiKhoan))
        {
            throw new UserFriendlyException("Vui lòng cập nhật đầy đủ thông tin tài khoản ngân hàng của gian hàng trước khi rút tiền!");
        }

        var yeuCau = await _viCuaHangManager.TaoYeuCauRutTienAsync(
            cuaHang.Id,
            input.SoTien,
            cuaHang.TenNganHang,
            cuaHang.SoTaiKhoanNganHang,
            cuaHang.TenChuTaiKhoan,
            input.GhiChu
        );

        return new YeuCauRutTienDto
        {
            Id = yeuCau.Id,
            CuaHangId = yeuCau.CuaHangId,
            TenCuaHang = cuaHang.Ten,
            SoTien = yeuCau.SoTien,
            TenNganHang = yeuCau.TenNganHang,
            SoTaiKhoan = yeuCau.SoTaiKhoan,
            TenChuTaiKhoan = yeuCau.TenChuTaiKhoan,
            TrangThai = yeuCau.TrangThai,
            GhiChu = yeuCau.GhiChu,
            CreationTime = yeuCau.CreationTime
        };
    }

    public virtual async Task<PagedResultDto<YeuCauRutTienDto>> GetMyPayoutRequestsAsync(PagedAndSortedResultRequestDto input)
    {
        var cuaHang = await GetCurrentShopAsync();
        var totalCount = await _rutTienRepository.CountAsync(x => x.CuaHangId == cuaHang.Id);
        var query = await _rutTienRepository.GetQueryableAsync();
        var items = query
            .Where(x => x.CuaHangId == cuaHang.Id)
            .OrderByDescending(x => x.CreationTime)
            .Skip(input.SkipCount)
            .Take(input.MaxResultCount)
            .ToList();

        var dtos = items.Select(x => new YeuCauRutTienDto
        {
            Id = x.Id,
            CuaHangId = x.CuaHangId,
            TenCuaHang = cuaHang.Ten,
            SoTien = x.SoTien,
            TenNganHang = x.TenNganHang,
            SoTaiKhoan = x.SoTaiKhoan,
            TenChuTaiKhoan = x.TenChuTaiKhoan,
            TrangThai = x.TrangThai,
            GhiChu = x.GhiChu,
            LyDoTuChoi = x.LyDoTuChoi,
            NgayXuLy = x.NgayXuLy,
            CreationTime = x.CreationTime
        }).ToList();

        return new PagedResultDto<YeuCauRutTienDto>(totalCount, dtos);
    }

    [Authorize(testtttt88Permissions.ViCuaHangs.ApprovePayout)]
    public virtual async Task<PagedResultDto<YeuCauRutTienDto>> GetAdminPayoutRequestsAsync(PagedAndSortedResultRequestDto input)
    {
        var totalCount = await _rutTienRepository.GetCountAsync();
        var query = await _rutTienRepository.GetQueryableAsync();
        var items = query
            .OrderByDescending(x => x.CreationTime)
            .Skip(input.SkipCount)
            .Take(input.MaxResultCount)
            .ToList();

        var shopIds = items.Select(x => x.CuaHangId).Distinct().ToList();
        var shops = await _cuaHangRepository.GetListAsync(x => shopIds.Contains(x.Id));
        var shopDict = shops.ToDictionary(x => x.Id, x => x.Ten);

        var dtos = items.Select(x => new YeuCauRutTienDto
        {
            Id = x.Id,
            CuaHangId = x.CuaHangId,
            TenCuaHang = shopDict.TryGetValue(x.CuaHangId, out var name) ? name : "Gian hàng",
            SoTien = x.SoTien,
            TenNganHang = x.TenNganHang,
            SoTaiKhoan = x.SoTaiKhoan,
            TenChuTaiKhoan = x.TenChuTaiKhoan,
            TrangThai = x.TrangThai,
            GhiChu = x.GhiChu,
            LyDoTuChoi = x.LyDoTuChoi,
            NgayXuLy = x.NgayXuLy,
            CreationTime = x.CreationTime
        }).ToList();

        return new PagedResultDto<YeuCauRutTienDto>(totalCount, dtos);
    }

    [Authorize(testtttt88Permissions.ViCuaHangs.ApprovePayout)]
    public virtual async Task<YeuCauRutTienDto> XuLyRutTienAsync(Guid id, XuLyRutTienDto input)
    {
        if (input.DongY)
        {
            await _viCuaHangManager.PheDuyetRutTienAsync(id);
        }
        else
        {
            await _viCuaHangManager.TuChoiRutTienAsync(id, input.LyDoTuChoi ?? "Từ chối bởi Admin sàn");
        }

        var yeuCau = await _rutTienRepository.GetAsync(id);
        var shop = await _cuaHangRepository.FindAsync(yeuCau.CuaHangId);

        return new YeuCauRutTienDto
        {
            Id = yeuCau.Id,
            CuaHangId = yeuCau.CuaHangId,
            TenCuaHang = shop?.Ten,
            SoTien = yeuCau.SoTien,
            TenNganHang = yeuCau.TenNganHang,
            SoTaiKhoan = yeuCau.SoTaiKhoan,
            TenChuTaiKhoan = yeuCau.TenChuTaiKhoan,
            TrangThai = yeuCau.TrangThai,
            GhiChu = yeuCau.GhiChu,
            LyDoTuChoi = yeuCau.LyDoTuChoi,
            NgayXuLy = yeuCau.NgayXuLy,
            CreationTime = yeuCau.CreationTime
        };
    }
}

