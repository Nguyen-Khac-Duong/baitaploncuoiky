using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Volo.Abp.Application.Services;

namespace testtttt88.DanhGias;

public interface IDanhGiaAppService : IApplicationService
{
    Task<DanhGiaDto> TaoDanhGiaAsync(TaoDanhGiaDto input);
    Task<List<DanhGiaDto>> GetDanhSachTheoSanPhamAsync(Guid sanPhamId);
    Task<ThongKeDanhGiaDto> GetThongKeTheoSanPhamAsync(Guid sanPhamId);
    Task<List<DanhGiaDto>> GetDanhSachTheoShopAsync(Guid? shopId = null);
    Task<List<DanhGiaDto>> GetDanhSachCuaToiAsync();
    Task<DanhGiaDto> ShopPhanHoiAsync(Guid danhGiaId, PhanHoiDanhGiaDto input);
}

