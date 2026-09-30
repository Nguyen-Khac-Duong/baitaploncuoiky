using System;
using System.ComponentModel.DataAnnotations;

namespace testtttt88.SanPhams;

public class CreateUpdateSanPhamDto
{
    [Required]
    [MaxLength(32)]
    public string MaSp { get; set; } = string.Empty;

    [Required]
    [MaxLength(256)]
    public string Ten { get; set; } = string.Empty;

    [Range(0, double.MaxValue)]
    public decimal Gia { get; set; }

    [Range(0, int.MaxValue)]
    public int SoLuongTon { get; set; }

    [Required]
    [MaxLength(128)]
    public string DanhMuc { get; set; } = string.Empty;

    [MaxLength(1024)]
    public string? HinhAnh { get; set; }

    [MaxLength(2048)]
    public string? MoTa { get; set; }
}
