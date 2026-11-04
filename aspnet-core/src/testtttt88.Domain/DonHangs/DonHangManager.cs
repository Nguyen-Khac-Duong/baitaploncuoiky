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
    /// Tạo mới một đơn hàng: Lấy giá và tên từ Server (chống client tự đặt giá), kiểm tra & trừ tồn kho, tính tổng tiền
    /// </summary>
    public async Task<DonHang> CreateOrderAsync(
        string tenKhachHang,
        string soDienThoai,
        string diaChi,
        List<(Guid sanPhamId, int soLuong)> chiTietInputs,
        string? nguoiDungId = null,
        string? ghiChu = null)
    {
        Check.NotNullOrWhiteSpace(tenKhachHang, nameof(tenKhachHang));
        Check.NotNullOrWhiteSpace(soDienThoai, nameof(soDienThoai));
        Check.NotNullOrWhiteSpace(diaChi, nameof(diaChi));

        if (chiTietInputs == null || chiTietInputs.Count == 0)
        {
            throw new BusinessException(testtttt88DomainErrorCodes.DonHangPhaiCoSanPham);
        }

        // Tự sinh mã đơn hàng không trùng lặp và có timestamp (BE #24)
        string maDon;
        do
        {
            maDon = $"DH{Clock.Now:yyMMddHHmmss}{Random.Shared.Next(100, 999)}";
        } while (await _donHangRepository.AnyAsync(x => x.MaDon == maDon));

        var donHang = new DonHang(
            GuidGenerator.Create(),
            maDon,
            tenKhachHang,
            soDienThoai,
            diaChi,
            tongTien: 0,
            nguoiDungId: nguoiDungId,
            ghiChu: ghiChu
        )
        {
            NgayTao = Clock.Now
        };

        // Duyệt từng sản phẩm: Lấy thông tin giá gốc từ server, kiểm tra tồn kho và trừ kho (BE #1 & BE #2)
        foreach (var item in chiTietInputs)
        {
            if (item.soLuong <= 0)
            {
                throw new ArgumentException("Số lượng sản phẩm đặt mua phải lớn hơn 0.", nameof(item.soLuong));
            }

            var sanPham = await _sanPhamRepository.FindAsync(item.sanPhamId);
            if (sanPham == null)
            {
                throw new BusinessException(testtttt88DomainErrorCodes.SanPhamKhongTonTai)
                    .WithData("Id", item.sanPhamId);
            }

            // Trừ tồn kho và bảo toàn invariant (ném ngoại lệ nếu kho không đủ)
            sanPham.GiamSoLuongTon(item.soLuong);
            await _sanPhamRepository.UpdateAsync(sanPham);

            // Server-controlled Price: Lấy đơn giá và hình ảnh gốc từ Entity SanPham
            donHang.ThemChiTiet(
                GuidGenerator.Create(),
                sanPham.Id,
                sanPham.Ten,
                item.soLuong,
                sanPham.Gia,
                sanPham.HinhAnh
            );
        }

        return await _donHangRepository.InsertAsync(donHang);
    }

    /// <summary>
    /// Thay đổi trạng thái đơn hàng (Chờ xử lý -> Đang giao -> Hoàn thành / Hủy)
    /// Khi hủy đơn: Tự động hoàn trả số lượng tồn kho (BE #1)
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

        // Chuyển đổi trạng thái với State Machine check
        donHang.ChuyenTrangThai(newStatus);

        // Nếu trạng thái mới là ĐÃ HỦY: Hoàn trả số lượng tồn kho cho các sản phẩm
        if (newStatus == DonHang.TrangThaiDaHuy)
        {
            foreach (var item in donHang.ChiTiet)
            {
                var sanPham = await _sanPhamRepository.FindAsync(item.SanPhamId);
                if (sanPham != null)
                {
                    sanPham.TangSoLuongTon(item.SoLuong);
                    await _sanPhamRepository.UpdateAsync(sanPham);
                }
            }
        }

        return await _donHangRepository.UpdateAsync(donHang);
    }
}
