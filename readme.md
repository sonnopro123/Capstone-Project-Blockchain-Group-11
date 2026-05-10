# CredProof
### Decentralized Academic Credential Verification
### IT4527E — Blockchain & Applications Capstone Project

Hệ thống cấp phát, xác minh và thu hồi bằng cấp học thuật số trên blockchain.  
Kết hợp **ECC Signature** + **Merkle Selective Disclosure** + **On-chain Registry**.

---

## Mục tiêu dự án

| Yêu cầu | Mô tả |
|---------|-------|
| ECC Signature | Mỗi credential được issuer ký bằng Elliptic Curve Cryptography (secp256k1). Không thể làm giả, không thể chỉnh sửa sau khi phát hành. |
| Merkle Selective Disclosure | Mỗi môn học là một leaf trong Merkle Tree. Sinh viên chỉ tiết lộ môn học cần thiết khi xin việc — không lộ toàn bộ bảng điểm. |
| On-chain Issuer Registry | Danh sách tổ chức cấp bằng được ủy quyền lưu trên Ethereum smart contract. |
| Revocation List | Credential bị thu hồi được ghi on-chain. Verifier kiểm tra trạng thái tức thì. |

---

## Business Logic Rules

- Một student chỉ được có **một ACTIVE credential** từ cùng issuer tại một thời điểm.
- Nếu credential cũ đã **revoked**, issuer được phép cấp lại credential mới cho cùng student.
- Duplicate check chỉ chặn credential **active** — không chặn credential đã revoked.
- Credential revoked **giữ lại** trong storage để audit/history, không bị xóa cứng.
- `credentialId = keccak256(studentId:issuerAddress:issuedAt)` — unique mỗi lần phát hành.

---

## UX Rules

- Sau khi đăng ký issuer thành công → tự động fill issuer info sang tab Phát hành.
- Sau khi phát hành credential → hiển thị đầy đủ: Credential ID, Merkle Root, Signature (r, s), danh sách môn học.
- Credential ID có nút **copy** để dùng lại.
- Tab Thu hồi tự động load Credential ID mới nhất từ localStorage.
- Sau khi revoke → credential cũ on-chain là `invalid/revoked`.
- Hiển thị banner gợi ý "Có thể cấp lại" sau khi revoke thành công.

---

## Security Rules

- Không expose private key ra log hoặc console.
- Không commit file `.env` hoặc bất kỳ file chứa secret.
- ECC private key của issuer chỉ được trả về **1 lần** khi gọi `/issuer/register` — lưu lại ngay.
- `claude.md` / `CLAUDE.md` và local notes không được commit lên GitHub.
- Hardhat test accounts chỉ dùng cho local testing — không dùng cho production.

---

## Demo Flow (9 bước)

