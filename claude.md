# CLAUDE.md
# Dự án: Decentralized Academic Credential System with Selective Disclosure

---

# 0. QUY TẮC TIẾN ĐỘ — BẮT BUỘC

## File tiến độ: `tiendo.md`

### Claude PHẢI đọc tiendo.md khi:
- Bắt đầu bất kỳ conversation mới nào về project này
- Trước khi bắt đầu implement một task mới
- Khi user hỏi "tiến độ đến đâu rồi" hoặc tương tự

### Claude PHẢI cập nhật tiendo.md ngay sau khi:
- Hoàn thành implement một module hoặc endpoint
- Fix xong một bug quan trọng
- Chạy test thành công (ghi rõ kết quả)
- Deploy hoặc cấu hình môi trường thay đổi
- Bắt đầu hoặc hoàn thành một Sprint frontend

### Quy tắc cập nhật:
- Chỉ sửa đúng dòng liên quan — không viết lại toàn file
- Cập nhật ngày ở dòng "Cập nhật lần cuối"
- Thêm dòng vào bảng "LỊCH SỬ CẬP NHẬT"
- Đổi trạng thái ⚠️ → ✅ khi hoàn thành

---

# 1. TỔNG QUAN DỰ ÁN

Đây là hệ thống blockchain dùng để cấp phát, xác minh và thu hồi bằng cấp/chứng chỉ học thuật số.

Mục tiêu:
- Trường đại học (Issuer) cấp credential cho sinh viên.
- Credential phải được ký bằng ECC.
- Transcript phải được xây bằng Merkle Tree.
- Chỉ Merkle Root lưu on-chain.
- Sinh viên có thể selective disclosure: chỉ tiết lộ môn cần thiết.
- Verifier xác minh proof mà không cần xem toàn bộ transcript.

---

# 2. YÊU CẦU BẮT BUỘC THEO ĐỀ BÀI

Claude phải luôn đảm bảo đủ 3 yêu cầu cốt lõi:

### (1) ECC Signature
Credential phải được issuer ký bằng ECC.

### (2) Merkle Tree Selective Disclosure
- mỗi course là một leaf
- phải generate Merkle Proof cho từng course

### (3) On-chain Registry Smart Contract
Smart contract phải quản lý:
- authorized issuers
- revoked credentials

Nếu thiếu 1 trong 3 phần trên thì project không đạt yêu cầu đề.

---

# 3. CHIẾN LƯỢC TRIỂN KHAI

## ƯU TIÊN BACKEND TRƯỚC

Frontend chưa làm ngay.

Phải hoàn thiện backend theo thứ tự:

1. Smart Contract
2. ECC Signing Engine
3. Merkle Engine
4. Backend API
5. Blockchain Integration
6. End-to-End Test

Chỉ sau khi backend stable mới làm frontend.

---

# 4. TECH STACK

## Blockchain:
- Ethereum Sepolia testnet
- Solidity
- Hardhat

## Backend:
- Node.js
- Express.js

## Crypto:
- elliptic
- merkletreejs
- keccak256

## Blockchain interaction:
- ethers.js

## Storage:
- SQLite hoặc JSON local storage

