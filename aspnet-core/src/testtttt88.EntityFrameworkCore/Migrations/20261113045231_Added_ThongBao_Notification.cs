using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace testtttt88.Migrations
{
    /// <inheritdoc />
    public partial class Added_ThongBao_Notification : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AppThongBaos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    NguoiDungId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CuaHangId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    TieuDe = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    NoiDung = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    Loai = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    LienKet = table.Column<string>(type: "nvarchar(512)", maxLength: 512, nullable: true),
                    DaDoc = table.Column<bool>(type: "bit", nullable: false),
                    ThoiGianDoc = table.Column<DateTime>(type: "datetime2", nullable: true),
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
                    table.PrimaryKey("PK_AppThongBaos", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AppThongBaos_CreationTime",
                table: "AppThongBaos",
                column: "CreationTime");

            migrationBuilder.CreateIndex(
                name: "IX_AppThongBaos_CuaHangId",
                table: "AppThongBaos",
                column: "CuaHangId");

            migrationBuilder.CreateIndex(
                name: "IX_AppThongBaos_NguoiDungId",
                table: "AppThongBaos",
                column: "NguoiDungId");

            migrationBuilder.CreateIndex(
                name: "IX_AppThongBaos_NguoiDungId_DaDoc",
                table: "AppThongBaos",
                columns: new[] { "NguoiDungId", "DaDoc" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AppThongBaos");
        }
    }
}
