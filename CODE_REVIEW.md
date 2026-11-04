# Code Review  (ABP + Angular)



**Thứ tự ưu tiên:** BE #1, #2, #4, #6 và FE #1, #2. Đây là các lỗi gây sai tiền, sai kho hoặc hỏng chức năng.

---

## I. Backend (ABP .NET)

### 🔴 Nghiêm trọng

| # | Vị trí | Vấn đề | Gợi ý sửa |
|---|---|---|---|
| 1 | `Application/Orders/OrderAppService.cs:213` | **Trừ kho 2 lần.** `UpdateAsync` gọi `ProcessOrderInventoryConsumptionAsync` mỗi khi status = Completed mà không xét trạng thái cũ. Sửa lại một đơn đã Completed là kho bị trừ tiếp. Đơn đã Cancelled cũng chuyển sang Completed được. | Chỉ trừ kho khi `oldStatus != Completed`. Chặn sửa đơn đã Completed/Cancelled. Đưa logic vào `Order.Complete()` trong domain. |
| 2 | `OrderAppService.cs:127-141, 205, 577-583` | **Client tự đặt giá.** `UnitPrice` và `TotalAmount` lấy thẳng từ DTO, nên giá 0 hoặc giá âm đều được chấp nhận. | Lấy giá từ `Dish.Price` phía server. Bỏ `UnitPrice`/`TotalAmount` khỏi input DTO. |
| 3 | `Application.Contracts/Orders/OrderDtos.cs:19-64` | DTO không có validation, nên `Quantity` âm hoặc 0 vẫn qua. Hậu quả: tổng tiền âm, lượng trừ kho âm. | `[Range(1, 999)] Quantity`, `[MinLength(1)] Items`, `[StringLength] Note`. |
| 4 | `Forecasts/ForecastAppServices.cs:366, 556` | **Tồn kho bị nhân `ConversionFactor` 2 lần.** `CreateBatchAsync` đã lưu `RemainingQuantity` theo đơn vị cơ sở, nên tồn kho bị thổi phồng và gợi ý mua sai. | Chỉ dùng `Sum(b => b.RemainingQuantity)`. |
| 5 | `OrderAppService.cs:373-389`, `Inventories/InventoryAppService.cs:171-183` | **Retry concurrency có thể trừ kho thừa.** Vòng retry chạy lại trong cùng UoW/DbContext, trong khi `DeductFefoAsync` đã `autoSave` từng lô (`InventoryManager.cs:81,93`). Nếu lô thứ 2 lỗi, lần retry trừ lại lô thứ 1. Entity lỗi vẫn giữ ConcurrencyStamp cũ nên retry gần như luôn lỗi lại. | Retry bằng UoW mới (`IUnitOfWorkManager.Begin(requiresNew: true)`), hoặc bỏ `autoSave` và chỉ lưu một lần ở cuối. |
| 6 | `HttpApi/Controllers/MediaController.cs:22-41` | Upload ảnh lên Cloudinary **không cần đăng nhập**, và chỉ kiểm tra đuôi file. | `[Authorize(TooHungryPermissions.Dishes.Edit)]`, kiểm tra `ContentType` là `image/*`. |
| 7 | `DailyMenus/DailyMenuAppService.cs:13` | Không có `[Authorize]`. ABP tự sinh `/api/app/daily-menu`, nên người chưa đăng nhập gọi được Create/Update/Delete. | Thêm `[Authorize(...)]`. |
| 8 | `HttpApi/Controllers/RecipeController.cs:37`, `TableOrderController.cs:9-31` | `by-dish` không kiểm tra quyền, ai cũng xem được công thức món. `complete/{tableId}` chỉ có `[Authorize]` chung, nên mọi user đã đăng nhập đều hoàn tất đơn và trừ kho được. | Gắn permission cụ thể. |
| 9 | `OrderAppService.cs:24`, `Dishes/DishAppServices.cs:226-294` | `OrderAppService` và `DishCategoryAppService` chỉ có `[Authorize]` chung. Các permission `Orders.*` và `DishCategories.*` đã khai báo nhưng không dùng. | Thêm `[Authorize(TooHungryPermissions.Orders.Delete)]`... cho từng method. |
| 10 | `Contracts/Tables/TableDtos.cs:37-56`, `Tables/TableAppService.cs:302` | **Mass assignment.** DTO cập nhật chứa `Status`, `OccupiedTime`, `Reserved*`, và `ObjectMapper.Map` ghi đè tất cả. Nhờ vậy lách được rule "bàn còn đơn mở" mà `ChangeStatusAsync` có kiểm tra. | Bỏ các trường trạng thái khỏi DTO. Trạng thái chỉ đổi qua `ChangeStatusAsync`. |
| 11 | `OrderAppService.cs:154,230,605`, `TableAppService.cs:438,567` | Gửi SignalR **trước khi commit**. Nếu rollback thì client đã nhận trạng thái sai. | `CurrentUnitOfWork.OnCompleted(() => notifier...)` hoặc dùng local event handler. |
| 12 | `OrderAppService.cs:533-566`, `EntityFrameworkCore/TooHungryDbContext.cs:229-231`, `TableAppService.cs:126` | **Race khi tạo đơn.** Unique index chỉ lọc `Status = 0`, nên đơn tạo với `Processing` lọt qua. Hai `SubmitOrder` đồng thời ném lỗi 500. `ToDictionary(x => x.TableId)` crash khi một bàn có 2 đơn active. | Sửa filter của index. Bắt `DbUpdateException` rồi ném `BusinessException`. |

