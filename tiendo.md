# Tiến độ dự án — Decentralized Academic Credential System

Cập nhật lần cuối: 2026-04-12

---

## TỔNG QUAN NHANH

| Hạng mục | Trạng thái | Ghi chú |
|----------|-----------|---------|
| Smart Contract | ✅ Hoàn thành | Deployed local Hardhat |
| ECC Engine | ✅ Hoàn thành | Unit test pass |
| Merkle Engine | ✅ Hoàn thành | Unit test pass |
| Backend API | ✅ Hoàn thành | Chạy port 3000 |
| Blockchain Service | ✅ Hoàn thành | Kết nối Hardhat local |
| End-to-End Test | ⚠️ Chưa chạy | Script sẵn sàng: test/e2e.test.js |
| Frontend | ✅ Hoàn thành Sprint 1 | Chạy port 5173 |

---

## CHI TIẾT TỪNG MODULE

### MODULE A — Smart Contract
**File:** `contracts/CredentialRegistry.sol`
**Trạng thái:** ✅ Deployed local

Đã implement:
- `registerIssuer()` — onlyOwner
- `removeIssuer()` — onlyOwner
- `issueCredential()` — onlyAuthorizedIssuer, lưu merkleRoot on-chain
- `revokeCredential()` — onlyAuthorizedIssuer (issuer gốc)
- `verifyCredential()` — kiểm tra valid + not revoked + issuer authorized
- `isIssuerAuthorized()`, `getMerkleRoot()`, `isRevoked()`
- Events: IssuerRegistered, IssuerRemoved, CredentialIssued, CredentialRevoked

Test: `test/CredentialRegistry.test.js` — 10+ case, all pass

---

### MODULE B — ECC Engine
**File:** `backend/services/eccService.js`
**Trạng thái:** ✅ Hoàn thành

Đã implement:
- `generateIssuerKeyPair()` — secp256k1
- `signCredential(payload, privateKey)` — keccak256 hash + ECDSA sign
- `verifySignature(payload, signature, publicKey)` — verify + tamper detection

Test: `test/eccMerkle.test.js` — all pass

---

### MODULE C — Merkle Engine
**File:** `backend/merkle/merkleService.js`
**Trạng thái:** ✅ Hoàn thành

Đã implement:
- `buildMerkleTree(courses)` — sortPairs=true, keccak256 leaf hash
- `generateRoot(courses)` — trả về hex root
- `generateProof(courses, targetCourse)` — selective disclosure proof
- `verifyProof(proof, leaf, root)` — xác minh proof

Test: `test/eccMerkle.test.js` — all pass

---

### MODULE D — Backend API
**File:** `backend/server.js` + `backend/routes/`
**Trạng thái:** ✅ Chạy port 3000

Endpoints đã hoạt động:

| Endpoint | Trạng thái | Test |
|----------|-----------|------|
| POST /issuer/register | ✅ | Đã test thực tế — PASS |
| POST /credential/issue | ✅ | Chưa test thực tế |
| POST /credential/revoke | ✅ | Chưa test thực tế |
| POST /proof/generate | ✅ | Chưa test thực tế |
| POST /proof/verify | ✅ | Chưa test thực tế |
| GET /credential/:id | ✅ | Chưa test thực tế |
| GET /health | ✅ | PASS |

---

### MODULE E — Blockchain Service
**File:** `backend/blockchain/blockchainService.js`
**Trạng thái:** ✅ Hoàn thành

- ABI load từ artifact (đã fix)
- Owner wallet dùng cho `registerIssuer` (onlyOwner)
- Issuer wallet riêng dùng cho `issueCredential` / `revokeCredential`
- `_contractAs(privateKey)` — dynamic signer per issuer

---

### STORAGE
**File:** `backend/storage/db.js` + `backend/storage/data.json`
**Trạng thái:** ✅ Hoạt động

Lưu: issuer (ECC keys + Ethereum keys), credential (issuedAt, courses, signature, merkleRoot)

---

### FRONTEND
**Thư mục:** `frontend/`
**Trạng thái:** ✅ Sprint 1 hoàn thành — Chạy port 5173

| Trang | Trạng thái |
|-------|-----------|
| Landing Page | ✅ Hoàn thành |
| Issuer Dashboard (3 tab) | ✅ Hoàn thành |
| Student Dashboard (2 tab) | ✅ Hoàn thành |
| Verifier Dashboard | ✅ Hoàn thành |

Stack: React 18 + Vite 5 + TailwindCSS + Axios

---

## MÔI TRƯỜNG HIỆN TẠI

| Thành phần | Giá trị |
|-----------|---------|
| Mạng | Hardhat localhost 127.0.0.1:8545 |
| Contract address | 0x5FbDB2315678afecb367f032d93F642f64180aa3 |
| Owner wallet (Account #0) | 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 |
| Issuer wallet (Account #1) | 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 |
| Backend port | 3000 |
| Frontend port | 5173 |

---

## VIỆC CÒN LẠI

### Ưu tiên cao
- [ ] Chạy `node test/e2e.test.js` để verify toàn bộ flow
- [ ] Test thực tế POST /credential/issue
- [ ] Test thực tế POST /proof/generate + POST /proof/verify

### Ưu tiên trung bình
- [ ] Test giao diện frontend kết nối backend thực tế
- [ ] Kiểm tra proxy Vite → backend hoạt động đúng

### Ưu tiên thấp (demo cuối)
- [ ] Deploy contract lên Sepolia testnet
- [ ] Cập nhật .env với Sepolia RPC + contract address

---

## LỊCH SỬ CẬP NHẬT

| Ngày | Hành động |
|------|-----------|
| 2026-04-12 | Khởi tạo project, tạo toàn bộ backend modules |
| 2026-04-12 | Fix ABI import, fix issuedAt mismatch, fix issuer wallet |
| 2026-04-12 | Backend server start thành công, /issuer/register test PASS |
| 2026-04-12 | Tạo toàn bộ frontend Sprint 1 (4 trang), Vite chạy port 5173 |
| 2026-04-12 | Tạo readme.md (hướng dẫn cài đặt, chạy, API reference) + tiendo.md (file này) |
