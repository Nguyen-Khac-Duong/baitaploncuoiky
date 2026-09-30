using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using testtttt88.SanPhams;
using Volo.Abp;
using Volo.Abp.Domain.Entities;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Domain.Services;

namespace testtttt88.DonHangs;

/// <summary>
/// Domain Service quản lý nghiệp vụ Đơn Hàng theo chuẩn DDD của công ty
/// </summary>
public class DonHangManager : DomainService
{
    private readonly IRepository<DonHang, Guid> _donHangRepository;
    private readonly IRepository<SanPham, Guid> _sanPhamRepository;

    public DonHangManager(
        IRepository<DonHang, Guid> donHangRepository,
        IRepository<SanPham, Guid> sanPhamRepository)
    {
        _donHangRepository = donHangRepository;
        _sanPhamRepository = sanPhamRepository;
    }

    /// <summary>
    /// Tạo mới một đơn hàng: Tự sinh mã đơn, kiểm tra & trừ tồn kho, tính tổng tiền
    /// </summary>
    public async Task<DonHang> CreateOrderAsync(
        string tenKhachHang,
        string soDienThoai,
        string diaChi,
        List<(Guid sanPhamId, string tenSanPham, int soLuong, decimal donGia, string? hinhAnh)> chiTietItems,
        string? nguoiDungId = null,
        string? ghiChu = null)
    {
        Check.NotNullOrWhiteSpace(tenKhachHang, nameof(tenKhachHang));
        Check.NotNullOrWhiteSpace(soDienThoai, nameof(soDienThoai));
        Check.NotNullOrWhiteSpace(diaChi, nameof(diaChi));

        if (chiTietItems == null || chiTietItems.Count == 0)
        {
            throw new UserFriendlyException("Đơn hàng phải có ít nhất một sản phẩm!");
        }

        // Tự sinh mã đơn hàng không trùng lặp
        string maDon;
        do
        {
            maDon = "DH" + new Random().Next(100000, 999999);
        } while (await _donHangRepository.AnyAsync(x => x.MaDon == maDon));

        // Tính tổng tiền đơn hàng
        decimal tongTien = chiTietItems.Sum(x => x.donGia * x.soLuong);

        var donHang = new DonHang(
            GuidGenerator.Create(),
            maDon,
            tenKhachHang,
            soDienThoai,
            diaChi,
            tongTien,
            nguoiDungId,
            ghiChu,
            "cho_xu_ly"
        );

        // Duyệt từng sản phẩm: Tạo chi tiết đơn hàng và trừ tồn kho
        foreach (var item in chiTietItems)
        {
            var chiTiet = new ChiTietDonHang(
                GuidGenerator.Create(),
                donHang.Id,
                item.sanPhamId,
                item.tenSanPham,
                item.soLuong,
                item.donGia,
                item.donGia * item.soLuong,
                item.hinhAnh
            );
            donHang.ChiTiet.Add(chiTiet);

            // Cập nhật tồn kho sản phẩm trong tầng Domain
            if (item.sanPhamId != Guid.Empty)
            {
                var sanPham = await _sanPhamRepository.FindAsync(item.sanPhamId);
                if (sanPham != null)
                {
                    sanPham.SoLuongTon = Math.Max(0, sanPham.SoLuongTon - item.soLuong);
                    await _sanPhamRepository.UpdateAsync(sanPham);
                }
            }
        }

        return await _donHangRepository.InsertAsync(donHang);
    }

    /// <summary>
    /// Thay đổi trạng thái đơn hàng (Chờ xử lý -> Đang giao -> Hoàn thành / Hủy)
    /// </summary>
    public async Task<DonHang> ChangeStatusAsync(Guid id, string newStatus)
    {
        Check.NotNullOrWhiteSpace(newStatus, nameof(newStatus));

        var query = await _donHangRepository.WithDetailsAsync(x => x.ChiTiet);
        var donHang = await AsyncExecuter.FirstOrDefaultAsync(query.Where(x => x.Id == id));

        if (donHang == null)
        {
            throw new EntityNotFoundException(typeof(DonHang), id);
        }

        donHang.TrangThai = newStatus;
        return await _donHangRepository.UpdateAsync(donHang);
    }
}