### 🟡 Trung bình

13. **Lẫn múi giờ.**
    - Dùng `DateTime.Now` ở `OrderAppService.cs:152,240,603`, `TableAppService.cs:196,290,306,420,478,551` và `TableReservationManager.cs:167` (class này đã inject `IClock`).
    - Dùng `DateTime.UtcNow` ở `OrderAppService.cs:562` và `DashboardAppService.cs:172`. Dashboard chia "hôm nay" và khung giờ theo UTC, nên lệch 7 giờ so với giờ VN.
    - → Cấu hình `AbpClockOptions.Kind = Utc` và chỉ dùng `Clock.Now`.
14. **Giờ mở cửa định nghĩa 2 nơi khác nhau:** `TableAppService.cs:296` (08:00–22:00) và `TableReservationManager.cs:47` (09:00–22:59).
15. **`TableReservationManager.cs:96`:** bàn chuyển sang Reserved ngay khi tạo booking, dù giờ đặt có thể cách tới 7 ngày, nên bàn bị khoá cả tuần. `CheckInAsync:165-167` không kiểm tra trạng thái bàn trước khi ghi đè.
16. **`TableAppService.cs:592-668` (`MergeTablesAsync`):**
    - Món trùng `DishId` bị cộng dồn theo giá của đơn chính, nên sai tiền nếu giá khác nhau.
    - Mất `Note` của món. `Note` của đơn phụ bị ghi đè.
17. **`TooHungryDbContext.cs:133, 174`: unique index `Name` (Table, Unit) không lọc soft delete**, nên tạo lại tên đã xoá bị lỗi 500. → `.HasFilter("[IsDeleted] = 0")`.
18. **`TooHungryDbContext.cs:310`: thiếu unique index cho Recipe active.** Khi có race, một món có thể có 2 recipe active.
19. **`Recipes/RecipeManager.cs:101-153`: versioning chỉ là hình thức.** `BumpVersion` sửa trên cùng một bản ghi nên không có lịch sử thật. `_ingredientRepository` được inject nhưng không dùng, nên không kiểm tra nguyên liệu có tồn tại hay active.
20. **N+1 / tải cả bảng:**
    - `ForecastAppServices.cs:182`: `FindAsync` trong vòng lặp lồng nhau.
    - `ForecastAppServices.cs:395-399`: tải toàn bộ Dishes và Recipes cho mỗi DTO. Dòng 399 gọi `ToHashSet()` đồng bộ trên IQueryable.
    - `RecipeAppService.cs:92-97, 245-249`: mỗi recipe một query, mỗi lần tải lại toàn bộ Units.
    - `OrderAppService.cs:352-355, 405-406`: tải mọi recipe active chỉ để dùng vài món.
    - → Lọc theo `dishIds` và gom thành một query.
