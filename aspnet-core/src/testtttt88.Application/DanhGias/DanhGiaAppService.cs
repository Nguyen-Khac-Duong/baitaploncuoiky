using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using testtttt88.CuaHangs;
using testtttt88.DonHangs;
using testtttt88.SanPhams;
using testtttt88.ThongBaos;
using Volo.Abp;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Users;

namespace testtttt88.DanhGias;

public class DanhGiaAppService : testtttt88AppService, IDanhGiaAppService
{
    private readonly IRepository<DanhGiaSanPham, Guid> _danhGiaRepository;
    private readonly IRepository<SanPham, Guid> _sanPhamRepository;
    private readonly IRepository<DonHang, Guid> _donHangRepository;
    private readonly IRepository<CuaHang, Guid> _cuaHangRepository;
    private readonly IRepository<ThongBao, Guid> _thongBaoRepository;
    private readonly DanhGiaManager _danhGiaManager;

    public DanhGiaAppService(
        IRepository<DanhGiaSanPham, Guid> danhGiaRepository,
        IRepository<SanPham, Guid> sanPhamRepository,
        IRepository<DonHang, Guid> donHangRepository,
        IRepository<CuaHang, Guid> cuaHangRepository,
        IRepository<ThongBao, Guid> thongBaoRepository,
        DanhGiaManager danhGiaManager)
    {
        _danhGiaRepository = danhGiaRepository;
        _sanPhamRepository = sanPhamRepository;
        _donHangRepository = donHangRepository;
        _cuaHangRepository = cuaHangRepository;
        _thongBaoRepository = thongBaoRepository;
        _danhGiaManager = danhGiaManager;
    }

    private async Task TaoThongBaoAsync(
        string doiTuong,
        Guid? nguoiDungId,
        Guid? cuaHangId,
        string tieuDe,
        string noiDung,
        string loai,
        string? lienKet = null)
    {
        try
        {
            var tb = new ThongBao(
                GuidGenerator.Create(),
                tieuDe,
                noiDung,
                loai,
                lienKet,
                nguoiDungId,
                cuaHangId,
                doiTuong
            );
            await _thongBaoRepository.InsertAsync(tb);
        }
        catch
        {
            // Tránh ảnh hưởng luồng chính
        }
    }

    private async Task<DanhGiaDto> MapToDtoAsync(DanhGiaSanPham entity)
    {
        var sp = await _sanPhamRepository.FindAsync(entity.SanPhamId);
        var donHang = await _donHangRepository.FindAsync(entity.DonHangId);
        var shop = await _cuaHangRepository.FindAsync(entity.CuaHangId);

        return new DanhGiaDto
        {
            Id = entity.Id,
            CreationTime = entity.CreationTime,
            CreatorId = entity.CreatorId,
            LastModificationTime = entity.LastModificationTime,
            LastModifierId = entity.LastModifierId,
            SanPhamId = entity.SanPhamId,
            TenSanPham = sp?.Ten ?? "Sản phẩm",
            HinhAnhSanPham = sp?.HinhAnh,
            DonHangId = entity.DonHangId,
            MaDonHang = donHang?.MaDon ?? string.Empty,
            CuaHangId = entity.CuaHangId,
            TenCuaHang = shop?.Ten ?? "Gian hàng",
            NguoiDungId = entity.NguoiDungId,
            TenNguoiDung = entity.TenNguoiDung,
            AvatarNguoiDung = entity.AvatarNguoiDung,
            SoSao = entity.SoSao,
            NoiDung = entity.NoiDung,
            HinhAnh = entity.HinhAnh,
            DonHangCoHoanTra = entity.DonHangCoHoanTra,
            PhanHoiShop = entity.PhanHoiShop,
            ThoiGianPhanHoi = entity.ThoiGianPhanHoi
        };
    }

    /// <summary>
    /// Khách hàng tạo đánh giá cho sản phẩm đã mua
    /// </summary>
    [Authorize]
    public virtual async Task<DanhGiaDto> TaoDanhGiaAsync(TaoDanhGiaDto input)
    {
        var userId = CurrentUser.GetId();
        var userName = CurrentUser.Name ?? CurrentUser.UserName ?? "Khách hàng";

        var danhGia = await _danhGiaManager.TaoDanhGiaAsync(
            sanPhamId: input.SanPhamId,
            donHangId: input.DonHangId,
            nguoiDungId: userId,
            tenNguoiDung: userName,
            soSao: input.SoSao,
            noiDung: input.NoiDung,
            hinhAnh: input.HinhAnh
        );

        // Bắn thông báo cho Seller
        if (danhGia.CuaHangId != Guid.Empty)
        {
            var sp = await _sanPhamRepository.FindAsync(danhGia.SanPhamId);
            await TaoThongBaoAsync(
                ThongBao.DoiTuongSeller,
                null,
                danhGia.CuaHangId,
                $"⭐ Khách vừa đánh giá {danhGia.SoSao}★",
                $"{userName} vừa để lại nhận xét {danhGia.SoSao} sao cho '{sp?.Ten ?? "sản phẩm"}': \"{danhGia.NoiDung}\". Bấm để xem và phản hồi.",
                ThongBao.LoaiDanhGia,
                "/seller/danh-gia"
            );
        }

        return await MapToDtoAsync(danhGia);
    }

