# Project Master Blueprint: env-guard / env-gap

Tài liệu thiết kế tổng thể (Master Blueprint) hợp nhất toàn diện: **Yêu cầu sản phẩm (PRD)**, **Phạm vi MVP**, **Công nghệ & Thẩm định thư viện (Tech Stack)**, **Kiến trúc hệ thống (Architecture)**, **Cây thư mục (Project Structure)** và **Tiêu chí nghiệm thu (Acceptance Criteria)**.

---

## 1. Tổng quan dự án & Chiến lược định danh npm

* **Tên mã nội bộ:** `env-guard` / `env-gap`
* **Mô tả ngắn:** Công cụ dòng lệnh (CLI Utility) siêu nhẹ, **Zero-dependency**, chuyên kiểm tra và bảo đảm tính đồng bộ giữa `.env` và `.env.example` trước khi commit hoặc deploy.
* **Chiến lược đặt tên trên npm Registry:**
  * **Phương án A (Khuyên dùng - Độc nhất 100%):** Scoped Package `@<username>/env-guard` (ví dụ: `@alexdev/env-guard`). Hoàn toàn miễn phí, gắn liền với profile cá nhân, không lo trùng tên.
  * **Phương án B (Unscoped Package khả dụng):** `env-gap` (kiểm tra khoảng cách/độ lệch), `env-parity`, `env-sync-guard`.
  * **Lệnh xác thực tính khả dụng trên máy:** `npm view <ten-goi>` (Nếu trả về lỗi `404 E404` nghĩa là tên hoàn toàn trống).

---

## 2. Mục tiêu & Chân dung người dùng mục tiêu

### 2.1. Mục tiêu
* **Đối với người dùng:** Triệt tiêu hoàn toàn sự cố crash ứng dụng do thiếu biến môi trường khi pull code mới hoặc deploy. Thời gian chạy dưới 50ms, không gây trễ khi gắn vào Git pre-commit hook.
* **Đối với tác giả (Vibe Coding):** Hoàn thành trọn vẹn chu trình phát triển package đầu tay: khởi tạo $\rightarrow$ lập trình có AI hỗ trợ $\rightarrow$ kiểm thử tự động $\rightarrow$ cấu hình npm binary $\rightarrow$ xuất bản lên npm.

### 2.2. Chân dung người dùng mục tiêu (Personas)
1. **Solo Developer / Indie Hacker:** Hay clone dự án giữa nhiều máy cá nhân, cần kiểm tra nhanh tính đầy đủ của file `.env`.
2. **Team Member (Git / Agile):** Đồng đội cập nhật biến mới trong `.env.example`, cần công cụ tự động cảnh báo để bổ sung ngay vào file `.env` cá nhân.
3. **DevOps / CI Maintainer:** Cần một CLI nhẹ, không phụ thuộc thư viện ngoài để chặn các bản build thiếu biến cấu hình trên GitHub Actions hoặc Husky hook.

---

## 3. Luồng trải nghiệm người dùng (User Workflows)

### 3.1. Luồng chạy độc lập (CLI On-demand)
```text
[Developer mở terminal] ──> Gõ: npx env-gap
                                  │
                                  ▼
                    [Tự động quét root folder]
                     Tìm: .env.example & .env
                                  │
         ┌────────────────────────┴────────────────────────┐
         ▼                                                 ▼
   [Đủ cả 2 file]                                   [Không tìm thấy file]
         │                                                 │
         ▼                                                 ▼
   [So sánh Keys]                                   In thông báo vàng
         │                                          Exit Code 1
   ┌─────┴─────────────────────────┐
   ▼                               ▼
[Đồng bộ 100%]              [Phát hiện sai lệch]
✔ In màu xanh: Hợp lệ        ✖ In màu đỏ: Danh sách Missing Keys
Exit Code: 0                ! In màu vàng: Danh sách Extra Keys (nếu có)
                            Exit Code: 1
```

