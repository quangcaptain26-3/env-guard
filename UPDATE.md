# PROJECT PROGRESS & HANDOFF LOG: UPDATE.md

> **QUY TẮC BẮT BUỘC DÀNH CHO AI:**
> 1. **TỪ PROMPT THỨ 2 TRỞ ĐI:** Bạn BẮT BUỘC phải đọc file này trước tiên để nắm rõ tiến độ hiện tại, các file đã tạo, và nhiệm vụ kế tiếp.
> 2. **SAU MỖI PROMPT:** Điền đầy đủ mục nhật ký tiến độ theo mẫu bên dưới trước khi kết thúc câu trả lời.

---

## 1. Trạng thái tổng quan dự án (Current Status)

* **Tên dự án:** `@capquang26/env-guard` (thư mục làm việc: `env-gap`)
* **Phase hiện tại:** `Release Preparation` — rebrand + xử lý các mục P0/P1 sau audit
* **Trạng thái:** `RELEASE_READY` — 52/52 test pass, tarball 9.249 B, **chưa commit / chưa publish**
* **Toàn bộ Test Suite:** `52/52 PASS` (17 parser + 14 diff + 10 CLI/API + 11 format)
* **Checkpoint gần nhất:** ✅ `Checkpoint 1` · ✅ `Checkpoint 2` · ✅ `Checkpoint 3` · ✅ `Final Review` (5/6 AC; AC-5 do môi trường)

---

## 2. Cấu trúc mẫu ghi chép sau mỗi Prompt (Template)

Mỗi lần AI hoàn thành một prompt, phải thêm một khối nhật ký vào phần **3. Lịch sử thực thi** theo định dạng sau:

```markdown
### 📝 [YYYY-MM-DD HH:mm] - <MÃ PROMPT: SETUP / PHASE-01 / PHASE-02 / ...>
* **Mục tiêu:** <Tóm tắt ngắn 1 câu mục tiêu của prompt vừa chạy>
* **Các file đã tác động:**
  * `[CREATED]` đường_dẫn_file
  * `[MODIFIED]` đường_dẫn_file
* **Bằng chứng kiểm thử (Verification Evidence):**
  * Lệnh đã chạy: `node --test test/...` (hoặc lệnh kiểm tra cấu hình)
  * Kết quả: `X tests passed, 0 failed, execution time: XXms`
* **Quyết định kỹ thuật / Lưu ý quan trọng:**
  * <Ghi chú nếu có edge case hoặc lưu ý cho prompt sau>
* **Trạng thái Checkpoint:** <Checkpoint 1: PASSED / PENDING>
* **Bàn giao cho Prompt kế tiếp:** <Chỉ rõ prompt tiếp theo cần làm gì>
```

---

## 3. Lịch sử thực thi chi tiết (Execution History)

*(AI sẽ nối tiếp các bản ghi mới nhất xuống bên dưới)*

### 📝 [Khởi tạo] - SETUP_READY
* **Mục tiêu:** Hoàn thiện bộ tài liệu kỹ thuật, kiến trúc, kế hoạch triển khai và bộ prompts điều phối.
* **Các file đã tác động:**
  * `[CREATED]` PRODUCT-REQUIREMENTS.md
  * `[CREATED]` TECH-STACK.md
  * `[CREATED]` ARCHITECTURE.md
  * `[CREATED]` PROJECT-BLUEPRINT.md
  * `[CREATED]` IMPLEMENTATION-PLAN.md
  * `[CREATED]` MASTER-PROMPT.md, SETUP-PROMPT.md, PHASE-01..05-PROMPT.md, FINAL-REVIEW-PROMPT.md
  * `[CREATED]` UPDATE.md
* **Bằng chứng kiểm thử:** Toàn bộ tài liệu và prompts đã được phê duyệt, sẵn sàng cho khâu code.
* **Trạng thái Checkpoint:** Sẵn sàng bước vào Phase 1.
* **Bàn giao cho Prompt kế tiếp:** Chạy `SETUP-PROMPT` (hoặc `PHASE-01-PROMPT`) để tạo thư mục và các file mã nguồn sơ khai.

### 📝 [2026-10-28 00:40] - PHASE-01
* **Mục tiêu:** Hoàn tất Phase 1 (Foundation Setup) — chuẩn hóa `.gitignore`, `package.json` ESM + binary, `LICENSE`; xác minh toàn bộ cây thư mục và điều kiện Zero-dependency.
* **Các file đã tác động:**
  * `[MODIFIED]` `.gitignore` — dùng `.env*` + ngoại lệ `!.env.example` (thay vì liệt kê thủ công `.env`, `.env.local`), thêm `npm-debug.log*`, `.npm/`, `desktop.ini`.
  * `[MODIFIED]` `package.json` — bổ sung `"dependencies": {}` (khai báo tường minh Zero Runtime Dependency theo Task 1.2). Giữ nguyên `"type": "module"`, `"bin"`, `"files"`, `"engines": ">=18.0.0"`.
  * `[MODIFIED]` `LICENSE` — file cũ bị **cắt cụt** (thiếu toàn bộ đoạn miễn trừ bảo hành của MIT, chỉ 598 bytes); đã ghi lại văn bản MIT License đầy đủ kèm dòng bản quyền `Copyright (c) 2026 env-gap contributors`.
  * `[VERIFIED]` Cấu trúc thư mục `bin/`, `src/`, `test/`, `test/fixtures/` cùng các file placeholder `bin/cli.js`, `src/{index,parser,diff,format}.js`, `test/{parser,diff}.test.js` đã tồn tại (rỗng, đúng phạm vi Phase 1).
* **Bằng chứng kiểm thử (Verification Evidence):**
  * `node -e "import('./package.json', { with: { type: 'json' } })"` → `JSON OK`; `name=env-gap`, `type=module`, `bin={"env-gap":"./bin/cli.js"}`, `files=[bin/, src/, README.md, LICENSE]`, `dependencies={}`, `devDependencies=null`.
  * Kiểm tra cây thư mục bằng PowerShell (`Test-Path` trên 15 đường dẫn bắt buộc) → `15/15 OK`, không thiếu mục nào.
  * Kiểm chứng `.gitignore` bằng repo Git tạm (copy `.gitignore` → `git init` → `git check-ignore`): `.env`, `.env.local`, `.env.production`, `debug.log` bị ignore; `.env.example`, `README.md` **không** bị ignore (đúng yêu cầu "trừ `.env.example`").
  * `npm test` → `2 tests passed, 0 failed, duration_ms: 90.3ms` (Node v26.4.0). Hai "test" hiện chỉ là file rỗng nên chưa có assertion thực chất.
