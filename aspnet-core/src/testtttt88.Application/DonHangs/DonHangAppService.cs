using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using testtttt88.Permissions;
using testtttt88.SanPhams;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Domain.Entities;
using Volo.Abp.Domain.Repositories;

namespace testtttt88.DonHangs;

/// <summary>
/// Application Service quản lý Đơn Hàng theo chuẩn DDD của công ty
/// </summary>
public class DonHangAppService : testtttt88AppService, IDonHangAppService
{
    private readonly IRepository<DonHang, Guid> _donHangRepository;
    private readonly IRepository<SanPham, Guid> _sanPhamRepository;
    private readonly DonHangManager _donHangManager;

    public DonHangAppService(
        IRepository<DonHang, Guid> donHangRepository,
        IRepository<SanPham, Guid> sanPhamRepository,
        DonHangManager donHangManager)
    {
        _donHangRepository = donHangRepository;
        _sanPhamRepository = sanPhamRepository;
        _donHangManager = donHangManager;
    }

    /// <summary>
    /// Lấy danh sách toàn bộ đơn hàng kèm chi tiết sản phẩm (Eager Loading WithDetailsAsync)
    /// Yêu cầu quyền quản lý đơn hàng
    /// </summary>
    [Authorize(testtttt88Permissions.DonHangs.Default)]
    public async Task<List<DonHangDto>> GetListAsync()
    {
        var query = await _donHangRepository.WithDetailsAsync(x => x.ChiTiet);
        var orders = await AsyncExecuter.ToListAsync(query.OrderByDescending(x => x.CreationTime));
        return orders.Select(x =>
        {
            var dto = ObjectMapper.Map<DonHang, DonHangDto>(x);
            dto.NgayTao = x.CreationTime;
            return dto;
        }).ToList();
    }

    /// <summary>
    /// Lấy danh sách đơn hàng có phân trang và bộ lọc từ Server (BE #10, FE #1)
    /// </summary>
    [Authorize(testtttt88Permissions.DonHangs.Default)]
    public async Task<PagedResultDto<DonHangDto>> GetPagedListAsync(GetDonHangListFilterDto input)
    {
        var query = await _donHangRepository.WithDetailsAsync(x => x.ChiTiet);

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

        var sorting = string.IsNullOrWhiteSpace(input.Sorting) ? $"{nameof(DonHang.CreationTime)} desc" : input.Sorting;
        var pagedQuery = query.OrderBy(sorting).Skip(input.SkipCount).Take(input.MaxResultCount);

        var orders = await AsyncExecuter.ToListAsync(pagedQuery);
        var dtos = orders.Select(x =>
        {
            var dto = ObjectMapper.Map<DonHang, DonHangDto>(x);
            dto.NgayTao = x.CreationTime;
            return dto;
        }).ToList();

        return new PagedResultDto<DonHangDto>(totalCount, dtos);
    }

    /// <summary>
    /// Lấy chi tiết đơn hàng theo Id
    /// </summary>
    public async Task<DonHangDto> GetAsync(Guid id)
    {
        var query = await _donHangRepository.WithDetailsAsync(x => x.ChiTiet);
        var order = await AsyncExecuter.FirstOrDefaultAsync(query.Where(x => x.Id == id));
        if (order == null)
        {
            throw new EntityNotFoundException(typeof(DonHang), id);
        }

        var dto = ObjectMapper.Map<DonHang, DonHangDto>(order);
        dto.NgayTao = order.CreationTime;
        return dto;
    }

    /// <summary>
    /// Lấy danh sách đơn hàng của khách hàng đang đăng nhập
    /// </summary>
    public async Task<List<DonHangDto>> GetByNguoiDungAsync(string nguoiDungId)
    {
        var query = await _donHangRepository.WithDetailsAsync(x => x.ChiTiet);
        var orders = await AsyncExecuter.ToListAsync(
            query.Where(x => x.NguoiDungId == nguoiDungId).OrderByDescending(x => x.CreationTime)
        );
        return orders.Select(x =>
        {
            var dto = ObjectMapper.Map<DonHang, DonHangDto>(x);
            dto.NgayTao = x.CreationTime;
            return dto;
        }).ToList();
    }

    /// <summary>
    /// Tạo đơn hàng mới: Ủy thác toàn bộ nghiệp vụ kiểm tra & trừ kho, lấy giá server cho DonHangManager (BE #1, BE #2)
    /// </summary>
    public async Task<DonHangDto> CreateAsync(CreateDonHangDto input)
    {
        var items = input.ChiTiet.Select(x => (x.SanPhamId, x.SoLuong)).ToList();

        var createdOrder = await _donHangManager.CreateOrderAsync(
            tenKhachHang: input.TenKhachHang,
            soDienThoai: input.SoDienThoai,
            diaChi: input.DiaChi,
            chiTietInputs: items,
            nguoiDungId: input.NguoiDungId,
            ghiChu: input.GhiChu
        );

        var dto = ObjectMapper.Map<DonHang, DonHangDto>(createdOrder);
        dto.NgayTao = createdOrder.CreationTime;
        return dto;
    }

    /// <summary>
    /// Cập nhật trạng thái đơn hàng (Duyệt đơn, Đang giao, Đã hủy)
    /// </summary>
    [Authorize(testtttt88Permissions.DonHangs.EditStatus)]
    public async Task<DonHangDto> DoiTrangThaiAsync(Guid id, DoiTrangThaiDonHangDto input)
    {
        var updatedOrder = await _donHangManager.ChangeStatusAsync(id, input.TrangThai);
        var dto = ObjectMapper.Map<DonHang, DonHangDto>(updatedOrder);
        dto.NgayTao = updatedOrder.CreationTime;
        return dto;
    }

    /// <summary>
    /// Thống kê Dashboard (Yêu cầu quyền quản lý)
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
}
