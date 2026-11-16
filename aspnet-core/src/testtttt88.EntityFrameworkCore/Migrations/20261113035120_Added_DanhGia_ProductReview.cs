using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace testtttt88.Migrations
{
    /// <inheritdoc />
    public partial class Added_DanhGia_ProductReview : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AppDanhGiaSanPhams",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SanPhamId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DonHangId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CuaHangId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    NguoiDungId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenNguoiDung = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                    AvatarNguoiDung = table.Column<string>(type: "nvarchar(1024)", maxLength: 1024, nullable: true),
                    SoSao = table.Column<int>(type: "int", nullable: false),
                    NoiDung = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    HinhAnh = table.Column<string>(type: "nvarchar(1024)", maxLength: 1024, nullable: true),
                    DonHangCoHoanTra = table.Column<bool>(type: "bit", nullable: false),
                    PhanHoiShop = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    ThoiGianPhanHoi = table.Column<DateTime>(type: "datetime2", nullable: true),
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
                    table.PrimaryKey("PK_AppDanhGiaSanPhams", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AppDanhGiaSanPhams_CuaHangId",
                table: "AppDanhGiaSanPhams",
                column: "CuaHangId");

            migrationBuilder.CreateIndex(
                name: "IX_AppDanhGiaSanPhams_DonHangId",
                table: "AppDanhGiaSanPhams",
                column: "DonHangId");

            migrationBuilder.CreateIndex(
                name: "IX_AppDanhGiaSanPhams_DonHangId_SanPhamId",
                table: "AppDanhGiaSanPhams",
                columns: new[] { "DonHangId", "SanPhamId" });

            migrationBuilder.CreateIndex(
                name: "IX_AppDanhGiaSanPhams_NguoiDungId",
                table: "AppDanhGiaSanPhams",
                column: "NguoiDungId");

            migrationBuilder.CreateIndex(
                name: "IX_AppDanhGiaSanPhams_SanPhamId",
                table: "AppDanhGiaSanPhams",
                column: "SanPhamId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AppDanhGiaSanPhams");
        }
    }
}
