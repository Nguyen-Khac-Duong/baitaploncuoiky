using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using testtttt88.CuaHangs;
using Volo.Abp;
using Volo.Abp.Domain.Entities;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Users;

namespace testtttt88.ThongBaos;

[Authorize]
public class ThongBaoAppService : testtttt88AppService, IThongBaoAppService
{
    private readonly IRepository<ThongBao, Guid> _thongBaoRepository;
    private readonly IRepository<CuaHang, Guid> _cuaHangRepository;

    public ThongBaoAppService(
        IRepository<ThongBao, Guid> thongBaoRepository,
        IRepository<CuaHang, Guid> cuaHangRepository)
    {
        _thongBaoRepository = thongBaoRepository;
        _cuaHangRepository = cuaHangRepository;
    }

    private ThongBaoDto MapToDto(ThongBao entity)
    {
        return new ThongBaoDto
        {
            Id = entity.Id,
            CreationTime = entity.CreationTime,
            CreatorId = entity.CreatorId,
            LastModificationTime = entity.LastModificationTime,
            LastModifierId = entity.LastModifierId,
            NguoiDungId = entity.NguoiDungId,
            CuaHangId = entity.CuaHangId,
            DoiTuong = entity.DoiTuong,
            TieuDe = entity.TieuDe,
            NoiDung = entity.NoiDung,
            Loai = entity.Loai,
            LienKet = entity.LienKet,
            DaDoc = entity.DaDoc,
            ThoiGianDoc = entity.ThoiGianDoc
        };
    }

    private async Task<Guid?> GetCurrentShopIdAsync()
    {
        if (!CurrentUser.Id.HasValue) return null;
        var userId = CurrentUser.GetId();
        var shop = await _cuaHangRepository.FirstOrDefaultAsync(x => x.ChuSoHuuId == userId);
        return shop?.Id;
    }