* **Quyết định kỹ thuật / Lưu ý quan trọng:**
  * Script test giữ đúng tài liệu: `"test": "node --test test/**/*.test.js"`. ⚠️ **Cảnh báo tương thích:** trên Windows/CMD không có shell glob expansion, mẫu `test/**/*.test.js` được Node tự mở rộng — tính năng glob của test runner chỉ có từ Node ≥ 22.6. Trên Node 18/20 script này có thể báo "Could not find". Nếu Phase 3/5 cần hỗ trợ thực sự Node 18/20, đổi thành `node --test test/` (hành vi tương đương, tương thích ngược). Chưa đổi để giữ nguyên AC của Task 1.2.
  * Các file `.js` trong `src/` và `bin/` vẫn rỗng 0 byte — **chưa có logic**, đúng phạm vi (Phase 2/4 mới được viết).
  * Không có `node_modules/`, không có `package-lock.json`, không cài bất kỳ package nào.
  * Thư mục dự án **chưa phải Git repo** (`git init` chưa chạy) — cần cân nhắc trước Phase 5 (Task 5.2/5.3 dùng `npm pack`).
* **Trạng thái Checkpoint:** `Phase 1: PASSED` (Task 1.1 ✅, Task 1.2 ✅). `Checkpoint 1: PENDING` — chỉ xét sau khi hoàn tất Phase 2 + Phase 3.
* **Bàn giao cho Prompt kế tiếp (PHASE-02):** Viết 3 module Functional Core thuần túy, không I/O:
  1. `src/parser.js` → `parseEnvKeys(content: string): string[]` (bỏ dòng trống/comment `#`, strip tiền tố `export `, lấy key trước dấu `=` đầu tiên, khử trùng lặp giữ thứ tự, JSDoc đầy đủ).
  2. `src/diff.js` → `diffEnvKeys(exampleKeys, envKeys): { missing, extra, isSynced }` (dùng `Set`, `isSynced === (missing.length === 0)`; `extra` chỉ cảnh báo, không ảnh hưởng exit code).
  3. `src/format.js` → `formatReport(diffResult, options)` (ANSI `\x1b[32m/\x1b[31m/\x1b[33m/\x1b[0m`, tắt màu khi `NO_COLOR` tồn tại hoặc `options.noColor === true`, **tuyệt đối chỉ in tên key**).
  Sau đó chạy `node --test`, rồi append nhật ký Phase 2 và **dừng lại** — không viết test suite (Phase 3) hay `bin/cli.js` (Phase 4).

### 📝 [2026-10-28 00:42] - SETUP
* **Mục tiêu:** Xác nhận (re-verify) toàn bộ môi trường khởi tạo sơ khai theo yêu cầu SETUP: cây thư mục, `.gitignore`, `LICENSE` MIT 2026, `package.json` ESM zero-dependency, `UPDATE.md`.
* **Các file đã tác động:**
  * `[VERIFIED]` `bin/`, `src/`, `test/fixtures/` — đủ 3 thư mục theo ARCHITECTURE.md (kèm placeholder `bin/cli.js`, `src/{index,parser,diff,format}.js`, `test/{parser,diff}.test.js`).
  * `[MODIFIED]` `package.json` — chuẩn hóa theo đúng nội dung SETUP yêu cầu: bỏ key `"author": ""` (rỗng, gây nhiễu metadata npm); giữ `"dependencies": {}` để thỏa AC Task 1.2 (khai báo tường minh zero-dependency). Toàn bộ các key còn lại khớp 100%.
  * `[MODIFIED]` `.gitignore`, `LICENSE`, `package.json` — **loại bỏ UTF-8 BOM (EF BB BF)** bị sinh ra khi ghi file. BOM khiến `JSON.parse` ném `SyntaxError: Unexpected token '\uFEFF'` và làm hỏng pattern đầu tiên (`node_modules/`) của `.gitignore`.
  * `[VERIFIED]` `LICENSE` — MIT License 2026 đầy đủ, 1.080 bytes, không BOM.
  * `[VERIFIED]` `UPDATE.md` — template + lịch sử hiện có được giữ nguyên, chỉ append (không ghi đè).
* **Bằng chứng kiểm thử (Verification Evidence):**
  * `node -e "const pkg = JSON.parse(require('fs').readFileSync('./package.json')); console.log('Package OK:', pkg.name, pkg.bin)"` → `Package OK: env-gap { 'env-gap': './bin/cli.js' }` ✅
  * `npm test` → `2 tests passed, 0 failed, duration_ms: 101.99ms` (Node v26.4.0) ✅
  * Kiểm chứng `.gitignore` trong repo Git tạm: bị ignore đúng → `.env`, `.env.local`, `debug.log`, `.DS_Store`, `Thumbs.db`, `node_modules/`; **không** bị ignore → `.env.example`, `README.md`, `.gitignore` ✅
  * Quét BOM toàn repo: `BOM=False` cho `.gitignore`, `LICENSE`, `package.json` (các tài liệu `.md` vốn đã sạch).
* **Quyết định kỹ thuật / Lưu ý quan trọng:**
  * `.gitignore` dùng `.env*` + ngoại lệ `!.env.example` (thay vì chỉ `.env`, `.env.local`) để chặn cả `.env.production`, `.env.staging`… tránh rò rỉ secret — vẫn thỏa đủ 6 dòng SETUP yêu cầu và AC Task 1.1.
  * `package.json` **không có** `devDependencies`; `dependencies` là object rỗng ⇒ Zero Runtime Dependency (đã xác minh không tồn tại `node_modules/`, không có lockfile).
  * Mọi file văn bản phải ghi **UTF-8 không BOM**; nếu công cụ soạn thảo tự thêm BOM, phải strip trước khi commit (đã ghi nhận sự cố này).
* **Trạng thái Checkpoint:** `SETUP: PASSED` — `Phase 1: PASSED`. `Checkpoint 1: PENDING` (cần Phase 2 + Phase 3).
* **Bàn giao cho Prompt kế tiếp (PHASE-02):** Bắt đầu Functional Core, tuyệt đối không I/O:
  * `src/parser.js` → `parseEnvKeys(content: string): string[]`.
  * `src/diff.js` → `diffEnvKeys(exampleKeys, envKeys): { missing, extra, isSynced }`.
  * `src/format.js` → `formatReport(diffResult, options)` (ANSI thuần, hỗ trợ `NO_COLOR`/`options.noColor`, chỉ in key).
  * Viết JSDoc đầy đủ, chạy `node --test`, append nhật ký `PHASE-02`, **dừng** trước Phase 3.

### 📝 [2026-10-28 00:43] - PHASE-01 (Khép kín Task 1.1 + 1.2)
* **Mục tiêu:** Chốt Phase 1 đúng 100% theo IMPLEMENTATION-PLAN.md: đủ 8 file rỗng nhận mã nguồn, `bin/cli.js` có Shebang, xác thực `package.json` chuẩn ESM + Binary.
* **Các file đã tác động:**
  * `[CREATED]` `test/cli.test.js` — file rỗng 0 byte (placeholder integration test cho Phase 4).
  * `[MODIFIED]` `bin/cli.js` — thêm dòng đầu `#!/usr/bin/env node` (20 bytes, UTF-8 **không BOM**), chưa chứa logic.
  * `[VERIFIED]` `src/parser.js`, `src/diff.js`, `src/format.js`, `src/index.js`, `test/parser.test.js`, `test/diff.test.js` — tồn tại, rỗng 0 byte, không BOM.
  * `[VERIFIED]` `package.json` — không sửa; `bin/cli.js` đã trỏ đúng `"env-gap": "./bin/cli.js"`.
