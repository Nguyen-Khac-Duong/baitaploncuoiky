using Riok.Mapperly.Abstractions;
using Volo.Abp.Mapperly;
using testtttt88.DonHangs;
using testtttt88.SanPhams;

namespace testtttt88;

[Mapper]
public partial class testtttt88ApplicationMappers
{
    public partial SanPhamDto Map(SanPham entity);
    public partial SanPham Map(CreateUpdateSanPhamDto dto);
    public partial void Map(CreateUpdateSanPhamDto dto, SanPham entity);

    public partial DonHangDto Map(DonHang entity);
    public partial ChiTietDonHangDto Map(ChiTietDonHang entity);
}