    /// <summary>
    /// Lấy danh sách thông báo theo phân hệ Buyer hoặc Seller
    /// </summary>
    public virtual async Task<List<ThongBaoDto>> GetDanhSachAsync(string? doiTuong = null)
    {
        var userId = CurrentUser.GetId();
        var isSeller = string.Equals(doiTuong, ThongBao.DoiTuongSeller, StringComparison.OrdinalIgnoreCase);
        var targetDoiTuong = isSeller ? ThongBao.DoiTuongSeller : ThongBao.DoiTuongBuyer;

        var shopId = isSeller ? await GetCurrentShopIdAsync() : null;

        var query = await _thongBaoRepository.GetQueryableAsync();

        List<ThongBao> items;
        if (isSeller)
        {
            items = query
                .Where(x => x.DoiTuong == ThongBao.DoiTuongSeller &&
                            ((shopId.HasValue && x.CuaHangId == shopId.Value) || x.NguoiDungId == userId))
                .OrderByDescending(x => x.CreationTime)
                .Take(50)
                .ToList();
        }
        else
        {
            items = query
                .Where(x => x.DoiTuong == ThongBao.DoiTuongBuyer && x.NguoiDungId == userId)
                .OrderByDescending(x => x.CreationTime)
                .Take(50)
                .ToList();
        }

        // Tự động khởi tạo dữ liệu thông báo mẫu đặc trưng nếu người dùng chưa có
        if (!items.Any())
        {
            var seedList = new List<ThongBao>();

            if (isSeller)
            {
                seedList.Add(new ThongBao(
                    GuidGenerator.Create(),
                    "🎉 Chào mừng bạn đến Kênh Quản Trị Người Bán (Seller Center)!",
                    "Hệ thống bán hàng và đối soát tài chính đa gian hàng KD Shop đã sẵn sàng. Hãy bắt đầu kiểm tra đơn hàng và cập nhật sản phẩm.",
                    ThongBao.LoaiHeThong,
                    "/seller/tong-quan",
                    userId,
                    shopId,
                    ThongBao.DoiTuongSeller
                ));
                seedList.Add(new ThongBao(
                    GuidGenerator.Create(),
                    "📦 Có đơn hàng mới cần xử lý #DH261113110",
                    "Khách hàng vừa đặt đơn mới trị giá 2.950.000đ. Vui lòng xác nhận và đóng gói sản phẩm trước 18h.",
                    ThongBao.LoaiDonHang,
                    "/seller/don-hang",
                    userId,
                    shopId,
                    ThongBao.DoiTuongSeller
                ));
                seedList.Add(new ThongBao(
                    GuidGenerator.Create(),
                    "⭐ Bạn nhận được đánh giá 5★ mới",
                    "Khách hàng vừa đánh giá 5 sao cho sản phẩm 'Lining Halbertec 9000'. Hãy vào gửi lời cảm ơn khách hàng nhé!",
                    ThongBao.LoaiDanhGia,
                    "/seller/danh-gia",
                    userId,
                    shopId,
                    ThongBao.DoiTuongSeller
                ));
                seedList.Add(new ThongBao(
                    GuidGenerator.Create(),
                    "💰 Quyết toán Escrow thành công: +2.850.000đ",
                    "Đơn hàng giao thành công! Số tiền bán hàng bảo chứng đã được tự động quyết toán vào Ví Khả Dụng của Shop.",
                    ThongBao.LoaiViTien,
                    "/seller/vi-tien",
                    userId,
                    shopId,
                    ThongBao.DoiTuongSeller
                ));
                seedList.Add(new ThongBao(
                    GuidGenerator.Create(),
                    "⚠️ Yêu cầu hoàn trả mới cần kiểm tra",
                    "Có yêu cầu trả hàng/hoàn tiền cần shop phản hồi. Hãy vào mục Quản lý Đơn hàng để kiểm tra lý do và hình ảnh.",
                    ThongBao.LoaiHoanTien,
                    "/seller/don-hang",
                    userId,
                    shopId,
                    ThongBao.DoiTuongSeller
                ));
            }
            else
            {
                // DÀNH RIÊNG CHO BUYER: Tiến trình đơn hàng, vận chuyển, giao nhận, đánh giá, hoàn tiền
                seedList.Add(new ThongBao(
                    GuidGenerator.Create(),
                    "🚚 Đơn hàng đang trên đường giao đến bạn!",
                    "Kiện hàng của đơn #DH261113103 đã xuất kho và đang được shipper vận chuyển đến địa chỉ của bạn. Vui lòng để ý điện thoại.",
                    ThongBao.LoaiDonHang,
                    "/don-hang-cua-toi",
                    userId,
                    null,
                    ThongBao.DoiTuongBuyer
                ));
                seedList.Add(new ThongBao(
                    GuidGenerator.Create(),
                    "🎉 Giao hàng thành công! Mời bạn đánh giá sản phẩm",
                    "Đơn hàng #DH261113095 đã giao thành công. Bấm vào đây để đánh giá chất lượng sản phẩm và nhận 200 Xu ưu đãi nhé!",
                    ThongBao.LoaiDanhGia,
                    "/don-hang-cua-toi",
                    userId,
                    null,
                    ThongBao.DoiTuongBuyer
                ));
                seedList.Add(new ThongBao(
                    GuidGenerator.Create(),
                    "💬 Shop đã phản hồi nhận xét của bạn",
                    "Chủ shop vừa gửi lời cảm ơn và giải đáp phản hồi đánh giá của bạn. Nhấn vào để xem ngay.",
                    ThongBao.LoaiDanhGia,
                    "/don-hang-cua-toi",
                    userId,
                    null,
                    ThongBao.DoiTuongBuyer
                ));
                seedList.Add(new ThongBao(
                    GuidGenerator.Create(),
                    "✅ Yêu cầu hoàn tiền đã được Shop chấp thuận",
                    "Yêu cầu trả hàng cho đơn #DH261113088 đã được duyệt. Tiền hoàn sẽ được chuyển về tài khoản của bạn.",
                    ThongBao.LoaiHoanTien,
                    "/don-hang-cua-toi",
                    userId,
                    null,
                    ThongBao.DoiTuongBuyer
                ));
                seedList.Add(new ThongBao(
                    GuidGenerator.Create(),
                    "🎁 Tặng bạn Voucher FREESHIP toàn quốc 0Đ",
                    "Voucher giảm 100% phí vận chuyển cho đơn tiếp theo đã được thêm vào tài khoản của bạn. Mua sắm ngay!",
                    ThongBao.LoaiHeThong,
                    "/cua-hang",
                    userId,
                    null,
                    ThongBao.DoiTuongBuyer
                ));
            }

            foreach (var tb in seedList)
            {
                await _thongBaoRepository.InsertAsync(tb);
            }

            return seedList.OrderByDescending(x => x.CreationTime).Select(MapToDto).ToList();
        }

        return items.Select(MapToDto).ToList();
    }