21. **Query đồng bộ chặn thread:** `TableAppService.cs:46, 121-124, 615-619`, `InventoryManager.cs:53-55, 118-120`. → Đổi sang `AsyncExecuter` / `ToListAsync`.
22. **Lạm dụng `AutoInclude`** cho Order→Items→Dish→Category và Table→DiningArea. Các lệnh `AnyAsync`/`FirstOrDefaultAsync` chỉ để kiểm tra cũng kéo theo cả cây entity. Thiếu index `Orders(Status, OrderDate)` và unique `OrderNumber`.
23. **Không phân trang:** `InventoryAppService.GetTransactionsAsync:333-338`, `GetAlertsAsync:258,300-303` (vòng lặp O(n·m)).
24. **Mã số dễ trùng:** `ORD-{yyyyMMddHHmmss}`, `BATCH-`, `ADJ-`. Hai request trong cùng một giây ra cùng mã.
25. **`InventoryManager.cs:177-187`:** lô điều chỉnh tăng có dữ liệu sai: `PurchaseUnit = "BaseUnit"` là chuỗi literal, `UnitCost = 0` làm sai giá vốn, hạn dùng +1 năm kể cả với đồ tươi. Ngoài ra không chặn `quantity` âm trong `batchDeductions`.
26. **`ForecastAppServices.cs:581-588`:** không có máy trạng thái nên Executed quay về Draft được. Dòng 433 gọi `ToDictionary(DishId)` nên crash khi input có 2 dòng cùng món.
27. **Sai quy ước exception/localization của ABP:**
    - Khoảng 24 chỗ `UserFriendlyException("...tiếng Việt...")` hardcode.
    - Error code `TooHungry:Order:AlreadyCompleted`/`AlreadyCancelled` không có trong `vi.json`.
    - Namespace `RecipeIngredient` chưa được `MapCodeNamespace`.
    - → Dùng `BusinessException(code)` kèm file localization.
28. **Entity anemic:** Order, OrderItem, RestaurantTable, Dish, Recipe... đều có public setter, và logic chuyển trạng thái nằm ở AppService. Đoạn reset `Reserved*` bị copy khoảng 8 lần (`OrderAppService.cs:222, 329, 690`, `TableAppService.cs:430, 489, 559, 672`, background worker). → Viết `table.Release()/Occupy()/MarkCleaning()` và `order.Complete()/Cancel()`.
29. **`Reservations/ReservationAutoCancelBackgroundWorker.cs:29-65`:** thiếu `[UnitOfWork]` nên cập nhật không atomic.
30. **Secret commit vào repo:**
    - `HttpApi.Host/appsettings.json:52,55` chứa `CertificatePassPhrase` và `StringEncryption:DefaultPassPhrase`.
    - `ShowPII = true` (`TooHungryHttpApiHostModule.cs:98-102`).
    - Swagger bật ở mọi môi trường.
31. **`Dashboard/DashboardAppService.cs:128-135`:** `catch { }` nuốt lỗi mà không log. Dòng 236 dùng `dynamic` cho anonymous type, nên thay bằng `record`.

### 🟢 Nhỏ

32. **File rác ở thư mục gốc, nên xoá:**
    - `test.cs` chứa mật khẩu admin.
    - `Reflect.cs` hardcode đường dẫn máy cá nhân.
    - `fix.js` và `translate.js` là script sửa code một lần.
    - `perf-test.ps1` gọi API khi chưa đăng nhập, nên chỉ đo được phản hồi 401.
    - `Logs/logs.txt`.
