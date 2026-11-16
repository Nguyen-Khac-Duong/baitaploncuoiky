using System;
using Volo.Abp;
using Volo.Abp.Domain.Entities.Auditing;

namespace testtttt88.DanhMucs;

/// <summary>
/// Thực thể Danh Mục Sản Phẩm (Hỗ trợ cấu trúc cây phân cấp 2-3 tầng)
/// </summary>
public class DanhMuc : FullAuditedAggregateRoot<Guid>
{
    public string Ten { get; private set; } = string.Empty;
    public string Slug { get; private set; } = string.Empty;
    public string? Icon { get; set; }
    public string? MoTa { get; set; }
    public Guid? ParentId { get; set; }
    public int ThuTu { get; set; }
    public bool TrangThai { get; set; } = true;

    protected DanhMuc()
    {
    }

    public DanhMuc(
        Guid id,
        string ten,
        string slug,
        string? icon = null,
        string? moTa = null,
        Guid? parentId = null,
        int thuTu = 0,
        bool trangThai = true)
        : base(id)
    {
        SetTen(ten);
        SetSlug(slug);
        Icon = icon;
        MoTa = moTa;
        ParentId = parentId;
        ThuTu = thuTu;
        TrangThai = trangThai;
    }

    public void SetTen(string ten)
    {
        Ten = Check.NotNullOrWhiteSpace(ten, nameof(ten), maxLength: 256);
    }

    public void SetSlug(string slug)
    {
        Slug = Check.NotNullOrWhiteSpace(slug, nameof(slug), maxLength: 256).Trim().ToLowerInvariant();
    }
}

