# Product Requirements Document (PRD): env-guard / env-gap

## 1. Tổng quan & Chiến lược đặt tên trên npm (Naming Strategy)

### 1.1. Bối cảnh & Tên dự án
* **Mã dự án nội bộ:** `env-guard` (Micro CLI so sánh và bảo vệ tính toàn vẹn của biến môi trường).
* **Tình trạng trên npm Registry:** Tên `env-guard` đã bị đăng ký trên npm registry toàn cầu. Để đảm bảo **100% không bị lỗi trùng tên (403 Forbidden / E403 package name already exists)** khi chạy `npm publish`, dự án áp dụng 2 chiến lược đặt tên sau:

#### Chiến lược 1: Scoped Package (Khuyên dùng - Chuẩn chuyên nghiệp)
* **Định dạng:** `@<npm-username>/env-guard` (ví dụ: `@alexdev/env-guard`, `@nguyen/env-guard`).
* **Ưu điểm:**
  * Không bao giờ lo bị trùng tên với người khác vì gắn liền với namespace tài khoản npm của bạn.
  * Hoàn toàn miễn phí cho public packages trên npmjs.com.
  * Giúp xây dựng thương hiệu cá nhân rõ ràng trong portfolio.
* **Cách chạy:** `npx @<npm-username>/env-guard` hoặc cài đặt `npm i -D @<npm-username>/env-guard`.

#### Chiến lược 2: Unscoped Package độc nhất (Catchy & Trống trên npm)
Nếu muốn tên ngắn không có dấu `@`, các tên sau đã được kiểm tra và hiện đang khả dụng (chưa có chủ sở hữu):
1. **`env-gap`** (Rất ngắn, mang ý nghĩa phát hiện khoảng cách/độ lệch giữa `.env` và `.env.example`).
2. **`env-parity`** (Thuật ngữ chuẩn trong phát triển phần mềm - "Environment Parity" theo quy chuẩn 12-Factor App).
3. **`env-sync-guard`** (Mô tả trực diện tính năng bảo vệ đồng bộ).
4. **`check-env-sync`** (Dễ hiểu, dễ nhớ cho lệnh CLI).

#### Mẹo kiểm tra tên trống trên máy cá nhân:
Trước khi chọn bất kỳ tên nào, mở terminal và gõ:
```bash
npm view <ten-goi-du-kien>
```
* Nếu báo lỗi `404 Not Found (E404)` $\rightarrow$ **Tên hoàn toàn trống**, bạn có thể dùng ngay.
* Nếu in ra thông tin phiên bản $\rightarrow$ Tên đã có người sở hữu.

---

## 2. Mục tiêu & Chân dung người dùng mục tiêu (Target Persona)

### 2.1. Mục tiêu dự án
* **Mục tiêu kỹ thuật:** Xây dựng một CLI package cực nhẹ (< 10KB), **Zero Runtime Dependency**, khởi động dưới 50ms, phát hiện chính xác sự sai lệch giữa `.env` và `.env.example`.
* **Mục tiêu học tập & Vibe Coding:** Giúp lập trình viên lần đầu xuất bản npm làm chủ toàn bộ chu kỳ: khởi tạo dự án $\rightarrow$ viết mã bằng AI $\rightarrow$ viết test tự động $\rightarrow$ cấu hình npm binary $\rightarrow$ xuất bản lên npmjs.com.

### 2.2. Chân dung người dùng mục tiêu
* **Persona 1: Solo Developer / Indie Hacker**
  * *Bối cảnh:* Thường xuyên clone dự án cá nhân qua lại giữa máy bàn và laptop, hoặc kéo code từ GitHub sau vài tuần không đụng đến.
  * *Nỗi đau:* Chạy ứng dụng bị lỗi runtime trắng màn hình hoặc crash server chỉ vì file `.env` trên máy mới thiếu 1 biến bí mật.
* **Persona 2: Team Member trong nhóm Agile/Dev team**
  * *Bối cảnh:* Làm việc cùng 3–10 lập trình viên trên cùng một kho lưu trữ Git.
  * *Nỗi đau:* Đồng đội merge code mới có thêm biến môi trường vào `.env.example`, nhưng bản thân pull về không để ý thông báo trong chat, dẫn đến mất 15–30 phút debug xem tại sao app không chạy.
* **Persona 3: DevOps / CI Pipeline Maintainer**
  * *Bối cảnh:* Thiết lập luồng kiểm tra tự động trên GitHub Actions hoặc Git Pre-commit Hook.
  * *Nỗi đau:* Cần một công cụ kiểm tra cực nhanh, không làm chậm thời gian commit (Husky hook) và trả về exit code chuẩn.

---

## 3. User Journey & Luồng trải nghiệm (Workflows)

