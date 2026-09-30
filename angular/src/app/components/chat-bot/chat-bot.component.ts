import { Component, inject, signal, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService, ChatMessage } from '../../services/gemini.service';
import { ProductItem, MOCK_PRODUCTS } from '../../services/mock-products';
import { DuLieuService } from '../../he-thong/dich-vu/du-lieu.service';
import { ThongBaoService } from '../../he-thong/dich-vu/thong-bao.service';
import { SanPham } from '../../shared/mo-hinh/du-lieu.model';

@Component({
  selector: 'app-chat-bot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-bot.component.html',
  styleUrl: './chat-bot.component.css'
})
export class ChatBotComponent implements AfterViewChecked {
  private readonly geminiService = inject(GeminiService);
  private readonly duLieuService = inject(DuLieuService);
  private readonly thongBaoService = inject(ThongBaoService);

  @ViewChild('scrollContainer') private scrollContainer?: ElementRef<HTMLDivElement>;

  readonly isOpen = signal<boolean>(false);
  readonly messages = signal<ChatMessage[]>([
    {
      role: 'model',
      text: 'Xin chào! Em là Trợ lý AI ShopTech 🛍️.\nEm đã được đồng bộ trực tiếp với toàn bộ kho sản phẩm của cửa hàng để tư vấn cấu hình, giá bán và tình trạng tồn kho theo thời gian thực. Quý khách đang quan tâm đến dòng sản phẩm nào ạ?',
      timestamp: new Date(),
      sanPhamGoiY: this.duLieuService.sanPhamListSignal().slice(0, 2) // Lấy trực tiếp từ kho dữ liệu thật
    }
  ]);

  readonly isLoading = signal<boolean>(false);
  readonly inputMessage = signal<string>('');
  readonly showApiKeyModal = signal<boolean>(false);
  readonly tempApiKey = signal<string>(this.geminiService.getApiKey());
  readonly currentApiKey = this.geminiService.apiKey;

  readonly quickSuggestions = signal<string[]>([
    'Cho tôi xem máy tính / laptop',
    'Xem các dòng điện thoại',
    'Cửa hàng có tai nghe và phụ kiện gì?'
  ]);

  private shouldScroll = false;

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  toggleChat(): void {
    const nextState = !this.isOpen();
    this.isOpen.set(nextState);
    if (nextState) {
      this.shouldScroll = true;
    }
  }

  openApiKeyModal(): void {
    this.tempApiKey.set(this.geminiService.getApiKey());
    this.showApiKeyModal.set(true);
  }

  closeApiKeyModal(): void {
    this.showApiKeyModal.set(false);
  }

  saveApiKey(): void {
    this.geminiService.setApiKey(this.tempApiKey());
    this.showApiKeyModal.set(false);
    this.thongBaoService.thanhCong('Đã lưu cấu hình Gemini API Key!', 'Cấu hình');
  }

  askSuggestion(suggestion: string): void {
    this.inputMessage.set(suggestion);
    this.sendMessage();
  }

  /**
   * Thêm sản phẩm trực tiếp từ Thẻ chat vào Giỏ hàng
   */
  themVaoGioHang(sp: SanPham, event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }

    const thanhCong = this.duLieuService.themVaoGioHang(sp, 1);
    if (thanhCong) {
      this.thongBaoService.thanhCong(
        `${sp.ten} đã được thêm vào giỏ hàng thành công!`,
        'Đã thêm vào giỏ 🛒'
      );
    } else {
      this.thongBaoService.thatBai(
        `Rất tiếc sản phẩm ${sp.ten} hiện đã hết hàng trong kho.`,
        'Hết hàng'
      );
    }
  }

  async sendMessage(): Promise<void> {
    const userText = this.inputMessage().trim();
    if (!userText || this.isLoading()) {
      return;
    }

    const userMessage: ChatMessage = {
      role: 'user',
      text: userText,
      timestamp: new Date()
    };

    this.messages.update(prev => [...prev, userMessage]);
    this.inputMessage.set('');
    this.isLoading.set(true);
    this.shouldScroll = true;

    try {
      const history = this.messages()
        .slice(0, -1)
        .map(m => ({ role: m.role, text: m.text }));

      // LẤY TRỰC TIẾP TOÀN BỘ KHO SẢN PHẨM THẬT CỦA CỬA HÀNG
      const danhSachSanPhamThat = this.duLieuService.sanPhamListSignal();

      const result = await this.geminiService.chatWithGemini(
        userText,
        history,
        danhSachSanPhamThat
      );

      this.messages.update(prev => [
        ...prev,
        {
          role: 'model',
          text: result.text,
          sanPhamGoiY: result.sanPhamGoiY,
          timestamp: new Date()
        }
      ]);
    } catch (error: any) {
      const danhSachSanPhamThat = this.duLieuService.sanPhamListSignal();
      this.messages.update(prev => [
        ...prev,
        {
          role: 'model',
          text: `Dạ em xin thông tin đến Quý khách về các sản phẩm có sẵn tại ShopTech:`,
          sanPhamGoiY: danhSachSanPhamThat.slice(0, 2),
          timestamp: new Date()
        }
      ]);
    } finally {
      this.isLoading.set(false);
      this.shouldScroll = true;
    }
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  private scrollToBottom(): void {
    try {
      if (this.scrollContainer) {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
      console.error('Scroll error:', err);
    }
  }
}