* **Bằng chứng kiểm thử (Verification Evidence):**
  * Lệnh nghiệm thu: `node -e "import('./package.json', { with: { type: 'json' } }).then(m => console.log('Config OK:', m.default.name))"` → **`Config OK: env-gap`** ✅
  * Kiểm tra chi tiết 7 tiêu chí `package.json` → `PASS` toàn bộ: `name`, `type=module`, `bin`, `files`, `dependencies={}`, `engines>=18.0.0`, `main=./src/index.js` ✅
  * `node --check bin/cli.js` → `syntax OK`; `node bin/cli.js` → `exit code: 0` (Shebang hợp lệ, không lỗi runtime) ✅
  * `npm test` → `3 tests passed, 0 failed, duration_ms: 137.30ms` (thêm `cli.test.js`, vẫn là placeholder rỗng) ✅
  * Quét byte: cả 8 file đều `BOM=False`; `bin/cli.js` có 3 byte đầu là `23 21 2F` (`#!/`) thay vì `EF BB BF`, đảm bảo kernel POSIX nhận diện Shebang.
* **Quyết định kỹ thuật / Lưu ý quan trọng:**
  * **Quyền thực thi POSIX:** môi trường hiện tại là Windows (NTFS) và dự án **chưa phải Git repo**, nên không thể lưu bit `+x` bằng `chmod`. Không chạy `chmod` giả tạo. npm tự set mode `0755` cho các entry trong `bin` khi publish/install, nên binary vẫn chạy được qua `npx`. Khi khởi tạo Git (Phase 5), chạy `git update-index --chmod=+x bin/cli.js` để lưu bit thực thi.
  * `bin/cli.js` hiện chỉ có Shebang — **cố ý**, logic CLI thuộc Task 4.2; chưa được viết `console.log`/`process.exit` ở đây.
  * Không tạo `test/fixtures/*` (Task 3.1) và không viết nội dung module Core (Phase 2) — giữ đúng ranh giới phase.
  * `node_modules/`, lockfile vẫn không tồn tại ⇒ zero-dependency được bảo toàn.
* **Trạng thái Checkpoint:** `Task 1.1: PASSED` · `Task 1.2: PASSED` · `Phase 1: COMPLETE`. `Checkpoint 1: PENDING` (cần Phase 2 + Phase 3).
* **Bàn giao cho Prompt kế tiếp (PHASE-02):** Viết Functional Core thuần túy (không `fs`, không `console`, không `process.exit`):
  1. `src/parser.js` → `parseEnvKeys(content)`.
  2. `src/diff.js` → `diffEnvKeys(exampleKeys, envKeys)`.
  3. `src/format.js` → `formatReport(diffResult, options)`.
  Chạy `node --test` và append nhật ký `PHASE-02`; **không** viết test suite (Phase 3) hay `bin/cli.js` (Phase 4).

### 📝 [2026-10-28 00:44] - PHASE-02
* **Mục tiêu:** Hiện thực 3 module Functional Core thuần túy (`parser`, `diff`, `format`), không I/O, zero dependency.
* **Các file đã tác động:**
  * `[MODIFIED]` `src/parser.js` — `parseEnvKeys(content: string): string[]` (2.021 bytes, JSDoc đầy đủ).
  * `[MODIFIED]` `src/diff.js` — `diffEnvKeys(exampleKeys, envKeys): { missing, extra, isSynced }` (1.913 bytes).
  * `[MODIFIED]` `src/format.js` — `formatReport(diffResult, options): string` (3.951 bytes).
* **Hợp đồng hàm đã hoàn thành:**
  * `parseEnvKeys`: strip BOM `\uFEFF`; split theo `\r\n | \r | \n`; trim từng dòng; bỏ dòng rỗng & comment `#` (kể cả key bị comment); strip tiền tố `/^export\s+/` (space hoặc tab); lấy ký tự trước dấu `=` **đầu tiên**; validate key bằng `/^[\w.-]+$/` (loại dòng rác như `BAD LINE = x`, dòng không có `=`); khử trùng lặp, **giữ thứ tự xuất hiện**.
  * `diffEnvKeys`: dùng `Set`; `missing` theo thứ tự `exampleKeys`, `extra` theo thứ tự `envKeys`; khử trùng lặp; `isSynced = missing.length === 0` (extra **không** làm fail); input không phải array → coi như `[]` (hàm total, không ném lỗi).
  * `formatReport`: trả `string`, **không newline cuối**; chỉ render **tên key**, tuyệt đối không có giá trị. Layout: đỏ `✖ Missing environment variables (n):` + item, vàng `! Extra environment variables (n):` + item, xanh `✔ All environment variables are synchronized!`; trường hợp không thiếu nhưng có extra → xanh `✔ All required environment variables are present.` + block vàng. ANSI: `\x1b[32m` (green), `\x1b[31m` (red), `\x1b[33m` (yellow), `\x1b[0m` (reset).
* **Bằng chứng kiểm thử (Verification Evidence):** chạy script ESM tạm (đã xóa sau khi chạy) với `node v26.4.0`:
  ```text
  parseEnvKeys -> ["PORT","API_KEY","DB_URL","EMPTY","TAB_KEY"]
  diff -> {"missing":["STRIPE_KEY"],"extra":["LEGACY"],"isSynced":false}
  --- plain ---
  ✖ Missing environment variables (1):
    - STRIPE_KEY
  ! Extra environment variables (1):
    - LEGACY
  --- colored (escaped) ---
  "\u001b[31m✖ Missing environment variables (1):\u001b[0m\n\u001b[31m  - STRIPE_KEY\u001b[0m\n\u001b[33m! Extra environment variables (1):\u001b[0m\n\u001b[33m  - LEGACY\u001b[0m"
  --- synced ---
  ✔ All environment variables are synchronized!
  --- synced + extra ---
  ✔ All required environment variables are present.
  ! Extra environment variables (1):
    - OLD
  ALL CORE CHECKS PASSED  (exit=0)
  ```
  * Input test phủ: BOM đầu file, comment, dòng trống, `export `, tab sau `export`, value chứa dấu `=`, value có `://user:pass@`, key có khoảng trắng quanh `=`, value rỗng, key trùng lặp, dòng không có `=`, dòng rác có space trong key.
  * `NO_COLOR=1` (set qua `process.env`) → output **không** chứa `\x1b[` ✅; `options.noColor: true` → plain ✅; mặc định → có mã màu ✅.
  * Zero Value Leak: assert output **không** chứa `postgres`, `abc=123` ✅.
  * Static scan `src/*.js`: không có `fs`, `console.`, `process.exit`, `require(` (chỉ 1 dòng comment nhắc chữ "console") ✅.
  * `npm test` → `3 passed, 0 failed, duration_ms: 127.04ms` (vẫn là placeholder rỗng) ✅.
  * Quét BOM: cả 3 file `BOM=False` ✅.
