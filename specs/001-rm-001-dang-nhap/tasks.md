# Tasks: RM-001 — Đăng nhập & Đăng ký

**Input**: Design documents from `/specs/001-rm-001-dang-nhap/` (spec.md, plan.md, research.md, data-model.md, quickstart.md)  
**Status**: Ready for implementation  
**Branch**: `001-rm-001-dang-nhap`

---

## Phase 1: Setup & Foundational (Shared Infrastructure)

**Purpose**: Đảm bảo các mô hình dữ liệu dùng chung và cơ chế quản lý trạng thái phiên hoạt động ổn định.

- [x] T001 Rà soát interface `NguoiDung`, `VaiTroNguoiDung` trong `angular/src/app/shared/mo-hinh/du-lieu.model.ts` khớp với `data-model.md`.
- [x] T002 [P] Khởi tạo service thông báo `thong-bao.service.ts` và tích hợp Toast UI chuẩn cho thông báo phản hồi thao tác Auth.
- [x] T003 Kiểm tra và bảo đảm `XacThucService` duy trì đúng Signal `currentUser = signal<NguoiDung | null>()` và đồng bộ `localStorage` hai chiều khi khởi tạo.

**Checkpoint**: Nền tảng dữ liệu và service sẵn sàng cho các user stories.

---

## Phase 2: User Story 1 - Khách Hàng & Admin Đăng Nhập (Priority: P1) 🎯 MVP

**Goal**: Người dùng nhập email và mật khẩu hợp lệ để xác thực danh tính, lưu phiên đăng nhập và chuyển hướng đúng giao diện theo vai trò (Admin -> `/admin/tong-quan`, Khách hàng -> `/cua-hang`).

**Independent Test**: Mở `/dang-nhap`, nhập `admin@gmail.com` / `123456`, click "Đăng nhập" -> hệ thống thông báo thành công và chuyển hướng tới Dashboard Admin.

### Implementation Tasks for User Story 1
- [x] T004 [US1] Hoàn thiện form `formDangNhap` trong `angular/src/app/auth/dang-nhap/dang-nhap.component.ts` với validator bắt buộc (required, email regex, minLength 6).
- [x] T005 [US1] Triển khai hàm `xuLyDangNhap()` gọi `XacThucService.dangNhap(email, matKhau)`:
  - Nếu thành công: cập nhật Signal `currentUser`, lưu `localStorage`, hiển thị Toast chào mừng và điều hướng theo vai trò.
  - Nếu thất bại: hiển thị thông báo lỗi trực tiếp trên giao diện (`loiDangNhap = true`, thông báo chi tiết).
- [x] T006 [P] [US1] Cập nhật giao diện `dang-nhap.component.html` hiển thị thông báo lỗi validation chi tiết khi input bị touch/dirty.
- [x] T007 [US1] Cấu hình Route Guard `adminGuard` và `khachHangGuard` trong `angular/src/app/he-thong/bao-ve/xac-thuc.guard.ts` kiểm tra chặt chẽ Signal `currentUser()` để bảo vệ các route `/admin/*` và `/don-hang-cua-toi`.

**Checkpoint**: User Story 1 hoạt động độc lập hoàn chỉnh, bảo vệ chặt chẽ phân quyền và phiên làm việc.

---

## Phase 3: User Story 2 - Khách Hàng Đăng Ký Tài Khoản Mới (Priority: P2)

**Goal**: Khách hàng mới điền thông tin cá nhân và mật khẩu để tạo tài khoản `khach_hang`. Sau khi đăng ký thành công, hệ thống thông báo thành công và chuyển về tab "Đăng nhập" (yêu cầu nhập lại mật khẩu để xác thực).

**Independent Test**: Mở tab Đăng ký, điền form hợp lệ, ấn "Đăng ký" -> hiển thị Toast thành công, giao diện tự động chuyển sang tab Đăng nhập và điền sẵn email mới.

### Implementation Tasks for User Story 2
- [x] T008 [US2] Cấu hình `formDangKy` trong `dang-nhap.component.ts` với validator đầy đủ (Họ tên, Email, SĐT regex 9-11 số, Địa chỉ >= 5 ký tự, Mật khẩu >= 6 ký tự, validator so khớp mật khẩu `kiemTraKhopMatKhau`).
- [x] T009 [US2] Cập nhật `XacThucService.dangKy()`:
  - Chuẩn hóa email `trim().toLowerCase()`.
  - Kiểm tra trùng lặp email trong danh sách người dùng.
  - Tạo mới thực thể `NguoiDung` với vai trò cố định `khach_hang` và lưu vào danh sách tài khoản.
  - Trả về kết quả thành công mà **không tự động gán currentUser** (để tuân thủ quyết định clarify).
- [x] T010 [US2] Triển khai hàm `xuLyDangKy()` trong `dang-nhap.component.ts`:
  - Gọi `XacThucService.dangKy()`.
  - Khi thành công: hiển thị Toast chúc mừng, gọi `doiTab('dang-nhap')`, điền email mới vào `formDangNhap` và focus vào ô mật khẩu.
  - Khi email đã tồn tại: hiển thị cảnh báo lỗi rõ ràng.

**Checkpoint**: User Story 2 hoàn tất và phối hợp nhịp nhàng với User Story 1.

---

## Phase 4: User Story 3 - Chuyển Đổi Tab & Tài Khoản Mẫu Nhanh (Priority: P3)

**Goal**: Trải nghiệm chuyển tab mượt mà đồng bộ query param URL và cung cấp các nút chọn nhanh tài khoản mẫu phục vụ demo đồ án.

**Independent Test**: Bấm vào nút "Admin mẫu", kiểm tra form tự động điền `admin@gmail.com` / `123456`; kiểm tra URL hiển thị đúng query parameter.

### Implementation Tasks for User Story 3
- [x] T011 [US3] Hoàn thiện hàm `doiTab()` và theo dõi `route.queryParams` trong `ngOnInit()` của `dang-nhap.component.ts` để đồng bộ URL (`?tab=dang-nhap` hoặc `?tab=dang-ky`).
- [x] T012 [P] [US3] Bổ sung các chip / nút chọn nhanh tài khoản mẫu:
  - "Admin mẫu": điền `admin@gmail.com` / `123456`.
  - "Khách hàng mẫu": điền `khachhang@gmail.com` / `123456`.
  - Tự động reset trạng thái lỗi `loiDangNhap = false`.

**Checkpoint**: Hoàn tất cả 3 User Stories.

---

## Phase 5: Verification & Polish

**Purpose**: Rà soát chất lượng mã nguồn, kiểm tra biên và kiểm thử hồi quy.

- [x] T013 Kiểm tra xử lý biên (Edge Cases): Khoảng trắng trong email, đăng xuất xóa sạch Signal và LocalStorage, chặn click nhiều lần khi đang xử lý (debounce/disabled state).
- [x] T014 Rà soát kỷ luật TypeScript: Đảm bảo không có kiểu `any`, không có cảnh báo linter còn sót lại.
- [x] T015 Kiểm thử toàn bộ 3 kịch bản theo tài liệu `specs/001-rm-001-dang-nhap/quickstart.md`.
- [x] T016 Cập nhật trạng thái `xong` cho `RM-001` trong `docs/roadmap.md` sau khi nghiệm thu.
