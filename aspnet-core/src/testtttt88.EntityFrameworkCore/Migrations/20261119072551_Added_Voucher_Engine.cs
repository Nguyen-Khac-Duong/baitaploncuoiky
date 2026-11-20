using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace testtttt88.Migrations
{
    /// <inheritdoc />
    public partial class Added_Voucher_Engine : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "MaVoucher",
                table: "AppDonHangTongs",
                type: "nvarchar(32)",
                maxLength: 32,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "TienGiamVoucher",
                table: "AppDonHangTongs",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "TienGiamVoucher",
                table: "AppDonHangs",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.CreateTable(
                name: "AppVouchers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MaVoucher = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    TieuDe = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    MoTa = table.Column<string>(type: "nvarchar(1024)", maxLength: 1024, nullable: true),
                    LoaiGiamGia = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    GiaTriGiam = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    GiaTriDonToiThieu = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    GiamToiDa = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    SoLuong = table.Column<int>(type: "int", nullable: false),
                    SoLuongDaDung = table.Column<int>(type: "int", nullable: false),
                    NgayBatDau = table.Column<DateTime>(type: "datetime2", nullable: false),
                    NgayKetThuc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CuaHangId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    KichHoat = table.Column<bool>(type: "bit", nullable: false),
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
                    table.PrimaryKey("PK_AppVouchers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AppVouchers_AppCuaHangs_CuaHangId",
                        column: x => x.CuaHangId,
                        principalTable: "AppCuaHangs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AppVouchers_CuaHangId",
                table: "AppVouchers",
                column: "CuaHangId");

            migrationBuilder.CreateIndex(
                name: "IX_AppVouchers_KichHoat",
                table: "AppVouchers",
                column: "KichHoat");

            migrationBuilder.CreateIndex(
                name: "IX_AppVouchers_MaVoucher",
                table: "AppVouchers",
                column: "MaVoucher",
                unique: true,
                filter: "[IsDeleted] = 0");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AppVouchers");

            migrationBuilder.DropColumn(
                name: "MaVoucher",
                table: "AppDonHangTongs");

            migrationBuilder.DropColumn(
                name: "TienGiamVoucher",
                table: "AppDonHangTongs");

            migrationBuilder.DropColumn(
                name: "TienGiamVoucher",
                table: "AppDonHangs");
        }
    }
}