### 3.2. Luồng tích hợp Git Hook (Husky Pre-commit)
```bash
# Thêm vào .husky/pre-commit
npx env-gap
```
Khi gõ `git commit -m "feat: new feature"`, hook tự kích hoạt. Nếu thiếu biến môi trường, commit bị chặn lại ngay lập tức (Exit Code 1), ngăn chặn code lỗi được đẩy lên kho lưu trữ từ xa.

---

## 4. Phạm vi tính năng: MVP v1.0.0 vs. Các phiên bản tiếp theo

| Hạng mục tính năng | MVP (v1.0.0) | v1.1.0+ | Ghi chú kỹ thuật |
| :--- | :---: | :---: | :--- |
| **Quét file mặc định** (`.env` & `.env.example`) | **Có** | Có | Đường dẫn chuẩn tại thư mục gốc |
| **Zero Runtime Dependency** | **Có** | Có | Dùng 100% API lõi của Node.js |
| **Báo Missing Keys + Exit Code 1** | **Có** | Có | Tính năng cốt lõi bắt buộc |
| **Cảnh báo Extra Keys (Unused Keys)** | **Có** | Có | Cảnh báo vàng, không chặn exit code |
| **Tự động tắt màu khi gặp `NO_COLOR` / CI** | **Có** | Có | Tương thích chuẩn Terminal POSIX |
| **Export hàm dùng trong code JS/TS** | **Có** | Có | Cung cấp file `src/index.js` |
| **Tùy chỉnh đường dẫn (`--env`, `--example`)** | Trì hoãn | **Có** | Dành cho dự án dùng `.env.local` |
| **Tự động hỏi và điền giá trị (`--fill`)** | Trì hoãn | **Có** | Chế độ interactive terminal |
| **Kiểm tra kiểu dữ liệu giá trị (Validation)** | Trì hoãn | **v2.0** | Kiểm tra PORT là số, URL hợp lệ |

---

## 5. Công nghệ & Thẩm định thư viện (Tech Stack & Audit)

### 5.1. Tech Stack lựa chọn
* **Runtime Target:** Node.js >= 18.0.0 (LTS 18, 20, 22+ trên macOS, Linux, Windows).
* **Chuẩn Module:** Native ECMAScript Modules (ESM) với `"type": "module"`.
* **Build Step:** **Không cần (Zero Build Step)**. Code JavaScript thuần chạy trực tiếp, loại bỏ 100% rủi ro cấu hình compiler hoặc lỗi đường dẫn khi publish.
* **Testing Framework:** `node:test` + `node:assert/strict` tích hợp sẵn trong Node.js (chạy qua `node --test`).

### 5.2. Thẩm định phụ thuộc (Dependency Audit)
* **Runtime Dependencies (`dependencies`):** **0 (Zero)**.
  * Đọc file & đường dẫn: `node:fs`, `node:path`.
  * Quản lý tiến trình & tham số: `node:process`.
  * Tô màu terminal: Native ANSI escape codes (`\x1b[32m`, `\x1b[31m`, `\x1b[33m`, `\x1b[0m`).
* **Bảo mật & Chuỗi cung ứng:** 0% rủi ro lỗ hổng bảo mật từ bên thứ ba; không thu thập dữ liệu (no telemetry); không bao giờ in giá trị của biến ra màn hình (chỉ in tên key).

---

## 6. Kiến trúc hệ thống & Quy tắc phụ thuộc

### 6.1. Mô hình: Functional Core, Imperative Shell
* **Functional Core (`src/parser.js`, `src/diff.js`, `src/format.js`):**
  * Các hàm thuần túy (Pure functions), không thực hiện I/O, không gọi `fs`, không in ra console.
  * Cực kỳ dễ viết unit test độc lập và đảm bảo độ chính xác tuyệt đối.
* **Imperative Shell (`bin/cli.js`):**
  * Đảm nhận mọi tác vụ có hiệu ứng phụ (side-effects): đọc file hệ thống, bắt lỗi ngoại lệ, in kết quả ra stdout/stderr và gọi `process.exit()`.

