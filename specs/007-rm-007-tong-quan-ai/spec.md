# Feature Specification: RM-007 — Tổng Quan Báo Cáo & Trợ Lý Ảo AI

**Feature Branch**: `007-rm-007-tong-quan-ai`  
**Created**: 2026-10-14  
**Status**: Completed  
**Roadmap ID**: [RM-007](../../docs/roadmap.md#rm-007--tổng-quan-báo-cáo--trợ-lý-ảo-ai-tong-hop-wave-3)  

---

## User Scenarios & Testing

### User Story 1 - Dashboard Báo Cáo Thống Kê Admin (Priority: P1)
Admin truy cập `/admin/tong-quan` xem các thẻ chỉ số KPI kinh doanh:
- Tổng số sản phẩm trong cửa hàng.
- Tổng số đơn hàng đã đặt.
- Tổng doanh thu thực tế.
- Cảnh báo số lượng sản phẩm sắp hết hàng (tồn kho < 5 hoặc = 0).

### User Story 2 - Trợ Lý Ảo AI Gemini Tư Vấn Mua Sắm (Priority: P1)
Khách mua hàng và Admin có thể mở cửa sổ Chatbot AI (nút tròn nổi góc phải màn hình) để:
- Hỏi thông tin sản phẩm, so sánh giá, tư vấn cấu hình phù hợp nhu cầu.
- Chatbot tự động nạp ngữ cảnh danh mục sản phẩm hiện có trong kho để trả lời chính xác, thông minh bằng Google Gemini API.

---

## Requirements
- **FR-001**: Thống kê tính toán tổng hợp qua `DuLieuService.thongKeSignal()` và API ABP `GET /api/app/don-hang/thong-ke-dashboard`.
- **FR-002**: Tích hợp `GeminiService` (`gemini.service.ts`) gọi Google Gemini API với System Prompt chuyên gia tư vấn công nghệ cho cửa hàng.
