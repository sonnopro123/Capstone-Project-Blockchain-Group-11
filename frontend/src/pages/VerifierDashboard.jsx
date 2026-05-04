import { useState } from 'react'
import DashboardLayout from '../layouts/DashboardLayout'
import Card from '../components/Card'
import Button from '../components/Button'
import Badge from '../components/Badge'
import StepGuide from '../components/StepGuide'
import { verifyProof } from '../services/api'

function friendlyError(e) {
  const msg = e.response?.data?.error || e.message || 'Lỗi không xác định'
  if (msg.includes('not found') || msg.includes('Not found')) return 'Không tìm thấy credential. Kiểm tra lại ID.'
  if (msg.includes('ETIMEDOUT') || msg.includes('Network Error')) return 'Không kết nối được server. Kiểm tra backend đang chạy chưa (node backend/server.js).'
  return msg
}

export default function VerifierDashboard() {
  const [raw, setRaw] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setRaw(text)
    } catch {
      setError('Không đọc được clipboard. Hãy dán thủ công bằng Ctrl+V.')
    }
  }

  const handle = async () => {
    setError(''); setResult(null)
    let parsed
    try {
      parsed = JSON.parse(raw)
    } catch {
      setError('JSON không hợp lệ — paste đúng định dạng từ sinh viên')
      return
    }
    if (!parsed.credentialId || !parsed.proof || !parsed.leaf) {
      setError('Thiếu trường credentialId, proof hoặc leaf')
      return
    }
    setLoading(true)
    try {
      const res = await verifyProof(parsed)
      setResult(res.data)
    } catch (e) {
      setError(friendlyError(e))
    } finally { setLoading(false) }
  }

  // Preview JSON hợp lệ
  const jsonPreview = (() => {
    try {
      if (!raw.trim()) return null
      const parsed = JSON.parse(raw)
      return parsed
    } catch { return null }
  })()

  const isValid = result?.valid === true

  return (
    <DashboardLayout title="Xác minh văn bằng" subtitle="Paste proof JSON do sinh viên cung cấp để xác minh">
      <div className="max-w-2xl space-y-5">
        <StepGuide
          steps={[
            { title: 'Nhận JSON proof từ sinh viên', desc: 'Sinh viên export từ trang Student' },
            { title: 'Dán vào ô bên dưới', desc: 'Hoặc dùng nút Dán từ clipboard' },
            { title: 'Nhấn Xác minh', desc: 'Hệ thống kiểm tra on-chain + Merkle + ECC' },
          ]}
        />

        <Card>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-semibold text-white">Dán Proof JSON</h2>
            <button
              onClick={pasteFromClipboard}
              className="text-xs text-[#6c47ff] hover:underline transition-colors"
            >
              📋 Dán từ clipboard
            </button>
          </div>
          <p className="text-xs text-[#666] mb-4">
            Sinh viên cung cấp JSON này từ trang "Tạo Proof". Verifier không cần xem toàn bộ bảng điểm.
          </p>
          <textarea
            className="w-full bg-[#0a0a0a] border border-[#222] hover:border-[#333] focus:border-[#6c47ff] rounded-xl p-4 text-xs font-mono text-[#888] h-48 resize-none outline-none transition-colors"
            placeholder={'{\n  "credentialId": "0x...",\n  "proof": ["0x...", ...],\n  "leaf": "0x...",\n  "courseCode": "IT4527E",\n  "grade": "A"\n}'}
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
          />

          {/* JSON preview khi hợp lệ */}
          {jsonPreview && (
            <div className="mt-3 bg-[#111] border border-[#222] rounded-xl p-3 text-xs text-[#888] space-y-1">
              <p className="text-green-400">✅ JSON hợp lệ</p>
              {jsonPreview.credentialId && (
                <p>Credential: <span className="text-white font-mono">{jsonPreview.credentialId.slice(0, 14)}...</span></p>
              )}
              {jsonPreview.courseCode && (
                <p>Môn học: <span className="text-white">{jsonPreview.courseCode}</span></p>
              )}
              {jsonPreview.grade && (
                <p>Điểm: <span className="text-[#6c47ff] font-bold">{jsonPreview.grade}</span></p>
              )}
              {jsonPreview.proof && (
                <p>Proof nodes: <span className="text-white">{jsonPreview.proof.length}</span></p>
              )}
            </div>
          )}

          {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
          <Button onClick={handle} disabled={loading} className="w-full mt-4">
            {loading ? 'Đang xác minh...' : 'Xác minh ngay'}
          </Button>
        </Card>

        {result && (
          <Card glow={isValid}>
            {/* Verdict */}
            <div className={`rounded-xl p-5 mb-5 border ${isValid ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
              <div className="text-3xl mb-2">{isValid ? '✅' : '❌'}</div>
              <div className={`text-lg font-bold ${isValid ? 'text-green-400' : 'text-red-400'}`}>
                {isValid ? 'Văn bằng hợp lệ' : 'Văn bằng không hợp lệ'}
              </div>
              {result.reason && <p className="text-xs text-[#666] mt-1">{result.reason}</p>}
              {result.courseCode && (
                <p className="text-sm text-[#888] mt-2">
                  Môn <span className="text-white font-mono">{result.courseCode}</span>{' '}
                  — Điểm <span className="text-white font-semibold">{result.grade}</span>
                </p>
              )}
            </div>

            {/* Check breakdown */}
            <div className="space-y-3">
              <p className="text-xs text-[#444] font-medium uppercase tracking-widest">Chi tiết kiểm tra</p>
              <CheckRow
                label="Merkle Proof hợp lệ"
                desc="Môn học tồn tại trong bảng điểm gốc"
                ok={result.merkleProofValid}
              />
              <CheckRow
                label="Chữ ký ECC hợp lệ"
                desc="Văn bằng được ký bởi tổ chức đã ủy quyền"
                ok={result.eccSignatureValid}
              />
              <CheckRow
                label="Chưa bị thu hồi on-chain"
                desc="Trạng thái trên Ethereum blockchain"
                ok={!result.revoked && result.valid !== false}
              />
            </div>
          </Card>
        )}

        {/* Info callout */}
        <div className="border border-[#1d1d1d] bg-[#0d0d0d] rounded-xl p-5">
          <p className="text-xs text-[#555] font-medium uppercase tracking-widest mb-3">Cách hoạt động</p>
          <ul className="space-y-2 text-xs text-[#555]">
            <li>→ Merkle Proof xác minh môn học nằm trong bảng điểm mà không lộ các môn khác</li>
            <li>→ ECC Signature xác minh tổ chức đã ký văn bằng này</li>
            <li>→ On-chain check đảm bảo văn bằng chưa bị thu hồi</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  )
}

function CheckRow({ label, desc, ok }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-[#1a1a1a] last:border-0">
      <span className={`text-sm mt-0.5 ${ok ? 'text-green-400' : 'text-red-400'}`}>{ok ? '✓' : '✗'}</span>
      <div>
        <p className="text-sm text-white">{label}</p>
        <p className="text-xs text-[#555]">{desc}</p>
      </div>
      <Badge variant={ok ? 'green' : 'red'} className="ml-auto">{ok ? 'Pass' : 'Fail'}</Badge>
    </div>
  )
}
