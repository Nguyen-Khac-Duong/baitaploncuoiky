using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Volo.Abp;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Domain.Services;

namespace testtttt88.Vouchers;

public class VoucherManager : DomainService
{
    private readonly IRepository<Voucher, Guid> _voucherRepository;

    public VoucherManager(IRepository<Voucher, Guid> voucherRepository)
    {
        _voucherRepository = voucherRepository;
    }

    /// <summary>
    /// Kiểm tra tính hợp lệ và tính số tiền giảm giá của voucher
    /// </summary>
    public async Task<(bool HopLe, decimal SoTienGiam, string ThongBao, Voucher? Voucher)> KiemTraVaTinhGiamGiaAsync(
        string maVoucher,
        decimal tongTienHang,
        Guid? cuaHangId = null)
    {
        if (string.IsNullOrWhiteSpace(maVoucher))
        {
            return (false, 0, "Vui lòng nhập mã voucher!", null);
        }

        var normalizedCode = maVoucher.Trim().ToUpperInvariant();
        var voucher = await _voucherRepository.FirstOrDefaultAsync(x => x.MaVoucher == normalizedCode);

        if (voucher == null)
        {
            return (false, 0, "Mã giảm giá không tồn tại hoặc đã bị xóa!", null);
        }

        // Nếu voucher gắn riêng cho 1 shop
        if (voucher.CuaHangId.HasValue && cuaHangId.HasValue && voucher.CuaHangId.Value != cuaHangId.Value)
        {
            return (false, 0, "Mã giảm giá này chỉ áp dụng cho một gian hàng cụ thể!", null);
        }

        if (!voucher.KiemTraHopLe(tongTienHang, out var lyDo))
        {
            return (false, 0, lyDo, voucher);
        }

        var tienGiam = voucher.TinhTienGiam(tongTienHang);
        return (true, tienGiam, $"Áp dụng voucher thành công! Giảm {tienGiam:N0}đ", voucher);
    }
}
