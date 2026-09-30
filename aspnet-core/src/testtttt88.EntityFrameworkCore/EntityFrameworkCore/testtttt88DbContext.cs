using Microsoft.EntityFrameworkCore;
using Volo.Abp.AuditLogging.EntityFrameworkCore;
using Volo.Abp.BackgroundJobs.EntityFrameworkCore;
using Volo.Abp.Data;
using Volo.Abp.DependencyInjection;
using Volo.Abp.EntityFrameworkCore;
using Volo.Abp.FeatureManagement.EntityFrameworkCore;
using Volo.Abp.Identity;
using Volo.Abp.Identity.EntityFrameworkCore;
using Volo.Abp.OpenIddict.EntityFrameworkCore;
using Volo.Abp.PermissionManagement.EntityFrameworkCore;
using Volo.Abp.SettingManagement.EntityFrameworkCore;
using Volo.Abp.TenantManagement;
using Volo.Abp.TenantManagement.EntityFrameworkCore;
using Volo.Abp.EntityFrameworkCore.Modeling;
using testtttt88.DonHangs;
using testtttt88.SanPhams;

namespace testtttt88.EntityFrameworkCore;

[ReplaceDbContext(typeof(IIdentityDbContext))]
[ReplaceDbContext(typeof(ITenantManagementDbContext))]
[ConnectionStringName("Default")]
public class testtttt88DbContext :
    AbpDbContext<testtttt88DbContext>,
    IIdentityDbContext,
    ITenantManagementDbContext
{
    /* Add DbSet properties for your Aggregate Roots / Entities here. */

    #region Entities from the modules

    /* Notice: We only implemented IIdentityDbContext and ITenantManagementDbContext
     * and replaced them for this DbContext. This allows you to perform JOIN
     * queries for the entities of these modules over the repositories easily. You
     * typically don't need that for other modules. But, if you need, you can
     * implement the DbContext interface of the needed module and use ReplaceDbContext
     * attribute just like IIdentityDbContext and ITenantManagementDbContext.
     *
     * More info: Replacing a DbContext of a module ensures that the related module
     * uses this DbContext on runtime. Otherwise, it will use its own DbContext class.
     */

    //Identity
    public DbSet<IdentityUser> Users { get; set; }
    public DbSet<IdentityRole> Roles { get; set; }
    public DbSet<IdentityClaimType> ClaimTypes { get; set; }
    public DbSet<OrganizationUnit> OrganizationUnits { get; set; }
    public DbSet<IdentitySecurityLog> SecurityLogs { get; set; }
    public DbSet<IdentityLinkUser> LinkUsers { get; set; }
    public DbSet<IdentityUserDelegation> UserDelegations { get; set; }
    public DbSet<IdentitySession> Sessions { get; set; }
    // Tenant Management
    public DbSet<Tenant> Tenants { get; set; }
    public DbSet<TenantConnectionString> TenantConnectionStrings { get; set; }

    #endregion

    // Shop Entities
    public DbSet<SanPham> SanPhams { get; set; }
    public DbSet<DonHang> DonHangs { get; set; }
    public DbSet<ChiTietDonHang> ChiTietDonHangs { get; set; }

    public testtttt88DbContext(DbContextOptions<testtttt88DbContext> options)
        : base(options)
    {

    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        /* Include modules to your migration db context */

        builder.ConfigurePermissionManagement();
        builder.ConfigureSettingManagement();
        builder.ConfigureBackgroundJobs();
        builder.ConfigureAuditLogging();
        builder.ConfigureIdentity();
        builder.ConfigureOpenIddict();
        builder.ConfigureFeatureManagement();
        builder.ConfigureTenantManagement();

        /* Configure your own tables/entities inside here */

        builder.Entity<SanPham>(b =>
        {
            b.ToTable(testtttt88Consts.DbTablePrefix + "SanPhams", testtttt88Consts.DbSchema);
            b.ConfigureByConvention();
            b.Property(x => x.MaSp).IsRequired().HasMaxLength(32);
            b.Property(x => x.Ten).IsRequired().HasMaxLength(256);
            b.Property(x => x.Gia).HasPrecision(18, 2);
            b.Property(x => x.DanhMuc).IsRequired().HasMaxLength(128);
            b.Property(x => x.HinhAnh).HasMaxLength(1024);
            b.Property(x => x.MoTa).HasMaxLength(2048);
        });

        builder.Entity<DonHang>(b =>
        {
            b.ToTable(testtttt88Consts.DbTablePrefix + "DonHangs", testtttt88Consts.DbSchema);
            b.ConfigureByConvention();
            b.Property(x => x.MaDon).IsRequired().HasMaxLength(32);
            b.Property(x => x.TenKhachHang).IsRequired().HasMaxLength(128);
            b.Property(x => x.SoDienThoai).IsRequired().HasMaxLength(32);
            b.Property(x => x.DiaChi).IsRequired().HasMaxLength(512);
            b.Property(x => x.GhiChu).HasMaxLength(1024);
            b.Property(x => x.TongTien).HasPrecision(18, 2);
            b.Property(x => x.TrangThai).IsRequired().HasMaxLength(64);
            b.HasMany(x => x.ChiTiet).WithOne().HasForeignKey(x => x.DonHangId).IsRequired();
        });

        builder.Entity<ChiTietDonHang>(b =>
        {
            b.ToTable(testtttt88Consts.DbTablePrefix + "ChiTietDonHangs", testtttt88Consts.DbSchema);
            b.ConfigureByConvention();
            b.Property(x => x.TenSanPham).IsRequired().HasMaxLength(256);
            b.Property(x => x.DonGia).HasPrecision(18, 2);
            b.Property(x => x.ThanhTien).HasPrecision(18, 2);
            b.Property(x => x.HinhAnh).HasMaxLength(1024);
        });
    }
}
