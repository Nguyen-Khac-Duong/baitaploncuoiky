using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using testtttt88.SanPhams;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Guids;

namespace testtttt88.DonHangs;

public class DonHangAppService : ApplicationService, IDonHangAppService
{
    private readonly IRepository<DonHang, Guid> _donHangRepository;
    private readonly IRepository<SanPham, Guid> _sanPhamRepository;
    private readonly IGuidGenerator _guidGenerator;

    public DonHangAppService(
        IRepository<DonHang, Guid> donHangRepository,
        IRepository<SanPham, Guid> sanPhamRepository,
        IGuidGenerator guidGenerator)
    {
        _donHangRepository = donHangRepository;
        _sanPhamRepository = sanPhamRepository;
        _guidGenerator = guidGenerator;
    }

    public async Task<List<DonHangDto>> GetListAsync()
    {
        var query = await _donHangRepository.WithDetailsAsync(x => x.ChiTiet);
        var orders = await AsyncExecuter.ToListAsync(query.OrderByDescending(x => x.CreationTime));
        return orders.Select(MapToDto).ToList();
    }

    public async Task<DonHangDto> GetAsync(Guid id)
    {
        var query = await _donHangRepository.WithDetailsAsync(x => x.ChiTiet);
        var order = await AsyncExecuter.FirstOrDefaultAsync(query.Where(x => x.Id == id));
        if (order == null)
        {
            throw new Volo.Abp.UserFriendlyException("Không tìm thấy đơn hàng!");
        }

        return MapToDto(order);
    }

    public async Task<List<DonHangDto>> GetByNguoiDungAsync(string nguoiDungId)
    {
        var query = await _donHangRepository.WithDetailsAsync(x => x.ChiTiet);
        var orders = await AsyncExecuter.ToListAsync(
            query.Where(x => x.NguoiDungId == nguoiDungId).OrderByDescending(x => x.CreationTime)
        );
        return orders.Select(MapToDto).ToList();
    }

    public async Task<DonHangDto> CreateAsync(CreateDonHangDto input)
    {
        if (input.ChiTiet == null || input.ChiTiet.Count == 0)
        {
            throw new Volo.Abp.UserFriendlyException("Đơn hàng phải có ít nhất một sản phẩm!");
        }

        var maDon = "DH" + new Random().Next(1000, 9999);
        var tongTien = input.ChiTiet.Sum(c => c.ThanhTien > 0 ? c.ThanhTien : c.DonGia * c.SoLuong);

        var donHang = new DonHang(
            _guidGenerator.Create(),
            maDon,
            input.TenKhachHang,
            input.SoDienThoai,
            input.DiaChi,
            tongTien,
            input.NguoiDungId,
            input.GhiChu,
            "cho_xu_ly"
        );

        foreach (var item in input.ChiTiet)
        {
            var chiTiet = new ChiTietDonHang(
                _guidGenerator.Create(),
                donHang.Id,
                item.SanPhamId,
                item.TenSanPham,
                item.SoLuong,
                item.DonGia,
                item.ThanhTien > 0 ? item.ThanhTien : item.DonGia * item.SoLuong,
                item.HinhAnh
            );
            donHang.ChiTiet.Add(chiTiet);

            // Giảm tồn kho sản phẩm trong database
            if (item.SanPhamId != Guid.Empty)
            {
                var sanPham = await _sanPhamRepository.FindAsync(item.SanPhamId);
                if (sanPham != null)
                {
                    sanPham.SoLuongTon = Math.Max(0, sanPham.SoLuongTon - item.SoLuong);
                    await _sanPhamRepository.UpdateAsync(sanPham);
                }
            }
        }

        await _donHangRepository.InsertAsync(donHang, autoSave: true);
        return MapToDto(donHang);
    }

    public async Task<DonHangDto> DoiTrangThaiAsync(Guid id, DoiTrangThaiDonHangDto input)
    {
        var query = await _donHangRepository.WithDetailsAsync(x => x.ChiTiet);
        var order = await AsyncExecuter.FirstOrDefaultAsync(query.Where(x => x.Id == id));
        if (order == null)
        {
            throw new Volo.Abp.UserFriendlyException("Không tìm thấy đơn hàng!");
        }

        order.TrangThai = input.TrangThai;
        await _donHangRepository.UpdateAsync(order, autoSave: true);
        return MapToDto(order);
    }

    public async Task<ThongKeDashboardDto> GetThongKeDashboardAsync()
    {
        var spQuery = await _sanPhamRepository.GetQueryableAsync();
        var tongSanPham = await AsyncExecuter.CountAsync(spQuery);
        var sanPhamHetHang = await AsyncExecuter.CountAsync(spQuery.Where(sp => sp.SoLuongTon <= 0));

        var dhQuery = await _donHangRepository.GetQueryableAsync();
        var tongDonHang = await AsyncExecuter.CountAsync(dhQuery);
        var ordersCompleted = dhQuery.Where(dh => dh.TrangThai == "hoan_thanh" || dh.TrangThai == "dang_giao");
        var ordersList = await AsyncExecuter.ToListAsync(ordersCompleted);
        var tongDoanhThu = ordersList.Sum(dh => dh.TongTien);

        return new ThongKeDashboardDto
        {
            TongSanPham = tongSanPham,
            TongDonHang = tongDonHang,
            TongDoanhThu = tongDoanhThu,
            SanPhamHetHang = sanPhamHetHang
        };
    }

    private static DonHangDto MapToDto(DonHang entity)
    {
        return new DonHangDto
        {
            Id = entity.Id,
            MaDon = entity.MaDon,
            NguoiDungId = entity.NguoiDungId,
            TenKhachHang = entity.TenKhachHang,
            SoDienThoai = entity.SoDienThoai,
            DiaChi = entity.DiaChi,
            GhiChu = entity.GhiChu,
            TongTien = entity.TongTien,
            TrangThai = entity.TrangThai,
            NgayTao = entity.NgayTao,
            CreationTime = entity.CreationTime,
            CreatorId = entity.CreatorId,
            LastModificationTime = entity.LastModificationTime,
            LastModifierId = entity.LastModifierId,
            ChiTiet = entity.ChiTiet?.Select(c => new ChiTietDonHangDto
            {
                Id = c.Id,
                DonHangId = c.DonHangId,
                SanPhamId = c.SanPhamId,
                TenSanPham = c.TenSanPham,
                SoLuong = c.SoLuong,
                DonGia = c.DonGia,
                ThanhTien = c.ThanhTien,
                HinhAnh = c.HinhAnh
            }).ToList() ?? new List<ChiTietDonHangDto>()
        };
    }
}
