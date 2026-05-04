# Decentralized Academic Credential System
### IT4527E — Blockchain & Applications Capstone Project

Hệ thống cấp phát, xác minh và thu hồi bằng cấp học thuật số trên blockchain.  
Kết hợp **ECC Signature** + **Merkle Selective Disclosure** + **On-chain Registry**.

---

## Yêu cầu phần mềm

| Phần mềm | Phiên bản tối thiểu | Link tải |
|----------|--------------------|----|
| Node.js | v18+ (khuyến nghị v20+) | https://nodejs.org |
| npm | đi kèm Node.js | — |
| Git | bất kỳ | https://git-scm.com |

> **Kiểm tra đã cài chưa:**
> ```
> node --version
> npm --version
> ```

---

## Cài đặt khi mang sang máy mới

### Bước 1 — Clone / copy project

Nếu dùng Git:
```bash
git clone <repo-url>
cd "Capstone project"
```

Nếu copy thư mục thủ công: mở terminal vào thư mục gốc project (chứa `package.json`).

---

### Bước 2 — Cài dependencies backend (thư mục gốc)

```bash
npm install
```

Cài tất cả: `hardhat`, `ethers`, `express`, `elliptic`, `merkletreejs`, `dotenv`, v.v.

---

### Bước 3 — Cài dependencies frontend

```bash
cd frontend
npm install
cd ..
```

Cài: `react`, `vite`, `tailwindcss`, `axios`, `framer-motion`, v.v.

---

### Bước 4 — Tạo file .env

Copy file mẫu:
```bash
cp .env.example .env
```

Hoặc tạo file `.env` tại thư mục gốc với nội dung:
```
RPC_URL=http://127.0.0.1:8545
OWNER_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
CONTRACT_ADDRESS=
PORT=3000
```

> `CONTRACT_ADDRESS` để trống — sẽ điền sau khi deploy (Bước 6).

---

## Chạy project (local Hardhat)

Cần mở **3 terminal riêng biệt**, chạy theo thứ tự:

### Terminal 1 — Khởi động Hardhat node

```bash
npx hardhat node
```

Giữ terminal này chạy liên tục.  
Hardhat tạo sẵn 20 tài khoản test có ETH, hiển thị danh sách khi khởi động.

---

### Terminal 2 — Deploy smart contract

```bash
npx hardhat run scripts/deploy.js --network localhost
```

Output sẽ in ra địa chỉ contract, ví dụ:
```
CredentialRegistry deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

**Sao chép địa chỉ đó vào `.env`:**
```
CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
```

---

### Terminal 3 — Khởi động backend server

```bash
node backend/server.js
```

Server chạy tại: `http://localhost:3000`

Kiểm tra:
```bash
curl http://localhost:3000/health
# → {"status":"ok"}
```

---

### Terminal 4 (tùy chọn) — Khởi động frontend

```bash
cd frontend
node node_modules/vite/bin/vite.js  #lần đầu

npm run dev
```

Frontend chạy tại: `http://localhost:5173`  
Mở trình duyệt và truy cập địa chỉ trên.

> **Trên Windows dùng PowerShell:**
> ```powershell
> Set-Location frontend
> & 'C:\Program Files\nodejs\node.exe' node_modules\vite\bin\vite.js
> ```

---

## Chạy test

### Test smart contract (Hardhat)

```bash
npx hardhat test
```

Test các function: registerIssuer, issueCredential, revokeCredential, verifyCredential.

---

### Test ECC + Merkle (unit test)

```bash
node test/eccMerkle.test.js
```

Test: sign/verify ECC, build tree, generate proof, verify proof, tamper detection.

---

### Test End-to-End (toàn bộ flow)

> Yêu cầu: Hardhat node + backend server đang chạy, `data.json` chưa có issuer cũ.

```bash
node test/e2e.test.js
```

Flow test:
1. POST /issuer/register
2. POST /credential/issue
3. POST /proof/generate (môn IT4527E)
4. POST /proof/verify → kỳ vọng valid: true
5. POST /credential/revoke
6. POST /proof/verify → kỳ vọng valid: false

---

## Danh sách npm scripts

Chạy từ thư mục **gốc** project:

| Lệnh | Tác dụng |
|------|----------|
| `npm start` | Start backend server |
| `npm run test:contract` | Chạy Hardhat contract tests |
| `npm run test:unit` | Chạy ECC + Merkle unit tests |
| `npm run test:e2e` | Chạy end-to-end HTTP test |
| `npm run node` | Khởi động Hardhat local node |
| `npm run deploy:local` | Deploy contract lên localhost |
| `npm run deploy:sepolia` | Deploy contract lên Sepolia testnet |

---

