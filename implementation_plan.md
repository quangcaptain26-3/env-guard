# Implementation Plan: env-guard / env-gap

Tài liệu này phân rã toàn bộ lộ trình triển khai dự án thành các **Phases**, **Tasks** độc lập, ma trận phụ thuộc, các cơ hội thực thi song song và các **Checkpoints** kiểm thử định kỳ, tuân thủ nguyên lý *Functional Core, Imperative Shell*.

---

## 1. Bản đồ tổng thể lộ trình (Phase Roadmap)

```text
[Phase 1: Setup & Scaffolding]
              │
              ▼
[Phase 2: Functional Core] ◄─── (Có thể làm song song: Parser, Diff, Format)
              │
              ▼
[Phase 3: Unit Testing & Fixtures] ───> [Checkpoint 1: Core 100% Pass]
              │
              ▼
[Phase 4: CLI Shell & Integration] ───> [Checkpoint 2: Integration Pass]
              │
              ▼
[Phase 5: Packaging & Release Prep] ──> [Checkpoint 3: Publish Readiness]
```

---

## 2. Chi tiết các Phase và Task

### Phase 1: Khởi tạo dự án & Nền tảng (Foundation Setup)
*Mục tiêu:* Thiết lập cấu trúc thư mục, tệp cấu hình package, quản lý mã nguồn và bản quyền.

#### Task 1.1: Tạo cấu trúc thư mục và Git config
* **Mục tiêu:** Tạo cây thư mục chuẩn và loại trừ các tệp nhạy cảm.
* **Phạm vi:** Tạo các thư mục `bin/`, `src/`, `test/fixtures/`, và file `.gitignore`.
* **Files liên quan:** `.gitignore`, `LICENSE`.
* **Dependencies:** Không có.
* **Acceptance Criteria:**
  * Thư mục được tạo đầy đủ theo kiến trúc.
  * `.gitignore` loại trừ: `node_modules/`, `.env*` (trừ `.env.example`), `*.log`.
* **Cách thức kiểm tra:** Chạy `Get-ChildItem -Recurse` hoặc `ls -R` xác nhận đủ thư mục.

#### Task 1.2: Thiết lập `package.json` chuẩn ESM & Binary CLI
* **Mục tiêu:** Định nghĩa metadata npm, khai báo module ESM và lệnh binary.
* **Phạm vi:** File `package.json`.
* **Dependencies:** Task 1.1.
* **Acceptance Criteria:**
  * `"type": "module"`.
  * `"bin": { "env-gap": "./bin/cli.js" }`.
  * `"files": ["bin/", "src/", "README.md", "LICENSE"]` (chỉ đóng gói file cần thiết).
  * `"dependencies": {}` (Zero-dependency).
  * Script `"test": "node --test test/**/*.test.js"`.
* **Cách thức kiểm tra:** Chạy `node -e "import('./package.json', {assert: {type: 'json'}})"` không báo lỗi cú pháp.

---

### Phase 2: Xây dựng Lõi chức năng (Functional Core)
*Mục tiêu:* Xây dựng các hàm thuần túy (Pure Functions), không I/O, độc lập tuyệt đối.
*Khả năng chạy song song:* **Task 2.1, Task 2.2 và Task 2.3 có thể thực hiện song song hoàn toàn.**

#### Task 2.1: Module phân tích cú pháp (`src/parser.js`) [Song song]
* **Mục tiêu:** Chuyển đổi nội dung văn bản dotenv thành danh sách các keys.
* **Phạm vi:** Hàm `parseEnvKeys(content: string): string[]`.
* **Files liên quan:** `src/parser.js`.
* **Dependencies:** Phase 1.
* **Acceptance Criteria:**
  * Bỏ qua dòng trống và khoảng trắng thừa.
  * Bỏ qua dòng comment bắt đầu bằng `#`.
  * Loại bỏ tiền tố `export ` nếu có (ví dụ: `export API_KEY=123` $\rightarrow$ `API_KEY`).
  * Trích xuất chính xác tên key trước dấu `=` đầu tiên.
  * Loại bỏ trùng lặp và giữ thứ tự xuất hiện.
* **Cách thức kiểm tra:** Test trực tiếp bằng Node REPL hoặc gọi hàm với chuỗi thử nghiệm.

