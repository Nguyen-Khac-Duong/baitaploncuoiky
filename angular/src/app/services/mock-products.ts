export interface ProductItem {
  id: string;
  maSp: string;
  ten: string;
  gia: number;
  danhMuc: string;
  soLuongTon: number;
  hinhAnh: string;
  thongSoKyThuat: {
    manHinh?: string;
    chip?: string;
    ram?: string;
    boNho?: string;
    pin?: string;
    camera?: string;
    ketNoi?: string;
    trongLuong?: string;
  };
  moTaNgan: string;
  tinhNangNoiBat: string[];
}

export const MOCK_PRODUCTS: ProductItem[] = [
  {
    id: 'sp-01',
    maSp: 'IP16PM-256',
    ten: 'iPhone 16 Pro Max 256GB',
    gia: 34990000,
    danhMuc: 'Điện thoại',
    soLuongTon: 15,
    hinhAnh: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&auto=format&fit=crop&q=80',
    thongSoKyThuat: {
      manHinh: '6.9" OLED 120Hz ProMotion',
      chip: 'Apple A18 Pro 3nm',
      ram: '8GB',
      boNho: '256GB',
      pin: '4.685 mAh, Sạc 27W',
      camera: 'Chính 48MP + Tele 5x Zoom quang'
    },
    moTaNgan: 'Siêu phẩm cao cấp nhất của Apple với viền titan sa mạc, nút Camera Control và Apple Intelligence.',
    tinhNangNoiBat: [
      'Nút điều khiển camera chuyên nghiệp Camera Control',
      'Pin xem video 33 giờ liên tục',
      'Hỗ trợ toàn diện Apple Intelligence tiếng Việt'
    ]
  },
  {
    id: 'sp-02',
    maSp: 'SS-S24U-512',
    ten: 'Samsung Galaxy S24 Ultra 512GB',
    gia: 31990000,
    danhMuc: 'Điện thoại',
    soLuongTon: 12,
    hinhAnh: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500&auto=format&fit=crop&q=80',
    thongSoKyThuat: {
      manHinh: '6.8" Dynamic AMOLED 2X 120Hz',
      chip: 'Snapdragon 8 Gen 3 for Galaxy',
      ram: '12GB',
      boNho: '512GB',
      pin: '5000 mAh, Sạc 45W',
      camera: '200MP + Zoom đêm 100x'
    },
    moTaNgan: 'Flagship Android đỉnh cao với khung Titanium, bút S-Pen và bộ tính năng Galaxy AI tiên tiến.',
    tinhNangNoiBat: [
      'Bút S-Pen tích hợp ghi chú tức thì',
      'Khoanh tròn để tìm kiếm Circle to Search',
      'Camera zoom đêm cực nét Quad Tele 100x'
    ]
  },
  {
    id: 'sp-03',
    maSp: 'MBP-M3-14',
    ten: 'MacBook Pro 14 inch M3 Pro',
    gia: 48990000,
    danhMuc: 'Laptop',
    soLuongTon: 7,
    hinhAnh: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&auto=format&fit=crop&q=80',
    thongSoKyThuat: {
      manHinh: '14.2" Liquid Retina XDR 120Hz',
      chip: 'Apple M3 Pro (11-core CPU, 14-core GPU)',
      ram: '18GB Unified Memory',
      boNho: '512GB SSD NVMe',
      pin: '18 giờ liên tục',
      trongLuong: '1.61 kg'
    },
    moTaNgan: 'Cỗ máy làm việc chuyên nghiệp cho lập trình viên, dựng phim 4K, màu Space Black sang trọng.',
    tinhNangNoiBat: [
      'Màu Đen Không Gian chống bám vân tay',
      'Pin bền bỉ cả ngày làm việc',
      'Đầy đủ cổng: HDMI, Khe thẻ SD, Thunderbolt 4'
    ]
  },
  {
    id: 'sp-04',
    maSp: 'DELL-XPS14',
    ten: 'Dell XPS 14 9440 Core Ultra 7',
    gia: 42500000,
    danhMuc: 'Laptop',
    soLuongTon: 5,
    hinhAnh: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500&auto=format&fit=crop&q=80',
    thongSoKyThuat: {
      manHinh: '14.5" 3.2K OLED Touch 120Hz',
      chip: 'Intel Core Ultra 7 155H + AI NPU',
      ram: '16GB LPDDR5x',
      boNho: '1TB SSD NVMe',
      pin: '69.5 Wh',
      trongLuong: '1.68 kg'
    },
    moTaNgan: 'Laptop doanh nhân siêu mỏng nhẹ, bàn phím vô cực Zero-Lattice và touchpad tàng hình.',
    tinhNangNoiBat: [
      'Touchpad kính tàng hình phản hồi xúc giác',
      'Màn hình OLED 3.2K màu chuẩn DCI-P3 100%',
      'Chip AI NPU xử lý tác vụ thông minh'
    ]
  },
  {
    id: 'sp-05',
    maSp: 'SN-WH1000XM5',
    ten: 'Tai nghe Sony WH-1000XM5',
    gia: 7990000,
    danhMuc: 'Âm thanh',
    soLuongTon: 20,
    hinhAnh: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80',
    thongSoKyThuat: {
      ketNoi: 'Bluetooth 5.2, LDAC, Jack 3.5mm',
      pin: '30 giờ (bật ANC), Sạc nhanh 3 phút nghe 3 giờ',
      trongLuong: '250g'
    },
    moTaNgan: 'Đỉnh cao chống ồn chủ động (ANC) với chip kép V1 + QN1 và chất âm Hi-Res Audio độ phân giải cao.',
    tinhNangNoiBat: [
      'Chống ồn tự động tối ưu hóa môi trường',
      'Đàm thoại khử ồn AI với 4 micro định hướng',
      'Đệm tai siêu êm, đeo thoải mái cả ngày'
    ]
  },
  {
    id: 'sp-06',
    maSp: 'APP-PRO-2',
    ten: 'Tai nghe Apple AirPods Pro 2 (USB-C)',
    gia: 5490000,
    danhMuc: 'Âm thanh',
    soLuongTon: 25,
    hinhAnh: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=500&auto=format&fit=crop&q=80',
    thongSoKyThuat: {
      chip: 'Apple H2',
      ketNoi: 'Bluetooth 5.3, Cổng USB-C, MagSafe',
      pin: '6 giờ nghe (ANC), 30 giờ kèm hộp sạc'
    },
    moTaNgan: 'Tai nghe True Wireless cao cấp của Apple với âm thanh thích ứng và chống ồn gấp 2 lần.',
    tinhNangNoiBat: [
      'Âm thanh thích ứng Adaptive Audio theo môi trường',
      'Tự động hạ âm lượng khi bắt đầu trò chuyện',
      'Hộp sạc có loa định vị tìm kiếm qua Find My'
    ]
  },
  {
    id: 'sp-07',
    maSp: 'LOGI-MX3S',
    ten: 'Chuột Logitech MX Master 3S',
    gia: 2390000,
    danhMuc: 'Phụ kiện',
    soLuongTon: 30,
    hinhAnh: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&auto=format&fit=crop&q=80',
    thongSoKyThuat: {
      ketNoi: 'Bluetooth Low Energy / USB Logi Bolt',
      pin: 'Dùng đến 70 ngày, sạc Type-C',
      trongLuong: '141g'
    },
    moTaNgan: 'Chuột công thái học cao cấp, cảm biến 8000 DPI lướt mượt trên mọi bề mặt kính.',
    tinhNangNoiBat: [
      'Con lăn điện từ MagSpeed cuộn 1000 dòng/giây',
      'Click êm tĩnh Quiet Clicks giảm 90% tiếng ồn',
      'Chuyển đổi kết nối giữa 3 máy tính dễ dàng'
    ]
  },
  {
    id: 'sp-08',
    maSp: 'DELL-U2723QE',
    ten: 'Màn hình Dell UltraSharp 27" 4K IPS Black',
    gia: 13890000,
    danhMuc: 'Màn hình',
    soLuongTon: 8,
    hinhAnh: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&auto=format&fit=crop&q=80',
    thongSoKyThuat: {
      manHinh: '27" 4K UHD (3840 x 2160) IPS Black',
      ketNoi: 'USB-C Hub sạc 90W, LAN RJ45, DP, HDMI',
      trongLuong: '6.64 kg'
    },
    moTaNgan: 'Màn hình đồ họa chuyên nghiệp độ tương phản 2000:1, chuẩn màu DCI-P3 98% và sạc 90W.',
    tinhNangNoiBat: [
      'Tấm nền IPS Black đen sâu gấp đôi IPS thường',
      'Cổng Type-C vừa xuất hình vừa sạc 90W laptop',
      'Thiết kế chân đế công thái học xoay nâng linh hoạt'
    ]
  }
];
