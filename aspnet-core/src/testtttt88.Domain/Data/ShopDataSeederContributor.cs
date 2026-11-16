using System;
using System.Threading.Tasks;
using testtttt88.CuaHangs;
using testtttt88.DonHangs;
using testtttt88.SanPhams;
using testtttt88.ViCuaHangs;
using Volo.Abp.Authorization.Permissions;
using Volo.Abp.Data;
using Volo.Abp.DependencyInjection;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Guids;
using Volo.Abp.Identity;
using Volo.Abp.PermissionManagement;

namespace testtttt88.Data;

public class ShopDataSeederContributor : IDataSeedContributor, ITransientDependency
{
    private readonly IRepository<SanPham, Guid> _sanPhamRepository;
    private readonly IRepository<DonHang, Guid> _donHangRepository;
    private readonly IRepository<CuaHang, Guid> _cuaHangRepository;
    private readonly IRepository<ViCuaHang, Guid> _viCuaHangRepository;
    private readonly IGuidGenerator _guidGenerator;
    private readonly IPermissionDataSeeder _permissionDataSeeder;
    private readonly IIdentityUserRepository _identityUserRepository;
    private readonly IdentityUserManager _identityUserManager;

    public ShopDataSeederContributor(
        IRepository<SanPham, Guid> sanPhamRepository,
        IRepository<DonHang, Guid> donHangRepository,
        IRepository<CuaHang, Guid> cuaHangRepository,
        IRepository<ViCuaHang, Guid> viCuaHangRepository,
        IGuidGenerator guidGenerator,
        IPermissionDataSeeder permissionDataSeeder,
        IIdentityUserRepository identityUserRepository,
        IdentityUserManager identityUserManager)
    {
        _sanPhamRepository = sanPhamRepository;
        _donHangRepository = donHangRepository;
        _cuaHangRepository = cuaHangRepository;
        _viCuaHangRepository = viCuaHangRepository;
        _guidGenerator = guidGenerator;
        _permissionDataSeeder = permissionDataSeeder;
        _identityUserRepository = identityUserRepository;
        _identityUserManager = identityUserManager;
    }

    public async Task SeedAsync(DataSeedContext context)
    {
        // 1. Cấp toàn bộ quyền quản trị cho Role 'admin' (Bao gồm Gian Hàng & Ví Sàn)
        var adminPermissions = new[]
        {
            "testtttt88.SanPhams",
            "testtttt88.SanPhams.Create",
            "testtttt88.SanPhams.Edit",
            "testtttt88.SanPhams.Delete",
            "testtttt88.DonHangs",
            "testtttt88.DonHangs.Create",
            "testtttt88.DonHangs.EditStatus",
            "testtttt88.DonHangs.Delete",
            "testtttt88.CuaHangs",
            "testtttt88.CuaHangs.Manage",
            "testtttt88.ViCuaHangs",
            "testtttt88.ViCuaHangs.Manage"
        };

        await _permissionDataSeeder.SeedAsync(
            RolePermissionValueProvider.ProviderName,
            "admin",
            adminPermissions
        );

        // 2. Đảm bảo tài khoản Admin có email admin@gmail.com
        var adminUser = await _identityUserRepository.FindByNormalizedUserNameAsync("ADMIN");
        if (adminUser != null)
        {
            if (adminUser.Email != "admin@gmail.com")
            {
                await _identityUserManager.SetEmailAsync(adminUser, "admin@gmail.com");
                await _identityUserRepository.UpdateAsync(adminUser);
            }
        }

        // 3. Xóa liên kết gian hàng cũ với Admin để tách bạch hoàn toàn vai trò Quản Trị Sàn
        if (adminUser != null)
        {
            var adminOwnedShops = await _cuaHangRepository.GetListAsync(x => x.ChuSoHuuId == adminUser.Id);
            foreach (var shop in adminOwnedShops)
            {
                await _cuaHangRepository.DeleteAsync(shop);
            }
        }
    }
}