1. **Register Issuer** — tổ chức đăng ký với Ethereum wallet (Account #1 khi test local)
2. **Issue Credential** — phát hành credential cho student với bảng điểm
3. **Show Credential ID** — hiển thị credentialId, merkleRoot, signature
4. **Student Generate Proof** — sinh viên tạo Merkle proof cho môn học cần tiết lộ
5. **Verifier Verify Valid** — verifier xác minh proof → `valid: true`
6. **Revoke Credential** — thu hồi credential trên blockchain
7. **Verify Old Credential Invalid** — verify lại credential cũ → `valid: false`
8. **Re-issue Same Student** — cấp lại credential mới cho cùng student → **phải thành công**
9. **Verify New Credential Valid** — verify credential mới → `valid: true`

---

## Yêu cầu phần mềm

| Phần mềm | Phiên bản tối thiểu |
|----------|-------------------|
| Node.js | v18+ (khuyến nghị v20+) |
| npm | đi kèm Node.js |
| Git | bất kỳ |

---

## Cài đặt khi mang sang máy mới

### Bước 1 — Clone project

```bash
git clone https://github.com/sonnopro123/Capstone-Project-Blockchain-Group-11.git
cd Capstone-Project-Blockchain-Group-11
```

### Bước 2 — Cài dependencies backend

```bash
npm install
```

### Bước 3 — Cài dependencies frontend

```bash
cd frontend
npm install
cd ..
```

### Bước 4 — Tạo file .env

```bash
cp .env.example .env
```

Hoặc tạo `.env` tại thư mục gốc:

```env
RPC_URL=http://127.0.0.1:8545
OWNER_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
CONTRACT_ADDRESS=
PORT=3000
```

> `CONTRACT_ADDRESS` để trống — điền sau khi deploy (Bước 6).

---

## Chạy project (local Hardhat)

Cần mở **3 terminal**, chạy theo thứ tự:

### Terminal 1 — Khởi động Hardhat node

```bash
npx hardhat node
```

### Terminal 2 — Deploy smart contract

```bash
npx hardhat run scripts/deploy.js --network localhost
```

Sao chép địa chỉ contract vào `.env`:
```
CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
```

### Terminal 3 — Khởi động backend server

```bash
node backend/server.js
```

Server: `http://localhost:3000`

### Terminal 4 (tùy chọn) — Khởi động frontend

```bash
cd frontend
npm run dev
```

Frontend: `http://localhost:5173`

---

## Chạy test

```bash
# Smart contract
npx hardhat test

# ECC + Merkle unit test
node test/eccMerkle.test.js

# End-to-end (yêu cầu Hardhat node + backend đang chạy)
node test/e2e.test.js
```

---

## Cấu trúc thư mục

```
Capstone-Project-Blockchain-Group-11/
│
├── contracts/
│   └── CredentialRegistry.sol          # Smart contract chính
│
├── backend/
│   ├── server.js
│   ├── routes/
│   │   ├── issuer.js                   # POST /issuer/register
│   │   ├── credential.js               # POST /credential/issue|revoke, GET /credential/:id
│   │   └── proof.js                    # POST /proof/generate|verify
│   ├── services/
│   │   └── eccService.js               # ECC sign/verify (secp256k1)
│   ├── merkle/
│   │   └── merkleService.js            # Merkle tree, proof generation
│   ├── blockchain/
│   │   └── blockchainService.js        # Kết nối Ethereum, gọi contract
│   └── storage/
│       ├── db.js                       # JSON file storage
│       └── data.json                   # Dữ liệu off-chain (không commit)
│
├── frontend/
│   ├── src/
│   │   ├── pages/                      # Landing, IssuerDashboard, StudentDashboard, VerifierDashboard
│   │   ├── components/                 # Button, Card, Badge, Input, Navbar, Toast, Tooltip, WorkflowStepper
│   │   ├── layouts/                    # MainLayout, DashboardLayout
│   │   ├── context/                    # IssuerContext (state sharing giữa tabs)
│   │   ├── config/branding.js          # APP_NAME, APP_TAGLINE, APP_ABBR
│   │   └── services/api.js             # Axios wrapper gọi backend
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── scripts/
│   └── deploy.js
│
├── test/
│   ├── CredentialRegistry.test.js
│   ├── eccMerkle.test.js
│   └── e2e.test.js
│
├── .env.example
├── hardhat.config.js
├── tiendo.md                           # Tiến độ dự án
└── readme.md                           # File này
```

---

## API Reference

### POST /issuer/register

```json
Request:
{
  "name": "Đại học Bách khoa Hà Nội",
  "ethAddress": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
  "ethPrivateKey": "0x59c6995e..."
}

Response 201:
{
  "message": "Issuer registered successfully",
  "issuer": {
    "ethAddress": "0x...",
    "name": "...",
    "eccPublicKey": "04...",
    "eccPrivateKey": "..."    ← lưu lại, chỉ trả về 1 lần
  }
}
```

### POST /credential/issue

```json
Request:
{
  "issuerAddress": "0x70997970...",
  "eccPrivateKey": "b65d3b62...",
  "studentId": "20235619",
  "studentName": "Nguyễn Văn A",
  "courses": [
    { "courseCode": "IT4527E", "courseName": "Blockchain và ứng dụng", "grade": "A" }
  ]
}

Response 201:
{
  "credentialId": "0x...",
  "merkleRoot": "0x...",
  "signature": { "r": "...", "s": "..." },
  "payload": { "issuerAddress": "...", "studentId": "...", "courses": [...], "issuedAt": "..." }
}
```

> Trả về `409` nếu student đã có **active** credential từ issuer này.  
> Cho phép issue lại nếu credential cũ đã **revoked**.

### POST /credential/revoke

```json
Request:  { "credentialId": "0x..." }
Response: { "message": "Credential revoked", "credentialId": "0x..." }
```

### GET /credential/:id

```json
Response:
{
  "credentialId": "0x...",
  "studentName": "...",
  "courses": [...],
  "merkleRoot": "0x...",
  "revoked": false,
  "onChainValid": true
}
```

### POST /proof/generate

```json
Request:  { "credentialId": "0x...", "courseCode": "IT4527E" }
Response: {
  "proof": ["0x...", "0x..."],
  "leaf": "0x...",
  "root": "0x...",
  "courseCode": "IT4527E",
  "grade": "A"
}
```

### POST /proof/verify

```json
Request:
{
  "credentialId": "0x...",
  "proof": ["0x...", "0x..."],
  "leaf": "0x...",
  "courseCode": "IT4527E",
  "grade": "A"
}

Response:
{
  "valid": true,
  "merkleProofValid": true,
  "eccSignatureValid": true
}
```

---

## Hardhat Test Accounts (local only)

| # | Địa chỉ | Vai trò |
|---|---------|---------|
| 0 | 0xf39Fd6...92266 | Owner (deploy + registerIssuer) |
| 1 | 0x70997970...9C8 | Issuer mặc định khi test |

> Các key này là **public Hardhat defaults** — chỉ dùng cho local testing, không có ETH thật.

---

## Lưu ý quan trọng

- Mỗi lần **restart Hardhat node**, contract bị xóa → phải deploy lại và cập nhật `CONTRACT_ADDRESS`
- Mỗi lần **deploy lại**, nên xóa `backend/storage/data.json` để tránh conflict dữ liệu cũ
- File `.env` không được commit lên Git
- ECC private key của issuer chỉ trả về **1 lần** khi đăng ký — lưu lại ngay

---

## Deploy lên Sepolia (demo cuối)

```bash
# Cập nhật .env với Sepolia RPC và private key thật
RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
OWNER_PRIVATE_KEY=0xYOUR_REAL_PRIVATE_KEY

# Deploy
npx hardhat run scripts/deploy.js --network sepolia
```

Faucet ETH test: https://sepoliafaucet.com
