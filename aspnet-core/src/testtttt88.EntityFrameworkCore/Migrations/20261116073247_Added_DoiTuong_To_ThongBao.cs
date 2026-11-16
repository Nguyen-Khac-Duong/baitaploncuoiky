using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace testtttt88.Migrations
{
    /// <inheritdoc />
    public partial class Added_DoiTuong_To_ThongBao : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "DoiTuong",
                table: "AppThongBaos",
                type: "nvarchar(32)",
                maxLength: 32,
                nullable: false,
                defaultValue: "buyer");

            migrationBuilder.CreateIndex(
                name: "IX_AppThongBaos_DoiTuong",
                table: "AppThongBaos",
                column: "DoiTuong");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_AppThongBaos_DoiTuong",
                table: "AppThongBaos");

            migrationBuilder.DropColumn(
                name: "DoiTuong",
                table: "AppThongBaos");
        }
    }
}
