# TimViecOnline frontend

Next.js 16.4 App Router, React 19, TypeScript, Tailwind 4, shadcn/Radix, Lucide và Sonner. Mốc hiện tại: tìm kiếm và chi tiết việc làm cho khách; dữ liệu minh họa, chưa kết nối Laravel.

## Chạy cục bộ

Yêu cầu Node.js 22 và npm. Từ thư mục `frontend`:

```powershell
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Mở `http://localhost:3000/jobs`. `/` chuyển đến `/jobs` trong mốc này. Không cần MySQL, Laravel hoặc Gemini để chạy bản trải nghiệm.

## Những gì đã hoạt động

- Tìm có dấu/không dấu theo tiêu đề, công ty và kỹ năng.
- Lọc nhiều ngành, tỉnh/thành, hình thức, cấp bậc và mức lương; các nhóm kết hợp AND. URL giữ bộ lọc khi refresh, chia sẻ và back/forward.
- 18 tin đang tuyển, phân trang thật 6 tin/trang. Sắp xếp cập nhật mới nhất, ID giảm dần khi trùng thời gian.
- Chi tiết theo ID, thông tin công ty, kỹ năng và việc tương tự. `/jobs/19` minh họa tin đóng; `/jobs/20` minh họa tin hết hạn; cả hai khóa ứng tuyển.
- Khách lưu/ứng tuyển được yêu cầu đăng nhập. `/login` hiện chỉ là điểm tiếp nối có thông báo chưa kết nối API và liên kết quay lại an toàn; chưa xác thực hay lưu hồ sơ.
- Skeleton, không có kết quả/xóa lọc, error boundary/thử lại và not-found.

## Dữ liệu và tích hợp

`src/features/jobs` chứa type, quy tắc lọc, parse URL và định dạng thuần. `src/mocks/jobs.ts` tạo fixture theo ngày Việt Nam. `src/services/jobs.ts` là lớp server-only cung cấp `listJobs`, `getJob`, `getJobCatalog`, `findRelatedJobs`; component không import fixture. Snapshot được dùng chung trong từng request bằng React cache.

Các khóa URL: `keyword`, `category_ids` (lặp lại được), `city`, `job_type`, `salary`, `level`, `page`. Salary nhận `under10`, `10to20`, `over20`, `negotiable`. Quy tắc so sánh theo SRS FR-05.3; `salary_max=null` không thuộc nhóm phải so sánh max. Tin active còn hạn mới vào kết quả; hạn tính hết ngày theo Asia/Ho_Chi_Minh.

Khi backend sẵn sàng, thay implementation repository bằng API adapter sau khi thống nhất DTO/envelope, multi-category, phân trang, ngày hạn và sort. Các biến API/Reverb trong `.env.example` chuẩn bị cho mốc sau; hiện repository chưa sử dụng chúng. Frontend không truy cập database, không chứa secret, không thay authorization backend.

## Kiểm tra

```powershell
npm run lint
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
npm audit --omit=dev
```

Playwright tự chạy production server cổng 3117; cần build trước. Kiểm tra luồng chính, URL/history, dialog/keyboard, responsive 360–1440px và axe WCAG A/AA. Ảnh/traces ở `test-results/` được gitignore. Chưa chứng minh SLA tải hệ thống 50 người, uptime hoặc tính năng backend; chưa kiểm tra Safari/Firefox hay trình đọc màn hình thực tế.

`npm audit --omit=dev` hiện không báo lỗ hổng. Audit toàn bộ báo chuỗi dependency phát triển của ESLint/shadcn liên quan [braces GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm); chưa có bản vá khi kiểm tra. Không dùng `npm audit fix --force` để hạ Next/shadcn không tương thích. CLI shadcn nằm trong devDependencies và Base UI đã được gỡ.

## Quy tắc làm việc

Tạo `feature/*` từ `develop`, kiểm tra rồi tạo PR theo README gốc. Không commit `.env.local`, `.next`, `node_modules` hoặc kết quả kiểm thử. Quyết định và phạm vi: [kế hoạch frontend](../docs/plans/job-discovery-frontend.md). AI, chat, đăng nhập thật, hồ sơ và employer portal thuộc các mốc tiếp theo.
