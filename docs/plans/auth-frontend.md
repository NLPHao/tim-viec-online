# Mốc frontend xác thực

## Phạm vi và giả định

Tiếp tục lộ trình đã thống nhất sau tìm việc: login, register candidate/employer, forgot/reset password, đổi mật khẩu, logout và điều hướng theo vai trò. Làm trong `frontend/` trên `feature/auth-fe`, tạo từ develop và đưa phần tìm việc đã hoàn thành vào làm dependency; giữ nguyên SRS/design người dùng đang sửa. Không sửa Laravel/MySQL, không triển khai AI/Reverb hoặc portal nghiệp vụ đầy đủ.

Giữ thiết kế hai cột navy–xanh, Be Vietnam Pro, form trắng, minh họa HTML/CSS về tìm việc thay cho AI. Mobile từ 360px chỉ giữ form, input tối thiểu 16px. Dùng Field/Input/Button/Checkbox shadcn Radix; Server Actions + useActionState theo skill. Không thêm ảnh/font mới.

## Quyết định

- Chọn form có validation thật + adapter API tách biệt thay cho chỉ HTML tĩnh hoặc backend giả tích hợp trong ứng dụng. `AUTH_MODE=preview` mặc định không tạo tài khoản, phiên hay gửi email, không lưu mật khẩu; chỉ báo chưa thể xử lý khi người dùng gửi form.
- `AUTH_MODE=api` là hợp đồng đề xuất dựa README token API, chưa phải backend hiện có: Next Server Actions gọi Laravel từ server, giữ Bearer token trong cookie HttpOnly, xác minh lại qua GET /user trước khi cấp phiên và trên trang được bảo vệ. Không gửi token vào client state/localStorage hoặc cache dùng chung. Sanctum SPA session/cookie là phương án chính thức cho first-party SPA; có thể thay adapter nếu nhóm backend chọn cơ chế đó.
- Cookie Secure trong production, SameSite=Lax, path=/, thời hạn thường tối đa 1 giờ, ghi nhớ tối đa 7 ngày, luôn bị chặn bởi expires_at backend nếu có. Backend cần thực thi expiry/revocation; frontend vẫn xác minh user mỗi request bằng no-store.
- Mutation API mode kiểm tra Origin theo AUTH_APP_URL cấu hình tin cậy, giữ kiểm tra Server Actions mặc định; API base server cố định, timeout 10 giây, chặn redirect, giới hạn body phản hồi. Production dùng HTTPS; HTTP chỉ cho loopback nội bộ. Backend chịu trách nhiệm rate limit phân tán, token reset dùng một lần/15 phút, khóa tài khoản và unique email.
- Role lấy từ backend, không lấy từ lựa chọn form/cookie tự khai. Candidate về /jobs hoặc job returnTo hợp lệ; employer về /employer; admin về /admin. Hai route portal mới chỉ là điểm đến được bảo vệ, ghi rõ nghiệp vụ sẽ triển khai sau. Không cho đăng ký admin.
- Trạng thái lỗi chuẩn SRS, không trả raw body/exception/password/token. Các trường form được giữ trong bộ nhớ client để lỗi trùng email không xóa thông tin; mật khẩu không xuất hiện trong ActionState.
- Đăng ký và reset thành công về login với notice cố định. Forgot trả thông báo trung tính sau thành công thực tế để không lộ email tồn tại. Năm lần sai đang được SRS đánh dấu để sau; không mô phỏng khóa bằng client.

## Kiểm chứng và giới hạn

Unit test validator/DTO/error mapping; production build, lint, typecheck. Browser kiểm tra preview không gửi credential tới Laravel/không tạo cookie; API mode kiểm tra bằng HTTP fixture test riêng (không phải backend ứng dụng), gồm role, cookie, redirect, lỗi, logout, form giữ giá trị, responsive và axe. Profile/company/application/chat thuộc mốc tiếp theo. NFR 50 người/1,5 giây và uptime chưa thể nghiệm thu với backend chưa có. Frontend do người dùng phụ trách; backend do nhóm khác triển khai theo hợp đồng.

## Hợp đồng API đề xuất để bàn giao backend

Base URL có hậu tố `/api`, response thành công có `{ "success": true, "data": ... }`; phản hồi lỗi dùng HTTP status phù hợp, `success: false`, `code` ổn định và `errors` theo tên trường. Frontend không hiển thị nguyên văn message từ upstream.