    /// <summary>
    /// Lấy danh sách đánh giá của một sản phẩm (công khai cho trang chi tiết sản phẩm)
    /// </summary>
    public virtual async Task<List<DanhGiaDto>> GetDanhSachTheoSanPhamAsync(Guid sanPhamId)
    {
        var query = await _danhGiaRepository.GetQueryableAsync();
        var entities = query
            .Where(x => x.SanPhamId == sanPhamId)
            .OrderByDescending(x => x.CreationTime)
            .ToList();

        var result = new List<DanhGiaDto>();
        foreach (var item in entities)
        {
            result.Add(await MapToDtoAsync(item));
        }
        return result;
    }

    /// <summary>
    /// Thống kê phân bổ sao và điểm trung bình của một sản phẩm
    /// </summary>
    public virtual async Task<ThongKeDanhGiaDto> GetThongKeTheoSanPhamAsync(Guid sanPhamId)
    {
        var query = await _danhGiaRepository.GetQueryableAsync();
        var items = query.Where(x => x.SanPhamId == sanPhamId).ToList();

        if (!items.Any())
        {
            return new ThongKeDanhGiaDto
            {
                DiemTrungBinh = 5.0,
                TongSoDanhGia = 0
            };
        }

        return new ThongKeDanhGiaDto
        {
            TongSoDanhGia = items.Count,
            DiemTrungBinh = Math.Round(items.Average(x => x.SoSao), 1),
            SoLuong5Sao = items.Count(x => x.SoSao == 5),
            SoLuong4Sao = items.Count(x => x.SoSao == 4),
            SoLuong3Sao = items.Count(x => x.SoSao == 3),
            SoLuong2Sao = items.Count(x => x.SoSao == 2),
            SoLuong1Sao = items.Count(x => x.SoSao == 1),
            SoLuongCoHinhAnh = items.Count(x => !string.IsNullOrWhiteSpace(x.HinhAnh)),
            SoLuongDonHoanTra = items.Count(x => x.DonHangCoHoanTra)
        };
    }

    /// <summary>
    /// Lấy danh sách đánh giá của gian hàng (dành cho Seller Center)
    /// </summary>
    [Authorize]
    public virtual async Task<List<DanhGiaDto>> GetDanhSachTheoShopAsync(Guid? shopId = null)
    {
        Guid targetShopId = Guid.Empty;
        if (shopId.HasValue && shopId.Value != Guid.Empty)
        {
            targetShopId = shopId.Value;
        }
        else
        {
            var myShop = await _cuaHangRepository.FirstOrDefaultAsync(x => x.ChuSoHuuId == CurrentUser.GetId());
            if (myShop != null)
            {
                targetShopId = myShop.Id;
            }
        }

        if (targetShopId == Guid.Empty)
        {
            return new List<DanhGiaDto>();
        }

        var query = await _danhGiaRepository.GetQueryableAsync();
        var entities = query
            .Where(x => x.CuaHangId == targetShopId)
            .OrderByDescending(x => x.CreationTime)
            .ToList();

        var result = new List<DanhGiaDto>();
        foreach (var item in entities)
        {
            result.Add(await MapToDtoAsync(item));
        }
        return result;
    }

    /// <summary>
    /// Lấy danh sách đánh giá của chính người dùng hiện tại
    /// </summary>
    [Authorize]
    public virtual async Task<List<DanhGiaDto>> GetDanhSachCuaToiAsync()
    {
        var userId = CurrentUser.GetId();
        var query = await _danhGiaRepository.GetQueryableAsync();
        var entities = query
            .Where(x => x.NguoiDungId == userId)
            .OrderByDescending(x => x.CreationTime)
            .ToList();

        var result = new List<DanhGiaDto>();
        foreach (var item in entities)
        {
            result.Add(await MapToDtoAsync(item));
        }
        return result;
    }

    /// <summary>
    /// Chủ gian hàng phản hồi đánh giá của khách
    /// </summary>
    [Authorize]
    public virtual async Task<DanhGiaDto> ShopPhanHoiAsync(Guid danhGiaId, PhanHoiDanhGiaDto input)
    {
        Check.NotNullOrWhiteSpace(input.NoiDungPhanHoi, nameof(input.NoiDungPhanHoi));
        var userId = CurrentUser.GetId();

        var updated = await _danhGiaManager.ShopPhanHoiAsync(danhGiaId, userId, input.NoiDungPhanHoi);

        // Bắn thông báo cho Buyer
        var sp = await _sanPhamRepository.FindAsync(updated.SanPhamId);
        await TaoThongBaoAsync(
            ThongBao.DoiTuongBuyer,
            updated.NguoiDungId,
            null,
            "💬 Shop đã phản hồi nhận xét của bạn",
            $"Shop vừa phản hồi đánh giá của bạn cho sản phẩm '{sp?.Ten ?? "sản phẩm"}': \"{input.NoiDungPhanHoi}\"",
            ThongBao.LoaiDanhGia,
            "/don-hang-cua-toi"
        );

        return await MapToDtoAsync(updated);
    }
}