### 3.1. Luồng chạy độc lập (Standalone / On-demand)
```
[Developer mở terminal tại root dự án]
                   │
                   ▼
         Gõ: npx env-gap
                   │
                   ▼
     [CLI tự động quét thư mục hiện tại]
        Tìm: .env.example & .env
                   │
         ┌─────────┴─────────┐
         ▼                   ▼
   [Đủ file]            [Thiếu file]
         │                   │
         ▼                   ▼
[So sánh Key]       In thông báo lỗi rõ ràng
         │          Exit Code 1
         │
   ┌─────┴─────────────────────────────────┐
   ▼                                       ▼
[Trùng khớp hoàn toàn]              [Phát hiện sai lệch]
✓ In màu xanh: Tất cả biến đồng bộ   ✗ In màu đỏ: Danh sách Missing Keys
✓ Exit Code: 0                      ! In màu vàng: Danh sách Extra Keys (nếu có)
                                    ✗ Exit Code: 1
```

### 3.2. Luồng tích hợp tự động (Git Hook / CI/CD)
1. Developer cài đặt: `npm install -D env-gap`.
2. Thêm vào `package.json`: `"scripts": { "check:env": "env-gap" }`.
3. Gắn vào Husky `.husky/pre-commit`:
   ```bash
   npx env-gap
   ```
4. Khi dev gõ `git commit`, hook tự kích hoạt:
   * Nếu file `.env` thiếu key $\rightarrow$ Commit bị chặn lại ngay lập tức, ngăn ngừa việc đưa code lỗi lên remote.
   * Nếu hợp lệ $\rightarrow$ Commit tiếp tục bình thường mà không làm trễ thao tác gõ lệnh (< 40ms).

---

## 4. Các chức năng chính (Core Features)

### 4.1. Phân tích cú pháp file .env chuẩn xác (Parser Engine)
* Đọc và trích xuất danh sách key từ file định dạng dotenv mà không phụ thuộc thư viện bên ngoài.
* **Hỗ trợ đầy đủ các định dạng phổ biến:**
  * Dòng trống và khoảng trắng thừa.
  * Dòng chú thích bắt đầu bằng `#`.
  * Các dòng có tiền tố `export ` (thường gặp trong bash/zsh env script): `export API_KEY=xxx`.
  * Key có giá trị rỗng hoặc giá trị chứa dấu bằng: `KEY=abc=123`.
  * Bỏ qua các key bị comment: `# DISABLED_KEY=123`.

### 4.2. So sánh đối chiếu 2 chiều (Bi-directional Diff)
* **Missing Keys (Thiếu - Bắt buộc xử lý):** Các biến có trong `.env.example` (yêu cầu của dự án) nhưng không tồn tại trong `.env` cá nhân.
* **Extra / Unused Keys (Dư thừa - Cảnh báo nhẹ):** Các biến có trong `.env` nhưng chưa được khai báo tài liệu hóa vào `.env.example`.

### 4.3. Giao diện dòng lệnh & Báo cáo màu sắc (Terminal UX)
* Sử dụng mã màu ANSI tiêu chuẩn (không cần cài thêm `chalk` hay `colorette`).
* Bảng hiển thị tối giản, phân biệt rõ ràng:
  * `[MISSING]` tô màu đỏ nổi bật.
  * `[EXTRA]` tô màu vàng cảnh báo.
  * `[SUCCESS]` tô màu xanh lá cây khi đồng bộ 100%.

### 4.4. Quản lý Exit Code chuẩn UNIX
* Trả về `exit(0)` khi không có missing key nào.
* Trả về `exit(1)` khi phát hiện thiếu ít nhất một key, hoặc khi không tìm thấy file cấu hình.

---

## 5. Phân chia phạm vi: MVP vs. Hạng mục trì hoãn

| Hạng mục | MVP (v1.0.0) | Phiên bản sau (v1.1+) | Ghi chú thiết kế |
| :--- | :---: | :---: | :--- |
| **Quét file mặc định** (`.env` & `.env.example`) | **Có** | Có | Đường dẫn mặc định chuẩn |
| **Zero-dependency** (chỉ dùng Node.js core) | **Có** | Có | Đảm bảo tốc độ và kích thước |
| **Báo Missing Keys + Exit Code 1** | **Có** | Có | Chức năng quan trọng nhất |
| **Báo Extra Keys** | **Có** | Có | Dạng cảnh báo không chặn exit code |
| **Tuỳ chỉnh đường dẫn file** (`--env`, `--example`) | Trì hoãn | **v1.1.0** | Dành cho dự án dùng `.env.local`, `.env.test` |
| **Chế độ tương tác nhập giá trị** (`--fill`) | Trì hoãn | **v1.2.0** | Hỏi và tự động append vào `.env` |
| **Kiểm tra cú pháp giá trị (Type validation)** | Trì hoãn | **v2.0.0** | Ví dụ: kiểm tra URL, PORT phải là số |
| **Tự động tạo file `.env` mẫu nếu chưa có** | Trì hoãn | **v1.1.0** | Copy từ `.env.example` sang `.env` |