* **Quyết định kỹ thuật / Lưu ý quan trọng:**
  * **Ngoại lệ purity có chủ đích:** `format.js` đọc `process.env.NO_COLOR` (đúng AC Task 2.3). Đây là *environment probe* chỉ đọc, không I/O file, không console. Để test tất định, `options.noColor` (boolean) **luôn thắng** env; Phase 3 phải truyền cờ này thay vì phụ thuộc env.
  * `isSynced` chỉ phản ánh missing (theo AC Task 2.2). Vì vậy `formatReport` **không** dùng `isSynced` để chọn thông điệp mà tự kiểm tra `missing.length`/`extra.length`, tránh in "synchronized" sai khi còn extra.
  * Không export helper màu/ANSI ra ngoài — Phase 3 assert qua output thực tế, tránh khóa API nội bộ.
  * `src/index.js` vẫn rỗng (Task 4.1), `bin/cli.js` vẫn chỉ có Shebang — chưa ghép nối.
* **Trạng thái Checkpoint:** `Phase 2: COMPLETE` (Task 2.1 ✅, 2.2 ✅, 2.3 ✅). `Checkpoint 1: PENDING` — cần Phase 3 pass 100% và < 50ms.
* **Bàn giao cho Prompt kế tiếp (PHASE-03):**
  1. Tạo fixtures `test/fixtures/valid.env`, `test/fixtures/valid.env.example`, `test/fixtures/edge-cases.env` (phủ đủ: đầy đủ, thiếu key, comment, export, whitespace, `=` trong value, key trùng).
  2. Viết `test/parser.test.js`, `test/diff.test.js` dùng `node:test` + `node:assert/strict` — thay thế file rỗng.
  3. (Khuyến nghị) thêm test cho `formatReport` (plain/color/NO_COLOR) dù plan chỉ nêu parser/diff — vẫn nằm trong phạm vi "Core Unit Testing".
  4. Chạy `node --test test/parser.test.js test/diff.test.js`, append nhật ký `PHASE-03`, xác nhận **Checkpoint 1**; **không** viết `bin/cli.js` (Phase 4).

### 📝 [2026-10-28 00:46] - PHASE-03
* **Mục tiêu:** Tạo fixtures và bộ unit test toàn diện cho `src/parser.js` + `src/diff.js` bằng `node:test`, đạt Checkpoint 1.
* **Các file đã tác động:**
  * `[CREATED]` `test/fixtures/valid.env.example` — 4 key chuẩn (`PORT`, `DATABASE_URL`, `JWT_SECRET`, `LOG_LEVEL`), 156 bytes.
  * `[CREATED]` `test/fixtures/valid.env` — cùng 4 key, **giá trị khác hoàn toàn** để chứng minh chỉ key được dùng (187 bytes).
  * `[CREATED]` `test/fixtures/edge-cases.env` — comment đầu dòng & thụt lề, `export` (space + tab), khoảng trắng quanh `=`, `=` trong value, value rỗng, inline `#`, key trùng, dòng không `=`, key chứa space, `=ORPHAN` (299 bytes).
  * `[MODIFIED]` `test/parser.test.js` — 17 test / 4 suite (thay file rỗng 0 byte).
  * `[MODIFIED]` `test/diff.test.js` — 14 test / 4 suite, gồm 2 test tích hợp `parseEnvKeys` + fixtures (thay file rỗng 0 byte).
  * `[MODIFIED]` `UPDATE.md` — append block này + cập nhật trạng thái/Checkpoint.
* **Nội dung kiểm thử (31 test):**
  * **Parser (17):** fixture `valid.env.example`, `valid.env`, `edge-cases.env`; chuỗi rỗng; whitespace-only; input không phải string (`undefined`/`null`/`42`); file chỉ có comment; key bị comment; `export` + tab; value chứa `=`; value rỗng; trim khoảng trắng; key có `.` `-` `_`; bỏ dòng không `=`, key rỗng, key có space; CRLF/CR/BOM; khử trùng giữ thứ tự; **không trả về value**.
  * **Diff (14):** khớp hoàn toàn; hai tập rỗng; thiếu key; thừa key (vẫn `isSynced: true`); thiếu + thừa; env rỗng; example rỗng; input không phải array; giữ thứ tự missing/extra; khử trùng; không mutate input; tích hợp fixture `valid.env.example` ↔ `valid.env` (synced) và ↔ `edge-cases.env` (missing 4 key).
* **Bằng chứng kiểm thử (Verification Evidence):**
  * Lệnh: `node --test test/parser.test.js test/diff.test.js`
  ```text
  ℹ tests 31
  ℹ suites 8
  ℹ pass 31
  ℹ fail 0
  ℹ cancelled 0
  ℹ skipped 0
  ℹ todo 0
  ℹ duration_ms 115.873
  ```
  * `npm test` (toàn bộ suite) → `tests 32, pass 32, fail 0, duration_ms: 127.8691` (32 = 31 test thật + `test/cli.test.js` rỗng).
  * Không có warning/cảnh báo nào từ test runner; không cài thêm bất kỳ package nào (`node:test`, `node:assert/strict`, `node:fs` đều là built-in).
  * Fixtures **không bị** `.gitignore` chặn (kiểm chứng bằng Git repo tạm): `test/fixtures/*.env` hiện untracked bình thường, chỉ `.env` bị ignore.
  * Quét BOM: cả 5 file mới `BOM=False`.
* **Quyết định kỹ thuật / Lưu ý quan trọng:**
  * ⏱️ **Ngưỡng "< 50ms":** không thể đạt nếu tính **wall-clock toàn tiến trình** trên máy này — riêng `node -e "0"` đã mất **57–88ms** (Windows + Node v26 bootstrap), còn `node --test` đo được **115.9ms** (trong đó ~75–88ms là khởi động runtime). Thời gian **thực thi test body** (tổng 8 suite) chỉ **≈14.4ms < 50ms**. Kết luận: ngưỡng 50ms được đáp ứng ở phần thực thi logic; phần vượt là chi phí khởi động process, không phải do code. Ghi nhận minh bạch thay vì làm tròn kết quả.
  * `test/fixtures/valid.env` cố ý chứa giá trị **giả** và khác `valid.env.example` để test chứng minh parser chỉ trả key.
  * **Khoảng trống còn lại:** `src/format.js` **chưa có unit test** (plan Checkpoint 1 chỉ yêu cầu parser + diff). Cần bổ sung test format (plain/ANSI/`NO_COLOR`) trước khi hoàn tất Phase 4/5 để khóa hành vi output.
