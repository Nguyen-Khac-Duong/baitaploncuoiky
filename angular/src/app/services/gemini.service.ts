import { Injectable, signal } from '@angular/core';
import { GoogleGenAI } from '@google/genai';
import { SanPham } from '../shared/mo-hinh/du-lieu.model';
import { ProductItem, MOCK_PRODUCTS } from './mock-products';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  sanPhamGoiY?: SanPham[]; // Danh sách các thẻ mặt hàng thật từ hệ thống
}

export interface ChatResponseResult {
  text: string;
  sanPhamGoiY?: SanPham[];
}

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private readonly STORAGE_KEY = 'gemini_api_key';
  // API Key mặc định (nhập từ giao diện hoặc LocalStorage để bảo mật)
  private readonly DEFAULT_API_KEY = '';
  readonly apiKey = signal<string>(this.loadApiKey());

  /**
   * Lưu API Key vào LocalStorage và cập nhật Signal
   */
  setApiKey(key: string): void {
    const cleanKey = key.trim();
    this.apiKey.set(cleanKey || this.DEFAULT_API_KEY);
    if (cleanKey) {
      localStorage.setItem(this.STORAGE_KEY, cleanKey);
    } else {
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  /**
   * Lấy API Key đã lưu hoặc mặc định
   */
  getApiKey(): string {
    return this.apiKey() || this.DEFAULT_API_KEY;
  }

  /**
   * Đọc API Key từ localStorage hoặc dùng key mặc định
   */
  private loadApiKey(): string {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(this.STORAGE_KEY) || this.DEFAULT_API_KEY;
    }
    return this.DEFAULT_API_KEY;
  }

  /**
   * Trích xuất các mặt hàng liên quan trực tiếp từ danh sách SanPham thật của cửa hàng
   */
  trichXuatSanPhamLienQuan(userMessage: string, replyText: string, productList: SanPham[]): SanPham[] {
    const rawUser = userMessage.toLowerCase().trim();
    const rawReply = (replyText || '').toLowerCase();
    const combined = `${rawUser} ${rawReply}`;

    // Kiểm tra các câu chào đơn thuần hoặc ngoài lề
    if (/^(alo|chào|hi|hello|ơi|bạn là ai|em là ai)$/i.test(rawUser)) {
      return [];
    }
    if (/(tivi|tủ lạnh|máy giặt|quat|xe máy|nồi cơm|máy lạnh|điều hòa)/i.test(rawUser)) {
      return [];
    }

    const matched = productList.filter(sp => {
      const ten = sp.ten.toLowerCase();
      const ma = sp.maSp.toLowerCase();
      const dm = sp.danhMuc.toLowerCase();

      // Nếu AI hoặc người dùng nhắc cụ thể đến tên hoặc mã
      if (rawReply.includes(ten) || rawReply.includes(ma)) return true;
      if (rawUser.includes(ten) || rawUser.includes(ma)) return true;

      // Nhóm Máy tính / Laptop
      if (/(máy tính|laptop|macbook|dell|pc)/i.test(combined) && dm.includes('laptop')) return true;

      // Nhóm Điện thoại
      if (/(điện thoại|đt|dienthoai|phone|smartphone|iphone|samsung|galaxy)/i.test(combined) && dm.includes('điện thoại')) return true;

      // Nhóm Âm thanh / Tai nghe
      if (/(tai nghe|headphone|âm thanh|loa|sony|airpod)/i.test(combined) && (dm.includes('âm thanh') || ten.includes('tai nghe'))) return true;

      // Nhóm Màn hình
      if (/(màn hình|man hinh|monitor|ultrasharp)/i.test(combined) && dm.includes('màn hình')) return true;

      // Nhóm Phụ kiện / Chuột / Bàn phím
      if (/(chuột|chuot|mouse|bàn phím|ban phim|phím|logitech|nuphy)/i.test(combined) && (dm.includes('phụ kiện') || ten.includes('chuột') || ten.includes('bàn phím'))) return true;

      return false;
    });

    if (matched.length > 0) {
      return matched.slice(0, 4);
    }

    // Nếu hỏi chung chung xem hàng / có gì / gợi ý
    if (/(sản phẩm|mặt hàng|mấy cái|hàng|xem|mua|bán chạy|tư vấn|có gì|hot|giá|danh mục)/i.test(rawUser)) {
      return productList.slice(0, 3);
    }

    return [];
  }

  /**
   * Định dạng toàn bộ danh sách sản phẩm THẬT của hệ thống thành ngữ cảnh cho AI
   */
  private formatProductData(productList: SanPham[]): string {
    if (!productList || productList.length === 0) {
      return 'Hiện tại cửa hàng không có sản phẩm nào trong kho dữ liệu.';
    }

    return productList.map((sp, index) => {
      const giaVnd = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(sp.gia);
      return `[${index + 1}] Mã: ${sp.maSp} | Tên: ${sp.ten}
- Danh mục: ${sp.danhMuc}
- Giá bán: ${giaVnd}
- Tồn kho: ${sp.soLuongTon > 0 ? `${sp.soLuongTon} sản phẩm (Có sẵn hàng)` : 'HẾT HÀNG'}
- Mô tả chi tiết: ${sp.moTa || 'Chính hãng 100%'}`;
    }).join('\n\n-------------------------\n\n');
  }

  /**
   * Tạo System Instruction cho Gemini AI học dữ liệu thật
   */
  private createSystemInstruction(productList: SanPham[]): string {
    const productsContext = this.formatProductData(productList);

    return `Bạn là "Trợ lý AI ShopTech" thông minh và trung thực - chuyên viên tư vấn bán hàng của hệ thống cửa hàng công nghệ ShopTech.
Ngôn ngữ giao tiếp: Tiếng Việt thân thiện, chuẩn mực, lịch sự, xưng hô là "Em" hoặc "ShopTech", gọi khách là "Quý khách" hoặc "Anh/Chị".

=== ĐÂY LÀ KHO DỮ LIỆU SẢN PHẨM THỰC TẾ TRONG HỆ THỐNG CỦA CỬA HÀNG ===
${productsContext}
=== HẾT KHO DỮ LIỆU ===

QUY TẮC CỐT LÕI:
1. Bạn PHẢI đọc và nắm rõ toàn bộ các mặt hàng thực tế ở trên để trả lời khách hàng.
2. Khi khách hàng hỏi về một danh mục (ví dụ: máy tính, điện thoại, phụ kiện, âm thanh, màn hình), HÃY TƯ VẤN ĐÚNG CÁC SẢN PHẨM THUỘC DANH MỤC ĐÓ TRONG KHO DỮ LIỆU TRÊN.
3. Tuyệt đối KHÔNG được trả lời lạc đề (ví dụ khách hỏi "máy tính" thì chỉ tư vấn Laptop / MacBook, không được gợi ý điện thoại).
4. Nếu khách hỏi sản phẩm mà cửa hàng KHÔNG CÓ: Hãy trung thực báo là hiện ShopTech chưa kinh doanh sản phẩm này và gợi ý các mặt hàng tương đương có sẵn trong kho.
5. Phong cách trả lời: Ngắn gọn, súc tích, tự nhiên như chuyên viên bán hàng thật sự. Hệ thống sẽ tự động đính kèm thẻ sản phẩm để khách bấm xem và thêm vào giỏ hàng.`;
  }

  /**
   * Fallback nội bộ dự phòng nếu mất mạng
   */
  private generateSmartFallbackResponse(userMessage: string, productList: SanPham[]): ChatResponseResult {
    const query = userMessage.toLowerCase().trim();

    // Chào hỏi
    if (/^(alo|chào|hi|hello|ơi|có ai không|hey|xin chào)/i.test(query)) {
      return {
        text: `Dạ ShopTech xin chào Quý khách! 🛍️\n\nEm là Trợ lý ảo AI ShopTech, sẵn sàng tư vấn báo giá, thông số và tồn kho thực tế của cửa hàng.\nQuý khách đang muốn tìm hiểu về sản phẩm nào dưới đây ạ?`,
        sanPhamGoiY: productList.slice(0, 3)
      };
    }

    const matchedProducts = this.trichXuatSanPhamLienQuan(userMessage, '', productList);

    if (matchedProducts.length > 0) {
      const tenDm = matchedProducts[0].danhMuc;
      return {
        text: `Dạ ShopTech xin gửi tới Quý khách thông tin các mặt hàng **${tenDm}** hiện có sẵn trong kho hàng. Quý khách có thể xem giá và bấm **Thêm vào giỏ** ngay bên dưới ạ:`,
        sanPhamGoiY: matchedProducts
      };
    }

    // Hỏi về sản phẩm ngoài danh mục
    if (/(tivi|tủ lạnh|máy giặt|quat|xe máy|máy lạnh|điều hòa)/i.test(query)) {
      return {
        text: `Dạ rất tiếc hiện tại ShopTech chưa kinh doanh mặt hàng này ạ.\nCửa hàng hiện có sẵn các thiết bị công nghệ chính hãng dưới đây, mời Quý khách tham khảo:`,
        sanPhamGoiY: productList.slice(0, 3)
      };
    }

    return {
      text: `Dạ em xin gửi tới Quý khách danh sách các mặt hàng công nghệ đang có sẵn tại ShopTech:`,
      sanPhamGoiY: productList.slice(0, 3)
    };
  }

  /**
   * Gửi câu hỏi đến trực tiếp Google Gemini AI (Model gemini-3.6-flash đời mới nhất)
   * Sử dụng trực tiếp danh sách sản phẩm thật từ hệ thống
   */
  async chatWithGemini(
    userMessage: string,
    history: { role: 'user' | 'model'; text: string }[] = [],
    productList: SanPham[] = []
  ): Promise<ChatResponseResult> {
    const key = this.getApiKey();

    if (!key) {
      return this.generateSmartFallbackResponse(userMessage, productList);
    }

    try {
      const ai = new GoogleGenAI({ apiKey: key });
      const systemInstruction = this.createSystemInstruction(productList);

      const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

      if (history && history.length > 0) {
        for (const item of history.slice(-6)) {
          contents.push({
            role: item.role === 'user' ? 'user' : 'model',
            parts: [{ text: item.text }]
          });
        }
      }

      contents.push({
        role: 'user',
        parts: [{ text: userMessage }]
      });

      // Gọi trực tiếp Gemini 3.6 Flash
      const apiCall = ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      // Timeout 25s cho AI xử lý phản hồi thật
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('TIMEOUT')), 25000)
      );

      const response = await Promise.race([apiCall, timeoutPromise]);
      const replyText = response?.text || '';

      if (!replyText) {
        return this.generateSmartFallbackResponse(userMessage, productList);
      }

      // Trích xuất các thẻ sản phẩm thật dựa trên nội dung trả lời của AI
      const sanPhamGoiY = this.trichXuatSanPhamLienQuan(userMessage, replyText, productList);

      return {
        text: replyText,
        sanPhamGoiY: sanPhamGoiY.length > 0 ? sanPhamGoiY : undefined
      };
    } catch (error: any) {
      console.warn('Gemini API call failed, using fallback:', error?.message);
      return this.generateSmartFallbackResponse(userMessage, productList);
    }
  }
}
