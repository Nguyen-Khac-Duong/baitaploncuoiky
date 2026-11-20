using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using testtttt88.CuaHangs;
using Volo.Abp;
using Volo.Abp.Domain.Entities;
using Volo.Abp.Domain.Repositories;

namespace testtttt88.Vouchers;

public class VoucherAppService : testtttt88AppService, IVoucherAppService
{
    private readonly IRepository<Voucher, Guid> _voucherRepository;
    private readonly IRepository<CuaHang, Guid> _cuaHangRepository;
    private readonly VoucherManager _voucherManager;

    public VoucherAppService(
        IRepository<Voucher, Guid> voucherRepository,
        IRepository<CuaHang, Guid> cuaHangRepository,
        VoucherManager voucherManager)
    {
        _voucherRepository = voucherRepository;
        _cuaHangRepository = cuaHangRepository;
        _voucherManager = voucherManager;
    }

    private static VoucherDto MapToDto(Voucher x, string? tenCuaHang = null)
    {
        return new VoucherDto
        {
            Id = x.Id,
            CreationTime = x.CreationTime,
            CreatorId = x.CreatorId,
            LastModificationTime = x.LastModificationTime,
            LastModifierId = x.LastModifierId,
            MaVoucher = x.MaVoucher,
            TieuDe = x.TieuDe,
            MoTa = x.MoTa,
            LoaiGiamGia = x.LoaiGiamGia,
            GiaTriGiam = x.GiaTriGiam,
            GiaTriDonToiThieu = x.GiaTriDonToiThieu,
            GiamToiDa = x.GiamToiDa,
            SoLuong = x.SoLuong,
            SoLuongDaDung = x.SoLuongDaDung,
            NgayBatDau = x.NgayBatDau,
            NgayKetThuc = x.NgayKetThuc,
            CuaHangId = x.CuaHangId,
            TenCuaHang = tenCuaHang ?? (!x.CuaHangId.HasValue ? "Sàn Thương Mại" : null),
            KichHoat = x.KichHoat
        };
    }

    /// <summary>
    /// Kiểm tra tính hợp lệ và số tiền giảm giá của mã voucher
    /// </summary>
    public async Task<KetQuaKiemTraVoucherDto> KiemTraVoucherAsync(KiemTraVoucherInputDto input)
    {
        var (hopLe, soTienGiam, thongBao, voucher) = await _voucherManager.KiemTraVaTinhGiamGiaAsync(
            input.MaVoucher,
            input.TongTienHang,
            input.CuaHangId
        );

        decimal tongSauGiam = Math.Max(0, input.TongTienHang - soTienGiam);
        string? tenShop = null;
        if (voucher?.CuaHangId.HasValue == true)
        {
            var shop = await _cuaHangRepository.FindAsync(voucher.CuaHangId.Value);
            tenShop = shop?.Ten;
        }

        return new KetQuaKiemTraVoucherDto
        {
            HopLe = hopLe,
            SoTienGiam = soTienGiam,
            TongTienSauGiam = tongSauGiam,
            ThongBao = thongBao,
            LaVoucherSan = voucher != null ? !voucher.CuaHangId.HasValue : true,
            CuaHangId = voucher?.CuaHangId,
            Voucher = voucher != null ? MapToDto(voucher, tenShop) : null
        };
    }

    /// <summary>
    /// Lấy danh sách Voucher của toàn Sàn (Platform Vouchers) do Quản trị viên phát hành
    /// </summary>
    public async Task<List<VoucherDto>> GetDanhSachVoucherSanAsync()
    {
        var query = await _voucherRepository.GetQueryableAsync();
        var list = query
            .Where(x => !x.CuaHangId.HasValue)
            .OrderByDescending(x => x.CreationTime)
            .ToList();
        return list.Select(x => MapToDto(x, "Sàn Thương Mại")).ToList();
    }