    /// <summary>
    /// Đếm số thông báo chưa đọc theo phân hệ
    /// </summary>
    public virtual async Task<int> GetSoChuaDocAsync(string? doiTuong = null)
    {
        var userId = CurrentUser.GetId();
        var isSeller = string.Equals(doiTuong, ThongBao.DoiTuongSeller, StringComparison.OrdinalIgnoreCase);
        var shopId = isSeller ? await GetCurrentShopIdAsync() : null;

        var query = await _thongBaoRepository.GetQueryableAsync();

        if (isSeller)
        {
            return query.Count(x => !x.DaDoc && x.DoiTuong == ThongBao.DoiTuongSeller &&
                                    ((shopId.HasValue && x.CuaHangId == shopId.Value) || x.NguoiDungId == userId));
        }

        return query.Count(x => !x.DaDoc && x.DoiTuong == ThongBao.DoiTuongBuyer && x.NguoiDungId == userId);
    }

    /// <summary>
    /// Đánh dấu đã đọc một thông báo
    /// </summary>
    public virtual async Task<ThongBaoDto> DanhDauDaDocAsync(Guid id)
    {
        var tb = await _thongBaoRepository.FindAsync(id);
        if (tb == null)
        {
            throw new EntityNotFoundException(typeof(ThongBao), id);
        }

        tb.DanhDauDaDoc();
        await _thongBaoRepository.UpdateAsync(tb);
        return MapToDto(tb);
    }

    /// <summary>
    /// Đánh dấu toàn bộ thông báo là đã đọc theo phân hệ
    /// </summary>
    public virtual async Task DanhDauTatCaDaDocAsync(string? doiTuong = null)
    {
        var userId = CurrentUser.GetId();
        var isSeller = string.Equals(doiTuong, ThongBao.DoiTuongSeller, StringComparison.OrdinalIgnoreCase);
        var shopId = isSeller ? await GetCurrentShopIdAsync() : null;

        var query = await _thongBaoRepository.GetQueryableAsync();
        List<ThongBao> unread;

        if (isSeller)
        {
            unread = query
                .Where(x => !x.DaDoc && x.DoiTuong == ThongBao.DoiTuongSeller &&
                            ((shopId.HasValue && x.CuaHangId == shopId.Value) || x.NguoiDungId == userId))
                .ToList();
        }
        else
        {
            unread = query
                .Where(x => !x.DaDoc && x.DoiTuong == ThongBao.DoiTuongBuyer && x.NguoiDungId == userId)
                .ToList();
        }

        foreach (var item in unread)
        {
            item.DanhDauDaDoc();
            await _thongBaoRepository.UpdateAsync(item);
        }
    }

    /// <summary>
    /// Xóa một thông báo
    /// </summary>
    public virtual async Task XoaThongBaoAsync(Guid id)
    {
        await _thongBaoRepository.DeleteAsync(id);
    }

    /// <summary>
    /// Xóa toàn bộ thông báo theo phân hệ
    /// </summary>
    public virtual async Task XoaTatCaAsync(string? doiTuong = null)
    {
        var userId = CurrentUser.GetId();
        var isSeller = string.Equals(doiTuong, ThongBao.DoiTuongSeller, StringComparison.OrdinalIgnoreCase);
        var shopId = isSeller ? await GetCurrentShopIdAsync() : null;

        var query = await _thongBaoRepository.GetQueryableAsync();
        List<ThongBao> list;

        if (isSeller)
        {
            list = query
                .Where(x => x.DoiTuong == ThongBao.DoiTuongSeller &&
                            ((shopId.HasValue && x.CuaHangId == shopId.Value) || x.NguoiDungId == userId))
                .ToList();
        }
        else
        {
            list = query
                .Where(x => x.DoiTuong == ThongBao.DoiTuongBuyer && x.NguoiDungId == userId)
                .ToList();
        }

        foreach (var item in list)
        {
            await _thongBaoRepository.DeleteAsync(item);
        }
    }
}
