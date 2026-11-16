using System;
using System.Linq;
using System.Threading.Tasks;
using testtttt88.DonHangs;
using testtttt88.SanPhams;
using testtttt88.CuaHangs;
using Volo.Abp;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Domain.Services;

namespace testtttt88.DanhGias;

/// <summary>
/// Domain Service quản lý toàn vẹn nghiệp vụ Đánh giá sản phẩm theo chuẩn DDD
/// </summary>
public class DanhGiaManager : DomainService
{
    private readonly IRepository<DanhGiaSanPham, Guid> _danhGiaRepository;
    private readonly IRepository<DonHang, Guid> _donHangRepository;
    private readonly IRepository<SanPham, Guid> _sanPhamRepository;
    private readonly IRepository<CuaHang, Guid> _cuaHangRepository;

    public DanhGiaManager(
        IRepository<DanhGiaSanPham, Guid> danhGiaRepository,
        IRepository<DonHang, Guid> donHangRepository,
        IRepository<SanPham, Guid> sanPhamRepository,
        IRepository<CuaHang, Guid> cuaHangRepository)
    {
        _danhGiaRepository = danhGiaRepository;
        _donHangRepository = donHangRepository;
        _sanPhamRepository = sanPhamRepository;
        _cuaHangRepository = cuaHangRepository;
    }

    /// <summary>
    /// Tạo mới một đánh giá từ khách hàng đã mua sản phẩm
    /// </summary>
    public async Task<DanhGiaSanPham> TaoDanhGiaAsync(
        Guid sanPhamId,
        Guid donHangId,
        Guid nguoiDungId,
        string tenNguoiDung,
        int soSao,
        string noiDung,
        string? hinhAnh = null,
        string? avatarNguoiDung = null)
    {
        // 1. Kiểm tra sản phẩm tồn tại
        var sanPham = await _sanPhamRepository.FindAsync(sanPhamId);
        if (sanPham == null)
        {
            throw new UserFriendlyException("Không tìm thấy thông tin sản phẩm cần đánh giá!");
        }

        // 2. Kiểm tra đơn hàng & nạp kèm chi tiết sản phẩm
        var query = await _donHangRepository.WithDetailsAsync(x => x.ChiTiet);
        var donHang = await AsyncExecuter.FirstOrDefaultAsync(query.Where(x => x.Id == donHangId));
        if (donHang == null)
        {
            throw new UserFriendlyException("Không tìm thấy đơn hàng tương ứng!");
        }

        // 3. Kiểm tra người dùng có phải là người mua đơn này không
        if (!string.Equals(donHang.NguoiDungId, nguoiDungId.ToString(), StringComparison.OrdinalIgnoreCase))
        {
            throw new UserFriendlyException("Bạn chỉ có thể đánh giá các sản phẩm trong đơn hàng của chính mình!");
        }

        // 4. Kiểm tra trạng thái đơn hàng (Được đánh giá khi đã giao hàng, hoàn thành, hoặc có hoàn/trả)
        if (string.Equals(donHang.TrangThai, DonHang.TrangThaiChoXuLy, StringComparison.OrdinalIgnoreCase) ||
            string.Equals(donHang.TrangThai, DonHang.TrangThaiDaHuy, StringComparison.OrdinalIgnoreCase))
        {
            throw new UserFriendlyException("Đơn hàng chưa được vận chuyển đến bạn hoặc đã bị hủy trước khi giao nên chưa thể đánh giá sản phẩm!");
        }

        // 5. Kiểm tra sản phẩm có nằm trong chi tiết đơn hàng không
        if (donHang.ChiTiet != null && donHang.ChiTiet.Any())
        {
            var coSanPhamTrongDon = donHang.ChiTiet.Any(x => x.SanPhamId == sanPhamId);
            if (!coSanPhamTrongDon)
            {
                throw new UserFriendlyException("Sản phẩm này không nằm trong danh mục sản phẩm của đơn hàng đã chọn!");
            }
        }

        // 6. Kiểm tra xem người dùng đã từng đánh giá sản phẩm này trong đơn này chưa
        var daDanhGia = await _danhGiaRepository.AnyAsync(x => x.DonHangId == donHangId && x.SanPhamId == sanPhamId);
        if (daDanhGia)
        {
            throw new UserFriendlyException("Bạn đã gửi đánh giá cho sản phẩm này trong đơn hàng rồi!");
        }

        bool donHangCoHoanTra = string.Equals(donHang.TrangThai, "tra_hang", StringComparison.OrdinalIgnoreCase) ||
                                string.Equals(donHang.TrangThai, "hoan_tien", StringComparison.OrdinalIgnoreCase);

        var danhGia = new DanhGiaSanPham(
            GuidGenerator.Create(),
            sanPhamId,
            donHangId,
            sanPham.CuaHangId,
            nguoiDungId,
            tenNguoiDung,
            soSao,
            noiDung,
            hinhAnh,
            donHangCoHoanTra,
            avatarNguoiDung
        );

        return await _danhGiaRepository.InsertAsync(danhGia);
    }

    /// <summary>
    /// Shop phản hồi đánh giá của khách
    /// </summary>
    public async Task<DanhGiaSanPham> ShopPhanHoiAsync(Guid danhGiaId, Guid chuSoHuuId, string noiDungPhanHoi)
    {
        var danhGia = await _danhGiaRepository.FindAsync(danhGiaId);
        if (danhGia == null)
        {
            throw new UserFriendlyException("Không tìm thấy đánh giá cần phản hồi!");
        }

        // Kiểm tra quyền: Shop phải thuộc về chủ sở hữu này
        var cuaHang = await _cuaHangRepository.FindAsync(danhGia.CuaHangId);
        if (cuaHang == null || cuaHang.ChuSoHuuId != chuSoHuuId)
        {
            throw new UserFriendlyException("Bạn chỉ có quyền phản hồi các đánh giá thuộc gian hàng của mình!");
        }

        danhGia.CapNhatPhanHoiShop(noiDungPhanHoi);
        return await _danhGiaRepository.UpdateAsync(danhGia);
    }
}

