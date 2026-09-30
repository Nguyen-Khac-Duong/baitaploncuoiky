using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using testtttt88.Permissions;
using testtttt88.SanPhams;
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
    /// </summary>
    public async Task<List<DonHangDto>> GetListAsync()
    {
        var query = await _donHangRepository.WithDetailsAsync(x => x.ChiTiet);
        var orders = await AsyncExecuter.ToListAsync(query.OrderByDescending(x => x.CreationTime));
        return orders.Select(x => ObjectMapper.Map<DonHang, DonHangDto>(x)).ToList();
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

        return ObjectMapper.Map<DonHang, DonHangDto>(order);
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
        return orders.Select(x => ObjectMapper.Map<DonHang, DonHangDto>(x)).ToList();
    }

    /// <summary>
    /// Tạo đơn hàng mới: Ủy thác toàn bộ nghiệp vụ kiểm tra & trừ kho cho DonHangManager
    /// </summary>
    public async Task<DonHangDto> CreateAsync(CreateDonHangDto input)
    {
        var items = input.ChiTiet.Select(x => (
            x.SanPhamId,
            x.TenSanPham,
            x.SoLuong,
            x.DonGia,
            x.HinhAnh
        )).ToList();

        var createdOrder = await _donHangManager.CreateOrderAsync(
            tenKhachHang: input.TenKhachHang,
            soDienThoai: input.SoDienThoai,
            diaChi: input.DiaChi,
            chiTietItems: items,
            nguoiDungId: input.NguoiDungId,
            ghiChu: input.GhiChu
        );

        return ObjectMapper.Map<DonHang, DonHangDto>(createdOrder);
    }

    /// <summary>
    /// Cập nhật trạng thái đơn hàng (Duyệt đơn, Đang giao, Đã hủy)
    /// </summary>
    [Authorize(testtttt88Permissions.DonHangs.EditStatus)]
    public async Task<DonHangDto> DoiTrangThaiAsync(Guid id, DoiTrangThaiDonHangDto input)
    {
        var updatedOrder = await _donHangManager.ChangeStatusAsync(id, input.TrangThai);
        return ObjectMapper.Map<DonHang, DonHangDto>(updatedOrder);
    }

    /// <summary>
    /// Thống kê Dashboard
    /// </summary>
    public async Task<ThongKeDashboardDto> GetThongKeDashboardAsync()
    {
        var totalOrders = await _donHangRepository.GetCountAsync();
        var totalProducts = await _sanPhamRepository.GetCountAsync();
        var outOfStockCount = await _sanPhamRepository.CountAsync(x => x.SoLuongTon <= 0);

        var queryOrders = await _donHangRepository.GetQueryableAsync();
        var completedOrders = queryOrders.Where(x => x.TrangThai == "hoan_thanh" || x.TrangThai == "da_giao");
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