### 6.2. Luồng dữ liệu (Data Pipeline)
$$\text{File Content (String)} \xrightarrow{\text{parser.js}} \text{Keys (string[])} \xrightarrow{\text{diff.js}} \text{DiffResult} \xrightarrow{\text{format.js}} \text{ANSI Output} \xrightarrow{\text{cli.js}} \text{process.exit}$$

### 6.3. Quy tắc phụ thuộc 1 chiều (Strict Dependency Rule)
* `bin/cli.js` $\rightarrow$ `src/format.js` $\rightarrow$ `src/diff.js` $\rightarrow$ `src/parser.js`.
* Tuyệt đối không có phụ thuộc vòng (circular imports).

---

## 7. Cấu trúc cây thư mục chi tiết

```text
env-gap/
├── bin/
│   └── cli.js                  # Entrypoint thực thi dòng lệnh (Shebang #!/usr/bin/env node)
├── src/
│   ├── index.js                # Programmatic API entrypoint (export parse, diff, check)
│   ├── parser.js               # Parser trích xuất key từ định dạng dotenv
│   ├── diff.js                 # Thuật toán Set difference tìm missing/extra keys
│   └── format.js               # Format output kèm mã màu ANSI & hỗ trợ NO_COLOR
├── test/
│   ├── fixtures/               # Dữ liệu kiểm thử mẫu
│   │   ├── valid.env
│   │   ├── valid.env.example
│   │   └── edge-cases.env
│   ├── parser.test.js          # Unit test cho logic parser
│   ├── diff.test.js            # Unit test cho logic diff
│   └── cli.test.js             # Integration test chạy qua child_process
├── .gitignore                  # Bỏ qua node_modules, .env cá nhân, OS files
├── package.json                # npm metadata, bin declaration, ESM settings
├── README.md                   # Hướng dẫn sử dụng & badge
└── LICENSE                     # Giấy phép bản quyền MIT
```

---

## 8. Tiêu chí nghiệm thu (Acceptance Criteria)

* **AC-1 (Đồng bộ thành công):** Khi `.env` chứa đầy đủ mọi key trong `.env.example`, in thông báo xanh `✔ All environment variables are synchronized!`, Exit Code `0`.
* **AC-2 (Phát hiện thiếu biến):** Khi `.env` thiếu ít nhất 1 key trong `.env.example`, in danh sách đỏ `✖ Missing: KEY_NAME`, Exit Code `1`.
* **AC-3 (Xử lý cú pháp linh hoạt):** Bỏ qua dòng trống, comment `#`, nhận diện đúng key có tiền tố `export `, key có giá trị chứa dấu `=`, khoảng trắng đầu cuối dòng.
* **AC-4 (Xử lý thiếu file cấu hình):** Nếu không tìm thấy `.env.example`, in thông báo hướng dẫn màu vàng, Exit Code `1`.
* **AC-5 (Hiệu năng):** Tổng thời gian thực thi của lệnh CLI trên máy tính thông thường phải dưới **50ms**.
* **AC-6 (Bảo mật):** Không bao giờ in giá trị nhạy cảm ra terminal trong bất kỳ hoàn cảnh nào.

---

## 9. Cấu hình `package.json` hoàn chỉnh

```json
{
  "name": "env-gap",
  "version": "1.0.0",
  "description": "Zero-dependency CLI to verify environment variable parity against .env.example",
  "type": "module",
  "main": "./src/index.js",
  "bin": {
    "env-gap": "./bin/cli.js"
  },
  "files": [
    "bin/",
    "src/",
    "README.md",
    "LICENSE"
  ],
  "scripts": {
    "test": "node --test test/**/*.test.js",
    "start": "node ./bin/cli.js"
  },
  "keywords": [
    "env",
    "dotenv",
    "environment",
    "diff",
    "parity",
    "cli",
    "zero-dependency"
  ],
  "author": "Your Name",
  "license": "MIT",
  "engines": {
    "node": ">=18.0.0"
  }
}
```
