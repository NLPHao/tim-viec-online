# Đồng bộ ô chọn — 18/10/2026

Yêu cầu: áp dụng mẫu người dùng cung cấp cho toàn bộ dropdown đang dùng trong frontend. Bộ lọc có giá trị chuyển viền xanh, nhãn xanh nhạt và có nút xóa riêng; menu chọn tùy chỉnh, không mở bộ chọn mặc định của hệ điều hành.

- Giữ Be Vietnam Pro, màu thương hiệu và bố cục trang hiện tại. Phong cách gọn, rõ trạng thái; không thay đổi navbar, card hoặc luồng xác thực ngoài các ô chọn.
- Phạm vi được rà: địa điểm navbar; ngành nghề, hình thức, lương, cấp bậc trang việc làm. Menu tài khoản/danh mục đã dùng Radix. Hiện chưa có ô chọn ngày trong frontend; khi bổ sung phải dùng calendar tùy chỉnh thay cho `input[type=date]`.
- Dùng shadcn Select (Radix) cho chọn một; Popover + Checkbox hiện có cho nhiều ngành và tìm ngành không dấu. Đây là phương án dùng primitive đang có, giảm mã điều khiển bàn phím so với tự viết listbox; không cần thêm Command/Calendar khi chưa dùng.
- Đưa kiểu menu, viền, màu đã chọn, focus và nút xóa vào component dùng chung. Nút xóa nằm cạnh trigger, không lồng button trong button. Nhãn dài được rút gọn; tên đầy đủ vẫn trong menu và accessible name.
- Giữ mã giá trị và tên field để tích hợp Laravel, tìm kiếm GET, URL/back/reload, chọn nhiều và reset trang. Trạng thái optimistic áp dụng ngay cho bộ lọc; địa điểm navbar giữ thao tác tìm kiếm bằng nút/Enter như hiện tại.
- Giả định: giữ quy mô danh mục và nguồn dữ liệu hiện tại; không thêm API hoặc dữ liệu cá nhân. Popover chỉ dựng menu khi mở; giới hạn chiều cao, cuộn và tránh tràn màn hình từ 360px. Thành phần dùng chung là nơi bảo trì kiểu ô chọn về sau.
- Kiểm chứng: chọn/xóa từng bộ lọc, phối hợp nhiều tiêu chí, tìm trong ngành, Back/reload, GET navbar, bàn phím/Escape/trả focus, axe và responsive. Kiểm tra trực tiếp `localhost:3000` để xác nhận giao diện đang chạy đã cập nhật.

Radix có thể tạo select ẩn để hỗ trợ form; phần người dùng tương tác hoàn toàn là trigger/menu tùy chỉnh. Không dùng CSS để che menu native rồi giữ hành vi native.

## Kết quả thực hiện

- Có `SelectionField` và `MultiSelectionField` dùng chung, dựa trên Select được tạo từ CLI shadcn theo `radix-nova`, Popover và Checkbox hiện có. Không thêm dependency. Kiểu nằm trong `selection.css`, dùng biến màu thương hiệu; bỏ CSS cho select/details cũ.
- Menu chọn một dùng phím mũi tên/Home/End/typeahead từ Radix. Khi menu mở, phần trang bên ngoài tạm `inert` và được khôi phục khi đóng để các điều khiển đang ẩn khỏi trình đọc màn hình cũng không nhận focus. Menu chọn nhiều dùng Tab/Space và mô tả đầy đủ các lựa chọn qua `aria-describedby`.
- Build production, ESLint, TypeScript đạt. 16 kịch bản Chromium đạt, gồm tìm kiếm/lọc hiện có và kiểm tra mới: viền xanh khi có giá trị, xóa từng tiêu chí, giữ keyword/city, Back/reload, menu tùy chỉnh và trạng thái tìm ngành rỗng, focus/bàn phím, axe khi menu mở. Kiểm tra responsive 360/390/768/1024/1440px; kiểm tra menu mở tại 360 và 1440px.
- Kiểm tra trực tiếp cổng 3000 trên desktop và mobile: bốn bộ lọc có giá trị, địa điểm đã chọn trên navbar, kết quả đúng và không có lỗi JavaScript. Đã xem ảnh menu và trạng thái chọn; tại 360px, mỗi bộ lọc rộng 140px, xếp hai cột. Bộ kiểm tra bổ sung kiểm soát chiều rộng tối thiểu để tránh ô chọn co thành một hàng quá nhỏ.
- Chưa kiểm tra trình đọc màn hình thật, Safari/Firefox hoặc backend Laravel thật. Không phát sinh ô chọn ngày mới trong thay đổi này.
