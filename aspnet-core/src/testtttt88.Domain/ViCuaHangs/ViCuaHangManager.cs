using System;
using System.Threading.Tasks;
using Volo.Abp;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Domain.Services;

namespace testtttt88.ViCuaHangs;

/// <summary>
/// Domain Service quản lý Ví gian hàng, đối soát Escrow và dòng tiền sàn
/// </summary>
public class ViCuaHangManager : DomainService
{
    private readonly IRepository<ViCuaHang, Guid> _viRepository;
    private readonly IRepository<GiaoDichVi, Guid> _giaoDichRepository;
    private readonly IRepository<YeuCauRutTien, Guid> _rutTienRepository;

    public ViCuaHangManager(
        IRepository<ViCuaHang, Guid> viRepository,
        IRepository<GiaoDichVi, Guid> giaoDichRepository,
        IRepository<YeuCauRutTien, Guid> rutTienRepository)
    {
        _viRepository = viRepository;
        _giaoDichRepository = giaoDichRepository;
        _rutTienRepository = rutTienRepository;
    }

    /// <summary>
    /// Tạo ví mới cho gian hàng khi được kích hoạt
    /// </summary>
    public async Task<ViCuaHang> TaoViChoCuaHangAsync(Guid cuaHangId)
    {
        var existing = await _viRepository.FirstOrDefaultAsync(x => x.CuaHangId == cuaHangId);
        if (existing != null)
        {
            return existing;
        }

        var vi = new ViCuaHang(GuidGenerator.Create(), cuaHangId);
        return await _viRepository.InsertAsync(vi);
    }

    /// <summary>
    /// Ghi nhận tiền đơn hàng mới vào quỹ tạm giữ (Escrow)
    /// </summary>
    public async Task GhiNhanDonHangMoiAsync(Guid cuaHangId, decimal tongTienDon, string maDon)
    {
        var vi = await LayHoacTaoViAsync(cuaHangId);
        vi.CongTienTamGiu(tongTienDon);
        await _viRepository.UpdateAsync(vi);

        var gd = new GiaoDichVi(
            GuidGenerator.Create(),
            vi.Id,
            cuaHangId,
            GiaoDichVi.LoaiCongTamGiu,
            tongTienDon,
            vi.SoDuKhaDung,
            $"Ghi nhận tiền tạm giữ cho đơn hàng #{maDon}",
            maDon
        );
        await _giaoDichRepository.InsertAsync(gd);
    }

    /// <summary>
    /// Hủy tiền tạm giữ Escrow khi đơn hàng bị hủy
    /// </summary>
    public async Task HuyDonTamGiuAsync(Guid cuaHangId, decimal tongTienDon, string maDon)
    {
        var vi = await LayHoacTaoViAsync(cuaHangId);
        vi.HuyDonTamGiu(tongTienDon);
        await _viRepository.UpdateAsync(vi);

        var gd = new GiaoDichVi(
            GuidGenerator.Create(),
            vi.Id,
            cuaHangId,
            GiaoDichVi.LoaiTruTamGiuHuyDon,
            -tongTienDon,
            vi.SoDuKhaDung,
            $"Hủy tiền tạm giữ cho đơn hàng bị hủy #{maDon}",
            maDon
        );
        await _giaoDichRepository.InsertAsync(gd);
    }

    /// <summary>
    /// Quyết toán khi đơn hàng hoàn thành: Chuyển tiền thực nhận (sau trừ hoa hồng) vào số dư khả dụng
    /// </summary>
    public async Task QuyetToanDonHangAsync(Guid cuaHangId, decimal tienThucNhan, decimal tongTienGoc, string maDon)
    {
        var vi = await LayHoacTaoViAsync(cuaHangId);
        vi.QuyetToanDonHang(tienThucNhan, tongTienGoc);
        await _viRepository.UpdateAsync(vi);

        var gd = new GiaoDichVi(
            GuidGenerator.Create(),
            vi.Id,
            cuaHangId,
            GiaoDichVi.LoaiQuyetToan,
            tienThucNhan,
            vi.SoDuKhaDung,
            $"Quyết toán doanh thu đơn hàng #{maDon} (+{tienThucNhan:#,##0} VNĐ)",
            maDon
        );
        await _giaoDichRepository.InsertAsync(gd);
    }

    /// <summary>
    /// Xử lý hoàn tiền cho đơn hàng được chấp nhận trả hàng/hoàn tiền
    /// </summary>
    public async Task HoanTienDonHangAsync(Guid cuaHangId, decimal tienThucNhan, decimal tongTienGoc, string maDon, bool daQuyetToan)
    {
        var vi = await LayHoacTaoViAsync(cuaHangId);
        if (daQuyetToan)
        {
            vi.HoanTienDonDaQuyetToan(tienThucNhan);
        }
        else
        {
            vi.HuyDonTamGiu(tongTienGoc);
        }
        await _viRepository.UpdateAsync(vi);

        var gd = new GiaoDichVi(
            GuidGenerator.Create(),
            vi.Id,
            cuaHangId,
            "HoanTien",
            -(daQuyetToan ? tienThucNhan : tongTienGoc),
            vi.SoDuKhaDung,
            $"Hoàn tiền đơn hàng #{maDon} (Chấp nhận yêu cầu trả hàng)",
            maDon
        );
        await _giaoDichRepository.InsertAsync(gd);
    }

