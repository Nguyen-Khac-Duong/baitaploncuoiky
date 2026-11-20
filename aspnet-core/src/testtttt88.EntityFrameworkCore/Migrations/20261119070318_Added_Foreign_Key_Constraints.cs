using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace testtttt88.Migrations
{
    /// <inheritdoc />
    public partial class Added_Foreign_Key_Constraints : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AppDonHangs_AppDonHangTongs_DonHangTongId",
                table: "AppDonHangs");

            migrationBuilder.CreateIndex(
                name: "IX_AppChiTietDonHangs_SanPhamId",
                table: "AppChiTietDonHangs",
                column: "SanPhamId");

            migrationBuilder.AddForeignKey(
                name: "FK_AppChiTietDonHangs_AppSanPhams_SanPhamId",
                table: "AppChiTietDonHangs",
                column: "SanPhamId",
                principalTable: "AppSanPhams",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_AppDanhGiaSanPhams_AppCuaHangs_CuaHangId",
                table: "AppDanhGiaSanPhams",
                column: "CuaHangId",
                principalTable: "AppCuaHangs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_AppDanhGiaSanPhams_AppDonHangs_DonHangId",
                table: "AppDanhGiaSanPhams",
                column: "DonHangId",
                principalTable: "AppDonHangs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_AppDanhGiaSanPhams_AppSanPhams_SanPhamId",
                table: "AppDanhGiaSanPhams",
                column: "SanPhamId",
                principalTable: "AppSanPhams",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_AppDonHangs_AppCuaHangs_CuaHangId",
                table: "AppDonHangs",
                column: "CuaHangId",
                principalTable: "AppCuaHangs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_AppDonHangs_AppDonHangTongs_DonHangTongId",
                table: "AppDonHangs",
                column: "DonHangTongId",
                principalTable: "AppDonHangTongs",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_AppGiaoDichVis_AppCuaHangs_CuaHangId",
                table: "AppGiaoDichVis",
                column: "CuaHangId",
                principalTable: "AppCuaHangs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_AppGiaoDichVis_AppViCuaHangs_ViCuaHangId",
                table: "AppGiaoDichVis",
                column: "ViCuaHangId",
                principalTable: "AppViCuaHangs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AppSanPhams_AppCuaHangs_CuaHangId",
                table: "AppSanPhams",
                column: "CuaHangId",
                principalTable: "AppCuaHangs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_AppSanPhams_AppDanhMucs_DanhMucId",
                table: "AppSanPhams",
                column: "DanhMucId",
                principalTable: "AppDanhMucs",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_AppThongBaos_AppCuaHangs_CuaHangId",
                table: "AppThongBaos",
                column: "CuaHangId",
                principalTable: "AppCuaHangs",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_AppViCuaHangs_AppCuaHangs_CuaHangId",
                table: "AppViCuaHangs",
                column: "CuaHangId",
                principalTable: "AppCuaHangs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_AppYeuCauRutTiens_AppCuaHangs_CuaHangId",
                table: "AppYeuCauRutTiens",
                column: "CuaHangId",
                principalTable: "AppCuaHangs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AppChiTietDonHangs_AppSanPhams_SanPhamId",
                table: "AppChiTietDonHangs");

            migrationBuilder.DropForeignKey(
                name: "FK_AppDanhGiaSanPhams_AppCuaHangs_CuaHangId",
                table: "AppDanhGiaSanPhams");

            migrationBuilder.DropForeignKey(
                name: "FK_AppDanhGiaSanPhams_AppDonHangs_DonHangId",
                table: "AppDanhGiaSanPhams");

            migrationBuilder.DropForeignKey(
                name: "FK_AppDanhGiaSanPhams_AppSanPhams_SanPhamId",
                table: "AppDanhGiaSanPhams");

            migrationBuilder.DropForeignKey(
                name: "FK_AppDonHangs_AppCuaHangs_CuaHangId",
                table: "AppDonHangs");

            migrationBuilder.DropForeignKey(
                name: "FK_AppDonHangs_AppDonHangTongs_DonHangTongId",
                table: "AppDonHangs");

            migrationBuilder.DropForeignKey(
                name: "FK_AppGiaoDichVis_AppCuaHangs_CuaHangId",
                table: "AppGiaoDichVis");

            migrationBuilder.DropForeignKey(
                name: "FK_AppGiaoDichVis_AppViCuaHangs_ViCuaHangId",
                table: "AppGiaoDichVis");

            migrationBuilder.DropForeignKey(
                name: "FK_AppSanPhams_AppCuaHangs_CuaHangId",
                table: "AppSanPhams");

            migrationBuilder.DropForeignKey(
                name: "FK_AppSanPhams_AppDanhMucs_DanhMucId",
                table: "AppSanPhams");

            migrationBuilder.DropForeignKey(
                name: "FK_AppThongBaos_AppCuaHangs_CuaHangId",
                table: "AppThongBaos");

            migrationBuilder.DropForeignKey(
                name: "FK_AppViCuaHangs_AppCuaHangs_CuaHangId",
                table: "AppViCuaHangs");

            migrationBuilder.DropForeignKey(
                name: "FK_AppYeuCauRutTiens_AppCuaHangs_CuaHangId",
                table: "AppYeuCauRutTiens");

            migrationBuilder.DropIndex(
                name: "IX_AppChiTietDonHangs_SanPhamId",
                table: "AppChiTietDonHangs");

            migrationBuilder.AddForeignKey(
                name: "FK_AppDonHangs_AppDonHangTongs_DonHangTongId",
                table: "AppDonHangs",
                column: "DonHangTongId",
                principalTable: "AppDonHangTongs",
                principalColumn: "Id");
        }
    }
}