## Cấu trúc thư mục

```
Capstone project/
│
├── contracts/
│   └── CredentialRegistry.sol          # Smart contract chính
│
├── backend/
│   ├── server.js                        # Express server entry point
│   ├── routes/
│   │   ├── issuer.js                    # POST /issuer/register
│   │   ├── credential.js               # POST /credential/issue|revoke, GET /credential/:id
│   │   └── proof.js                    # POST /proof/generate|verify
│   ├── services/
│   │   └── eccService.js               # ECC sign/verify (secp256k1)
│   ├── merkle/
│   │   └── merkleService.js            # Merkle tree, proof generation
│   ├── blockchain/
│   │   └── blockchainService.js        # Kết nối Ethereum, gọi contract
│   └── storage/
│       ├── db.js                        # JSON file storage
│       └── data.json                   # Dữ liệu off-chain (tự tạo khi chạy)
│
├── frontend/
│   ├── src/
│   │   ├── pages/                      # Landing, IssuerDashboard, StudentDashboard, VerifierDashboard
│   │   ├── components/                 # Button, Card, Badge, Input, Navbar
│   │   ├── layouts/                    # MainLayout, DashboardLayout
│   │   └── services/api.js            # Axios wrapper gọi backend
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── scripts/
│   └── deploy.js                       # Script deploy contract
│
├── test/
│   ├── CredentialRegistry.test.js      # Hardhat contract tests
│   ├── eccMerkle.test.js              # ECC + Merkle unit tests
│   └── e2e.test.js                    # End-to-end flow test
│
├── .env                                # Cấu hình môi trường (không commit)
├── .env.example                        # Template .env
├── hardhat.config.js                   # Cấu hình Hardhat
├── package.json
├── tiendo.md                           # Tiến độ project
└── readme.md                           # File này
```

---

## API Reference

### POST /issuer/register
Đăng ký tổ chức cấp bằng.

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

---

### POST /credential/issue
Phát hành văn bằng cho sinh viên.

```json
Request:
{
  "issuerAddress": "0x70997970...",
  "eccPrivateKey": "b65d3b62...",
  "studentId": "SV-2021-001",
  "studentName": "Nguyễn Văn A",
  "courses": [
    { "courseCode": "IT4527E", "grade": "A" },
    { "courseCode": "IT3040",  "grade": "B+" }
  ]
}

Response 201:
{
  "credentialId": "0x...",
  "merkleRoot": "0x...",
  "signature": { "r": "...", "s": "..." }
}
```

---

### POST /credential/revoke
Thu hồi văn bằng.

```json
Request:  { "credentialId": "0x..." }
Response: { "message": "Credential revoked", "credentialId": "0x..." }
```

---

### GET /credential/:id
Lấy thông tin văn bằng.

```json
Response: {
  "credentialId": "0x...",
  "studentName": "...",
  "courses": [...],
  "merkleRoot": "0x...",
  "revoked": false,
  "onChainValid": true
}
```

---

### POST /proof/generate
Tạo Merkle proof cho 1 môn học (selective disclosure).

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

---

### POST /proof/verify
Xác minh proof (verifier dùng).

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
  "eccSignatureValid": true,
  "courseCode": "IT4527E",
  "grade": "A"
}
```

---

## Hardhat Test Accounts (local only)

| # | Địa chỉ | Private Key | Vai trò |
|---|---------|-------------|---------|
| 0 | 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 | 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 | Owner (deploy + registerIssuer) |
| 1 | 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 | 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d | Issuer (issue + revoke) |

> Các key này là public — **chỉ dùng cho local testing**, không có ETH thật.

---

## Lưu ý quan trọng

- **Mỗi lần restart Hardhat node**, contract bị xóa → phải deploy lại và cập nhật `CONTRACT_ADDRESS` trong `.env`
- **Mỗi lần deploy lại**, phải xóa `backend/storage/data.json` để tránh conflict dữ liệu cũ
- File `.env` không được commit lên Git (đã có trong `.gitignore`)
- ECC private key của issuer chỉ được trả về **1 lần** khi gọi `/issuer/register` — lưu lại ngay

---

## Deploy lên Sepolia (demo cuối)

1. Tạo tài khoản Alchemy hoặc Infura, lấy Sepolia RPC URL
2. Nạp ETH test qua faucet: https://sepoliafaucet.com
3. Cập nhật `.env`:
   ```
   RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
   OWNER_PRIVATE_KEY=0xYOUR_REAL_PRIVATE_KEY
   ```
4. Deploy:
   ```bash
   npx hardhat run scripts/deploy.js --network sepolia
   ```
5. Cập nhật `CONTRACT_ADDRESS` trong `.env` với địa chỉ vừa deploy