## Local Development (ưu tiên):
- Hardhat localhost: 127.0.0.1:8545
- Hardhat test accounts (pre-funded, dùng Account #1 làm issuer)
- JSON local storage: backend/storage/data.json

## Frontend (phase sau):
- React.js
- Tailwind CSS
- shadcn/ui

---

# 5. KIẾN TRÚC DỰ ÁN

project/
├── contracts/
│   └── CredentialRegistry.sol
│
├── backend/
│   ├── server.js
│   ├── routes/
│   ├── services/
│   ├── merkle/
│   ├── blockchain/
│   └── storage/
│
├── scripts/
├── test/
├── frontend/
└── README.md

---

# 6. MODULE BẮT BUỘC PHẢI XÂY

---

## MODULE A — SMART CONTRACT

File:
contracts/CredentialRegistry.sol

Bắt buộc:
- registerIssuer()
- removeIssuer()
- issueCredential()
- revokeCredential()
- verifyCredential()
- isIssuerAuthorized()

---

## MODULE B — ECC ENGINE

File:
backend/services/eccService.js

Bắt buộc:
- generateIssuerKeyPair()
- signCredential()
- verifySignature()

---

## MODULE C — MERKLE ENGINE

File:
backend/merkle/merkleService.js

Bắt buộc:
- buildMerkleTree()
- generateRoot()
- generateProof()
- verifyProof()

---

## MODULE D — BACKEND API

Endpoints bắt buộc:

POST /issuer/register
POST /credential/issue
POST /credential/revoke
POST /proof/generate
POST /proof/verify
GET /credential/:id

---

## MODULE E — BLOCKCHAIN SERVICE

Phải xử lý:
- deploy contract
- connect wallet
- send transaction
- read contract state

---

# 7. FRONTEND PHASE — ĐÃ BẮT ĐẦU

**Status backend (hoàn thành):**
- Smart Contract: deployed local Hardhat ✓
- ECC Engine: pass unit test ✓
- Merkle Engine: pass unit test ✓
- Backend API: chạy port 3000 ✓
- /issuer/register: test pass ✓

**Frontend Tech Stack:**
- React + Vite
- TailwindCSS
- Framer Motion
- Axios (gọi backend API)

**Color System:**
- Background: #0a0a0a / #111111
- Accent: #6c47ff (tím)
- Text: #ffffff / #888888
- Border: #222222

**Backend API base URL:** http://localhost:3000

---

## FRONTEND SPRINT 1

### 1. Landing Page (trang chủ)
- Hero section, feature cards, CTA, footer

### 2. Issuer Dashboard
- Đăng ký issuer, issue credential, danh sách credential

## FRONTEND SPRINT 2

### 3. Student Dashboard
- Xem credential, generate selective proof

### 4. Verifier Dashboard
- Verify proof, kiểm tra revoked status

---

## FRONTEND ARCHITECTURE

```
frontend/
├── src/
│   ├── pages/         Landing, IssuerDashboard, StudentDashboard, VerifierDashboard
│   ├── components/    Button, Card, Badge, Navbar, Sidebar, Modal, Form
│   ├── layouts/       MainLayout, DashboardLayout
│   ├── services/      api.js (axios wrapper cho backend)
│   └── app/           App.jsx, main.jsx, router
├── public/
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

# 8. QUY TẮC THIẾT KẾ

### Rule 1:
Code module hóa rõ ràng.

### Rule 2:
Mỗi file chỉ có 1 responsibility.

### Rule 3:
Không duplicate logic.

### Rule 4:
Ưu tiên code dễ debug.

### Rule 5:
Reusable function bắt buộc.

---

# 9. QUY TẮC BẮT BUỘC

### Bắt buộc 1:
Không generate frontend trước backend.

### Bắt buộc 2:
Không đổi ABI sau khi finalize.

### Bắt buộc 3:
Không regenerate toàn project cùng lúc.

### Bắt buộc 4:
Chỉ code đúng phạm vi task hiện tại.

### Bắt buộc 5:
Mọi thay đổi contract phải update test ngay.

### Bắt buộc 6:
Backend wallet (OWNER_PRIVATE_KEY) chỉ dùng để registerIssuer (onlyOwner).
Mỗi issuer phải có Ethereum wallet riêng để issueCredential/revokeCredential.
Tách biệt ECC key (off-chain signing) với Ethereum key (on-chain tx).

---

# 10. WORKFLOW CHUẨN

---

## PHASE 1b — LOCAL DEPLOY (sau khi viết contract)

```
# Terminal 1
npx hardhat node

# Terminal 2
npx hardhat run scripts/deploy.js --network localhost
# → Cập nhật CONTRACT_ADDRESS vào .env

# Terminal 3
node backend/server.js
```

Sepolia chỉ dùng ở phase demo cuối.

---

## PHASE 1 — SMART CONTRACT MVP

Bắt đầu:
CredentialRegistry.sol

Viết:
- registerIssuer
- issueCredential
- revokeCredential
- verifyCredential

Sau đó viết unit test.

---

## PHASE 2 — ECC ENGINE

Viết:
eccService.js

Test:
- sign
- verify

---

## PHASE 3 — MERKLE ENGINE

Viết:
merkleService.js

Test:
- build root
- proof generation
- proof verify

---

## PHASE 4 — BACKEND API

Viết Express server.

Implement từng endpoint riêng.

---

## PHASE 5 — BLOCKCHAIN INTEGRATION

Connect backend ↔ smart contract.

---

## PHASE 6 — END TO END TEST

Flow bắt buộc:
1. register issuer
2. issue credential
3. generate proof
4. verify proof
5. revoke credential
6. verify revoked fail

---

## PHASE 7 — FRONTEND

Chỉ bắt đầu sau phase 1-6 hoàn tất.

---

# 11. CLAUDE CODE GENERATION RULE

Claude phải:
- generate incremental từng module
- không build full app một lần
- luôn hoàn thành module hiện tại trước

---

# 12. TOKEN OPTIMIZATION RULE

Claude chỉ sửa file liên quan trực tiếp.

Không lặp lại code cũ nếu không cần.

---

# 13. FIRST TASK

Task đầu tiên luôn là:

Tạo CredentialRegistry.sol MVP đúng đề bài.

Chỉ generate:
- registerIssuer
- issueCredential
- revokeCredential
- verifyCredential

Không generate frontend.

---

# 14. ƯU TIÊN ĐÁNH GIÁ

Backend logic đúng > frontend đẹp.

Trọng tâm grading:
ECC + Merkle Tree + Smart Contract.

---