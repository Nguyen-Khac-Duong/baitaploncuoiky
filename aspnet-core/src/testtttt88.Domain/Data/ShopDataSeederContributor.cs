using System;
using System.Threading.Tasks;
using testtttt88.DonHangs;
using testtttt88.SanPhams;
using Volo.Abp.Data;
using Volo.Abp.DependencyInjection;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Guids;

namespace testtttt88.Data;

public class ShopDataSeederContributor : IDataSeedContributor, ITransientDependency
{
    private readonly IRepository<SanPham, Guid> _sanPhamRepository;
    private readonly IRepository<DonHang, Guid> _donHangRepository;
    private readonly IGuidGenerator _guidGenerator;

    public ShopDataSeederContributor(
        IRepository<SanPham, Guid> sanPhamRepository,
        IRepository<DonHang, Guid> donHangRepository,
        IGuidGenerator guidGenerator)
    {
        _sanPhamRepository = sanPhamRepository;
        _donHangRepository = donHangRepository;
        _guidGenerator = guidGenerator;
    }

    public async Task SeedAsync(DataSeedContext context)
    {
        if (await _sanPhamRepository.GetCountAsync() <= 0)
        {
            var sp1 = new SanPham(
                _guidGenerator.Create(),
                "SP001",
                "iPhone 15 Pro Max 256GB Titan Tự Nhiên",
                29990000m,
                15,
                "Điện thoại",
                "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&auto=format&fit=crop&q=80",
                "Flagship Apple mới nhất với chip A17 Pro siêu mạnh mẽ và khung viền Titan siêu nhẹ."
            );

            var sp2 = new SanPham(
                _guidGenerator.Create(),
                "SP002",
                "MacBook Pro 14 inch M3 Pro 18GB/512GB",
                48990000m,
                8,
                "Laptop",
                "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&auto=format&fit=crop&q=80",
                "Hiệu năng đỉnh cao với màn hình Liquid Retina XDR và thời lượng pin lên đến 22 giờ."
            );

            var sp3 = new SanPham(
                _guidGenerator.Create(),
                "SP003",
                "Bàn phím cơ không dây NuPhy Air75 V2",
                2850000m,
                0,
                "Phụ kiện",
                "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=80",
                "Bàn phím cơ low-profile không dây kết nối đa thiết bị, gõ cực êm."
            );

            var sp4 = new SanPham(
                _guidGenerator.Create(),
                "SP004",
                "Tai nghe chống ồn Sony WH-1000XM5",
                6790000m,
                22,
                "Âm thanh",
                "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80",
                "Công nghệ chống ồn đỉnh cao, chất âm trung thực chi tiết và đàm thoại siêu nét."
            );

            var sp5 = new SanPham(
                _guidGenerator.Create(),
                "SP005",
                "Màn hình Dell UltraSharp U2724D 2K 120Hz",
                9500000m,
                6,
                "Màn hình",
                "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&auto=format&fit=crop&q=80",
                "Màn hình chuyên đồ họa màu sắc chuẩn IPS Black, tần số quét 120Hz mượt mà."
            );

            var sp6 = new SanPham(
                _guidGenerator.Create(),
                "SP006",
                "Chuột không dây Logitech MX Master 3S",
                2490000m,
                18,
                "Phụ kiện",
                "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&auto=format&fit=crop&q=80",
                "Chuột công thái học cao cấp dành cho lập trình viên và sáng tạo nội dung."
            );

            await _sanPhamRepository.InsertAsync(sp1, autoSave: true);
            await _sanPhamRepository.InsertAsync(sp2, autoSave: true);
            await _sanPhamRepository.InsertAsync(sp3, autoSave: true);
            await _sanPhamRepository.InsertAsync(sp4, autoSave: true);
            await _sanPhamRepository.InsertAsync(sp5, autoSave: true);
            await _sanPhamRepository.InsertAsync(sp6, autoSave: true);

            // Seed initial order
            if (await _donHangRepository.GetCountAsync() <= 0)
            {
                var dh1 = new DonHang(
                    _guidGenerator.Create(),
                    "DH1001",
                    "Trần Khách Hàng",
                    "0988776655",
                    "123 Phố Huế, Hai Bà Trưng, Hà Nội",
                    29990000m,
                    nguoiDungId: "user-khach-1",
                    trangThai: "hoan_thanh"
                );
                dh1.ChiTiet.Add(new ChiTietDonHang(
                    _guidGenerator.Create(),
                    dh1.Id,
                    sp1.Id,
                    sp1.Ten,
                    1,
                    sp1.Gia,
                    sp1.Gia,
                    sp1.HinhAnh
                ));

                var dh2 = new DonHang(
                    _guidGenerator.Create(),
                    "DH1002",
                    "Nguyễn Văn An",
                    "0901234567",
                    "45 Cầu Giấy, Hà Nội",
                    9640000m,
                    trangThai: "dang_giao"
                );
                dh2.ChiTiet.Add(new ChiTietDonHang(
                    _guidGenerator.Create(),
                    dh2.Id,
                    sp3.Id,
                    sp3.Ten,
                    1,
                    sp3.Gia,
                    sp3.Gia,
                    sp3.HinhAnh
                ));
                dh2.ChiTiet.Add(new ChiTietDonHang(
                    _guidGenerator.Create(),
                    dh2.Id,
                    sp4.Id,
                    sp4.Ten,
                    1,
                    sp4.Gia,
                    sp4.Gia,
                    sp4.HinhAnh
                ));

                await _donHangRepository.InsertAsync(dh1, autoSave: true);
                await _donHangRepository.InsertAsync(dh2, autoSave: true);
            }
        }
    }
}
