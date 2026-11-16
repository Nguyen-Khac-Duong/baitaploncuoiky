using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace testtttt88.Migrations
{
    /// <inheritdoc />
    public partial class Added_Return_Refund_To_DonHang : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "GhiChuTraHang",
                table: "AppDonHangs",
                type: "nvarchar(1024)",
                maxLength: 1024,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "HinhAnhTraHang",
                table: "AppDonHangs",
                type: "nvarchar(1024)",
                maxLength: 1024,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LyDoTraHang",
                table: "AppDonHangs",
                type: "nvarchar(256)",
                maxLength: 256,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PhanHoiTraHang",
                table: "AppDonHangs",
                type: "nvarchar(1024)",
                maxLength: 1024,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ThoiGianXuLyTraHang",
                table: "AppDonHangs",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ThoiGianYeuCauTraHang",
                table: "AppDonHangs",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "GhiChuTraHang",
                table: "AppDonHangs");

            migrationBuilder.DropColumn(
                name: "HinhAnhTraHang",
                table: "AppDonHangs");

            migrationBuilder.DropColumn(
                name: "LyDoTraHang",
                table: "AppDonHangs");

            migrationBuilder.DropColumn(
                name: "PhanHoiTraHang",
                table: "AppDonHangs");

            migrationBuilder.DropColumn(
                name: "ThoiGianXuLyTraHang",
                table: "AppDonHangs");

            migrationBuilder.DropColumn(
                name: "ThoiGianYeuCauTraHang",
                table: "AppDonHangs");
        }
    }
}