#### Task 2.2: Module so sánh tập hợp (`src/diff.js`) [Song song]
* **Mục tiêu:** Đối chiếu 2 danh sách key và tìm ra sự chênh lệch (Set difference).
* **Phạm vi:** Hàm `diffEnvKeys(exampleKeys: string[], envKeys: string[])`.
* **Files liên quan:** `src/diff.js`.
* **Dependencies:** Phase 1.
* **Acceptance Criteria:**
  * Trả về object: `{ missing: string[], extra: string[], isSynced: boolean }`.
  * `missing`: Có trong `exampleKeys` nhưng thiếu trong `envKeys`.
  * `extra`: Có trong `envKeys` nhưng chưa khai báo trong `exampleKeys`.
  * `isSynced`: `true` khi và chỉ khi `missing.length === 0`.
* **Cách thức kiểm tra:** Test với 2 mảng mẫu, kiểm tra tính toán Set chính xác.

#### Task 2.3: Module định dạng màu Terminal (`src/format.js`) [Song song]
* **Mục tiêu:** Tạo chuỗi thông báo kết quả có màu ANSI hoặc plain text.
* **Phạm vi:** Hàm `formatReport(diffResult, options)`.
* **Files liên quan:** `src/format.js`.
* **Dependencies:** Phase 1.
* **Acceptance Criteria:**
  * Sử dụng mã ANSI gốc: Xanh (`\x1b[32m`), Đỏ (`\x1b[31m`), Vàng (`\x1b[33m`), Reset (`\x1b[0m`).
  * Tự động tắt mã màu nếu biến `process.env.NO_COLOR` tồn tại hoặc cờ `options.noColor === true`.
  * Tuyệt đối không chứa bất kỳ giá trị biến nào (chỉ in tên key).
* **Cách thức kiểm tra:** In ra terminal kiểm tra hiển thị màu sắc và kiểm tra khi bật `NO_COLOR=1`.

---

### Phase 3: Kiểm thử tự động Lõi chức năng (Core Unit Testing)
*Mục tiêu:* Đạt 100% test coverage cho Functional Core trước khi ghép nối CLI Shell.

#### Task 3.1: Chuẩn bị Test Fixtures
* **Phạm vi:** Tạo `test/fixtures/valid.env`, `test/fixtures/valid.env.example`, `test/fixtures/edge-cases.env`.
* **Dependencies:** Phase 1.
* **Acceptance Criteria:** Fixtures bao phủ các trường hợp: file đầy đủ, file thiếu key, comment rải rác, ký tự lạ, dấu `=` trong value.

#### Task 3.2: Viết Unit Test cho Parser & Diff
* **Phạm vi:** `test/parser.test.js`, `test/diff.test.js`.
* **Dependencies:** Phase 2, Task 3.1.
* **Acceptance Criteria:**
  * Dùng `node:test` và `node:assert/strict`.
  * Bao phủ AC-3 (xử lý cú pháp linh hoạt) và AC-2 (bắt missing key).
* **Cách thức kiểm tra:** Chạy `node --test test/parser.test.js test/diff.test.js`.

> 🛑 **CHECKPOINT 1:** Toàn bộ unit tests cho `parser` và `diff` phải **Pass 100%** mà không có cảnh báo nào. Thời gian chạy < 50ms.

---

### Phase 4: Tầng vỏ CLI & Ghép nối tích hợp (Imperative Shell)
*Mục tiêu:* Xây dựng điểm thực thi dòng lệnh, tương tác file hệ thống, xử lý exit code.

#### Task 4.1: Xây dựng Programmatic Entrypoint (`src/index.js`)
* **Mục tiêu:** Xuất khẩu các hàm cốt lõi để dev khác có thể `import` vào code JS.
* **Phạm vi:** `src/index.js`.
* **Dependencies:** Checkpoint 1.
* **Acceptance Criteria:** Export `parseEnvKeys`, `diffEnvKeys`, `formatReport`.
* **Cách thức kiểm tra:** `import * as envGap from './src/index.js'` thành công.

#### Task 4.2: Xây dựng CLI Entrypoint (`bin/cli.js`)
* **Mục tiêu:** Tiếp nhận tham số, đọc file, in kết quả và gán Exit Code chuẩn.
* **Phạm vi:** `bin/cli.js`.
* **Dependencies:** Checkpoint 1.
* **Acceptance Criteria:**
  * Có Shebang `#!/usr/bin/env node` ở dòng số 1.
  * Tự động tìm `.env.example` và `.env` tại thư mục hiện tại (`process.cwd()`).
  * Xử lý trường hợp không tìm thấy file mà không làm vỡ stack trace.
  * Trả về `process.exit(0)` nếu đồng bộ; `process.exit(1)` nếu thiếu key hoặc thiếu file cấu hình.
* **Cách thức kiểm tra:** Chạy thử trực tiếp `node ./bin/cli.js` trong thư mục có file mẫu.

