using System;
using System.Threading.Tasks;
using Shouldly;
using testtttt88.SanPhams;
using Volo.Abp;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Modularity;
using Xunit;

namespace testtttt88.SanPhams;

public abstract class SanPhamManagerTests<TStartupModule> : testtttt88DomainTestBase<TStartupModule>
    where TStartupModule : IAbpModule
{
    private readonly SanPhamManager _sanPhamManager;
    private readonly IRepository<SanPham, Guid> _sanPhamRepository;

    protected SanPhamManagerTests()
    {
        _sanPhamManager = GetRequiredService<SanPhamManager>();
        _sanPhamRepository = GetRequiredService<IRepository<SanPham, Guid>>();
    }

    [Fact]
    public async Task Should_Create_Product_When_Valid()
    {
        var product = await _sanPhamManager.CreateAsync(
            "TEST_SP_01",
            "Sản phẩm Test 01",
            100000m,
            20,
            "Điện thoại"
        );

        product.ShouldNotBeNull();
        product.MaSp.ShouldBe("TEST_SP_01");
        product.SoLuongTon.ShouldBe(20);
    }

    [Fact]
    public async Task Should_Throw_When_Duplicate_Code()
    {
        await _sanPhamManager.CreateAsync("DUPLICATE_CODE", "SP 1", 50000m, 10, "Điện thoại");

        var exception = await Assert.ThrowsAsync<BusinessException>(async () =>
        {
            await _sanPhamManager.CreateAsync("DUPLICATE_CODE", "SP 2", 60000m, 15, "Laptop");
        });

        exception.Code.ShouldBe(testtttt88DomainErrorCodes.SanPhamDaTonTai);
    }
}

