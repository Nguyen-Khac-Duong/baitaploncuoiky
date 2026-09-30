using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;

namespace testtttt88.SanPhams;

public class SanPhamAppService :
    CrudAppService<SanPham, SanPhamDto, Guid, PagedAndSortedResultRequestDto, CreateUpdateSanPhamDto>,
    ISanPhamAppService
{
    public SanPhamAppService(IRepository<SanPham, Guid> repository)
        : base(repository)
    {
    }

    public async Task<List<SanPhamDto>> GetAllListAsync()
    {
        var entities = await Repository.GetListAsync();
        return entities.Select(MapToDto).ToList();
    }

    protected override Task<SanPhamDto> MapToGetOutputDtoAsync(SanPham entity)
    {
        return Task.FromResult(MapToDto(entity));
    }

    protected override Task<List<SanPhamDto>> MapToGetListOutputDtosAsync(List<SanPham> entities)
    {
        return Task.FromResult(entities.Select(MapToDto).ToList());
    }

    protected override Task<SanPham> MapToEntityAsync(CreateUpdateSanPhamDto createInput)
    {
        var entity = new SanPham(
            GuidGenerator.Create(),
            createInput.MaSp,
            createInput.Ten,
            createInput.Gia,
            createInput.SoLuongTon,
            createInput.DanhMuc,
            createInput.HinhAnh,
            createInput.MoTa
        );
        return Task.FromResult(entity);
    }

    protected override Task MapToEntityAsync(CreateUpdateSanPhamDto updateInput, SanPham entity)
    {
        entity.MaSp = updateInput.MaSp;
        entity.Ten = updateInput.Ten;
        entity.Gia = updateInput.Gia;
        entity.SoLuongTon = updateInput.SoLuongTon;
        entity.DanhMuc = updateInput.DanhMuc;
        entity.HinhAnh = updateInput.HinhAnh;
        entity.MoTa = updateInput.MoTa;
        return Task.CompletedTask;
    }

    private static SanPhamDto MapToDto(SanPham entity)
    {
        return new SanPhamDto
        {
            Id = entity.Id,
            MaSp = entity.MaSp,
            Ten = entity.Ten,
            Gia = entity.Gia,
            SoLuongTon = entity.SoLuongTon,
            DanhMuc = entity.DanhMuc,
            HinhAnh = entity.HinhAnh,
            MoTa = entity.MoTa,
            NgayTao = entity.NgayTao,
            CreationTime = entity.CreationTime,
            CreatorId = entity.CreatorId,
            LastModificationTime = entity.LastModificationTime,
            LastModifierId = entity.LastModifierId
        };
    }
}