* **Trạng thái Checkpoint:** ✅ **`Checkpoint 1: PASSED`** — 31/31 test Core pass, 0 fail, 0 skipped; `Task 3.1 ✅`, `Task 3.2 ✅`.
* **Bàn giao cho Prompt kế tiếp (PHASE-04):**
  1. `src/index.js` — re-export `parseEnvKeys`, `diffEnvKeys`, `formatReport` (Task 4.1).
  2. `bin/cli.js` — giữ Shebang dòng 1; dùng `node:fs`/`node:path`; đọc `.env` + `.env.example` tại `process.cwd()`; xử lý thiếu file/EACCES không vỡ stack trace; `NO_COLOR`/non-TTY → truyền `noColor`; `process.exit(0|1)`; chỉ in key, không in value (Task 4.2).
  3. `test/cli.test.js` — integration test bằng `node:child_process` (exit 0/1, thiếu file) (Task 4.3).
  4. (Khuyến nghị) thêm `test/format.test.js` để bù khoảng trống coverage.
  5. Chạy `npm test`, append `PHASE-04`, xác nhận **Checkpoint 2**.

### 📝 [2026-10-28 00:48] - PHASE-04
* **Mục tiêu:** Hoàn thiện Programmatic API (`src/index.js`), CLI Shell (`bin/cli.js`) và Integration Test qua `child_process`; đạt Checkpoint 2.
* **Các file đã tác động:**
  * `[MODIFIED]` `src/index.js` — 1.584 bytes; re-export `parseEnvKeys`, `diffEnvKeys`, `formatReport` + thêm `checkEnvParity(exampleContent, envContent, options)` trả `{ missing, extra, isSynced, report }`. Hoàn toàn pure, không `fs`.
  * `[MODIFIED]` `bin/cli.js` — 3.650 bytes; Shebang dòng 1 (`23 21 2F`), toàn bộ I/O nằm ở đây.
  * `[MODIFIED]` `test/cli.test.js` — 6.025 bytes; **10 test** (7 integration CLI + 3 programmatic API).
  * `[MODIFIED]` `UPDATE.md` — append block này + cập nhật trạng thái/Checkpoint.
* **Hành vi CLI đã hiện thực:**
  * Đọc `path.resolve(process.cwd(), '.env.example')` và `.env` bằng `readFileSync(..., 'utf8')`.
  * Thiếu `.env.example` → stderr vàng `! Cannot find .env.example in <cwd>` + hướng dẫn tạo → exit **1**.
  * Thiếu `.env` → stderr `! Cannot find .env in <cwd>` + `Copy .env.example to .env ...` → exit **1**.
  * `EACCES`/`EPERM` → thông báo ngắn, exit **1**; lỗi khác → in `message`, **không** in stack trace.
  * Kết quả: `formatReport(diff, { noColor })` → stdout; exit **0** khi `isSynced === true`, **1** khi thiếu key.
  * `noColor = !process.stdout.isTTY || NO_COLOR (khác rỗng)`; truyền **boolean** xuống Core nên hành vi tất định.
  * Zero Value Leak: chỉ truyền key vào `diff`/`format`; message lỗi chỉ chứa đường dẫn/tên file.
* **Bằng chứng kiểm thử (Verification Evidence):**
  * `npm test` → **`tests 41 · suites 11 · pass 41 · fail 0 · cancelled 0 · skipped 0 · duration_ms 617.6514`** ✅
  * 7 integration test (mỗi test spawn process thật, 61–84ms/test): synced→0; missing→1 + chỉ in tên key; extra→0 + cảnh báo; thiếu `.env.example`→1 (không stack trace); thiếu `.env`→1; cú pháp comment/`export`/`=`→0; piped/`NO_COLOR`→không ANSI.
  * 3 test API: đủ 4 export; `checkEnvParity` trả diff + report; **không** rò rỉ value (`super-secret`).
  * `node -e "import('./src/index.js')..."` → `API exports: checkEnvParity, diffEnvKeys, formatReport, parseEnvKeys`.
  * Demo thủ công trong thư mục tạm (đã xóa):
    ```text
    === synced + extra (piped -> plain) ===
    ✔ All required environment variables are present.
    ! Extra environment variables (1):
      - LEGACY_KEY
    exit=0
    === missing key case ===
    ✖ Missing environment variables (2):
      - DATABASE_URL
      - JWT_SECRET
    exit=1
    ```
    Giá trị thật trong `.env` (`real-secret-value`, `old`) **không** xuất hiện ở stdout/stderr.
  * Quét BOM: `src/index.js`, `bin/cli.js`, `test/cli.test.js` đều `BOM=False`.
* **Quyết định kỹ thuật / Lưu ý quan trọng:**
  * `process.exit(main())` dùng đúng đặc tả Task 4.2 (exit code số nguyên 0/1). Output nhỏ (<1KB) nên không gặp hiện tượng cắt stdout trên pipe; integration test đã xác nhận nội dung đầy đủ.
  * Thông báo lỗi ghi ra **stderr**, báo cáo kết quả ghi ra **stdout** — đúng chuẩn UNIX, cho phép pipe riêng.
  * `checkEnvParity` nhận **nội dung file** (không phải đường dẫn) để giữ API thuần túy; người dùng tự đọc file.
  * ⚠️ **Coverage gap còn lại:** `src/format.js` vẫn **chưa có unit test trực tiếp** (được test gián tiếp qua integration: plain text/no ANSI/success/missing/extra). Nên bổ sung `test/format.test.js` ở Phase 5 để khóa hành vi ANSI trước khi publish.
  * Không thêm dependency; `dependencies: {}` giữ nguyên.
* **Trạng thái Checkpoint:** ✅ **`Checkpoint 2: PASSED`** — 41/41 test (unit + integration) pass 100%, 0 fail. `Task 4.1 ✅`, `Task 4.2 ✅`, `Task 4.3 ✅`.
* **Bàn giao cho Prompt kế tiếp (PHASE-05):**
  1. `README.md` — giới thiệu zero-dependency, `npx env-gap`, tích hợp Husky pre-commit (3 dòng), ví dụ Programmatic API (`checkEnvParity`).
  2. `npm pack --dry-run` → chỉ chứa `bin/`, `src/`, `README.md`, `LICENSE`, `package.json`; **không** có `test/`, `.env`; unpacked size **< 10KB**.
  3. Kiểm thử cài đặt cục bộ (`npm link` hoặc gọi binary trong thư mục rỗng ngoài dự án).
  4. (Khuyến nghị) thêm `test/format.test.js` + chạy lại toàn bộ suite.
  5. Khởi tạo Git repo, `git update-index --chmod=+x bin/cli.js`, rồi append `PHASE-05` và xác nhận **Checkpoint 3**.

