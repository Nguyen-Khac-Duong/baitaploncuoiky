using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Shouldly;
using testtttt88.DonHangs;
using testtttt88.SanPhams;
using Volo.Abp;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Modularity;
using Xunit;

namespace testtttt88.DonHangs;

public abstract class DonHangManagerTests<TStartupModule> : testtttt88DomainTestBase<TStartupModule>
    where TStartupModule : IAbpModule
{
    private readonly DonHangManager _donHangManager;
    private readonly SanPhamManager _sanPhamManager;
    private readonly IRepository<SanPham, Guid> _sanPhamRepository;

    protected DonHangManagerTests()
    {
        _donHangManager = GetRequiredService<DonHangManager>();
        _sanPhamManager = GetRequiredService<SanPhamManager>();
        _sanPhamRepository = GetRequiredService<IRepository<SanPham, Guid>>();
    }

    [Fact]
    public async Task Should_Deduct_Inventory_When_Order_Created()
    {
        var product = await _sanPhamManager.CreateAsync(
            "SP_ORDER_TEST_01",
            "iPhone Test",
            20000000m,
            10,
            "Điện thoại"
        );

        var order = await _donHangManager.CreateOrderAsync(
            "Nguyễn Văn A",
            "0912345678",
            "Hà Nội",
            new List<(Guid, int)> { (product.Id, 3) }
        );

        order.ShouldNotBeNull();
        order.TongTien.ShouldBe(60000000m);

        var updatedProduct = await _sanPhamRepository.GetAsync(product.Id);
        updatedProduct.SoLuongTon.ShouldBe(7);
    }

    [Fact]
    public async Task Should_Throw_When_Insufficient_Stock()
    {
        var product = await _sanPhamManager.CreateAsync(
            "SP_ORDER_TEST_02",
            "Laptop Test",
            15000000m,
            2,
            "Laptop"
        );

        var exception = await Assert.ThrowsAsync<BusinessException>(async () =>
        {
            await _donHangManager.CreateOrderAsync(
                "Trần Thị B",
                "0987654321",
                "Hồ Chí Minh",
                new List<(Guid, int)> { (product.Id, 5) }
            );
        });

        exception.Code.ShouldBe(testtttt88DomainErrorCodes.KhongDuSoLuongTon);
    }

    [Fact]
    public async Task Should_Restore_Stock_When_Order_Cancelled()
    {
        var product = await _sanPhamManager.CreateAsync(
            "SP_ORDER_TEST_03",
            "Bàn phím Test",
            1000000m,
            10,
            "Phụ kiện"
        );

        var order = await _donHangManager.CreateOrderAsync(
            "Lê Văn C",
            "0933333333",
            "Đà Nẵng",
            new List<(Guid, int)> { (product.Id, 4) }
        );

        var updatedOrder = await _donHangManager.ChangeStatusAsync(order.Id, DonHang.TrangThaiDaHuy);
        updatedOrder.TrangThai.ShouldBe(DonHang.TrangThaiDaHuy);

        var restoredProduct = await _sanPhamRepository.GetAsync(product.Id);
        restoredProduct.SoLuongTon.ShouldBe(10);
    }
}