| Endpoint | Dữ liệu gửi / nhận |
| --- | --- |
| POST `/login` | Gửi `email`, `password`, `remember` boolean; nhận `data.token` hoặc `data.access_token`, nên có `expires_at` ISO 8601 có timezone. |
| GET `/user` | Bearer token; nhận `data` gồm `id` số nguyên dương, `name`, `email`, `role` candidate/employer/admin, `status` active/locked. |
| POST `/register` | Gửi `name`, `email`, `role`, `phone` tùy chọn, `dob` YYYY-MM-DD, `password`, `password_confirmation`; không tự đăng nhập. Backend tạo hồ sơ theo FR-01.6. |
| POST `/forgot-password` | Gửi `email`; thành công trả cùng một phản hồi dù email có tồn tại hay không. |
| POST `/reset-password` | Gửi `email`, `token`, `password`, `password_confirmation`. |
| PUT `/user/change-password` | Bearer token; gửi `current_password`, `password`, `password_confirmation`. Tên `password` là đề xuất của adapter; README gốc dùng `new_password`, cần nhóm backend thống nhất trước khi bật API. |
| POST `/logout` | Bearer token; thu hồi token hiện tại. |

Các mã lỗi đã xử lý: 401 sai thông tin/phiên hết hạn; 403 `account_locked` hoặc `temporarily_locked`; 400 `invalid_reset_token`, `invalid_current_password`, `password_unchanged`; 422 `email_taken`/lỗi trường; 429 giới hạn tần suất. Backend cần trả mã xác định khi trùng email; adapter cũng hỗ trợ envelope Laravel `errors.email`. Endpoint mutation thành công vẫn cần JSON envelope, không trả 204 body rỗng.

## Kết quả kiểm tra — 17/10/2026

- Production build, ESLint và TypeScript: đạt.
- Unit test: 28/28 đạt, gồm 12 nghiệp vụ tìm việc, 11 validation xác thực, 5 hợp đồng dữ liệu/lỗi API. Chưa đo coverage phần trăm.
- Browser preview/public: 19 tình huống đã đạt; lần chạy đầu đạt 17, sau khi sửa focus theo thứ tự trường và locator tránh route announcer, chạy lại 2 tình huống lỗi đều đạt.
- Browser API fixture: 15/15 đạt trên production server sau bản sửa cuối, gồm cookie HttpOnly/Secure, chống chuyển hướng ngoài, role từ API, phiên không hợp lệ, logout thu hồi token, Origin giả không đến backend, giữ lỗi email khi sửa trường khác và đổi/reset mật khẩu.
- Responsive 360/390/768/1024/1440px không tràn ngang; đã xem ảnh đăng ký mobile/desktop. Axe WCAG A/AA không phát hiện lỗi trong các màn hình đã kiểm tra.
- `npm audit --omit=dev`: 0 lỗ hổng. Không ghi nhận password/token trong state trả về action, browser storage hoặc log ứng dụng.

Kết quả API chỉ xác nhận adapter với fixture, chưa xác nhận Laravel thật, email thật hoặc chính sách bảo mật phía backend. Chat/Reverb, AI và portal nghiệp vụ chưa thuộc phần hoàn thành này.

## Điều chỉnh nhận diện và nội dung — 17/10/2026

Theo yêu cầu chỉ sửa các điểm chưa phù hợp, giữ nguyên bố cục, font, màu và nghiệp vụ. Tham khảo auth/footer trong `design/`; không sao chép các tính năng AI chưa triển khai hoặc thông tin liên hệ giả. Dùng logo người dùng cung cấp tại `frontend/public/brand/logo.png`, chung cho header, footer và biểu tượng tab; giữ nguyên ảnh nguồn, dùng `next/image` ở kích thước 48px (header auth mobile 40px), nền trắng để nhận diện rõ trên navy.

Bỏ banner mô tả bản trải nghiệm trên form và ghi chú phát triển ở footer. Thay các câu khẩu hiệu chung chung bằng nội dung mô tả tìm việc/tài khoản; đổi phản hồi “triển khai trong mốc tiếp theo” thành thông báo chức năng chưa khả dụng sau tương tác. Thông tin dữ liệu minh họa chỉ còn ở danh sách/chi tiết việc làm, nơi liên quan trực tiếp đến nội dung đang xem. Backend, bảo mật phiên và validation giữ nguyên; không thêm thư viện/font hoặc mở rộng trang nghiệp vụ.

Kiểm tra sau chỉnh sửa: lint/TypeScript đạt; 19/19 browser test preview/public và 1 browser test API cho phản hồi ứng tuyển/lưu việc làm đạt. Logo tải thành công và không tràn ngang ở 360/390/768/1024/1440px; đã xem ảnh login desktop/mobile và danh sách việc làm mobile, axe trong suite không báo lỗi. Gỡ favicon Next.js mặc định để biểu tượng tab dùng logo thật.