#### Task 4.3: Viết Integration Test cho CLI Shell
* **Mục tiêu:** Kiểm tra lệnh CLI thực tế qua tiến trình con (child process).
* **Phạm vi:** `test/cli.test.js`.
* **Dependencies:** Task 4.2.
* **Acceptance Criteria:**
  * Dùng `node:child_process` thực thi `node ./bin/cli.js`.
  * Kiểm tra Exit Code đúng 0 khi pass, đúng 1 khi fail.
* **Cách thức kiểm tra:** Chạy `npm test`.

> 🛑 **CHECKPOINT 2:** Toàn bộ test suite (`npm test`) chạy qua, bao gồm cả Unit và Integration tests. Đáp ứng đầy đủ các tiêu chí nghiệm thu từ AC-1 đến AC-6 trong Master Blueprint.

---

### Phase 5: Hoàn thiện đóng gói & Sẵn sàng xuất bản (Release Readiness)
*Mục tiêu:* Chuẩn bị tài liệu, kiểm thử gói cài đặt và hoàn tất điều kiện publish npm.

#### Task 5.1: Soạn thảo tài liệu (`README.md`)
* **Phạm vi:** `README.md`.
* **Acceptance Criteria:**
  * Giới thiệu ngắn gọn, nêu bật tính năng Zero-dependency.
  * Hướng dẫn chạy nhanh qua `npx`.
  * Hướng dẫn tích hợp Husky / Git pre-commit hook trong 3 dòng lệnh.
  * Hướng dẫn sử dụng Programmatic API.

#### Task 5.2: Kiểm thử đóng gói cục bộ (Dry-run Audit)
* **Phạm vi:** Chạy lệnh `npm pack --dry-run`.
* **Acceptance Criteria:**
  * Gói nén chỉ chứa: `bin/`, `src/`, `README.md`, `LICENSE`, `package.json`.
  * Không chứa thư mục `test/`, không chứa `.env` nội bộ.
  * Dung lượng gói (unpacked size) **< 10KB**.

#### Task 5.3: Kiểm thử cài đặt cục bộ giả lập
* **Phạm vi:** Tạo một thư mục rỗng bên ngoài, chạy `npm link` hoặc gọi trực tiếp binary để kiểm tra.
* **Acceptance Criteria:** Binary chạy trơn tru, không báo lỗi thiếu quyền thực thi hay thiếu module.

> 🛑 **CHECKPOINT 3 (Final Release Gate):**
> 1. Tài khoản npmjs.com đã được verify email & bật 2FA.
> 2. Đã xác nhận tên gói khả dụng (`npm view <ten-goi>` ra lỗi 404).
> 3. Lệnh sẵn sàng: `npm publish` (hoặc `npm publish --access public` nếu dùng Scoped Package).

---

## 3. Ma trận phân công & Cơ hội chạy song song

| Nhóm việc | Tác vụ | Khả năng song song | Người thực hiện / Vai trò |
| :--- | :--- | :---: | :--- |
| **Foundation** | Task 1.1, Task 1.2 | Tuần tự | Setup Agent / Dev |
| **Core Dev** | Task 2.1 (`parser.js`) | **Song song 1** | Core Developer / AI Vibe Coder |
| **Core Dev** | Task 2.2 (`diff.js`) | **Song song 2** | Core Developer / AI Vibe Coder |
| **Core Dev** | Task 2.3 (`format.js`) | **Song song 3** | Core Developer / AI Vibe Coder |
| **Testing** | Task 3.1, Task 3.2 | Tuần tự sau Phase 2 | QA / Test Agent |
| **CLI Shell** | Task 4.1, Task 4.2, Task 4.3 | Tuần tự sau Checkpoint 1 | Integration Dev |
| **Release** | Task 5.1, Task 5.2, Task 5.3 | Tuần tự sau Checkpoint 2 | Package Maintainer |

---

## 4. Kế hoạch Code Review & Tiêu chuẩn chất lượng

Trong suốt quá trình code, mọi đoạn mã phải được kiểm duyệt theo 4 nguyên tắc bất di bất dịch:
1. **Zero Runtime Dependency Check:** Không được xuất hiện bất kỳ lệnh `import` nào ngoài `node:*` trong thư mục `src/` và `bin/`.
2. **Zero Value Leak Check:** Kiểm tra kỹ mã nguồn để đảm bảo không có lệnh `console.log` nào in giá trị của biến ra ngoài (chỉ in tên key).
3. **Cross-Platform Path Check:** Luôn dùng `path.resolve` hoặc `path.join`, không ghép chuỗi đường dẫn bằng dấu `/` hoặc `\` thủ công.
4. **POSIX Terminal Compliance:** Mã ANSI không được làm vỡ layout khi terminal không hỗ trợ màu (luôn có kiểm tra `NO_COLOR`).
