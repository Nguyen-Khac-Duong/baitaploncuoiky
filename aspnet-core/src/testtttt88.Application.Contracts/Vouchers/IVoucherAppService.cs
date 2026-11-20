using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Volo.Abp.Application.Services;

namespace testtttt88.Vouchers;

public interface IVoucherAppService : IApplicationService
{
    Task<KetQuaKiemTraVoucherDto> KiemTraVoucherAsync(KiemTraVoucherInputDto input);
    Task<List<VoucherDto>> GetDanhSachVoucherKhaDungAsync(decimal? tongTienHang = null, Guid? cuaHangId = null);
    Task<List<VoucherDto>> GetDanhSachVoucherSanAsync();
    Task<List<VoucherDto>> GetDanhSachVoucherShopAsync(Guid cuaHangId);
    Task<List<VoucherDto>> GetDanhSachAsync(Guid? cuaHangId = null);
    Task<List<VoucherDto>> GetMyStoreVouchersAsync();
    Task<VoucherDto> CreateAsync(TaoCapNhatVoucherDto input);
    Task<VoucherDto> UpdateAsync(Guid id, TaoCapNhatVoucherDto input);
    Task<VoucherDto> DoiTrangThaiKichHoatAsync(Guid id);
    Task DeleteAsync(Guid id);
}
