using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace testtttt88.Migrations
{
    /// <inheritdoc />
    public partial class Added_MultiVendor_Marketplace_Core : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "CuaHangId",
                table: "AppSanPhams",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "CuaHangId",
                table: "AppDonHangs",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "DonHangTongId",
                table: "AppDonHangs",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "PhiVanChuyen",
                table: "AppDonHangs",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "ThucNhanCuaShop",
                table: "AppDonHangs",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "TienHang",
                table: "AppDonHangs",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "TienHoaHongSan",
                table: "AppDonHangs",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.CreateTable(
                name: "AppCuaHangs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Ten = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    Slug = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    ChuSoHuuId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SoDienThoai = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                    DiaChi = table.Column<string>(type: "nvarchar(512)", maxLength: 512, nullable: false),
                    Logo = table.Column<string>(type: "nvarchar(1024)", maxLength: 1024, nullable: true),
                    Banner = table.Column<string>(type: "nvarchar(1024)", maxLength: 1024, nullable: true),
                    MoTa = table.Column<string>(type: "nvarchar(2048)", maxLength: 2048, nullable: true),
                    TrangThai = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    PhanTramHoaHong = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    SoTaiKhoanNganHang = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: true),
                    TenNganHang = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: true),
                    TenChuTaiKhoan = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: true),
                    ExtraProperties = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ConcurrencyStamp = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    CreationTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatorId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    LastModificationTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastModifierId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    DeleterId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DeletionTime = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppCuaHangs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AppDonHangTongs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MaDonTong = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    NguoiDungId = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    TenKhachHang = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                    SoDienThoai = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    DiaChi = table.Column<string>(type: "nvarchar(512)", maxLength: 512, nullable: false),
                    GhiChu = table.Column<string>(type: "nvarchar(1024)", maxLength: 1024, nullable: true),
                    TongTien = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    PhuongThucThanhToan = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    TrangThai = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    ExtraProperties = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ConcurrencyStamp = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    CreationTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatorId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    LastModificationTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastModifierId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    DeleterId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DeletionTime = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppDonHangTongs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AppGiaoDichVis",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ViCuaHangId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CuaHangId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LoaiGiaoDich = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    SoTien = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    SoDuSauGiaoDich = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    MoTa = table.Column<string>(type: "nvarchar(512)", maxLength: 512, nullable: false),
                    MaDonHangLienQuan = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: true),
                    CreationTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatorId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppGiaoDichVis", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AppViCuaHangs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CuaHangId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SoDuKhaDung = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    SoDuTamGiu = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    TongTienDaRut = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    ExtraProperties = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ConcurrencyStamp = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    CreationTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatorId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    LastModificationTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastModifierId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    DeleterId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DeletionTime = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppViCuaHangs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AppYeuCauRutTiens",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CuaHangId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SoTien = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    TenNganHang = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                    SoTaiKhoan = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    TenChuTaiKhoan = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                    TrangThai = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    GhiChu = table.Column<string>(type: "nvarchar(512)", maxLength: 512, nullable: true),
                    LyDoTuChoi = table.Column<string>(type: "nvarchar(512)", maxLength: 512, nullable: true),
                    NgayXuLy = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ExtraProperties = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ConcurrencyStamp = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    CreationTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatorId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    LastModificationTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastModifierId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    DeleterId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DeletionTime = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppYeuCauRutTiens", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AppSanPhams_CuaHangId",
                table: "AppSanPhams",
                column: "CuaHangId");

            migrationBuilder.CreateIndex(
                name: "IX_AppSanPhams_MaSp",
                table: "AppSanPhams",
                column: "MaSp",
                unique: true,
                filter: "[IsDeleted] = 0");

            migrationBuilder.CreateIndex(
                name: "IX_AppDonHangs_CuaHangId",
                table: "AppDonHangs",
                column: "CuaHangId");

            migrationBuilder.CreateIndex(
                name: "IX_AppDonHangs_DonHangTongId",
                table: "AppDonHangs",
                column: "DonHangTongId");

            migrationBuilder.CreateIndex(
                name: "IX_AppDonHangs_MaDon",
                table: "AppDonHangs",
                column: "MaDon",
                unique: true,
                filter: "[IsDeleted] = 0");

            migrationBuilder.CreateIndex(
                name: "IX_AppDonHangs_TrangThai_CreationTime",
                table: "AppDonHangs",
                columns: new[] { "TrangThai", "CreationTime" });

            migrationBuilder.CreateIndex(
                name: "IX_AppCuaHangs_ChuSoHuuId",
                table: "AppCuaHangs",
                column: "ChuSoHuuId");

            migrationBuilder.CreateIndex(
                name: "IX_AppCuaHangs_Slug",
                table: "AppCuaHangs",
                column: "Slug",
                unique: true,
                filter: "[IsDeleted] = 0");

            migrationBuilder.CreateIndex(
                name: "IX_AppCuaHangs_TrangThai",
                table: "AppCuaHangs",
                column: "TrangThai");

            migrationBuilder.CreateIndex(
                name: "IX_AppDonHangTongs_MaDonTong",
                table: "AppDonHangTongs",
                column: "MaDonTong",
                unique: true,
                filter: "[IsDeleted] = 0");

            migrationBuilder.CreateIndex(
                name: "IX_AppDonHangTongs_NguoiDungId",
                table: "AppDonHangTongs",
                column: "NguoiDungId");

            migrationBuilder.CreateIndex(
                name: "IX_AppDonHangTongs_TrangThai",
                table: "AppDonHangTongs",
                column: "TrangThai");

            migrationBuilder.CreateIndex(
                name: "IX_AppGiaoDichVis_CreationTime",
                table: "AppGiaoDichVis",
                column: "CreationTime");

            migrationBuilder.CreateIndex(
                name: "IX_AppGiaoDichVis_CuaHangId",
                table: "AppGiaoDichVis",
                column: "CuaHangId");

            migrationBuilder.CreateIndex(
                name: "IX_AppGiaoDichVis_ViCuaHangId",
                table: "AppGiaoDichVis",
                column: "ViCuaHangId");

            migrationBuilder.CreateIndex(
                name: "IX_AppViCuaHangs_CuaHangId",
                table: "AppViCuaHangs",
                column: "CuaHangId",
                unique: true,
                filter: "[IsDeleted] = 0");

            migrationBuilder.CreateIndex(
                name: "IX_AppYeuCauRutTiens_CuaHangId",
                table: "AppYeuCauRutTiens",
                column: "CuaHangId");

            migrationBuilder.CreateIndex(
                name: "IX_AppYeuCauRutTiens_TrangThai",
                table: "AppYeuCauRutTiens",
                column: "TrangThai");

            migrationBuilder.AddForeignKey(
                name: "FK_AppDonHangs_AppDonHangTongs_DonHangTongId",
                table: "AppDonHangs",
                column: "DonHangTongId",
                principalTable: "AppDonHangTongs",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AppDonHangs_AppDonHangTongs_DonHangTongId",
                table: "AppDonHangs");

            migrationBuilder.DropTable(
                name: "AppCuaHangs");

            migrationBuilder.DropTable(
                name: "AppDonHangTongs");

            migrationBuilder.DropTable(
                name: "AppGiaoDichVis");

            migrationBuilder.DropTable(
                name: "AppViCuaHangs");

            migrationBuilder.DropTable(
                name: "AppYeuCauRutTiens");

            migrationBuilder.DropIndex(
                name: "IX_AppSanPhams_CuaHangId",
                table: "AppSanPhams");

            migrationBuilder.DropIndex(
                name: "IX_AppSanPhams_MaSp",
                table: "AppSanPhams");

            migrationBuilder.DropIndex(
                name: "IX_AppDonHangs_CuaHangId",
                table: "AppDonHangs");

            migrationBuilder.DropIndex(
                name: "IX_AppDonHangs_DonHangTongId",
                table: "AppDonHangs");

            migrationBuilder.DropIndex(
                name: "IX_AppDonHangs_MaDon",
                table: "AppDonHangs");

            migrationBuilder.DropIndex(
                name: "IX_AppDonHangs_TrangThai_CreationTime",
                table: "AppDonHangs");

            migrationBuilder.DropColumn(
                name: "CuaHangId",
                table: "AppSanPhams");

            migrationBuilder.DropColumn(
                name: "CuaHangId",
                table: "AppDonHangs");

            migrationBuilder.DropColumn(
                name: "DonHangTongId",
                table: "AppDonHangs");

            migrationBuilder.DropColumn(
                name: "PhiVanChuyen",
                table: "AppDonHangs");

            migrationBuilder.DropColumn(
                name: "ThucNhanCuaShop",
                table: "AppDonHangs");

            migrationBuilder.DropColumn(
                name: "TienHang",
                table: "AppDonHangs");

            migrationBuilder.DropColumn(
                name: "TienHoaHongSan",
                table: "AppDonHangs");
        }
    }
}