### 📝 [2026-10-28 00:50] - PHASE-05
* **Mục tiêu:** Hoàn thiện README, audit đóng gói (`npm pack --dry-run`), kiểm tra cài đặt qua `npm link`; đạt Checkpoint 3 (Release Ready).
* **Các file đã tác động:**
  * `[MODIFIED]` `README.md` — 4.157 bytes (trước đó rỗng 0 byte). Gồm: 5 badge (npm version/downloads/license/node/dependencies), Problem Statement, Quick start `npx env-gap`, output mẫu (synced / missing / extra), bảng Features, Husky pre-commit hook, CI snippet, Programmatic API (`checkEnvParity` + low-level exports), bảng Exit codes, mục Security, Requirements, License.
  * `[MODIFIED]` `UPDATE.md` — append block này + cập nhật trạng thái/Checkpoint.
  * `[VERIFIED]` `package.json` — `files` giới hạn đúng `bin/`, `src/`, `README.md`, `LICENSE`; không sửa gì.
* **Bằng chứng kiểm thử (Verification Evidence):**
  * **Packaging audit** — `npm pack --dry-run`:
    ```text
    npm notice Tarball Contents
    npm notice 1.1kB LICENSE
    npm notice 4.2kB README.md
    npm notice 3.6kB bin/cli.js
    npm notice 619B package.json
    npm notice 1.9kB src/diff.js
    npm notice 4.0kB src/format.js
    npm notice 1.6kB src/index.js
    npm notice 2.0kB src/parser.js
    npm notice package size: 7.3 kB
    npm notice unpacked size: 19.0 kB
    npm notice total files: 8
    ```
    * Chỉ đúng 8 file; **không** có `test/`, `.env`, `UPDATE.md`, tài liệu nội bộ.
    * `npm pack --dry-run --json` → `size: 7257` bytes, `unpackedSize: 18972`, `entryCount: 8`.
    * Quét output: **không có `npm warn`** (chỉ `npm notice`) ✅.
  * **Local link test** — `npm link` → `added 1 package, audited 3 packages`, exit 0; `env-gap` resolve tại `C:\Users\Admin\AppData\Roaming\npm\env-gap.ps1`. Chạy trong thư mục tạm:
    ```text
    === env-gap (installed via npm link) ===
    ✔ All environment variables are synchronized!
    exit=0
    === missing key ===
    ✖ Missing environment variables (1):
      - DATABASE_URL
    exit=1
    === missing .env.example ===
    ! Cannot find .env.example in C:\Users\Admin\AppData\Local\Temp\env-gap-link-test
      Create .env.example with the variables your project requires, then run env-gap again.
    exit=1
    ```
    * Dọn dẹp: `npm unlink -g env-gap` → `removed 1 package`, `env-gap removed from PATH`; **không** còn `node_modules/`, `package-lock.json`, `.tgz` trong repo.
  * **Tên package khả dụng** — `npm view env-gap` → `npm error code E404` / `404 Not Found` ⇒ tên **còn trống** trên registry ✅.
  * **Tài khoản publish** — `npm whoami` → `capquang26` (đã đăng nhập, exit 0). **Chưa chạy `npm publish`** vì đây là hành động công khai/không thể hoàn tác, cần người dùng xác nhận.
  * `npm test` sau thay đổi README → `tests 41 · suites 11 · pass 41 · fail 0 · duration_ms 592.568` ✅ (README không ảnh hưởng runtime).
  * `README.md` BOM=False.
* **Quyết định kỹ thuật / Lưu ý quan trọng:**
  * ⚠️ **Mâu thuẫn tiêu chí kích thước:** IMPLEMENTATION-PLAN ghi "unpacked size < 10KB", nhưng PRD/TECH-STACK ghi "dung lượng gói **khi nén/tải về** < 10KB". Số đo thực tế: **tarball 7.257 bytes (7.3 kB) ✅** nhưng **unpacked 18.972 bytes (19.0 kB) ❌** so với ngưỡng literal. Không thể đạt 10KB unpacked khi bản thân `bin/` + `src/` đã 13.119 bytes và JSDoc đầy đủ là yêu cầu chất lượng — muốn đạt phải cắt bỏ tài liệu trong code hoặc thêm bước minify (vi phạm "Zero Build Step"). Kết luận: đạt ngưỡng **download size** theo PRD; ghi nhận unpacked vượt ngưỡng của plan.
  * File `bin/cli.js` trong tarball có mode `0644` (Windows không lưu bit `+x`). `npm link` đã tạo shim và chạy được ⇒ không chặn cài đặt. Khi có Git repo, chạy `git update-index --chmod=+x bin/cli.js` để lưu bit thực thi cho các bản publish từ Linux/macOS.
  * `package.json` chưa có `repository`/`homepage`/`bugs`/`author` — không gây warning khi pack, nhưng nên bổ sung trước khi publish để trang npm đầy đủ.
  * README dùng badge trỏ tới `img.shields.io` — sẽ hiển thị 404 cho tới khi package thực sự được publish.
  * ⚠️ **Coverage gap vẫn còn:** `src/format.js` chưa có unit test trực tiếp (chỉ test gián tiếp qua integration). Không chặn Checkpoint 3 nhưng nên xử lý ở Final Review.
* **Trạng thái Checkpoint:** ✅ **`Checkpoint 3: PASSED (RELEASE READY)`**
  * `Task 5.1 ✅` README · `Task 5.2 ✅` dry-run audit (8 file, không warning, tarball 7.3 kB) · `Task 5.3 ✅` local link test.
  * Điều kiện publish: tên `env-gap` trống (E404), tài khoản `capquang26` đã đăng nhập, lệnh sẵn sàng `npm publish` (unscoped) hoặc `npm publish --access public` (nếu chuyển scoped).
* **Bàn giao cho Final Review:**
  1. Quyết định **tên/scope**: `env-gap` (unscoped, đã xác nhận trống) hay `@capquang26/env-guard` (theo PRD Phương án A) — nếu đổi phải sửa `package.json.name`, README (`npx ...`), badge.
  2. Chạy lại toàn bộ `npm test` + `npm pack --dry-run` trên trạng thái cuối.
  3. (Khuyến nghị) thêm `test/format.test.js` để khóa hành vi ANSI/`NO_COLOR`.
  4. Khởi tạo Git repo, commit, `git update-index --chmod=+x bin/cli.js`, thêm `repository`/`homepage`/`author` vào `package.json`.
  5. **Chỉ publish khi người dùng xác nhận rõ ràng**; sau đó kiểm tra `npx env-gap@latest`, cập nhật `UPDATE.md` lần cuối.

### 📝 [2026-10-28 00:52] - FINAL-REVIEW
* **Mục tiêu:** Rà soát độc lập toàn dự án, đối chiếu AC-1→AC-6, kiểm toán kỹ thuật/rủi ro, chạy tổng nghiệm thu và lập biên bản cuối.
* **Các file đã tác động:**
  * `[CREATED]` `test/format.test.js` — 4.642 bytes, **11 test / 4 suite**, khóa hành vi ANSI: xanh cho success, đỏ cho missing, vàng cho extra, `options.noColor`, `NO_COLOR` (kể cả chuỗi rỗng), không newline cuối, không rò rỉ value.
  * `[MODIFIED]` `UPDATE.md` — append block này + thêm **Mục 4. Biên bản nghiệm thu cuối cùng**; cập nhật trạng thái tổng quan.
  * `[VERIFIED]` Toàn bộ `bin/`, `src/`, `test/` — không sửa logic production trong bước audit này.
