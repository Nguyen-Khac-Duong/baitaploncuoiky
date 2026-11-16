using System;
using System.Collections.Generic;
using Volo.Abp.Application.Dtos;

namespace testtttt88.DanhMucs;

public class DanhMucDto : FullAuditedEntityDto<Guid>
{
    public string Ten { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Icon { get; set; }
    public string? MoTa { get; set; }
    public Guid? ParentId { get; set; }
    public string? TenDanhMucCha { get; set; }
    public int ThuTu { get; set; }
    public bool TrangThai { get; set; }
    public int SoLuongSanPham { get; set; }
}

public class DanhMucTreeDto : DanhMucDto
{
    public List<DanhMucTreeDto> Children { get; set; } = new();
}

public class CreateUpdateDanhMucDto
{
    public string Ten { get; set; } = string.Empty;
    public string? Slug { get; set; }
    public string? Icon { get; set; }
    public string? MoTa { get; set; }
    public Guid? ParentId { get; set; }
    public int ThuTu { get; set; } = 0;
    public bool TrangThai { get; set; } = true;
}
