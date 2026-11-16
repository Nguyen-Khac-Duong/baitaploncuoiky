using System;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Volo.Abp;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Domain.Services;

namespace testtttt88.DanhMucs;

public class DanhMucManager : DomainService
{
    private readonly IRepository<DanhMuc, Guid> _danhMucRepository;

    public DanhMucManager(IRepository<DanhMuc, Guid> danhMucRepository)
    {
        _danhMucRepository = danhMucRepository;
    }

    public async Task<DanhMuc> CreateAsync(
        string ten,
        string? slug = null,
        string? icon = null,
        string? moTa = null,
        Guid? parentId = null,
        int thuTu = 0,
        bool trangThai = true)
    {
        Check.NotNullOrWhiteSpace(ten, nameof(ten));

        var finalSlug = string.IsNullOrWhiteSpace(slug) ? TaoSlugTuTen(ten) : slug.Trim().ToLowerInvariant();

        var existing = await _danhMucRepository.FirstOrDefaultAsync(x => x.Slug == finalSlug);
        if (existing != null)
        {
            finalSlug = $"{finalSlug}-{Guid.NewGuid().ToString()[..4]}";
        }

        if (parentId.HasValue)
        {
            var parent = await _danhMucRepository.FindAsync(parentId.Value);
            if (parent == null)
            {
                throw new BusinessException("DanhMuc:ParentNotFound", "Không tìm thấy danh mục cha!");
            }
        }

        var danhMuc = new DanhMuc(
            id: GuidGenerator.Create(),
            ten: ten,
            slug: finalSlug,
            icon: icon,
            moTa: moTa,
            parentId: parentId,
            thuTu: thuTu,
            trangThai: trangThai
        );

        return await _danhMucRepository.InsertAsync(danhMuc);
    }

    public async Task<DanhMuc> UpdateAsync(
        Guid id,
        string ten,
        string? slug = null,
        string? icon = null,
        string? moTa = null,
        Guid? parentId = null,
        int thuTu = 0,
        bool trangThai = true)
    {
        var danhMuc = await _danhMucRepository.GetAsync(id);

        if (parentId.HasValue && parentId.Value == id)
        {
            throw new BusinessException("DanhMuc:InvalidParent", "Danh mục không thể là danh mục cha của chính nó!");
        }

        danhMuc.SetTen(ten);

        if (!string.IsNullOrWhiteSpace(slug))
        {
            var cleanSlug = slug.Trim().ToLowerInvariant();
            var existing = await _danhMucRepository.FirstOrDefaultAsync(x => x.Slug == cleanSlug && x.Id != id);
            if (existing != null)
            {
                throw new BusinessException("DanhMuc:SlugExisted", "Đường dẫn slug này đã được sử dụng!");
            }
            danhMuc.SetSlug(cleanSlug);
        }

        danhMuc.Icon = icon;
        danhMuc.MoTa = moTa;
        danhMuc.ParentId = parentId;
        danhMuc.ThuTu = thuTu;
        danhMuc.TrangThai = trangThai;

        return await _danhMucRepository.UpdateAsync(danhMuc);
    }

    public static string TaoSlugTuTen(string input)
    {
        if (string.IsNullOrWhiteSpace(input)) return string.Empty;

        var str = input.ToLowerInvariant().Trim();
        str = Regex.Replace(str, @"[áàảãạăắằẳẵặâấầẩẫậ]", "a");
        str = Regex.Replace(str, @"[éèẻẽẹêếềểễệ]", "e");
        str = Regex.Replace(str, @"[íìỉĩị]", "i");
        str = Regex.Replace(str, @"[óòỏõọôốồổỗộơớờởỡợ]", "o");
        str = Regex.Replace(str, @"[úùủũụưứừửữự]", "u");
        str = Regex.Replace(str, @"[ýỳỷỹỵ]", "y");
        str = Regex.Replace(str, @"[đ]", "d");
        str = Regex.Replace(str, @"[^a-z0-9\s-]", "");
        str = Regex.Replace(str, @"\s+", "-").Trim('-');

        return str;
    }
}

