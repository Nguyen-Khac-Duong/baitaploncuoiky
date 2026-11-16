using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace testtttt88.Migrations
{
    /// <inheritdoc />
    public partial class Added_DanhMuc_CategoryTree : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "DanhMucId",
                table: "AppSanPhams",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "AppDanhMucs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Ten = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    Slug = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    Icon = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: true),
                    MoTa = table.Column<string>(type: "nvarchar(1024)", maxLength: 1024, nullable: true),
                    ParentId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ThuTu = table.Column<int>(type: "int", nullable: false),
                    TrangThai = table.Column<bool>(type: "bit", nullable: false),
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
                    table.PrimaryKey("PK_AppDanhMucs", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AppSanPhams_DanhMucId",
                table: "AppSanPhams",
                column: "DanhMucId");

            migrationBuilder.CreateIndex(
                name: "IX_AppDanhMucs_ParentId",
                table: "AppDanhMucs",
                column: "ParentId");

            migrationBuilder.CreateIndex(
                name: "IX_AppDanhMucs_Slug",
                table: "AppDanhMucs",
                column: "Slug",
                unique: true,
                filter: "[IsDeleted] = 0");

            migrationBuilder.CreateIndex(
                name: "IX_AppDanhMucs_TrangThai",
                table: "AppDanhMucs",
                column: "TrangThai");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AppDanhMucs");

            migrationBuilder.DropIndex(
                name: "IX_AppSanPhams_DanhMucId",
                table: "AppSanPhams");

            migrationBuilder.DropColumn(
                name: "DanhMucId",
                table: "AppSanPhams");
        }
    }
}
