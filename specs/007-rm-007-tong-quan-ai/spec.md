# Feature Specification: RM-007 — Báo Cáo Thống Kê Sàn & Trợ Lý Ảo Gemini AI

**Feature Branch**: `007-rm-007-tong-quan-ai`  
**Updated**: 2026-11-16 (Upgraded to Multi-vendor Metrics & AI Assistant)  
**Status**: Completed  
**Roadmap ID**: [RM-007](../../docs/roadmap.md#rm-007--tổng-quan-báo-cáo--trợ-lý-ảo-ai-tong-hop-wave-3)  

---

## User Scenarios & Testing

### User Story 1 - Dashboard Chỉ Số Vận Hành Toàn Sàn Dành Cho Admin (Priority: P1)
Admin truy cập `/admin/tong-quan` để theo dõi bức tranh kinh doanh toàn hệ thống:
- Tổng doanh thu sàn và doanh số đơn hàng hoàn thành.
- Tổng số lượng đơn hàng, số lượng gian hàng hoạt động và tổng sản phẩm.
- Cảnh báo số lượng sản phẩm sắp hết hàng / hết kho toàn sàn để có biện pháp nhắc nhở các shop.

### User Story 2 - Trợ Lý Ảo AI Tư Vấn Bán Hàng Trực Quan (Priority: P1)
Hộp thoại Chatbot AI Gemini nổi góc dưới màn hình phục vụ tư vấn trực tiếp cho khách mua hàng:
- Trả lời thông minh các câu hỏi về thông số kỹ thuật vợt cầu lông, giày thể thao, cách chọn vợt phù hợp với lối chơi (tấn công, công thủ toàn diện).
- Gợi ý sản phẩm đang có sẵn trong kho hàng của sàn kèm đường link xem chi tiết.

---

## Requirements & Backend Integration
- **FR-001**: API Backend ABP `DonHangAppService.GetThongKeDashboardAsync` tổng hợp chỉ số đơn hàng và doanh số.
- **FR-002**: Tích hợp Google Gemini AI qua `GeminiService` phía Angular client.