    /// <summary>
    /// Lấy danh sách Voucher khả dụng của một Gian hàng cụ thể (Shop Vouchers)
    /// </summary>
    public async Task<List<VoucherDto>> GetDanhSachVoucherShopAsync(Guid cuaHangId)
    {
        var now = DateTime.UtcNow;
        var query = await _voucherRepository.GetQueryableAsync();
        var list = query
            .Where(x => x.CuaHangId == cuaHangId && x.KichHoat && x.NgayBatDau <= now && x.NgayKetThuc >= now && x.SoLuongDaDung < x.SoLuong)
            .OrderBy(x => x.GiaTriDonToiThieu)
            .ToList();

        var shop = await _cuaHangRepository.FindAsync(cuaHangId);
        return list.Select(x => MapToDto(x, shop?.Ten)).ToList();
    }

    /// <summary>
    /// Lấy danh sách các voucher đang khả dụng cho đơn hàng để khách bấm chọn nhanh
    /// </summary>
    public async Task<List<VoucherDto>> GetDanhSachVoucherKhaDungAsync(decimal? tongTienHang = null, Guid? cuaHangId = null)
    {
        var now = DateTime.UtcNow;
        var query = await _voucherRepository.GetQueryableAsync();

        var vouchers = query
            .Where(x => x.KichHoat && x.NgayBatDau <= now && x.NgayKetThuc >= now && x.SoLuongDaDung < x.SoLuong)
            .Where(x => !x.CuaHangId.HasValue || (cuaHangId.HasValue && x.CuaHangId == cuaHangId.Value))
            .OrderBy(x => x.GiaTriDonToiThieu)
            .ToList();

        if (tongTienHang.HasValue)
        {
            // Sắp xếp đưa những voucher đủ điều kiện đơn tối thiểu lên đầu
            vouchers = vouchers
                .OrderByDescending(x => tongTienHang.Value >= x.GiaTriDonToiThieu)
                .ThenBy(x => x.GiaTriDonToiThieu)
                .ToList();
        }

        return vouchers.Select(x => MapToDto(x)).ToList();
    }

    /// <summary>
    /// Lấy danh sách toàn bộ voucher (Admin / Seller)
    /// </summary>
    public async Task<List<VoucherDto>> GetDanhSachAsync(Guid? cuaHangId = null)
    {
        var query = await _voucherRepository.GetQueryableAsync();
        if (cuaHangId.HasValue)
        {
            query = query.Where(x => x.CuaHangId == cuaHangId.Value);
        }

        var list = query.OrderByDescending(x => x.CreationTime).ToList();
        var shopIds = list.Where(x => x.CuaHangId.HasValue).Select(x => x.CuaHangId!.Value).Distinct().ToList();
        var shops = await _cuaHangRepository.GetListAsync(x => shopIds.Contains(x.Id));
        var shopDict = shops.ToDictionary(x => x.Id, x => x.Ten);

        return list.Select(x => MapToDto(x, x.CuaHangId.HasValue && shopDict.TryGetValue(x.CuaHangId.Value, out var name) ? name : (!x.CuaHangId.HasValue ? "Sàn Thương Mại" : null))).ToList();
    }

    /// <summary>
    /// Lấy danh sách Voucher của chính gian hàng mình (Seller)
    /// </summary>
    [Authorize]
    public async Task<List<VoucherDto>> GetMyStoreVouchersAsync()
    {
        var currentUserId = CurrentUser.Id;
        if (!currentUserId.HasValue) return new List<VoucherDto>();

        var shop = await _cuaHangRepository.FirstOrDefaultAsync(x => x.ChuSoHuuId == currentUserId.Value);
        if (shop == null) return new List<VoucherDto>();

        return await GetDanhSachAsync(shop.Id);
    }