    /// <summary>
    /// Tạo yêu cầu rút tiền về ngân hàng
    /// </summary>
    public async Task<YeuCauRutTien> TaoYeuCauRutTienAsync(
        Guid cuaHangId,
        decimal soTien,
        string tenNganHang,
        string soTaiKhoan,
        string tenChuTaiKhoan,
        string? ghiChu = null)
    {
        if (soTien < 50000m)
        {
            throw new UserFriendlyException("Số tiền rút tối thiểu là 50,000 VNĐ!");
        }

        var vi = await LayHoacTaoViAsync(cuaHangId);
        if (vi.SoDuKhaDung < soTien)
        {
            throw new UserFriendlyException($"Số dư khả dụng ({vi.SoDuKhaDung:#,##0} VNĐ) không đủ để rút {soTien:#,##0} VNĐ!");
        }

        vi.TruTienRut(soTien);
        await _viRepository.UpdateAsync(vi);

        var yeuCau = new YeuCauRutTien(
            GuidGenerator.Create(),
            cuaHangId,
            soTien,
            tenNganHang,
            soTaiKhoan,
            tenChuTaiKhoan,
            ghiChu
        );
        await _rutTienRepository.InsertAsync(yeuCau);

        var gd = new GiaoDichVi(
            GuidGenerator.Create(),
            vi.Id,
            cuaHangId,
            GiaoDichVi.LoaiRutTien,
            -soTien,
            vi.SoDuKhaDung,
            $"Tạo lệnh rút tiền #{yeuCau.Id.ToString()[..8]} về {tenNganHang} - {soTaiKhoan}"
        );
        await _giaoDichRepository.InsertAsync(gd);

        return yeuCau;
    }

    /// <summary>
    /// Phê duyệt yêu cầu rút tiền (Admin sàn bấm sau khi đã chuyển khoản thực tế)
    /// </summary>
    public async Task PheDuyetRutTienAsync(Guid yeuCauId)
    {
        var yeuCau = await _rutTienRepository.GetAsync(yeuCauId);
        if (yeuCau.TrangThai != YeuCauRutTien.TrangThaiChoDuyet)
        {
            throw new UserFriendlyException("Yêu cầu này đã được xử lý trước đó!");
        }

        yeuCau.PheDuyet();
        await _rutTienRepository.UpdateAsync(yeuCau);

        // Chỉ khi Admin phê duyệt giải ngân mới chính thức ghi nhận vào Tổng tiền đã rút thành công của Shop
        var vi = await LayHoacTaoViAsync(yeuCau.CuaHangId);
        vi.XacNhanRutTienThanhCong(yeuCau.SoTien);
        await _viRepository.UpdateAsync(vi);
    }

    /// <summary>
    /// Từ chối yêu cầu rút tiền: Hoàn lại tiền vào số dư khả dụng của Shop
    /// </summary>
    public async Task TuChoiRutTienAsync(Guid yeuCauId, string lyDo)
    {
        var yeuCau = await _rutTienRepository.GetAsync(yeuCauId);
        if (yeuCau.TrangThai != YeuCauRutTien.TrangThaiChoDuyet)
        {
            throw new UserFriendlyException("Yêu cầu này đã được xử lý trước đó!");
        }

        yeuCau.TuChoi(lyDo);
        await _rutTienRepository.UpdateAsync(yeuCau);

        var vi = await LayHoacTaoViAsync(yeuCau.CuaHangId);
        vi.HoanTienRutBiTuChoi(yeuCau.SoTien);
        await _viRepository.UpdateAsync(vi);

        var gd = new GiaoDichVi(
            GuidGenerator.Create(),
            vi.Id,
            yeuCau.CuaHangId,
            GiaoDichVi.LoaiHoanTienRut,
            yeuCau.SoTien,
            vi.SoDuKhaDung,
            $"Hoàn tiền lệnh rút #{yeuCau.Id.ToString()[..8]} do bị từ chối: {lyDo}"
        );
        await _giaoDichRepository.InsertAsync(gd);
    }

    private async Task<ViCuaHang> LayHoacTaoViAsync(Guid cuaHangId)
    {
        var vi = await _viRepository.FirstOrDefaultAsync(x => x.CuaHangId == cuaHangId);
        if (vi == null)
        {
            vi = new ViCuaHang(GuidGenerator.Create(), cuaHangId);
            vi = await _viRepository.InsertAsync(vi);
        }
        return vi;
    }
}

