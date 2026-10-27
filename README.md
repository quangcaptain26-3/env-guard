# env-guard

> Phát hiện biến môi trường còn thiếu **trước khi** ứng dụng của bạn crash.

[![npm version](https://img.shields.io/npm/v/@capquang26%2Fenv-guard.svg)](https://www.npmjs.com/package/@capquang26/env-guard)
[![npm downloads](https://img.shields.io/npm/dm/@capquang26%2Fenv-guard.svg)](https://www.npmjs.com/package/@capquang26/env-guard)
[![license](https://img.shields.io/npm/l/@capquang26%2Fenv-guard.svg)](./LICENSE)
[![node](https://img.shields.io/node/v/@capquang26%2Fenv-guard.svg)](https://nodejs.org)
[![dependencies](https://img.shields.io/badge/dependencies-0-brightgreen.svg)](./package.json)

`env-guard` so sánh **tên biến** trong `.env` với danh sách được khai báo trong
`.env.example`. Nếu thiếu bất kỳ biến nào, công cụ in ra chính xác tên biến còn
thiếu và thoát với mã `1`, giúp Git hook hoặc CI dừng lại trước khi lỗi xảy ra
lúc chạy ứng dụng.

- **Không phụ thuộc thư viện ngoài** — chỉ dùng module lõi Node.js (`node:fs`, `node:path`, `node:process`)
- **Không cần cấu hình** — tự đọc `.env` và `.env.example` tại thư mục hiện tại
- **Không bao giờ in giá trị bí mật** — chỉ đọc, so sánh và hiển thị tên biến
- **Khởi động nhanh** — phù hợp gắn vào pre-commit hook
- **Đa nền tảng** — Windows, macOS, Linux; Node.js 18.17 trở lên

---

## Vấn đề mà công cụ này giải quyết

Một đồng nghiệp thêm `STRIPE_SECRET` vào `.env.example` và merge lên nhánh
chung. Bạn pull code về, chạy ứng dụng và nó crash ngay lúc khởi động vì file
`.env` trên máy bạn chưa có biến đó. Thông báo lỗi thường xuất hiện ở một nơi
rất xa nguyên nhân thật, khiến bạn mất 15–30 phút để debug.

`env-guard` biến loại lỗi này thành một lệnh kiểm tra duy nhất: chạy tay, chạy
trong pre-commit hook, hoặc chạy trên CI.

---

## Tính năng

| Tính năng | Hành vi |
| :-- | :-- |
| Thiếu biến | In danh sách màu đỏ, thoát với mã `1` |
| Thừa biến (có trong `.env` nhưng không có trong `.env.example`) | Cảnh báo màu vàng, thoát với mã `0` |
| Không tìm thấy `.env.example` | Hướng dẫn tạo file, thoát với mã `1` |
| Không tìm thấy `.env` | Hướng dẫn copy từ `.env.example`, thoát với mã `1` |
| Comment `#`, tiền tố `export `, dấu `=` trong giá trị, CRLF, BOM | Phân tích chính xác |
| Key trùng lặp | Gộp lại, giữ lần xuất hiện đầu tiên |
| Màu sắc | ANSI tự động, tắt khi có `NO_COLOR` hoặc khi output không phải terminal |
| Giá trị biến | Không bao giờ được đọc vào báo cáo, không log, không lưu |

---

## Yêu cầu hệ thống

- **Node.js >= 18.17.0** (LTS 20, 22, 24+ đều hoạt động)
- Không cần bước build, không cần TypeScript, không cần cài thêm gì

---

## Cài đặt

### 1. Dùng trực tiếp, không cài (khuyến nghị để dùng thử)

```bash
npx @capquang26/env-guard
```

### 2. Cài như devDependency trong dự án

```bash
npm install --save-dev @capquang26/env-guard
```

Sau đó thêm script vào `package.json`:

```json
{
  "scripts": {
    "check:env": "env-guard"
  }
}
```

Và chạy:

```bash
npm run check:env
```

### 3. Cài toàn cục (dùng cho mọi dự án trên máy)

```bash
npm install --global @capquang26/env-guard
env-guard
```

---

## Cách sử dụng

Đứng tại **thư mục gốc của dự án** (nơi chứa `.env` và `.env.example`), chạy:

```bash
npx @capquang26/env-guard
```

### Trường hợp 1 — Mọi thứ đồng bộ

`.env` có đầy đủ mọi biến mà `.env.example` yêu cầu:

```text
✔ All environment variables are synchronized!
```

Mã thoát `0`.

### Trường hợp 2 — `.env` thiếu biến

```text
✖ Missing environment variables (1):
  - STRIPE_SECRET
```

Mã thoát `1` — commit, build hoặc CI job dừng tại đây. Chỉ **tên biến** được
in ra, giá trị của `STRIPE_SECRET` không bao giờ xuất hiện trên terminal.

### Trường hợp 3 — `.env` có biến thừa

Biến tồn tại trong `.env` nhưng chưa được ghi nhận trong `.env.example`:

```text
✔ All required environment variables are present.
! Extra environment variables (1):
  - LEGACY_TOKEN
```

Đây chỉ là **cảnh báo**, mã thoát vẫn là `0`.

### Trường hợp 4 — Thiếu file cấu hình

```text
! Cannot find .env.example in /duong/dan/du-an
  Create .env.example with the variables your project requires, then run env-guard again.
```

Mã thoát `1`, không có stack trace rối mắt.

### Bảng mã thoát

| Mã | Ý nghĩa |
| :-- | :-- |
| `0` | Mọi biến trong `.env.example` đều có trong `.env` (biến thừa chỉ cảnh báo) |
| `1` | Thiếu ít nhất một biến, hoặc không đọc được `.env` / `.env.example` |

### Tắt màu

Màu ANSI tự động tắt khi:

- Biến môi trường `NO_COLOR` được đặt (khác chuỗi rỗng), hoặc
- Output không phải terminal (ví dụ khi pipe sang file hoặc CI)

```bash
NO_COLOR=1 npx @capquang26/env-guard
```

---

## Tích hợp Git pre-commit hook (Husky)

```bash
npm install --save-dev husky
npx husky init
echo "npx @capquang26/env-guard" > .husky/pre-commit
```

Từ đó mỗi lần `git commit`, nếu `.env` thiếu biến thì commit bị chặn ngay lập
tức.

---

## Tích hợp CI (GitHub Actions)

```yaml
# .github/workflows/env-check.yml
name: env-check
on: [push, pull_request]

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npx @capquang26/env-guard
        env:
          # Tạo .env từ secret store trước bước này
          NO_COLOR: '1'
```

Trên CI, hãy tạo file `.env` từ secret store (GitHub Secrets, Vault…) trước khi
chạy kiểm tra.

---

## Programmatic API

Có thể nhúng logic kiểm tra vào code JavaScript/TypeScript mà không cần spawn
tiến trình con.

### Cách nhanh nhất

```js
import { readFileSync } from 'node:fs';
import { checkEnvParity } from '@capquang26/env-guard';

const { missing, extra, isSynced, report } = checkEnvParity(
  readFileSync('.env.example', 'utf8'),
  readFileSync('.env', 'utf8'),
);

console.log(report);
if (!isSynced) process.exitCode = 1;
```

`checkEnvParity` trả về:

| Trường | Kiểu | Ý nghĩa |
| :-- | :-- | :-- |
| `missing` | `string[]` | Biến có trong `.env.example` nhưng thiếu trong `.env` |
| `extra` | `string[]` | Biến có trong `.env` nhưng không có trong `.env.example` |
| `isSynced` | `boolean` | `true` khi không thiếu biến nào |
| `report` | `string` | Chuỗi báo cáo đã định dạng, sẵn sàng để in |

### Dùng các hàm cấp thấp

```js
import { parseEnvKeys, diffEnvKeys, formatReport } from '@capquang26/env-guard';

const exampleKeys = parseEnvKeys(exampleText);
const envKeys = parseEnvKeys(envText);
const result = diffEnvKeys(exampleKeys, envKeys);

console.log(formatReport(result, { noColor: true }));
```

Tất cả hàm trong `src/` đều **thuần túy** (pure): nhận chuỗi/mảng và trả về dữ
liệu. Việc đọc file và in ấn do code của bạn quyết định.

---

## Bảo mật

- **Chỉ đọc tên biến.** Giá trị của biến môi trường không bao giờ được đưa vào
  báo cáo, log hay bộ nhớ toàn cục.
- **Chỉ đọc file.** Công cụ không bao giờ ghi hay sửa `.env` của bạn.
- **Không gọi mạng.** Không telemetry, không gửi dữ liệu ra ngoài.
- **Zero dependency.** Không có rủi ro chuỗi cung ứng từ bên thứ ba.

---

## Cấu trúc dự án

```text
env-guard/
├── bin/
│   └── cli.js          # Entry point CLI (chứa Shebang)
├── src/
│   ├── index.js        # Programmatic API
│   ├── parser.js       # Trích xuất key từ nội dung dotenv (pure)
│   ├── diff.js         # So sánh 2 tập key (pure)
│   └── format.js       # Định dạng báo cáo + ANSI (pure)
├── test/
│   ├── fixtures/       # File .env mẫu cho test
│   ├── parser.test.js
│   ├── diff.test.js
│   ├── format.test.js
│   └── cli.test.js
├── package.json
├── LICENSE
└── README.md
```

---

## Phát triển & kiểm thử

```bash
git clone https://github.com/quangcaptain26-3/env-guard.git
cd env-guard
npm test
```

Bộ test dùng `node:test` và `node:assert/strict` có sẵn trong Node.js — không
cần cài Jest, Mocha hay Vitest. Chạy `npm test` sẽ thực thi toàn bộ unit test và
integration test (bao gồm việc spawn CLI thật để kiểm tra mã thoát).

---

## Giấy phép

[MIT](./LICENSE)