    /// <summary>
    /// Tạo mới Voucher (Admin tạo voucher Sàn hoặc Chủ shop tạo voucher Shop)
    /// </summary>
    [Authorize]
    public async Task<VoucherDto> CreateAsync(TaoCapNhatVoucherDto input)
    {
        Guid? shopId = input.CuaHangId;
        CuaHang? shop = null;

        if (CurrentUser.Id.HasValue)
        {
            var myShop = await _cuaHangRepository.FirstOrDefaultAsync(x => x.ChuSoHuuId == CurrentUser.Id.Value);
            if (myShop != null)
            {
                // Người dùng hiện tại là Seller -> bắt buộc gán vào Shop của họ
                shopId = myShop.Id;
                shop = myShop;
            }
        }

        if (shopId.HasValue && shop == null)
        {
            shop = await _cuaHangRepository.FindAsync(shopId.Value);
        }

        var normalizedCode = input.MaVoucher.Trim().ToUpperInvariant();

        // Nếu là Voucher của Shop, tự động gắn prefix mã của shop nếu chưa có (Ví dụ: KD_FREESHIP)
        if (shop != null)
        {
            string shopPrefix = "SHOP";
            if (!string.IsNullOrWhiteSpace(shop.Slug))
            {
                var cleanSlug = shop.Slug.Replace("-", "").ToUpperInvariant();
                shopPrefix = cleanSlug.Length > 6 ? cleanSlug.Substring(0, 6) : cleanSlug;
            }
            else if (!string.IsNullOrWhiteSpace(shop.Ten))
            {
                var words = shop.Ten.Trim().Split(new[] { ' ', '-', '_' }, StringSplitOptions.RemoveEmptyEntries);
                shopPrefix = words.Length > 1
                    ? string.Concat(words.Select(w => char.ToUpperInvariant(w[0])))
                    : (shop.Ten.Length > 6 ? shop.Ten.Substring(0, 6).ToUpperInvariant() : shop.Ten.ToUpperInvariant());
            }

            if (!normalizedCode.StartsWith(shopPrefix + "_") && !normalizedCode.StartsWith(shopPrefix))
            {
                normalizedCode = $"{shopPrefix}_{normalizedCode}";
            }
        }

        var existing = await _voucherRepository.FirstOrDefaultAsync(x => x.MaVoucher == normalizedCode);
        if (existing != null)
        {
            throw new UserFriendlyException($"Mã voucher '{normalizedCode}' đã tồn tại trên hệ thống! Vui lòng chọn một mã khác (Ví dụ: {normalizedCode}2).");
        }

        var voucher = new Voucher(
            GuidGenerator.Create(),
            normalizedCode,
            input.TieuDe,
            input.LoaiGiamGia,
            input.GiaTriGiam,
            input.GiaTriDonToiThieu,
            input.GiamToiDa,
            input.SoLuong,
            input.NgayBatDau,
            input.NgayKetThuc,
            shopId,
            input.MoTa
        );

        await _voucherRepository.InsertAsync(voucher);
        return MapToDto(voucher, shop?.Ten);
    }

    [Authorize]
    public async Task<VoucherDto> UpdateAsync(Guid id, TaoCapNhatVoucherDto input)
    {
        var voucher = await _voucherRepository.FindAsync(id);
        if (voucher == null)
        {
            throw new EntityNotFoundException(typeof(Voucher), id);
        }

        voucher.TieuDe = input.TieuDe;
        voucher.MoTa = input.MoTa;
        voucher.LoaiGiamGia = input.LoaiGiamGia;
        voucher.GiaTriGiam = input.GiaTriGiam;
        voucher.GiaTriDonToiThieu = input.GiaTriDonToiThieu;
        voucher.GiamToiDa = input.GiamToiDa;
        voucher.SoLuong = input.SoLuong;
        voucher.NgayBatDau = input.NgayBatDau;
        voucher.NgayKetThuc = input.NgayKetThuc;
        voucher.KichHoat = input.KichHoat;

        await _voucherRepository.UpdateAsync(voucher);
        return MapToDto(voucher);
    }

    [Authorize]
    public async Task<VoucherDto> DoiTrangThaiKichHoatAsync(Guid id)
    {
        var voucher = await _voucherRepository.FindAsync(id);
        if (voucher == null)
        {
            throw new EntityNotFoundException(typeof(Voucher), id);
        }

        voucher.KichHoat = !voucher.KichHoat;
        await _voucherRepository.UpdateAsync(voucher);
        return MapToDto(voucher);
    }

    [Authorize]
    public async Task DeleteAsync(Guid id)
    {
        await _voucherRepository.DeleteAsync(id);
    }
}
