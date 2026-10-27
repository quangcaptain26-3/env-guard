# System Architecture & Project Structure: env-guard / env-gap

Tài liệu này xác định kiến trúc tổng quan, ranh giới trách nhiệm giữa các module, quy tắc luân chuyển dữ liệu và tổ chức thư mục của dự án theo chuẩn thiết kế **Functional Core, Imperative Shell**.

---

## 1. Kiến trúc tổng quan & Ranh giới Module

Dự án áp dụng mô hình kiến trúc **Functional Core, Imperative Shell (Lõi hàm thuần túy, Vỏ thực thi I/O)**:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        IMPERATIVE SHELL (I/O)                          │
│                                                                        │
│   [Terminal / CI / Hook] ──> bin/cli.js                                │
│                                  │                                     │
│                                  ├── 1. fs.readFileSync (Đọc file)     │
│                                  ▼                                     │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │                     FUNCTIONAL CORE (No I/O)                   │   │
│   │                                                                │   │
│   │   src/parser.js ──> Trích xuất Keys từ Text thô                │   │
│   │          │                                                     │   │
│   │          ▼                                                     │   │
│   │   src/diff.js   ──> So sánh 2 Set (Missing / Extra)            │   │
│   │          │                                                     │   │
│   │          ▼                                                     │   │
│   │   src/format.js ──> Tạo chuỗi báo cáo kèm màu ANSI             │   │
│   │                                                                │   │
│   └────────────────────────────────────────────────────────────────┘   │
│                                  │                                     │
│                                  ├── 2. console.log (In kết quả)       │
│                                  ▼                                     │
│                             process.exit(code: 0 | 1)                  │
└────────────────────────────────────────────────────────────────────────┘
```

### Ranh giới các module (Boundaries)
1. **Module Phân tích (`src/parser.js`):**
   * *Nhiệm vụ duy nhất:* Nhận chuỗi văn bản UTF-8 $\rightarrow$ trả về danh sách các key hợp lệ `string[]`.
   * *Ranh giới:* Không chứa logic đọc file, không truy cập biến môi trường, không in terminal.
2. **Module So sánh (`src/diff.js`):**
   * *Nhiệm vụ duy nhất:* Nhận vào 2 mảng `exampleKeys` và `envKeys` $\rightarrow$ trả về kết quả dạng đối tượng `{ missing: string[], extra: string[], isSynced: boolean }`.
   * *Ranh giới:* Hoàn toàn độc lập với hệ thống file và giao diện người dùng.
3. **Module Định dạng hiển thị (`src/format.js`):**
   * *Nhiệm vụ duy nhất:* Biến đổi kết quả so sánh thành chuỗi hiển thị có màu sắc ANSI trực quan hoặc dạng văn bản thường (khi có cờ `NO_COLOR`).
4. **Vỏ điều khiển CLI (`bin/cli.js`):**
   * *Nhiệm vụ:* Tiếp nhận tham số từ terminal, thực hiện các tác vụ có hiệu ứng phụ (side-effects): kiểm tra file tồn tại bằng `node:fs`, đọc nội dung, gọi các hàm trong Core, in kết quả và trả về mã thoát `process.exit()`.
5. **Programmatic Interface (`src/index.js`):**
   * *Nhiệm vụ:* Điểm xuất khẩu (export) dành cho các lập trình viên muốn nhúng thư viện vào mã nguồn JavaScript/TypeScript của họ thay vì chỉ chạy bằng CLI.

---

## 2. Cây thư mục chi tiết (Directory Tree)

```text
env-gap/
├── bin/
│   └── cli.js                  # Entry point CLI (chứa Shebang #!/usr/bin/env node)
├── src/
│   ├── index.js                # Programmatic API entrypoint (export parse, diff, check)
│   ├── parser.js               # Logic trích xuất keys từ file dotenv
│   ├── diff.js                 # Logic so sánh 2 tập hợp keys (Set differences)
│   └── format.js               # Logic tô màu ANSI và định dạng bảng kết quả
├── test/
│   ├── fixtures/               # Dữ liệu file mẫu phục vụ unit test
│   │   ├── valid.env           # File .env hợp lệ
│   │   ├── valid.env.example   # File .env.example mẫu
│   │   └── edge-cases.env      # File chứa comment, export, khoảng trắng
│   ├── parser.test.js          # Unit tests cho parser.js
│   ├── diff.test.js            # Unit tests cho diff.js
│   └── cli.test.js             # Integration test chạy thử lệnh qua child_process
├── .gitignore                  # Bỏ qua node_modules, .env cá nhân, OS files
├── package.json                # npm package metadata, bin config, ESM settings
├── README.md                   # Tài liệu hướng dẫn sử dụng, ví dụ npx & Git hook
└── LICENSE                     # Giấy phép bản quyền MIT
```

---

## 3. Trách nhiệm cụ thể của từng tệp tin

| Tệp tin | Trách nhiệm | Không được phép chứa |
| :--- | :--- | :--- |
| **`bin/cli.js`** | Đọc tham số, gọi file system `fs`, in console, gọi `process.exit()` | Thuật toán so sánh phức tạp hoặc regex parse |
| **`src/parser.js`** | Parse chuỗi dotenv, loại bỏ comment `#`, tiền tố `export `, lấy tên key | Thao tác I/O (`fs`), mã màu terminal |
| **`src/diff.js`** | Dùng `Set` tính toán missing và extra keys | Thao tác I/O, format màu sắc |
| **`src/format.js`** | Ghép chuỗi, chèn mã màu ANSI (`\x1b[31m`, `\x1b[32m`), hỗ trợ `NO_COLOR` | Logic phán đoán đúng sai hay kiểm tra file |
| **`src/index.js`** | Re-export các hàm từ `parser`, `diff`, `format` | Logic nghiệp vụ mới |
| **`test/*.test.js`**| Đảm bảo độ tin cậy bằng kiểm thử tự động qua `node:test` | Code chỉnh sửa logic production |

