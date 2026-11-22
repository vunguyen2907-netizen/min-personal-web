# Website Cá Nhân Phi Thương Mại — Data-Driven Leader • Nature-Driven Soul

Trang web cá nhân tĩnh (HTML + Tailwind CSS + Vanilla JS) kết hợp giữa **Hồ sơ Năng lực (Work & Tech)** và **Trải nghiệm Leo núi & Nghỉ dưỡng (Trails & Tales)**, sẵn sàng publish miễn phí lên GitHub Pages, Cloudflare Pages hoặc Netlify và tích hợp sẵn **Google Analytics 4 (GA4)** để ghi nhận số lượt xem.

---

## 1. Liên kết triển khai & Backend

- **GitHub Repository:** https://github.com/vunguyen2907-netizen/min-personal-web
- **Website Online (GitHub Pages):** https://vunguyen2907-netizen.github.io/min-personal-web/
- **Supabase Project:** `min-personal-web` (`https://hlsxhrtwqlqxsmzqfigc.supabase.co`, Region: Singapore `ap-southeast-1`)
  - `public.projects`: Lưu danh sách dự án & Case Study (công khai đọc các mục `is_published = true`).
  - `public.trekking_logs`: Lưu nhật ký leo núi (công khai đọc các mục `is_published = true`).
  - `public.page_view_events`: Ghi nhận & đếm lượt xem trang trực tiếp trên web (song song với GA4).
  - `public.contact_messages`: Lưu lời nhắn từ form liên hệ (khách chỉ được phép gửi `INSERT`, không đọc được tin nhắn của người khác).

## 2. Cấu trúc thư mục

```text
.
├── index.html                  # Giao diện chính + mã nhúng Google Analytics 4 (GA4)
├── assets/
│   ├── css/style.css           # Style tùy chỉnh, hiệu ứng cuộn & modal
│   └── js/
│       ├── data.js             # Dữ liệu mặc định (fallback khi offline) & nội dung tĩnh
│       ├── supabase-client.js  # Kết nối REST API tới Supabase (Publishable Key)
│       └── main.js             # Render nội dung, bộ lọc, bản đồ, checklist 30L, form & GA4
├── robots.txt                  # Cấu hình SEO cơ bản
├── sitemap.xml                 # Sơ đồ trang cho Google Search
└── README.md                   # Tài liệu hướng dẫn publish
```

---

## 2. Hướng dẫn gắn Google Analytics 4 (GA4) để ghi nhận lượt xem

1. Truy cập [Google Analytics](https://analytics.google.com/) và đăng nhập bằng tài khoản Google.
2. Chọn **Quản trị (Admin)** → **Tạo tài khoản / Tạo thuộc tính (Create Property)**.
3. Chọn nền tảng **Web**, nhập URL trang web của bạn (ví dụ: `https://tenban.id.vn` hoặc `https://username.github.io/ten-repo`).
4. Sau khi tạo xong **Luồng dữ liệu (Web Data Stream)**, copy **Mã đo lường (Measurement ID)** có dạng `G-XXXXXXXXXX`.
5. Mở file `index.html`, tìm 2 dòng chứa `G-XXXXXXXXXX` (khoảng dòng 24 và 30) và thay bằng mã thật của bạn:
   ```html
   <script async src="https://www.googletagmanager.com/gtag/js?id=G-MA-CUA-BAN"></script>
   <script>
       window.dataLayer = window.dataLayer || [];
       function gtag(){ dataLayer.push(arguments); }
       gtag('js', new Date());
       gtag('config', 'G-MA-CUA-BAN', { ... });
   </script>
   ```
6. Sau khi publish web, mở trang web của bạn trên trình duyệt, sau đó vào **Google Analytics → Báo cáo → Theo thời gian thực (Realtime)** để kiểm tra lượt xem được ghi nhận ngay lập tức.

> **Lưu ý:** Ngoài `page_view` mặc định, `assets/js/main.js` đã tích hợp sẵn tracking các sự kiện tương tác (`view_case_study`, `view_trekking_log`, `filter_projects`, `select_mountain_peak`, `toggle_checklist_item`, `copy_email`).

---

## 3. Cách cá nhân hóa nội dung

- Mở `assets/js/data.js` để thay đổi:
  - Email, link LinkedIn, GitHub.
  - Nội dung 3 trụ cột quản trị, 4 dự án Case Study, nhật ký leo núi, danh sách đỉnh núi, review Đà Lạt và checklist 30L.
- Mở `index.html` để cập nhật lại email hiển thị ở footer, link mạng xã hội và ảnh đại diện (có thể thay link Unsplash bằng ảnh thật lưu trong thư mục `assets/images/`).
- Cập nhật `yourdomain.id.vn` trong `robots.txt` và `sitemap.xml` thành tên miền thật của bạn.

---

## 4. Hướng dẫn Publish miễn phí

### Cách 1: Publish bằng GitHub Pages (nhanh & miễn phí)
1. Tạo một repository công khai (Public) trên GitHub.
2. Push toàn bộ thư mục dự án lên nhánh `main`.
3. Vào **Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: `main` / `(root)` → Save**.
4. Chờ khoảng 1–2 phút, trang web sẽ hoạt động tại `https://<username>.github.io/<ten-repo>/`.
5. Nếu bạn có tên miền `.id.vn`, nhập tên miền vào mục **Custom domain** trong GitHub Pages và trỏ bản ghi DNS (`A` hoặc `CNAME`) tại nhà cung cấp tên miền.

### Cách 2: Publish bằng Cloudflare Pages hoặc Netlify
- Kéo thả toàn bộ thư mục dự án trực tiếp vào trang quản trị của **Cloudflare Pages** hoặc **Netlify Drop** là web online ngay lập tức (không cần bước build).
