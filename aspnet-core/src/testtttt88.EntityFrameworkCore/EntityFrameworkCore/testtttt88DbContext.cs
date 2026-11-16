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
using testtttt88.CuaHangs;
using testtttt88.DanhGias;
using testtttt88.DanhMucs;
using testtttt88.DonHangs;
using testtttt88.SanPhams;
using testtttt88.ThongBaos;
using testtttt88.ViCuaHangs;

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

    // Shop & Multi-vendor Entities
    public DbSet<DanhMuc> DanhMucs { get; set; }
    public DbSet<CuaHang> CuaHangs { get; set; }
    public DbSet<SanPham> SanPhams { get; set; }
    public DbSet<DonHangTong> DonHangTongs { get; set; }
    public DbSet<DonHang> DonHangs { get; set; }
    public DbSet<ChiTietDonHang> ChiTietDonHangs { get; set; }
    public DbSet<ViCuaHang> ViCuaHangs { get; set; }
    public DbSet<GiaoDichVi> GiaoDichVis { get; set; }
    public DbSet<YeuCauRutTien> YeuCauRutTiens { get; set; }
    public DbSet<DanhGiaSanPham> DanhGiaSanPhams { get; set; }
    public DbSet<ThongBao> ThongBaos { get; set; }

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

        builder.Entity<DanhMuc>(b =>
        {
            b.ToTable(testtttt88Consts.DbTablePrefix + "DanhMucs", testtttt88Consts.DbSchema);
            b.ConfigureByConvention();
            b.Property(x => x.Ten).IsRequired().HasMaxLength(256);
            b.Property(x => x.Slug).IsRequired().HasMaxLength(256);
            b.Property(x => x.Icon).HasMaxLength(128);
            b.Property(x => x.MoTa).HasMaxLength(1024);

            b.HasIndex(x => x.Slug).IsUnique().HasFilter("[IsDeleted] = 0");
            b.HasIndex(x => x.ParentId);
            b.HasIndex(x => x.TrangThai);
        });

        builder.Entity<CuaHang>(b =>
        {
            b.ToTable(testtttt88Consts.DbTablePrefix + "CuaHangs", testtttt88Consts.DbSchema);
            b.ConfigureByConvention();
            b.Property(x => x.Ten).IsRequired().HasMaxLength(256);
            b.Property(x => x.Slug).IsRequired().HasMaxLength(256);
            b.Property(x => x.SoDienThoai).IsRequired().HasMaxLength(32);
            b.Property(x => x.Email).IsRequired().HasMaxLength(128);
            b.Property(x => x.DiaChi).IsRequired().HasMaxLength(512);
            b.Property(x => x.Logo).HasMaxLength(1024);
            b.Property(x => x.Banner).HasMaxLength(1024);
            b.Property(x => x.MoTa).HasMaxLength(2048);
            b.Property(x => x.TrangThai).IsRequired().HasMaxLength(64);
            b.Property(x => x.PhanTramHoaHong).HasPrecision(5, 2);
            b.Property(x => x.SoTaiKhoanNganHang).HasMaxLength(64);
            b.Property(x => x.TenNganHang).HasMaxLength(128);
            b.Property(x => x.TenChuTaiKhoan).HasMaxLength(128);

            b.HasIndex(x => x.Slug).IsUnique().HasFilter("[IsDeleted] = 0");
            b.HasIndex(x => x.ChuSoHuuId);
            b.HasIndex(x => x.TrangThai);
        });

        builder.Entity<SanPham>(b =>
        {
            b.ToTable(testtttt88Consts.DbTablePrefix + "SanPhams", testtttt88Consts.DbSchema);
            b.ConfigureByConvention();
            b.Property(x => x.MaSp).IsRequired().HasMaxLength(32);
            b.Property(x => x.Ten).IsRequired().HasMaxLength(256);
            b.Property(x => x.Gia).HasPrecision(18, 2);
            b.Property(x => x.DanhMuc).IsRequired().HasMaxLength(128);
            b.Property(x => x.DanhMucId);
            b.Property(x => x.HinhAnh).HasMaxLength(1024);
            b.Property(x => x.MoTa).HasMaxLength(2048);

            // BE #17: Unique index có lọc soft delete
            b.HasIndex(x => x.MaSp).IsUnique().HasFilter("[IsDeleted] = 0");
            b.HasIndex(x => x.CuaHangId);
            b.HasIndex(x => x.DanhMucId);
        });

        builder.Entity<DonHangTong>(b =>
        {
            b.ToTable(testtttt88Consts.DbTablePrefix + "DonHangTongs", testtttt88Consts.DbSchema);
            b.ConfigureByConvention();
            b.Property(x => x.MaDonTong).IsRequired().HasMaxLength(32);
            b.Property(x => x.TenKhachHang).IsRequired().HasMaxLength(128);
            b.Property(x => x.SoDienThoai).IsRequired().HasMaxLength(32);
            b.Property(x => x.DiaChi).IsRequired().HasMaxLength(512);
            b.Property(x => x.GhiChu).HasMaxLength(1024);
            b.Property(x => x.TongTien).HasPrecision(18, 2);
            b.Property(x => x.PhuongThucThanhToan).IsRequired().HasMaxLength(64);
            b.Property(x => x.TrangThai).IsRequired().HasMaxLength(64);

            b.HasIndex(x => x.MaDonTong).IsUnique().HasFilter("[IsDeleted] = 0");
            b.HasIndex(x => x.NguoiDungId);
            b.HasIndex(x => x.TrangThai);
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
            b.Property(x => x.TienHang).HasPrecision(18, 2);
            b.Property(x => x.PhiVanChuyen).HasPrecision(18, 2);
            b.Property(x => x.TienHoaHongSan).HasPrecision(18, 2);
            b.Property(x => x.ThucNhanCuaShop).HasPrecision(18, 2);
            b.Property(x => x.TrangThai).IsRequired().HasMaxLength(64);
            b.Property(x => x.LyDoTraHang).HasMaxLength(256);
            b.Property(x => x.GhiChuTraHang).HasMaxLength(1024);
            b.Property(x => x.HinhAnhTraHang).HasMaxLength(1024);
            b.Property(x => x.PhanHoiTraHang).HasMaxLength(1024);
            b.HasMany(x => x.ChiTiet).WithOne().HasForeignKey(x => x.DonHangId).IsRequired();

            // BE #17: Unique index có lọc soft delete
            b.HasIndex(x => x.MaDon).IsUnique().HasFilter("[IsDeleted] = 0");
            // BE #22: Index cho truy vấn Dashboard và lọc trạng thái
            b.HasIndex(x => new { x.TrangThai, x.CreationTime });
            b.HasIndex(x => x.CuaHangId);
            b.HasIndex(x => x.DonHangTongId);
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

        builder.Entity<ViCuaHang>(b =>
        {
            b.ToTable(testtttt88Consts.DbTablePrefix + "ViCuaHangs", testtttt88Consts.DbSchema);
            b.ConfigureByConvention();
            b.Property(x => x.SoDuKhaDung).HasPrecision(18, 2);
            b.Property(x => x.SoDuTamGiu).HasPrecision(18, 2);
            b.Property(x => x.TongTienDaRut).HasPrecision(18, 2);

            b.HasIndex(x => x.CuaHangId).IsUnique().HasFilter("[IsDeleted] = 0");
        });

        builder.Entity<GiaoDichVi>(b =>
        {
            b.ToTable(testtttt88Consts.DbTablePrefix + "GiaoDichVis", testtttt88Consts.DbSchema);
            b.ConfigureByConvention();
            b.Property(x => x.LoaiGiaoDich).IsRequired().HasMaxLength(64);
            b.Property(x => x.SoTien).HasPrecision(18, 2);
            b.Property(x => x.SoDuSauGiaoDich).HasPrecision(18, 2);
            b.Property(x => x.MoTa).IsRequired().HasMaxLength(512);
            b.Property(x => x.MaDonHangLienQuan).HasMaxLength(64);

            b.HasIndex(x => x.ViCuaHangId);
            b.HasIndex(x => x.CuaHangId);
            b.HasIndex(x => x.CreationTime);
        });

        builder.Entity<YeuCauRutTien>(b =>
        {
            b.ToTable(testtttt88Consts.DbTablePrefix + "YeuCauRutTiens", testtttt88Consts.DbSchema);
            b.ConfigureByConvention();
            b.Property(x => x.SoTien).HasPrecision(18, 2);
            b.Property(x => x.TenNganHang).IsRequired().HasMaxLength(128);
            b.Property(x => x.SoTaiKhoan).IsRequired().HasMaxLength(64);
            b.Property(x => x.TenChuTaiKhoan).IsRequired().HasMaxLength(128);
            b.Property(x => x.TrangThai).IsRequired().HasMaxLength(64);
            b.Property(x => x.GhiChu).HasMaxLength(512);
            b.Property(x => x.LyDoTuChoi).HasMaxLength(512);

            b.HasIndex(x => x.CuaHangId);
            b.HasIndex(x => x.TrangThai);
        });

        builder.Entity<DanhGiaSanPham>(b =>
        {
            b.ToTable(testtttt88Consts.DbTablePrefix + "DanhGiaSanPhams", testtttt88Consts.DbSchema);
            b.ConfigureByConvention();
            b.Property(x => x.TenNguoiDung).IsRequired().HasMaxLength(128);
            b.Property(x => x.NoiDung).IsRequired().HasMaxLength(2000);
            b.Property(x => x.HinhAnh).HasMaxLength(1024);
            b.Property(x => x.AvatarNguoiDung).HasMaxLength(1024);
            b.Property(x => x.PhanHoiShop).HasMaxLength(2000);

            b.HasIndex(x => x.SanPhamId);
            b.HasIndex(x => x.DonHangId);
            b.HasIndex(x => x.CuaHangId);
            b.HasIndex(x => x.NguoiDungId);
            b.HasIndex(x => new { x.DonHangId, x.SanPhamId });
        });

        builder.Entity<ThongBao>(b =>
        {
            b.ToTable(testtttt88Consts.DbTablePrefix + "ThongBaos", testtttt88Consts.DbSchema);
            b.ConfigureByConvention();
            b.Property(x => x.TieuDe).IsRequired().HasMaxLength(256);
            b.Property(x => x.NoiDung).IsRequired().HasMaxLength(2000);
            b.Property(x => x.Loai).IsRequired().HasMaxLength(64);
            b.Property(x => x.LienKet).HasMaxLength(512);
            b.Property(x => x.DoiTuong).IsRequired().HasMaxLength(32).HasDefaultValue(ThongBao.DoiTuongBuyer);

            b.HasIndex(x => x.NguoiDungId);
            b.HasIndex(x => x.CuaHangId);
            b.HasIndex(x => x.DoiTuong);
            b.HasIndex(x => new { x.NguoiDungId, x.DaDoc });
            b.HasIndex(x => x.CreationTime);
        });
    }
}
