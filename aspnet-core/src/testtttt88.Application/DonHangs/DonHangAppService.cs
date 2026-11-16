using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using testtttt88.CuaHangs;
using testtttt88.Permissions;
using testtttt88.SanPhams;
using testtttt88.ThongBaos;
using testtttt88.ViCuaHangs;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Data;
using Volo.Abp.Domain.Entities;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Users;

namespace testtttt88.DonHangs;

/// <summary>
/// Application Service quản lý Đơn Hàng theo chuẩn DDD của công ty
/// Hỗ trợ Multi-vendor Split Order và Escrow Wallet
/// </summary>
public class DonHangAppService : testtttt88AppService, IDonHangAppService
{
    private readonly IRepository<DonHang, Guid> _donHangRepository;
    private readonly IRepository<DonHangTong, Guid> _donHangTongRepository;
    private readonly IRepository<SanPham, Guid> _sanPhamRepository;
    private readonly IRepository<CuaHang, Guid> _cuaHangRepository;
    private readonly IRepository<ThongBao, Guid> _thongBaoRepository;
    private readonly DonHangManager _donHangManager;
    private readonly ViCuaHangManager _viCuaHangManager;

    public DonHangAppService(
        IRepository<DonHang, Guid> donHangRepository,
        IRepository<DonHangTong, Guid> donHangTongRepository,
        IRepository<SanPham, Guid> sanPhamRepository,
        IRepository<CuaHang, Guid> cuaHangRepository,
        IRepository<ThongBao, Guid> thongBaoRepository,
        DonHangManager donHangManager,
        ViCuaHangManager viCuaHangManager)
    {
        _donHangRepository = donHangRepository;
        _donHangTongRepository = donHangTongRepository;
        _sanPhamRepository = sanPhamRepository;
        _cuaHangRepository = cuaHangRepository;
        _thongBaoRepository = thongBaoRepository;
        _donHangManager = donHangManager;
        _viCuaHangManager = viCuaHangManager;
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
            // Không để thông báo làm gián đoạn transaction chính
        }
    }

    private static DonHangDto MapToDto(DonHang x, string? tenCuaHang = null)
    {
        return new DonHangDto
        {
            Id = x.Id,
            CuaHangId = x.CuaHangId,
            TenCuaHang = tenCuaHang,
            DonHangTongId = x.DonHangTongId,
            MaDon = x.MaDon,
            NguoiDungId = x.NguoiDungId,
            TenKhachHang = x.TenKhachHang,
            SoDienThoai = x.SoDienThoai,
            DiaChi = x.DiaChi,
            TienHang = x.TienHang,
            PhiVanChuyen = x.PhiVanChuyen,
            TienHoaHongSan = x.TienHoaHongSan,
            ThucNhanCuaShop = x.ThucNhanCuaShop,
            TongTien = x.TongTien,
            TrangThai = x.TrangThai,
            GhiChu = x.GhiChu,
            NgayTao = x.CreationTime,
            LyDoTraHang = x.LyDoTraHang,
            GhiChuTraHang = x.GhiChuTraHang,
            HinhAnhTraHang = x.HinhAnhTraHang,
            ThoiGianYeuCauTraHang = x.ThoiGianYeuCauTraHang,
            PhanHoiTraHang = x.PhanHoiTraHang,
            ThoiGianXuLyTraHang = x.ThoiGianXuLyTraHang,
            ChiTiet = x.ChiTiet?.Select(c => new ChiTietDonHangDto
            {
                Id = c.Id,
                DonHangId = c.DonHangId,
                SanPhamId = c.SanPhamId,
                TenSanPham = c.TenSanPham,
                DonGia = c.DonGia,
                ThanhTien = c.ThanhTien,
                HinhAnh = c.HinhAnh,
                SoLuong = c.SoLuong
            }).ToList() ?? new List<ChiTietDonHangDto>()
        };
    }

    private async Task<Dictionary<Guid, string>> GetStoreNamesAsync(IEnumerable<Guid> storeIds)
    {
        var distinctIds = storeIds.Where(x => x != Guid.Empty).Distinct().ToList();
        if (!distinctIds.Any()) return new();
        var stores = await _cuaHangRepository.GetListAsync(x => distinctIds.Contains(x.Id));
        return stores.ToDictionary(x => x.Id, x => x.Ten);
    }

    private static readonly HashSet<string> AllowedOrderSortingFields = new(StringComparer.OrdinalIgnoreCase)
    {
        nameof(DonHang.CreationTime),
        nameof(DonHang.TongTien),
        nameof(DonHang.MaDon),
        nameof(DonHang.TrangThai),
        nameof(DonHang.TenKhachHang),
        "NgayTao"
    };

    private static string SanitizeOrderSorting(string? sorting)
    {
        if (string.IsNullOrWhiteSpace(sorting))
        {
            return $"{nameof(DonHang.CreationTime)} desc";
        }

        var parts = sorting.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);
        var field = parts[0];
        var direction = parts.Length > 1 && parts[1].Equals("desc", StringComparison.OrdinalIgnoreCase) ? "desc" : "asc";

        if (AllowedOrderSortingFields.Contains(field))
        {
            if (field.Equals("NgayTao", StringComparison.OrdinalIgnoreCase))
            {
                field = nameof(DonHang.CreationTime);
            }
            return $"{field} {direction}";
        }

        return $"{nameof(DonHang.CreationTime)} desc";
    }

    /// <summary>
    /// Lấy danh sách toàn bộ đơn hàng kèm chi tiết sản phẩm
    /// </summary>
    [Authorize(testtttt88Permissions.DonHangs.Default)]
    public async Task<List<DonHangDto>> GetListAsync()
    {
        var query = await _donHangRepository.WithDetailsAsync(x => x.ChiTiet);
        var orders = await AsyncExecuter.ToListAsync(query.OrderByDescending(x => x.CreationTime));
        var storeDict = await GetStoreNamesAsync(orders.Select(x => x.CuaHangId));
        return orders.Select(x => MapToDto(x, storeDict.TryGetValue(x.CuaHangId, out var name) ? name : null)).ToList();
    }

    /// <summary>
    /// Lấy danh sách đơn hàng có phân trang và bộ lọc từ Server (toàn sàn - Platform Admin)
    /// </summary>
    [Authorize(testtttt88Permissions.DonHangs.Default)]
    public async Task<PagedResultDto<DonHangDto>> GetPagedListAsync(GetDonHangListFilterDto input)
    {
        var query = await _donHangRepository.WithDetailsAsync(x => x.ChiTiet);

        if (input.CuaHangId.HasValue && input.CuaHangId.Value != Guid.Empty)
        {
            query = query.Where(x => x.CuaHangId == input.CuaHangId.Value);
        }

        if (!string.IsNullOrWhiteSpace(input.Filter))
        {
            var keyword = input.Filter.Trim().ToLower();
            query = query.Where(x =>
                x.MaDon.ToLower().Contains(keyword) ||
                x.TenKhachHang.ToLower().Contains(keyword) ||
                x.SoDienThoai.Contains(keyword)
            );
        }

        if (!string.IsNullOrWhiteSpace(input.TrangThai) && input.TrangThai != "all")
        {
            query = query.Where(x => x.TrangThai == input.TrangThai);
        }

        var totalCount = await AsyncExecuter.CountAsync(query);
        var sorting = SanitizeOrderSorting(input.Sorting);
        var pagedQuery = query.OrderBy(sorting).Skip(input.SkipCount).Take(input.MaxResultCount);

        var orders = await AsyncExecuter.ToListAsync(pagedQuery);
        var storeDict = await GetStoreNamesAsync(orders.Select(x => x.CuaHangId));
        var dtos = orders.Select(x => MapToDto(x, storeDict.TryGetValue(x.CuaHangId, out var name) ? name : null)).ToList();

        return new PagedResultDto<DonHangDto>(totalCount, dtos);
    }

    /// <summary>
    /// Lấy danh sách đơn hàng của riêng gian hàng của tôi (Seller Center)
    /// </summary>
    [Authorize]
    public async Task<PagedResultDto<DonHangDto>> GetMyStoreOrdersAsync(GetDonHangListFilterDto input)
    {
        var userId = CurrentUser.GetId();
        var shop = await _cuaHangRepository.FirstOrDefaultAsync(x => x.ChuSoHuuId == userId);
        if (shop == null)
        {
            return new PagedResultDto<DonHangDto>(0, new List<DonHangDto>());
        }

        var query = await _donHangRepository.WithDetailsAsync(x => x.ChiTiet);
        query = query.Where(x => x.CuaHangId == shop.Id);

        if (!string.IsNullOrWhiteSpace(input.Filter))
        {
            var keyword = input.Filter.Trim().ToLower();
            query = query.Where(x =>
                x.MaDon.ToLower().Contains(keyword) ||
                x.TenKhachHang.ToLower().Contains(keyword) ||
                x.SoDienThoai.Contains(keyword)
            );
        }

        if (!string.IsNullOrWhiteSpace(input.TrangThai) && input.TrangThai != "all")
        {
            query = query.Where(x => x.TrangThai == input.TrangThai);
        }

        var totalCount = await AsyncExecuter.CountAsync(query);
        var sorting = SanitizeOrderSorting(input.Sorting);
        var pagedQuery = query.OrderBy(sorting).Skip(input.SkipCount).Take(input.MaxResultCount);

        var orders = await AsyncExecuter.ToListAsync(pagedQuery);
        var dtos = orders.Select(x => MapToDto(x, shop.Ten)).ToList();

        return new PagedResultDto<DonHangDto>(totalCount, dtos);
    }

    /// <summary>
    /// Lấy chi tiết đơn hàng theo Id
    /// </summary>
    [Authorize]
    public async Task<DonHangDto> GetAsync(Guid id)
    {
        var query = await _donHangRepository.WithDetailsAsync(x => x.ChiTiet);
        var order = await AsyncExecuter.FirstOrDefaultAsync(query.Where(x => x.Id == id));
        if (order == null)
        {
            throw new EntityNotFoundException(typeof(DonHang), id);
        }

        var hasAdminPermission = await AuthorizationService.IsGrantedAsync(testtttt88Permissions.DonHangs.Default);
        var currentUserIdStr = CurrentUser.Id?.ToString();

        // Kiểm tra quyền: Admin, hoặc chính khách mua, hoặc chủ gian hàng
        bool isStoreOwner = false;
        if (CurrentUser.Id.HasValue && order.CuaHangId != Guid.Empty)
        {
            var shop = await _cuaHangRepository.FindAsync(order.CuaHangId);
            isStoreOwner = shop != null && shop.ChuSoHuuId == CurrentUser.GetId();
        }

        if (!hasAdminPermission && !isStoreOwner && (string.IsNullOrEmpty(currentUserIdStr) || order.NguoiDungId != currentUserIdStr))
        {
            throw new BusinessException(testtttt88DomainErrorCodes.KhongCoQuyenTruyCapDonHang);
        }

        var store = order.CuaHangId != Guid.Empty ? await _cuaHangRepository.FindAsync(order.CuaHangId) : null;
        return MapToDto(order, store?.Ten);
    }

    /// <summary>
    /// Lấy danh sách đơn hàng con của khách hàng đang đăng nhập
    /// </summary>
    [Authorize]
    public async Task<List<DonHangDto>> GetByNguoiDungAsync(string? nguoiDungId = null)
    {
        var currentUserIdStr = CurrentUser.Id?.ToString();
        var hasAdminPermission = await AuthorizationService.IsGrantedAsync(testtttt88Permissions.DonHangs.Default);

        var targetUserId = hasAdminPermission && !string.IsNullOrWhiteSpace(nguoiDungId)
            ? nguoiDungId
            : currentUserIdStr;

        if (string.IsNullOrWhiteSpace(targetUserId))
        {
            return new List<DonHangDto>();
        }

        var query = await _donHangRepository.WithDetailsAsync(x => x.ChiTiet);
        var orders = await AsyncExecuter.ToListAsync(
            query.Where(x => x.NguoiDungId == targetUserId).OrderByDescending(x => x.CreationTime)
        );

        var storeDict = await GetStoreNamesAsync(orders.Select(x => x.CuaHangId));
        return orders.Select(x => MapToDto(x, storeDict.TryGetValue(x.CuaHangId, out var name) ? name : null)).ToList();
    }

    /// <summary>
    /// Lấy danh sách Đơn Hàng Tổng (Master Orders) của Buyer
    /// </summary>
    [Authorize]
    public async Task<List<DonHangTongDto>> GetDonHangTongByNguoiDungAsync(string? nguoiDungId = null)
    {
        var currentUserIdStr = CurrentUser.Id?.ToString();
        var hasAdminPermission = await AuthorizationService.IsGrantedAsync(testtttt88Permissions.DonHangs.Default);

        var targetUserId = hasAdminPermission && !string.IsNullOrWhiteSpace(nguoiDungId)
            ? nguoiDungId
            : currentUserIdStr;

        if (string.IsNullOrWhiteSpace(targetUserId))
        {
            return new List<DonHangTongDto>();
        }

        var masterOrders = await _donHangTongRepository.GetListAsync(x => x.NguoiDungId == targetUserId);
        var masterIds = masterOrders.Select(x => x.Id).ToList();

        var querySub = await _donHangRepository.WithDetailsAsync(x => x.ChiTiet);
        var subOrders = await AsyncExecuter.ToListAsync(querySub.Where(x => x.DonHangTongId.HasValue && masterIds.Contains(x.DonHangTongId.Value)));

        var storeDict = await GetStoreNamesAsync(subOrders.Select(x => x.CuaHangId));

        var result = new List<DonHangTongDto>();
        foreach (var master in masterOrders.OrderByDescending(x => x.CreationTime))
        {
            var children = subOrders.Where(x => x.DonHangTongId == master.Id)
                .Select(x => MapToDto(x, storeDict.TryGetValue(x.CuaHangId, out var name) ? name : null))
                .ToList();

            result.Add(new DonHangTongDto
            {
                Id = master.Id,
                MaDonTong = master.MaDonTong,
                NguoiDungId = master.NguoiDungId,
                TenKhachHang = master.TenKhachHang,
                SoDienThoai = master.SoDienThoai,
                DiaChi = master.DiaChi,
                GhiChu = master.GhiChu,
                TongTien = master.TongTien,
                PhuongThucThanhToan = master.PhuongThucThanhToan,
                TrangThai = master.TrangThai,
                DonHangCons = children
            });
        }

        return result;
    }

    /// <summary>
    /// Tạo Đơn Hàng Tổng và Tự động Chia Thành Các Đơn Hàng Con Theo Từng Shop (Split Order)
    /// Đưa tiền vào Escrow tạm giữ của từng shop
    /// </summary>
    public async Task<DonHangTongDto> TaoDonHangTongAsync(CreateDonHangDto input)
    {
        if (CurrentUser.IsInRole("admin"))
        {
            throw new UserFriendlyException("Tài khoản Quản trị viên sàn (Admin) không được phép đặt mua hàng! Vui lòng đăng nhập hoặc tạo tài khoản Người Mua để mua sắm.");
        }

        if (input.ChiTiet == null || !input.ChiTiet.Any())
        {
            throw new BusinessException(testtttt88DomainErrorCodes.DonHangPhaiCoSanPham);
        }

        var realUserId = CurrentUser.IsAuthenticated ? CurrentUser.Id?.ToString() : null;

        // Gom các chi tiết theo Product ID và kiểm tra số lượng
        var groupedInputs = input.ChiTiet
            .GroupBy(x => x.SanPhamId)
            .Select(g => (sanPhamId: g.Key, soLuong: g.Sum(x => x.SoLuong)))
            .ToList();

        // Lấy thông tin các sản phẩm
        var sanPhamIds = groupedInputs.Select(x => x.sanPhamId).ToList();
        var sanPhams = await _sanPhamRepository.GetListAsync(x => sanPhamIds.Contains(x.Id));

        if (sanPhams.Count != sanPhamIds.Count)
        {
            throw new UserFriendlyException("Một hoặc nhiều sản phẩm trong giỏ hàng không tồn tại!");
        }

        // Lấy danh sách default shop nếu sản phẩm chưa gán shop
        var defaultShop = await _cuaHangRepository.FirstOrDefaultAsync();
        var defaultShopId = defaultShop?.Id ?? Guid.Empty;

        // Phân loại sản phẩm theo Shop
        var sanPhamTheoShop = new Dictionary<Guid, List<(SanPham sp, int qty)>>();
        foreach (var item in groupedInputs)
        {
            var sp = sanPhams.First(x => x.Id == item.sanPhamId);
            var shopId = sp.CuaHangId != Guid.Empty ? sp.CuaHangId : defaultShopId;

            if (!sanPhamTheoShop.ContainsKey(shopId))
            {
                sanPhamTheoShop[shopId] = new List<(SanPham, int)>();
            }
            sanPhamTheoShop[shopId].Add((sp, item.soLuong));
        }

        // Tạo mã đơn tổng
        var maDonTong = $"MALL{Clock.Now:yyMMddHHmmss}{Random.Shared.Next(100, 999)}";
        var donHangTong = new DonHangTong(
            GuidGenerator.Create(),
            maDonTong,
            input.TenKhachHang,
            input.SoDienThoai,
            input.DiaChi,
            tongTien: 0,
            nguoiDungId: realUserId,
            ghiChu: input.GhiChu
        );

        decimal tongTienTatCa = 0;
        var createdSubOrders = new List<DonHang>();

        // Duyệt từng shop và tạo Sub-Order
        foreach (var (shopId, spList) in sanPhamTheoShop)
        {
            var shop = await _cuaHangRepository.FindAsync(shopId);
            decimal hoaHongShop = shop?.PhanTramHoaHong ?? 5.0m;

            string maDonCon = $"DH{Clock.Now:yyMMddHHmmss}{Random.Shared.Next(100, 999)}";
            var donHangCon = new DonHang(
                GuidGenerator.Create(),
                maDonCon,
                input.TenKhachHang,
                input.SoDienThoai,
                input.DiaChi,
                tongTien: 0,
                nguoiDungId: realUserId,
                ghiChu: input.GhiChu,
                cuaHangId: shopId,
                donHangTongId: donHangTong.Id,
                phiVanChuyen: 0,
                phanTramHoaHong: hoaHongShop
            )
            {
                NgayTao = Clock.Now
            };

            foreach (var (sp, qty) in spList)
            {
                // Trừ kho
                sp.GiamSoLuongTon(qty);
                await _sanPhamRepository.UpdateAsync(sp);

                // Thêm chi tiết
                donHangCon.ThemChiTiet(
                    GuidGenerator.Create(),
                    sp.Id,
                    sp.Ten,
                    qty,
                    sp.Gia,
                    sp.HinhAnh
                );
            }

            var insertedSub = await _donHangRepository.InsertAsync(donHangCon);
            createdSubOrders.Add(insertedSub);
            tongTienTatCa += donHangCon.TongTien;

            // Ghi nhận vào ví Escrow của Shop
            if (shopId != Guid.Empty)
            {
                await _viCuaHangManager.GhiNhanDonHangMoiAsync(shopId, donHangCon.TongTien, donHangCon.MaDon);

                // Bắn thông báo cho Seller
                await TaoThongBaoAsync(
                    ThongBao.DoiTuongSeller,
                    null,
                    shopId,
                    $"📦 Đơn hàng mới #{donHangCon.MaDon}",
                    $"Khách hàng {donHangCon.TenKhachHang} vừa đặt đơn trị giá {donHangCon.TongTien:N0}đ. Vui lòng chuẩn bị và đóng gói sản phẩm.",
                    ThongBao.LoaiDonHang,
                    "/seller/don-hang"
                );
            }

            // Bắn thông báo cho Buyer
            if (Guid.TryParse(realUserId, out var bGuid))
            {
                await TaoThongBaoAsync(
                    ThongBao.DoiTuongBuyer,
                    bGuid,
                    null,
                    $"🎉 Đặt hàng thành công #{donHangCon.MaDon}",
                    $"Đơn hàng của bạn đã gửi đến Shop {shop?.Ten ?? "KD Shop"}. Bạn có thể theo dõi hành trình đơn hàng tại mục Đơn hàng của tôi.",
                    ThongBao.LoaiDonHang,
                    "/don-hang-cua-toi"
                );
            }
        }

        donHangTong.TongTien = tongTienTatCa;
        donHangTong.TrangThai = DonHangTong.TTDangXuLy;
        await _donHangTongRepository.InsertAsync(donHangTong);

        var storeDict = await GetStoreNamesAsync(createdSubOrders.Select(x => x.CuaHangId));
        return new DonHangTongDto
        {
            Id = donHangTong.Id,
            MaDonTong = donHangTong.MaDonTong,
            NguoiDungId = donHangTong.NguoiDungId,
            TenKhachHang = donHangTong.TenKhachHang,
            SoDienThoai = donHangTong.SoDienThoai,
            DiaChi = donHangTong.DiaChi,
            GhiChu = donHangTong.GhiChu,
            TongTien = donHangTong.TongTien,
            PhuongThucThanhToan = donHangTong.PhuongThucThanhToan,
            TrangThai = donHangTong.TrangThai,
            DonHangCons = createdSubOrders.Select(x => MapToDto(x, storeDict.TryGetValue(x.CuaHangId, out var name) ? name : null)).ToList()
        };
    }

    /// <summary>
    /// Tạo đơn hàng (tương thích backward API)
    /// </summary>
    public async Task<DonHangDto> CreateAsync(CreateDonHangDto input)
    {
        var masterResult = await TaoDonHangTongAsync(input);
        return masterResult.DonHangCons.First();
    }

    /// <summary>
    /// Thay đổi trạng thái đơn hàng (Duyệt đơn, Đang giao, Hoàn thành, Hủy)
    /// Tự động cập nhật Escrow Wallet (Quyết toán số dư khả dụng hoặc Hoàn tiền)
    /// </summary>
    [Authorize]
    public async Task<DonHangDto> DoiTrangThaiAsync(Guid id, DoiTrangThaiDonHangDto input)
    {
        var query = await _donHangRepository.WithDetailsAsync(x => x.ChiTiet);
        var donHang = await AsyncExecuter.FirstOrDefaultAsync(query.Where(x => x.Id == id));
        if (donHang == null)
        {
            throw new EntityNotFoundException(typeof(DonHang), id);
        }

        // Quyền kiểm tra: Admin sàn hoặc Chủ gian hàng
        var hasAdminPermission = await AuthorizationService.IsGrantedAsync(testtttt88Permissions.DonHangs.EditStatus);
        bool isStoreOwner = false;
        if (CurrentUser.Id.HasValue && donHang.CuaHangId != Guid.Empty)
        {
            var shop = await _cuaHangRepository.FindAsync(donHang.CuaHangId);
            isStoreOwner = shop != null && shop.ChuSoHuuId == CurrentUser.GetId();
        }

        if (!hasAdminPermission && !isStoreOwner)
        {
            throw new BusinessException(testtttt88DomainErrorCodes.KhongCoQuyenTruyCapDonHang);
        }

        var trangThaiCu = donHang.TrangThai;
        var trangThaiMoi = input.TrangThai;

        donHang.ChuyenTrangThai(trangThaiMoi);

        Guid? buyerId = Guid.TryParse(donHang.NguoiDungId, out var bId) ? bId : null;

        // Xử lý biến động ví và tồn kho + bắn thông báo chuyên biệt
        if (trangThaiMoi == DonHang.TrangThaiHoanThanh && trangThaiCu != DonHang.TrangThaiHoanThanh)
        {
            // Quyết toán tiền từ Escrow sang Số Dư Khả Dụng
            if (donHang.CuaHangId != Guid.Empty)
            {
                await _viCuaHangManager.QuyetToanDonHangAsync(
                    donHang.CuaHangId,
                    donHang.ThucNhanCuaShop,
                    donHang.TongTien,
                    donHang.MaDon
                );

                // Thông báo Seller: Tiền về ví
                await TaoThongBaoAsync(
                    ThongBao.DoiTuongSeller,
                    null,
                    donHang.CuaHangId,
                    $"💰 Tiền đã về ví: +{donHang.ThucNhanCuaShop:N0}đ",
                    $"Đơn hàng #{donHang.MaDon} đã giao thành công. Doanh thu thực nhận {donHang.ThucNhanCuaShop:N0}đ đã được cộng vào Ví Khả Dụng.",
                    ThongBao.LoaiViTien,
                    "/seller/vi-tien"
                );
            }

            // Thông báo Buyer: Giao hàng thành công + Mời đánh giá
            if (buyerId.HasValue)
            {
                await TaoThongBaoAsync(
                    ThongBao.DoiTuongBuyer,
                    buyerId.Value,
                    null,
                    $"🎉 Giao thành công! Mời đánh giá đơn #{donHang.MaDon}",
                    $"Kiện hàng đơn #{donHang.MaDon} đã được giao thành công. Bạn hãy chia sẻ đánh giá chất lượng sản phẩm để nhận thêm xu ưu đãi nhé!",
                    ThongBao.LoaiDanhGia,
                    "/don-hang-cua-toi"
                );
            }
        }
        else if (trangThaiMoi == DonHang.TrangThaiDangGiao && trangThaiCu != DonHang.TrangThaiDangGiao)
        {
            // Thông báo Buyer: Đang vận chuyển
            if (buyerId.HasValue)
            {
                await TaoThongBaoAsync(
                    ThongBao.DoiTuongBuyer,
                    buyerId.Value,
                    null,
                    $"🚚 Đơn hàng #{donHang.MaDon} đang trên đường giao!",
                    $"Shop đã bàn giao kiện hàng cho đơn vị vận chuyển. Đơn hàng đang trên đường giao tới {donHang.DiaChi}.",
                    ThongBao.LoaiDonHang,
                    "/don-hang-cua-toi"
                );
            }
        }
        else if (trangThaiMoi == DonHang.TrangThaiDaHuy && trangThaiCu != DonHang.TrangThaiDaHuy)
        {
            // Trả lại kho
            foreach (var item in donHang.ChiTiet)
            {
                var sanPham = await _sanPhamRepository.FindAsync(item.SanPhamId);
                if (sanPham != null)
                {
                    sanPham.TangSoLuongTon(item.SoLuong);
                    await _sanPhamRepository.UpdateAsync(sanPham);
                }
            }

            // Hủy tiền tạm giữ Escrow
            if (donHang.CuaHangId != Guid.Empty)
            {
                await _viCuaHangManager.HuyDonTamGiuAsync(
                    donHang.CuaHangId,
                    donHang.TongTien,
                    donHang.MaDon
                );
            }

            // Thông báo Buyer: Đơn bị hủy
            if (buyerId.HasValue)
            {
                await TaoThongBaoAsync(
                    ThongBao.DoiTuongBuyer,
                    buyerId.Value,
                    null,
                    $"❌ Đơn hàng #{donHang.MaDon} đã bị hủy",
                    $"Đơn hàng #{donHang.MaDon} của bạn đã bị hủy.",
                    ThongBao.LoaiDonHang,
                    "/don-hang-cua-toi"
                );
            }
        }

        await _donHangRepository.UpdateAsync(donHang);
        var shopEntity = donHang.CuaHangId != Guid.Empty ? await _cuaHangRepository.FindAsync(donHang.CuaHangId) : null;
        return MapToDto(donHang, shopEntity?.Ten);
    }

    /// <summary>
    /// Khách hàng gửi yêu cầu trả hàng / hoàn tiền cho đơn hàng
    /// </summary>
    [Authorize]
    public async Task<DonHangDto> YeuCauTraHangAsync(Guid id, YeuCauTraHangDto input)
    {
        var query = await _donHangRepository.WithDetailsAsync(x => x.ChiTiet);
        var donHang = await AsyncExecuter.FirstOrDefaultAsync(query.Where(x => x.Id == id));
        if (donHang == null)
        {
            throw new EntityNotFoundException(typeof(DonHang), id);
        }

        var userId = CurrentUser.GetId().ToString();
        if (!string.Equals(donHang.NguoiDungId, userId, StringComparison.OrdinalIgnoreCase))
        {
            throw new UserFriendlyException("Bạn chỉ có thể yêu cầu trả hàng cho đơn hàng của chính mình!");
        }

        if (donHang.TrangThai != DonHang.TrangThaiDangGiao && donHang.TrangThai != DonHang.TrangThaiHoanThanh)
        {
            throw new UserFriendlyException("Chỉ đơn hàng đang vận chuyển hoặc đã nhận hàng mới có thể yêu cầu trả hàng/hoàn tiền!");
        }

        donHang.GuiYeuCauTraHang(input.LyDoTraHang, input.GhiChuTraHang, input.HinhAnhTraHang);
        await _donHangRepository.UpdateAsync(donHang);

        Guid? bUid = Guid.TryParse(donHang.NguoiDungId, out var bGuidParsed) ? bGuidParsed : null;

        // Thông báo Buyer: Đã ghi nhận yêu cầu hoàn trả
        if (bUid.HasValue)
        {
            await TaoThongBaoAsync(
                ThongBao.DoiTuongBuyer,
                bUid.Value,
                null,
                $"⏳ Đã gửi yêu cầu trả hàng đơn #{donHang.MaDon}",
                $"Yêu cầu hoàn trả với lý do: '{input.LyDoTraHang}' đã được chuyển đến Người bán. Vui lòng chờ phản hồi từ Shop.",
                ThongBao.LoaiHoanTien,
                "/don-hang-cua-toi"
            );
        }

        // Thông báo Seller: Có yêu cầu hoàn trả cần xử lý
        if (donHang.CuaHangId != Guid.Empty)
        {
            await TaoThongBaoAsync(
                ThongBao.DoiTuongSeller,
                null,
                donHang.CuaHangId,
                $"⚠️ Yêu cầu hoàn trả mới cho đơn #{donHang.MaDon}",
                $"Khách hàng vừa gửi yêu cầu hoàn trả cho đơn #{donHang.MaDon}. Lý do: '{input.LyDoTraHang}'. Vui lòng xử lý.",
                ThongBao.LoaiHoanTien,
                "/seller/don-hang"
            );
        }

        var shop = donHang.CuaHangId != Guid.Empty ? await _cuaHangRepository.FindAsync(donHang.CuaHangId) : null;
        return MapToDto(donHang, shop?.Ten);
    }

    /// <summary>
    /// Chủ shop hoặc Platform Admin phê duyệt hoặc từ chối yêu cầu trả hàng / hoàn tiền
    /// </summary>
    [Authorize]
    public async Task<DonHangDto> XuLyTraHangAsync(Guid id, XuLyTraHangDto input)
    {
        var query = await _donHangRepository.WithDetailsAsync(x => x.ChiTiet);
        var donHang = await AsyncExecuter.FirstOrDefaultAsync(query.Where(x => x.Id == id));
        if (donHang == null)
        {
            throw new EntityNotFoundException(typeof(DonHang), id);
        }

        var hasAdminPermission = await AuthorizationService.IsGrantedAsync(testtttt88Permissions.DonHangs.EditStatus);
        bool isStoreOwner = false;
        if (CurrentUser.Id.HasValue && donHang.CuaHangId != Guid.Empty)
        {
            var shop = await _cuaHangRepository.FindAsync(donHang.CuaHangId);
            isStoreOwner = shop != null && shop.ChuSoHuuId == CurrentUser.GetId();
        }

        if (!hasAdminPermission && !isStoreOwner)
        {
            throw new BusinessException(testtttt88DomainErrorCodes.KhongCoQuyenTruyCapDonHang);
        }

        if (donHang.TrangThai != DonHang.TrangThaiYeuCauTraHang)
        {
            throw new UserFriendlyException("Đơn hàng hiện không có yêu cầu trả hàng đang chờ xử lý!");
        }

        donHang.XuLyTraHang(input.DongY, input.PhanHoi);

        if (input.DongY)
        {
            // 1. Trả lại tồn kho cho các sản phẩm trong đơn
            foreach (var item in donHang.ChiTiet)
            {
                var sanPham = await _sanPhamRepository.FindAsync(item.SanPhamId);
                if (sanPham != null)
                {
                    sanPham.TangSoLuongTon(item.SoLuong);
                    await _sanPhamRepository.UpdateAsync(sanPham);
                }
            }

            // 2. Trừ tiền hoàn trả từ ví Shop
            if (donHang.CuaHangId != Guid.Empty)
            {
                await _viCuaHangManager.HoanTienDonHangAsync(
                    donHang.CuaHangId,
                    donHang.ThucNhanCuaShop,
                    donHang.TongTien,
                    donHang.MaDon,
                    daQuyetToan: true
                );
            }
        }

        await _donHangRepository.UpdateAsync(donHang);

        // Thông báo phản hồi hoàn trả cho Buyer
        Guid? bUidProc = Guid.TryParse(donHang.NguoiDungId, out var bGuidProcParsed) ? bGuidProcParsed : null;
        if (bUidProc.HasValue)
        {
            if (input.DongY)
            {
                await TaoThongBaoAsync(
                    ThongBao.DoiTuongBuyer,
                    bUidProc.Value,
                    null,
                    $"✅ Shop đã chấp thuận yêu cầu hoàn tiền #{donHang.MaDon}",
                    $"Yêu cầu trả hàng cho đơn #{donHang.MaDon} đã được Shop đồng ý hoàn tiền. Phản hồi: '{input.PhanHoi}'.",
                    ThongBao.LoaiHoanTien,
                    "/don-hang-cua-toi"
                );
            }
            else
            {
                await TaoThongBaoAsync(
                    ThongBao.DoiTuongBuyer,
                    bUidProc.Value,
                    null,
                    $"❌ Yêu cầu trả hàng #{donHang.MaDon} đã bị từ chối",
                    $"Shop đã từ chối yêu cầu trả hàng của bạn. Lý do phản hồi từ Shop: '{input.PhanHoi}'.",
                    ThongBao.LoaiHoanTien,
                    "/don-hang-cua-toi"
                );
            }
        }

        var shopEntity = donHang.CuaHangId != Guid.Empty ? await _cuaHangRepository.FindAsync(donHang.CuaHangId) : null;
        return MapToDto(donHang, shopEntity?.Ten);
    }

    /// <summary>
    /// Thống kê Dashboard (Platform Admin)
    /// </summary>
    [Authorize(testtttt88Permissions.DonHangs.Default)]
    public async Task<ThongKeDashboardDto> GetThongKeDashboardAsync()
    {
        var totalOrders = await _donHangRepository.GetCountAsync();
        var totalProducts = await _sanPhamRepository.GetCountAsync();
        var outOfStockCount = await _sanPhamRepository.CountAsync(x => x.SoLuongTon <= 0);

        var queryOrders = await _donHangRepository.GetQueryableAsync();
        var completedOrders = queryOrders.Where(x => x.TrangThai == DonHang.TrangThaiHoanThanh);
        var totalRevenue = await AsyncExecuter.SumAsync(completedOrders, x => x.TongTien);

        return new ThongKeDashboardDto
        {
            TongDonHang = (int)totalOrders,
            TongSanPham = (int)totalProducts,
            SanPhamHetHang = (int)outOfStockCount,
            TongDoanhThu = totalRevenue
        };
    }

    /// <summary>
    /// Thống kê Dashboard cho Seller Center (Shop của tôi)
    /// </summary>
    [Authorize]
    public async Task<ThongKeDashboardDto> GetThongKeMyStoreAsync()
    {
        var userId = CurrentUser.GetId();
        var shop = await _cuaHangRepository.FirstOrDefaultAsync(x => x.ChuSoHuuId == userId);
        if (shop == null)
        {
            return new ThongKeDashboardDto();
        }

        var totalProducts = await _sanPhamRepository.CountAsync(x => x.CuaHangId == shop.Id);
        var outOfStockCount = await _sanPhamRepository.CountAsync(x => x.CuaHangId == shop.Id && x.SoLuongTon <= 0);

        var totalOrders = await _donHangRepository.CountAsync(x => x.CuaHangId == shop.Id);
        var queryOrders = await _donHangRepository.GetQueryableAsync();
        var completedOrders = queryOrders.Where(x => x.CuaHangId == shop.Id && x.TrangThai == DonHang.TrangThaiHoanThanh);
        var totalRevenue = await AsyncExecuter.SumAsync(completedOrders, x => x.ThucNhanCuaShop);

        return new ThongKeDashboardDto
        {
            TongDonHang = (int)totalOrders,
            TongSanPham = (int)totalProducts,
            SanPhamHetHang = (int)outOfStockCount,
            TongDoanhThu = totalRevenue
        };
    }
}