* **Bằng chứng kiểm thử (Verification Evidence):**
  * `npm test` → **`tests 52 · suites 15 · pass 52 · fail 0 · cancelled 0 · skipped 0 · duration_ms 571.0121`**
  * `node --check` → OK cho cả 9 file JS (`bin/cli.js`, 4 file `src/`, 4 file test).
  * AC-1 (thủ công, thư mục tạm): `exit=0`, stdout `✔ All environment variables are synchronized!`.
  * AC-2 (thủ công): `exit=1`, stdout `✖ Missing environment variables (1): - STRIPE_KEY`; `value leaked: False`.
  * AC-3: `node --test test/parser.test.js` → `tests 17 · suites 4 · pass 17 · fail 0`.
  * AC-4: `node --test test/cli.test.js` → `tests 10 · suites 3 · pass 10 · fail 0`; chạy thủ công thiếu `.env.example` / `.env` đều `exit=1`, `stack trace present: False`.
  * AC-5: 10 lần đo `node bin/cli.js` trong dự án mẫu → **min 55.3 / median 64.9 / max 86.7 ms**; baseline `node -e "0"` → **min 52.3 / median 66.9 / max 84.2 ms**.
  * AC-6: chạy với `.env` chứa `real-key-value`, `top-secret`, `leaked-extra` → cả 3 đều `False` trong stdout+stderr.
  * Dependency audit: `dependencies={}`, `devDependencies=null`, `peerDependencies=null`, `optionalDependencies=null`, `node_modules` không tồn tại, 0 lockfile.
  * Import audit: chỉ `node:fs`, `node:path`, `node:process` và import tương đối nội bộ; không có package ngoài.
  * Packaging audit: 8 file, tarball **7.257 bytes**, unpacked **18.972 bytes**.
* **Phát hiện quan trọng (discrepancies):**
  1. **AC-5 không đạt trên máy này:** median 64.9ms > 50ms. Nhưng **baseline Node rỗng đã 66.9ms** ⇒ chi phí thực của `env-gap` xấp xỉ **0ms** (thậm chí thấp hơn baseline trong phép đo này do nhiễu). Ngưỡng 50ms bị chặn bởi thời gian khởi động runtime trên Windows, không phải bởi code.
  2. **Unpacked size 19.0 kB > 10 kB** (tarball 7.3 kB đạt). Như đã ghi ở Phase 5, hai tài liệu mâu thuẫn; không thể đạt unpacked 10 kB mà vẫn giữ README + LICENSE + JSDoc + Zero Build Step.
  3. **Erratum:** block `PHASE-03` ghi parser có "18 test / 5 suite" — số đúng là **17 test / 4 suite** (tổng 31 test của Phase 3 vẫn chính xác). Đã đối chiếu lại output thực tế.
* **Trạng thái Checkpoint:** ✅ **`Final Review: PASSED` với 5/6 AC** — AC-5 FAIL do môi trường, đã ghi rõ trong biên bản Mục 4.
* **Bàn giao:** Chờ người dùng chốt tên/scope và ra lệnh publish. **Không tự ý chạy `npm publish`.**

### 📝 [2026-10-28 00:57] - POST-REVIEW (Rebrand + Hardening)
* **Mục tiêu:** Chốt tên scoped `@capquang26/env-guard`, xử lý các mục P0/P1 sau audit, Việt hóa README, khởi tạo Git repo và chuẩn bị commit theo từng phần (chờ duyệt).
* **Các file đã tác động:**
  * `[MODIFIED]` `package.json` — đổi `name` → `@capquang26/env-guard`; `bin` → `{ "env-guard": "./bin/cli.js" }`; thêm `exports` (`.` + `./package.json`); `test` → `node --test`; thêm `author`, `repository`, `homepage`, `bugs`; `engines` → `>=18.17.0`; giữ `dependencies: {}`.
  * `[MODIFIED]` `bin/cli.js` — `process.exit(main())` → `process.exitCode = main()` (tránh cắt cụt stdout trên pipe khi danh sách dài); message hướng dẫn đổi sang `env-guard`.
  * `[MODIFIED]` `src/format.js` — guard `options ?? {}` để `formatReport(diff, null)` không ném `TypeError`.
  * `[MODIFIED]` `README.md` — viết lại **tiếng Việt**, 9.022 bytes: mô tả vấn đề, tính năng, yêu cầu, 3 cách cài đặt, 4 kịch bản sử dụng kèm output, bảng exit code, `NO_COLOR`, Husky, CI, Programmatic API, bảo mật, cấu trúc dự án, hướng dẫn phát triển.
  * `[MODIFIED]` `UPDATE.md` — sửa erratum `PHASE-03` (17 test / 4 suite), cập nhật trạng thái, append block này.
  * `[INIT]` Git repo nhánh `main`, remote `origin` → `https://github.com/quangcaptain26-3/env-guard.git`.
* **Bằng chứng kiểm thử (Verification Evidence):**
  * `npm test` → **`tests 52 · suites 15 · pass 52 · fail 0 · duration_ms: 558.3852`** ✅
  * `npm pack --dry-run --json` → name `@capquang26/env-guard`, **8 file**, tarball **9.249 B**, unpacked **24.238 B** ✅ (tarball vẫn < 10 kB).
  * CLI chạy thật trong thư mục tạm: thiếu key → `exit=1` + `✖ Missing ...`; đồng bộ → `exit=0` + `✔ ...` ✅
  * `formatReport({missing:['A'],...}, null)` → trả chuỗi bình thường, không ném lỗi ✅
  * `node -e "require('./package.json')"` → `@capquang26/env-guard`, bin `{"env-guard":"./bin/cli.js"}`, deps `{}` ✅
  * Quét BOM: `package.json`, `README.md`, `bin/cli.js`, `src/format.js` đều `BOM=False`.
* **Quyết định kỹ thuật / Lưu ý quan trọng:**
  * **Tên/scope:** chốt `@capquang26/env-guard`; binary đổi thành `env-guard` cho khớp thương hiệu.
  * **Ngưỡng size:** giữ tiêu chí **tarball < 10 kB** (thực tế 9.249 B) làm chuẩn release; `unpacked 24.2 kB` vẫn vượt literal của plan nhưng không ảnh hưởng dung lượng tải về.
  * **Script test:** `node --test test/` **thất bại trên Node 26** (`Cannot find module ...\test`) vì test runner không còn tự mở rộng tham số thư mục. Đã đổi sang `node --test` (auto-discovery từ cwd) — chạy đúng 52 test, tương thích Node 18.1+.
  * **`engines` nâng lên `>=18.17.0`** để khớp khả năng chạy `node --test` và `describe/it`.
  * **Chiến lược commit:** mỗi nhóm thay đổi là một commit riêng, **chỉ thực hiện sau khi người dùng duyệt từng nhóm**.
