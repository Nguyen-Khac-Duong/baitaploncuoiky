using System;
using System.Threading.Tasks;
using testtttt88.DanhMucs;
using Volo.Abp.Data;
using Volo.Abp.DependencyInjection;
using Volo.Abp.Domain.Repositories;

namespace testtttt88.Data;

public class DanhMucDataSeederContributor : IDataSeedContributor, ITransientDependency
{
    private readonly IRepository<DanhMuc, Guid> _danhMucRepository;

    public DanhMucDataSeederContributor(IRepository<DanhMuc, Guid> danhMucRepository)
    {
        _danhMucRepository = danhMucRepository;
    }

    public async Task SeedAsync(DataSeedContext context)
    {
        if (await _danhMucRepository.GetCountAsync() > 0)
        {
            return;
        }

        // === 1. THIẾT BỊ ĐIỆN TỬ & CÔNG NGHỆ ===
        var catCongNghe = await _danhMucRepository.InsertAsync(new DanhMuc(
            Guid.Parse("11111111-1111-1111-1111-111111111111"),
            ten: "Thiết Bị Điện Tử & Công Nghệ",
            slug: "thiet-bi-dien-tu-cong-nghe",
            icon: "📱",
            moTa: "Điện thoại, laptop, máy tính bảng, linh kiện và phụ kiện công nghệ chính hãng.",
            parentId: null,
            thuTu: 1
        ));

        await _danhMucRepository.InsertAsync(new DanhMuc(
            Guid.NewGuid(),
            "Điện Thoại & Tablet",
            "dien-thoai-tablet",
            "📱",
            parentId: catCongNghe.Id,
            thuTu: 1
        ));
        await _danhMucRepository.InsertAsync(new DanhMuc(
            Guid.NewGuid(),
            "Laptop & Máy Vi Tính",
            "laptop-may-vi-tinh",
            "💻",
            parentId: catCongNghe.Id,
            thuTu: 2
        ));
        await _danhMucRepository.InsertAsync(new DanhMuc(
            Guid.NewGuid(),
            "Phụ Kiện Công Nghệ",
            "phu-kien-cong-nghe",
            "🔌",
            parentId: catCongNghe.Id,
            thuTu: 3
        ));
        await _danhMucRepository.InsertAsync(new DanhMuc(
            Guid.NewGuid(),
            "Thiết Bị Âm Thanh",
            "thiet-bi-am-thanh",
            "🎧",
            parentId: catCongNghe.Id,
            thuTu: 4
        ));

        // === 2. THỜI TRANG & PHỤ KIỆN ===
        var catThoiTrang = await _danhMucRepository.InsertAsync(new DanhMuc(
            Guid.Parse("22222222-2222-2222-2222-222222222222"),
            ten: "Thời Trang & Phụ Kiện",
            slug: "thoi-trang-phu-kien",
            icon: "👕",
            moTa: "Thời trang nam nữ, giày dép, túi xách phong cách hiện đại.",
            parentId: null,
            thuTu: 2
        ));

        await _danhMucRepository.InsertAsync(new DanhMuc(
            Guid.NewGuid(),
            "Thời Trang Nam",
            "thoi-trang-nam",
            "👔",
            parentId: catThoiTrang.Id,
            thuTu: 1
        ));
        await _danhMucRepository.InsertAsync(new DanhMuc(
            Guid.NewGuid(),
            "Thời Trang Nữ",
            "thoi-trang-nu",
            "👗",
            parentId: catThoiTrang.Id,
            thuTu: 2
        ));
        await _danhMucRepository.InsertAsync(new DanhMuc(
            Guid.NewGuid(),
            "Giày Dép & Túi Xách",
            "giay-dep-tui-xach",
            "👟",
            parentId: catThoiTrang.Id,
            thuTu: 3
        ));
        await _danhMucRepository.InsertAsync(new DanhMuc(
            Guid.NewGuid(),
            "Đồng Hồ & Trang Sức",
            "dong-ho-trang-suc",
            "⌚",
            parentId: catThoiTrang.Id,
            thuTu: 4
        ));

        // === 3. NHÀ CỬA & ĐỜI SỐNG ===
        var catNhaCua = await _danhMucRepository.InsertAsync(new DanhMuc(
            Guid.Parse("33333333-3333-3333-3333-333333333333"),
            ten: "Nhà Cửa & Đời Sống",
            slug: "nha-cua-doi-song",
            icon: "🏠",
            moTa: "Đồ gia dụng, thiết bị bếp thông minh và nội thất hiện đại.",
            parentId: null,
            thuTu: 3
        ));

        await _danhMucRepository.InsertAsync(new DanhMuc(
            Guid.NewGuid(),
            "Thiết Bị Gia Dụng & Bếp",
            "thiet-bi-gia-dung-bep",
            "🍳",
            parentId: catNhaCua.Id,
            thuTu: 1
        ));
        await _danhMucRepository.InsertAsync(new DanhMuc(
            Guid.NewGuid(),
            "Nội Thất & Đèn Trang Trí",
            "noi-that-den-trang-tri",
            "🛋️",
            parentId: catNhaCua.Id,
            thuTu: 2
        ));

        // === 4. SỨC KHỎE & SẮC ĐẸP ===
        var catSacDep = await _danhMucRepository.InsertAsync(new DanhMuc(
            Guid.Parse("44444444-4444-4444-4444-444444444444"),
            ten: "Sức Khỏe & Sắc Đẹp",
            slug: "suc-khoe-sac-dep",
            icon: "💄",
            moTa: "Mỹ phẩm, chăm sóc da và thực phẩm bảo vệ sức khỏe.",
            parentId: null,
            thuTu: 4
        ));

        await _danhMucRepository.InsertAsync(new DanhMuc(
            Guid.NewGuid(),
            "Chăm Sóc Da & Mỹ Phẩm",
            "cham-soc-da-my-pham",
            "✨",
            parentId: catSacDep.Id,
            thuTu: 1
        ));
        await _danhMucRepository.InsertAsync(new DanhMuc(
            Guid.NewGuid(),
            "Thực Phẩm Chức Năng",
            "thuc-pham-chuc-nang",
            "💊",
            parentId: catSacDep.Id,
            thuTu: 2
        ));

        // === 5. BÁCH HÓA & THỰC PHẨM ===
        var catBachHoa = await _danhMucRepository.InsertAsync(new DanhMuc(
            Guid.Parse("55555555-5555-5555-5555-555555555555"),
            ten: "Bách Hóa & Thực Phẩm",
            slug: "bach-hoa-thuc-pham",
            icon: "🍎",
            moTa: "Thực phẩm sạch, đặc sản vùng miền, trà và đồ uống tươi ngon.",
            parentId: null,
            thuTu: 5
        ));

        await _danhMucRepository.InsertAsync(new DanhMuc(
            Guid.NewGuid(),
            "Đồ Ăn Vặt & Bánh Kẹo",
            "do-an-vat-banh-keo",
            "🍪",
            parentId: catBachHoa.Id,
            thuTu: 1
        ));
        await _danhMucRepository.InsertAsync(new DanhMuc(
            Guid.NewGuid(),
            "Nông Sản & Thực Phẩm Sạch",
            "nong-san-thuc-pham-sach",
            "🥬",
            parentId: catBachHoa.Id,
            thuTu: 2
        ));

        // === 6. THỂ THAO & DU LỊCH ===
        await _danhMucRepository.InsertAsync(new DanhMuc(
            Guid.Parse("66666666-6666-6666-6666-666666666666"),
            ten: "Thể Thao & Du Lịch",
            slug: "the-thao-du-lich",
            icon: "⚽",
            moTa: "Dụng cụ thể thao, đồ tập gym, vali và phụ kiện du lịch.",
            parentId: null,
            thuTu: 6
        ));

        // === 7. MẸ & BÉ ===
        await _danhMucRepository.InsertAsync(new DanhMuc(
            Guid.Parse("77777777-7777-7777-7777-777777777777"),
            ten: "Mẹ & Bé",
            slug: "me-va-be",
            icon: "🧸",
            moTa: "Đồ chơi giáo dục, sữa dinh dưỡng và thời trang an toàn cho bé.",
            parentId: null,
            thuTu: 7
        ));
    }
}