33. **Đặt tên và nhất quán:**
    - `DishAppServices.cs` và `ForecastAppServices.cs` mỗi file chứa 2 class. → Tách ra.
    - `UploadImageInput` không dùng.
    - `OrderAppService` kế thừa `ApplicationService`, các service khác kế thừa `TooHungryAppService`.
    - Khoảng 7 nhóm permission khai báo nhưng không dùng (Receivings, Wastes, Stocktakings, Bills, Payments, UnitConversions, StockAdjustments).
    - Dùng lẫn `ObjectMapper` và mapper inject trực tiếp.
    - Magic number (`50*retry`, `3`, `7` ngày, `300000`).
34. **Thiếu test:**
    - Không có test phân quyền (`AbpAuthorizationException`).
    - Không có test concurrency/idempotency. Vì vậy bug #1 lọt qua.
    - Chưa test `CompletePaymentAsync`, `TransferTableAsync`, `MergeTablesAsync`, `MediaController`, `DailyMenuAppService`.


---

## II. Frontend (Angular)

### 🔴 Nghiêm trọng

| # | Vị trí | Vấn đề | Gợi ý sửa |
|---|---|---|---|
| 1 | `order/order.component.ts:167-185` | **Phân trang hỏng.** Search và lọc status chỉ chạy trên trang hiện tại, rồi ghi đè `totalCount = items.length`, nên không bao giờ xem được đơn thứ 11 trở đi. | Thêm `filter`/`status` vào DTO ở BE, truyền qua `streamCreator`, giữ nguyên `res.totalCount`. |
| 2 | `app.component.ts:63`, `shared/guards/dashboard.guard.ts:42,67`, `waiter/guards/waiter-auth.guard.ts:39` | Điều hướng tới **`/table/layout`, route này không tồn tại**. Cashier đăng nhập xong bị lỗi. | Đổi thành `/tables`. Thêm route `**`. |
| 3 | `app.component.ts:51, 80` | `getOne$('currentUser').subscribe` không có `take(1)`. Mỗi lần `visibilitychange` lại thêm một subscription mới, nên `refreshAppState()` bị gọi N lần. | `.pipe(filter(u => !!u?.isAuthenticated), take(1))`. |
| 4 | dish, dish-category, order, table, inventory, recipe, dining-area, users/roles | **Thiếu `*abpPermission` trên nút bấm**, chỉ unit và ingredient có. Mọi nút Xoá/Sửa đều hiện với mọi user. | `<button *abpPermission="'TooHungry.Orders.Delete'">`. |
| 5 | `order.component.ts:612-617, 720` | Gửi `unitPrice`/`totalAmount` lên server (đi cặp với BE #2). | Chỉ gửi `dishId` và `quantity`. |
| 6 | `proxy/ingredients/ingredient.service.ts:44`, `proxy/recipes/recipe.service.ts:40`, `proxy/dashboard/*` | **Proxy bị sửa tay.** `proxy/dashboard` không có trong `generate-proxy.json`. Chạy `abp generate-proxy` sẽ xoá mất phần tự viết, làm hỏng home và inventory. | Chuyển code tự viết ra ngoài `proxy/`. |
| 7 | `identity/roles/roles.ts:131-134, 261-264` | Gọi thẳng `RestService` tới `/api/permission-management`, `providerKey` không được encode. | Dùng `PermissionsService` hoặc `<abp-permission-management>`. |
| 8 | `sidebar-widgets/sidebar-widgets.component.ts:84-109` | Timer 1 giây ở root component, chạy change detection cho cả app mỗi giây. Interval 300ms chạy mãi ở layout không có sidebar. Chuyển node DOM vào DOM của LeptonX, dễ vỡ khi nâng cấp theme. | `ngZone.runOutsideAngular`, giới hạn số lần thử, dùng replaceable component của LeptonX. |
| 9 | `shared/services/table-signalr.service.ts:75-83` | Không có `accessTokenFactory`, và `TableHub` ở BE không có `[Authorize]`, nên ai cũng nhận được sự kiện. Lỗi kết nối lần đầu bị nuốt, không được thử lại. Kết nối ngay cả khi chưa đăng nhập. | Thêm token, `[Authorize]` cho hub, retry lần kết nối đầu. |

### 🟡 Trung bình

10. **Change detection không nhất quán.** Một nửa code dùng signal, nửa còn lại gán field trong `subscribe` rồi gọi `cdr.detectChanges()` rải rác (`inventory.component.ts:757,762,800,810…`). Với `users.ts:189-203`, modal có thể chưa mở cho tới lần tương tác tiếp theo. → Thống nhất dùng signal hoặc `async` pipe.
11. **`table/table.component.ts:297-309, 588-653`:** lấy 200 dòng rồi tự phân trang ở client, trong khi `ListService` gọi lại API mỗi lần đổi trang. `computed` đọc `list.page` vốn không phải signal. Quá 200 bàn thì phần dư bị cắt mà không báo.
12. **Tải toàn bộ dữ liệu:**
    - `waiter-tables` tải 500 dòng, `order` 200, `ingredient` 1000, `inventory` 1000. ABP giới hạn 1000, nên phần vượt quá bị mất mà không báo.
    - `order.ts:192-193` tải 1000 recipe và 1000 ingredient mỗi lần mở modal để tự tính tồn kho. → Dùng `orderService.validateStock` như `waiter-order` đang làm.
13. **Trùng lặp giữa `table` và `waiter-tables`:**
    - Cùng xử lý SignalR: `table.ts:318-370` ≈ `waiter-tables.ts:276-331`.
    - Lặp 5 computed đếm số bàn, `getStatusBadgeClass/Label`, `getActionLabel`.
    - → Tách `TableStateService`, `<app-table-card>` và một pipe cho status.
14. **Chuỗi hardcode, không qua localization:**
    - `isVi ? 'Gọi món' : 'Order'` (`table.ts:526-555`, `waiter-tables.ts:774-800`).
    - Toast tiếng Việt viết cứng ở `inventory.ts:676,692,769,811,…`, `order.ts:609,633,760,…`, `ingredient.ts:627,652`.
    - `payment.ts`: `instant(key) || 'fallback'` không bao giờ rơi vào fallback, vì `instant` trả về chính key khi thiếu bản dịch. `.replace('{0}')` → nên dùng `instant(key, ...params)`.
15. **Lỗi hiện 2 lần.** ABP tự hiện modal lỗi, component lại gọi `toaster.error` (`inventory.ts:692`, `table.ts:442`, `order.ts:768`). Code đọc `err.error.message`, trong khi ABP để message ở `err.error.error.message`. → Truyền `{ skipHandleError: true }` khi tự xử lý lỗi.
16. **Subscribe lồng nhau 3 tầng:** `waiter-tables.ts:509-545`, `:477-503`, `inventory.ts:879-893`. → Dùng `confirm$.pipe(filter(...), switchMap(...))`. `users.ts:269-307` gọi `updateRoles` thừa, vì DTO đã có `roleNames`.
17. **Lệch ngày theo UTC:** `toISOString().split('T')[0]` ở `inventory.ts:739,754,792` (kiểm tra hạn dùng sai) và `order.ts:414,442`, nên từ 0h đến 7h sáng giờ VN ra ngày hôm qua. `home.component.ts:180-185` gắn `'Z'` vào ngày local. → `formatDate(new Date(), 'yyyy-MM-dd', locale)`.
18. **`order.ts:413`:** sinh mã đơn ngẫu nhiên ở client, có thể trùng. BE đã tự sinh mã rồi, nên bỏ đoạn này.
19. **Kiểm tra theo tên role viết cứng** `['Manager','Administrator','admin']` ở khoảng 7 nơi (guards, `app.component`, `home`, `waiter-layout`). → Kiểm tra theo permission. Quy tắc "chỉ một admin" mới kiểm tra ở UI (`users.ts:213-240`).
20. **`order/order.component.html:609, 774`:** `[innerHTML]` với tên nguyên liệu do người dùng nhập. → Dùng interpolation.
21. **`inventory` quá lớn (956 dòng ts / 1160 dòng html):**
    - Một component gánh 3 tab, 4 modal inline và 2 bộ phân trang.
    - Phần deactivate trùng với `ingredient.component.ts:603-657`, nhưng khác key localization và khác kiểu form.
    - → Tách thành các tab component, `NewBatchModal`, và một modal deactivate dùng chung.
22. **Boilerplate phân trang copy ở 7 file.** Ngoài ra có hack `window.dispatchEvent(new Event('resize'))` kèm 3 timer (`order.ts:393-408`, `dish.ts:387`, `dish-category.ts:180`). → Dùng footer ngx-datatable hoặc một `<app-pager>` dùng chung.
23. **Hiệu năng template:**
    - Getter tạo mảng mới mỗi lần change detection: `categoryOptions`, `ingredientSelectOptions`, `pageSizeOptions`, `groupedDishes`.
    - `getDishStockWarning` chạy cho từng dòng giỏ hàng mỗi lần change detection.
    - Hàm sort ở `inventory.ts:474-494` filter toàn bộ batch cho mỗi lần so sánh.
    - → Dùng `computed()` hoặc tính trước một Map.
24. **`shared/services/custom-toaster.service.ts:30-38`:** truy cập phần private của ABP qua `as any`, sẽ vỡ khi nâng cấp ABP.

### 🟢 Nhỏ

25. **Code chết:**
    - Thư mục/file không dùng: `auth/login/*`, `shared/layout/*`, `shared-modal`, `shared-spinner`, `shared-module.ts`, `identity-module.ts`/`identity-routing-module.ts` (rỗng).
    - File thừa: `assets/i18n/*.json`, `permissions.json` (rỗng), `e2e/`.
    - `HttpClient` được inject nhưng không dùng ở `users.ts`.
26. **Trộn 3 bộ UI:** ngx-datatable, ng-zorro (chỉ dùng cho `shared-table`) và component tự viết.
27. **`console.error` còn sót:** `home.component.ts:208`, `recipe.component.ts:189`.
28. **`app.config.ts:52`:** `HttpClientModule` (deprecated) thừa, `FormsModule` import ở cấp global vô nghĩa.
29. **`tsconfig.json` không bật `strict`/`strictTemplates`**, nên `any` tràn lan (roles 15 chỗ, ingredient 16, unit 12) và có `as any` khi gọi proxy.
30. **Giờ mở cửa 9–23 hardcode ở 4 nơi:** `sidebar-widgets.ts:228`, `table.ts:246`, `home.ts:79`, `waiter-layout.ts:205`.
31. **Environment:** `environment.prod.ts` giống hệt bản dev (localhost, http). Số tài khoản VietQR nằm thẳng trong source.
32. **CSS:**
    - `table.component.scss` 95KB.
    - Số lần `!important`: `styles.scss` 1758, `table` 309, `dish` 252.
    - Các class giống nhau định nghĩa lại ở 7–9 file.
    - Nhiều inline `style=`.
33. **`ingredient.ts:280`:** sửa dữ liệu `storageType` ngay trên UI. → Nên làm bằng migration ở BE.
34. **`waiter-layout` `switchLanguage`:** dùng `window.location.reload()`, trong khi ABP đổi ngôn ngữ được mà không cần reload. Ký hiệu `' đ'` viết tay → dùng `currency:'VND'`.

