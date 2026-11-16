using Riok.Mapperly.Abstractions;
using Volo.Abp.Mapperly;
using testtttt88.DonHangs;
using testtttt88.SanPhams;

namespace testtttt88;

[Mapper(RequiredMappingStrategy = RequiredMappingStrategy.None)]
public partial class SanPhamToDtoMapper : MapperBase<SanPham, SanPhamDto>
{
    [MapProperty(nameof(SanPham.CreationTime), nameof(SanPhamDto.NgayTao))]
    public override partial SanPhamDto Map(SanPham source);

    [MapProperty(nameof(SanPham.CreationTime), nameof(SanPhamDto.NgayTao))]
    public override partial void Map(SanPham source, SanPhamDto destination);
}

[Mapper(RequiredMappingStrategy = RequiredMappingStrategy.None)]
public partial class DonHangToDtoMapper : MapperBase<DonHang, DonHangDto>
{
    [MapProperty(nameof(DonHang.CreationTime), nameof(DonHangDto.NgayTao))]
    public override partial DonHangDto Map(DonHang source);

    [MapProperty(nameof(DonHang.CreationTime), nameof(DonHangDto.NgayTao))]
    public override partial void Map(DonHang source, DonHangDto destination);
}

[Mapper(RequiredMappingStrategy = RequiredMappingStrategy.None)]
public partial class ChiTietDonHangToDtoMapper : MapperBase<ChiTietDonHang, ChiTietDonHangDto>
{
    public override partial ChiTietDonHangDto Map(ChiTietDonHang source);
    public override partial void Map(ChiTietDonHang source, ChiTietDonHangDto destination);
}