---

## 4. Luồng luân chuyển dữ liệu & Quy tắc phụ thuộc (Dependency Rules)

### 4.1. Luồng dữ liệu (Data Flow)
```text
1. [User gõ lệnh]
       │
       ▼
2. bin/cli.js xác định path:
   .env.example & .env
       │
       ▼ fs.readFileSync()
3. Chuỗi nội dung text thô
       │
       ▼ src/parser.js
4. Mảng Keys: string[]
       │
       ▼ src/diff.js
5. DiffResult: { missing: string[], extra: string[], isSynced: boolean }
       │
       ▼ src/format.js
6. Formatted Output: string (ANSI colored)
       │
       ▼ console.log() & process.exit(isSynced ? 0 : 1)
```

### 4.2. Quy tắc phụ thuộc (Dependency Direction)
* **Quy tắc 1 chiều:** `bin/cli.js` $\rightarrow$ `src/format.js` $\rightarrow$ `src/diff.js` $\rightarrow$ `src/parser.js`.
* **Tuyệt đối không có phụ thuộc vòng (Circular Dependencies):** Các file trong `src/` không bao giờ được phép `import` ngược lại `bin/cli.js`.
* `src/parser.js` và `src/diff.js` là các module lá (leaf modules), không phụ thuộc bất kỳ file nào khác trong dự án.

---

## 5. Cấu hình, Logging, Error Handling & Testing

### 5.1. Xử lý lỗi (Error Handling Strategy)
* **Lỗi không tìm thấy file cấu hình:**
  * Nếu thiếu `.env.example`: CLI in thông báo màu vàng hướng dẫn tạo file mẫu và thoát với mã `1`. Không ném ra Uncaught Exception hay in toàn bộ call stack làm rối mắt người dùng.
  * Nếu thiếu `.env`: CLI báo rõ ràng người dùng cần sao chép từ file `.env.example` sang `.env`.
* **Lỗi quyền truy cập file (EACCES / EPERM):** Bắt qua `try...catch` và in thông báo ngắn gọn.

### 5.2. Quản lý Logging & Terminal Styling
* **Nguyên tắc bảo mật:** Tuyệt đối không có bất kỳ dòng log nào in giá trị (values) của các biến môi trường ra stdout/stderr. Chỉ hiển thị tên biến (keys).
* **Chuẩn hiển thị:**
  * Thành công: Ký tự `✔` màu xanh lá cây (`\x1b[32m`).
  * Thiếu key: Ký tự `✖` màu đỏ (`\x1b[31m`).
  * Cảnh báo: Ký tự `!` màu vàng (`\x1b[33m`).
  * Tự động tắt màu (Plain text fallback) nếu biến môi trường `NO_COLOR` tồn tại hoặc terminal không phải là TTY (`!process.stdout.isTTY`).

### 5.3. Chiến lược kiểm thử (Testing Strategy)
* **Framework:** Sử dụng `node:test` và `node:assert/strict` có sẵn trong Node.js.
* **Tổ chức test:**
  * `parser.test.js`: Kiểm tra 100% các trường hợp đặc thù (dòng trống, key có giá trị rỗng, giá trị chứa dấu `=`, comment ở đầu dòng, khoảng trắng trước sau, tiền tố `export `).
  * `diff.test.js`: Kiểm tra tính chính xác của việc phát hiện missing keys và extra keys.
  * `cli.test.js`: Thực thi trực tiếp file `bin/cli.js` bằng `child_process.execFile` để kiểm tra mã thoát (Exit Code 0 vs Exit Code 1).
