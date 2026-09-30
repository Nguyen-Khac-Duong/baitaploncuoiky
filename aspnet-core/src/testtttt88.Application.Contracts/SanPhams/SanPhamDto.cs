using System;
using Volo.Abp.Application.Dtos;

namespace testtttt88.SanPhams;

public class SanPhamDto : FullAuditedEntityDto<Guid>
{
    public string MaSp { get; set; } = string.Empty;
    public string Ten { get; set; } = string.Empty;
    public decimal Gia { get; set; }
    public int SoLuongTon { get; set; }
    public string DanhMuc { get; set; } = string.Empty;
    public string? HinhAnh { get; set; }
    public string? MoTa { get; set; }
    public DateTime NgayTao { get; set; }
}