---

## 6. Yêu cầu phi chức năng (Non-Functional Requirements)

1. **Hiệu năng (Performance):**
   * Thời gian thực thi toàn bộ tiến trình phải dưới **50ms** trên máy tính thông thường để không gây cảm giác giật lag khi gắn vào Git hook.
   * Kích thước gói cài đặt khi nén lên npm: **dưới 10KB**.
2. **Khả năng tương thích (Compatibility):**
   * Chạy ổn định trên mọi phiên bản Node.js từ LTS v18 trở lên.
   * Tương thích hoàn toàn đa nền tảng: macOS, Linux, và Windows (cả PowerShell, CMD, Git Bash).
   * Hỗ trợ chuẩn ESM (`"type": "module"`) trong `package.json`.
3. **Bảo mật (Security & Privacy):**
   * **Tuyệt đối không in giá trị (values) của biến ra màn hình:** Chỉ in tên biến (keys).
   * **Không kết nối mạng (Zero network calls):** Không thu thập telemetry, không gửi dữ liệu ra bên ngoài.
4. **Độ tin cậy (Reliability):**
   * Không bao giờ ghi đè hoặc chỉnh sửa file `.env` gốc của người dùng trong phiên bản MVP (Read-only CLI).

---

## 7. Tiêu chí nghiệm thu (Acceptance Criteria)

* **Kịch bản 1: File đồng bộ hoàn hảo**
  * *Given:* Thư mục dự án có `.env` và `.env.example` chứa cùng tập hợp các key `[PORT, DB_URL]`.
  * *When:* Chạy lệnh `npx env-gap`.
  * *Then:* In thông báo xanh `✓ All environment variables are synced`, terminal trả về Exit Code `0`.

* **Kịch bản 2: File .env bị thiếu key**
  * *Given:* `.env.example` có `[PORT, DB_URL, STRIPE_KEY]`, nhưng `.env` chỉ có `[PORT, DB_URL]`.
  * *When:* Chạy lệnh `npx env-gap`.
  * *Then:* In danh sách màu đỏ `Missing: STRIPE_KEY`, terminal trả về Exit Code `1`.

* **Kịch bản 3: Không tìm thấy file**
  * *Given:* Thư mục dự án không có file `.env.example`.
  * *When:* Chạy lệnh `npx env-gap`.
  * *Then:* In cảnh báo vàng `Cannot find .env.example file`, hướng dẫn người dùng tạo file mẫu, Exit Code `1`.

* **Kịch bản 4: Biến có comment hoặc tiền tố export**
  * *Given:* `.env.example` chứa dòng `# COMMENTED_KEY=1` và `export API_KEY=abc`.
  * *When:* Chạy lệnh so sánh.
  * *Then:* Bỏ qua `COMMENTED_KEY`, nhận diện chính xác key `API_KEY`.

---

## 8. Giả định, Rủi ro tiềm ẩn & Câu hỏi mở

### 8.1. Giả định (Assumptions)
* Người dùng đặt file cấu hình tại thư mục gốc (root directory) nơi họ gõ lệnh.
* Các file cấu hình được mã hóa chuẩn UTF-8.

### 8.2. Rủi ro tiềm ẩn & Biện pháp giảm thiểu
* **Rủi ro 1: Lỗi quyền thực thi trên Linux/macOS khi chạy `npx`**
  * *Nguyên nhân:* Thiếu dòng Shebang `#!/usr/bin/env node` ở đầu file binary hoặc chưa cấp quyền `chmod +x`.
  * *Khắc phục:* File binary bắt buộc phải có dòng `#!/usr/bin/env node` ngay dòng đầu tiên.
* **Rủi ro 2: Lỗi E403 khi chạy `npm publish`**
  * *Nguyên nhân:* Tên package bị trùng hoặc tài khoản npm chưa kích hoạt 2FA / chưa verify email.
  * *Khắc phục:* Sử dụng Scoped Package `@username/env-guard` hoặc tên trống đã kiểm tra (`env-gap`), hoàn thành verify email trên npmjs.com trước khi publish.

### 8.3. Câu hỏi mở
1. Bạn đã có tài khoản trên [npmjs.com](https://www.npmjs.com/) chưa và username của bạn là gì? (Nếu có username, ta có thể dùng ngay scoped package `@<username>/env-guard`).
2. Bạn muốn xuất bản với tên unscoped công khai như `env-gap` hay dùng scoped package cá nhân?