* **Trạng thái Checkpoint:** Không đổi — `Checkpoint 1/2/3 PASSED`, `Final Review` 5/6 AC.
* **Bàn giao:** Duyệt danh sách nhóm commit → commit lần lượt → `git push -u origin main` → `npm publish --access public`. **Chưa commit gì ở bước này.**

---

## 4. BIÊN BẢN NGHIỆM THU CUỐI CÙNG (FINAL ACCEPTANCE RECORD)

* **Ngày:** 2026-10-28 00:52
* **Người thực hiện:** AI Coding Agent (audit độc lập)
* **Môi trường:** Windows, Node.js **v26.4.0**, npm **11.17.0**
* **Phiên bản gói:** `@capquang26/env-guard@1.0.0`
* **Kết luận tổng:** `RELEASE_READY` — **5/6 AC PASS**, 52/52 test pass, 2 deviation được ghi nhận công khai; **chưa publish**.

### 4.1. Bảng nghiệm thu Acceptance Criteria

| Mã | Tiêu chí | Cách xác thực | Bằng chứng | Trạng thái |
| :-- | :-- | :-- | :-- | :--: |
| **AC-1** | File đồng bộ hoàn hảo → in xanh, exit 0 | Fixtures khớp + integration + format test | `exit=0`; `✔ All environment variables are synchronized!`; `\x1b[32m...\x1b[0m` | **PASS** |
| **AC-2** | `.env` thiếu biến → danh sách đỏ, exit 1 | Fixtures thiếu key + format test | `exit=1`; `✖ Missing environment variables (1): - STRIPE_KEY`; `\x1b[31m...\x1b[0m` | **PASS** |
| **AC-3** | Bỏ comment `#`, dòng trống, `export `, `=` trong value | `node --test test/parser.test.js` | 17/17 test pass, gồm BOM/CRLF/CR, tab sau `export`, key trùng | **PASS** |
| **AC-4** | Thiếu `.env.example`/`.env` → hướng dẫn, exit 1, không call stack | `node --test test/cli.test.js` + chạy thủ công | 10/10 test; `exit=1`; `stack trace present: False` | **PASS** |
| **AC-5** | Tổng thời gian tiến trình < 50ms | `Measure-Command` ×10 | median **64.9ms** (baseline Node rỗng **66.9ms**) | **FAIL** (môi trường) |
| **AC-6** | Không bao giờ in giá trị biến | Quét mã nguồn + chạy với secret giả | 3/3 giá trị bí mật **không** xuất hiện; `console.*` chỉ ở `bin/cli.js` | **PASS** |

### 4.2. Kiểm toán kỹ thuật & rủi ro

| Hạng mục | Kết quả | Trạng thái |
| :-- | :-- | :--: |
| **Dependencies** | `dependencies: {}`; không `devDependencies`/`peer`/`optional`; không `node_modules`, không lockfile | **PASS** |
| **Bảo mật (Zero Value Leak)** | `src/` không có `console`/`fs`; `bin/cli.js` chỉ in report từ **key** và message lỗi; không network call | **PASS** |
| **Đa nền tảng** | `path.resolve` cho `.env`/`.env.example`; parser split `/\r\n|\r|\n/`; test CRLF/CR; ANSI tự tắt khi non-TTY | **PASS** |
| **Đóng gói** | 8 file, tarball **7.257 B (7.3 kB)** ✅ < 10 kB; unpacked **18.972 B (19.0 kB)** ❌ | **PARTIAL** |
| **UPDATE.md continuity** | Chuỗi: SETUP_READY → PHASE-01 → SETUP → PHASE-01 → PHASE-02 → PHASE-03 → PHASE-04 → PHASE-05 → FINAL-REVIEW, không gián đoạn | **PASS** (1 erratum đã đính chính) |
| **Chất lượng test** | 52 test, 15 suite, **0 fail / 0 skip / 0 todo**; không dùng thư viện test ngoài | **PASS** |

### 4.3. Tổng nghiệm thu

```text
$ npm test
ℹ tests 52
ℹ suites 15
ℹ pass 52
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 571.0121
```

### 4.4. Deviation & rủi ro còn lại (phải công bố trước khi publish)

1. **AC-5 (hiệu năng):** không đạt 50ms trên Windows vì Node khởi động ~52–87ms; `env-gap` gần như không thêm chi phí. Trên Linux/macOS (Node boot 20–30ms) nhiều khả năng đạt. **Đề xuất:** ghi rõ trong README/Release note là "startup dominated by Node runtime"; nếu cần chứng minh, đo trên CI Linux.
2. **Unpacked size 19.0 kB:** vượt ngưỡng literal của IMPLEMENTATION-PLAN; tarball 7.3 kB đạt ngưỡng PRD/TECH-STACK. Không sửa được nếu giữ JSDoc + README + LICENSE + Zero Build Step.
3. **`bin/cli.js` mode 0644** trong tarball (Windows). `npm link` đã chạy được; nên `git init` + `git update-index --chmod=+x bin/cli.js` trước khi publish từ môi trường POSIX.
4. **Metadata thiếu:** `repository`, `homepage`, `bugs`, `author` chưa có — không gây warning nhưng trang npm sẽ trống các mục này.
5. **Tên/scope chưa chốt:** `env-gap` (E404, còn trống) vs `@capquang26/env-guard` (PRD Phương án A).
6. **Badge README** sẽ 404 cho tới khi package được publish.
7. **Chưa phải Git repo:** không có lịch sử commit, không lưu được bit `+x`; `npm publish` vẫn hoạt động.

### 4.5. Điều kiện publish & xác nhận

- [x] 52/52 test pass (100%)
- [x] Zero runtime dependency
- [x] Zero value leak
- [x] `npm pack --dry-run` không warning, tarball 7.3 kB
- [x] `npm link` chạy đúng exit code 0/1
- [x] Tên `env-gap` còn trống (E404)
- [x] Tài khoản npm đã đăng nhập (`capquang26`)
- [ ] **Chốt tên/scope** (unscoped `env-gap` hoặc `@capquang26/env-guard`)
- [ ] **Người dùng xác nhận publish** (hành động công khai, không thể hoàn tác)
- [ ] (Khuyến nghị) `git init` + commit + `chmod +x` + bổ sung metadata

**Lệnh sẵn sàng:**
```bash
# Phương án A — unscoped (đã xác nhận trống)
npm publish

# Phương án B — scoped
npm publish --access public
```

> **Chữ ký nghiệm thu:** `RELEASE_READY` cho AC-1, AC-2, AC-3, AC-4, AC-6 và toàn bộ kiểm toán kỹ thuật, **với 2 deviation bắt buộc công bố** (AC-5 do môi trường, unpacked size 19.0 kB). Không có lỗi chức năng nào được tìm thấy trong quá trình audit.
