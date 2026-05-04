import { useState } from 'react'
import DashboardLayout from '../layouts/DashboardLayout'
import Card from '../components/Card'
import Button from '../components/Button'
import Input from '../components/Input'
import Badge from '../components/Badge'
import CopyField from '../components/CopyField'
import StepGuide from '../components/StepGuide'
import { getCredential, generateProof } from '../services/api'

function friendlyError(e) {
  const msg = e.response?.data?.error || e.message || 'Lỗi không xác định'
  if (msg.includes('already registered')) return 'Tổ chức này đã được đăng ký rồi.'
  if (msg.includes('Issuer not found')) return 'Issuer chưa đăng ký. Vào tab Đăng ký trước.'
  if (msg.includes('not found') || msg.includes('Not found')) return 'Không tìm thấy. Kiểm tra lại ID.'
  if (msg.includes('Already revoked')) return 'Credential này đã bị thu hồi trước đó rồi.'
  if (msg.includes('ETIMEDOUT') || msg.includes('Network Error')) return 'Không kết nối được server. Kiểm tra backend đang chạy chưa (node backend/server.js).'
  if (msg.includes('not in credential')) return 'Mã môn học không tồn tại trong credential này.'
  return msg
}

export default function StudentDashboard() {
  const [tab, setTab] = useState('view')

  // Shared state giữa 2 tab
  const [credId, setCredId] = useState('')
  const [cred, setCred] = useState(null)

  // Proof tab state
  const [proofCredId, setProofCredId] = useState('')
  const [proofCourses, setProofCourses] = useState([])
  const [courseCode, setCourseCode] = useState('')
  const [proof, setProof] = useState(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // History từ localStorage
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('credentialHistory') || '[]') } catch { return [] }
  })

  const saveHistory = (id) => {
    const next = [id, ...history.filter((h) => h !== id)].slice(0, 5)
    setHistory(next)
    localStorage.setItem('credentialHistory', JSON.stringify(next))
  }

  const fetchCred = async () => {
    setError(''); setCred(null); setProof(null)
    if (!credId) { setError('Nhập Credential ID'); return }
    setLoading(true)
    try {
      const res = await getCredential(credId)
      setCred(res.data)
      saveHistory(credId)
    } catch (e) {
      setError(friendlyError(e))
    } finally { setLoading(false) }
  }

  // Load courses khi nhập credentialId ở tab proof
  const fetchProofCourses = async (id) => {
    if (!id) { setProofCourses([]); return }
    try {
      const res = await getCredential(id)
      setProofCourses(res.data.courses || [])
    } catch {
      setProofCourses([])
    }
  }

  const genProof = async () => {
    setError(''); setProof(null)
    if (!proofCredId || !courseCode) { setError('Nhập đầy đủ thông tin'); return }
    setLoading(true)
    try {
      const res = await generateProof(proofCredId, courseCode)
      setProof(res.data)
    } catch (e) {
      setError(friendlyError(e))
    } finally { setLoading(false) }
  }

  const copyProofJson = () => {
    if (!proof) return
    const json = JSON.stringify(
      { credentialId: proofCredId, proof: proof.proof, leaf: proof.leaf, courseCode: proof.courseCode, grade: proof.grade },
      null,
      2
    )
    navigator.clipboard.writeText(json)
  }

  const TABS = [{ id: 'view', label: 'Xem văn bằng' }, { id: 'proof', label: 'Tạo Proof' }]

  return (
    <DashboardLayout title="Sinh viên" subtitle="Xem văn bằng và tạo proof chọn lọc để chia sẻ">
      <div className="flex items-center gap-1 border border-[#1d1d1d] bg-[#0d0d0d] rounded-full p-1 w-fit mb-8">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
              tab === t.id ? 'bg-[#1d1d1d] text-white' : 'text-[#555] hover:text-[#888]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'view' && (
        <div className="max-w-xl space-y-4">
          <StepGuide
            steps={[
              { title: 'Nhập Credential ID', desc: 'Lấy từ tổ chức cấp bằng' },
              { title: 'Xem thông tin', desc: 'Kiểm tra hiệu lực và danh sách môn' },
              { title: 'Sang tab Proof', desc: 'Tạo proof để chia sẻ với nhà tuyển dụng' },
            ]}
          />

          <Card>
            <h2 className="text-base font-semibold text-white mb-4">Tra cứu văn bằng</h2>
            <div className="flex gap-3">
              <Input
                placeholder="Nhập Credential ID (0x...)"
                value={credId}
                onChange={(e) => setCredId(e.target.value)}
                className="flex-1"
              />
              <Button onClick={fetchCred} disabled={loading}>Tìm</Button>
            </div>

            {history.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className="text-xs text-[#888]">Đã tra cứu:</span>
                {history.map((id) => (
                  <button
                    key={id}
                    onClick={() => setCredId(id)}
                    className="text-xs text-[#6c47ff] hover:underline font-mono"
                  >
                    {id.slice(0, 10)}...
                  </button>
                ))}
              </div>
            )}

            {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
          </Card>

          {cred && (
            <Card glow>
              <div className="flex items-center gap-2 mb-5">
                <Badge variant={cred.onChainValid ? 'green' : 'red'}>
                  {cred.onChainValid ? '✓ Hợp lệ on-chain' : '✗ Không hợp lệ'}
                </Badge>
                {cred.revoked && <Badge variant="red">Đã thu hồi</Badge>}
              </div>
              <div className="space-y-3 text-sm">
                <InfoRow label="Sinh viên" value={cred.studentName} />
                <InfoRow label="Mã SV" value={cred.studentId} />
                <CopyField label="Tổ chức cấp" value={cred.issuerAddress} />
                <CopyField label="Merkle Root" value={cred.merkleRoot} />
                <InfoRow label="Thời gian cấp" value={new Date(cred.issuedAt).toLocaleString('vi-VN')} />
              </div>

              <div className="mt-5 border-t border-[#1d1d1d] pt-5">
                <p className="text-xs text-[#555] mb-3 font-medium uppercase tracking-widest">Bảng điểm</p>
                <div className="space-y-2">
                  {cred.courses?.map((c) => (
                    <div key={c.courseCode} className="flex justify-between items-center py-1.5 border-b border-[#1a1a1a] last:border-0">
                      <div>
                        <span className="text-sm text-white font-mono">{c.courseCode}</span>
                        {c.courseName && <span className="text-xs text-[#888] ml-2">{c.courseName}</span>}
                      </div>
                      <Badge variant="purple">{c.grade}</Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-[#1d1d1d]">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setProofCredId(credId)
                    fetchProofCourses(credId)
                    setTab('proof')
                  }}
                >
                  → Tạo Proof từ văn bằng này
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}

      {tab === 'proof' && (
        <div className="max-w-xl space-y-4">
          <StepGuide
            steps={[
              { title: 'Nhập Credential ID', desc: 'Hoặc chuyển từ tab Xem văn bằng' },
              { title: 'Chọn môn cần chứng minh', desc: 'Chỉ môn này được tiết lộ' },
              { title: 'Copy JSON Proof', desc: 'Gửi cho Verifier (nhà tuyển dụng)' },
            ]}
          />

          <Card>
            <h2 className="text-base font-semibold text-white mb-2">Tạo Proof chọn lọc</h2>
            <p className="text-xs text-[#666] mb-5">Chỉ tiết lộ đúng 1 môn học — Verifier không thấy các môn còn lại.</p>
            <div className="space-y-4">
              <div>
                <Input
                  label="Credential ID"
                  placeholder="0x..."
                  value={proofCredId}
                  onChange={(e) => {
                    setProofCredId(e.target.value)
                    fetchProofCourses(e.target.value)
                  }}
                />
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs text-[#888]">Môn cần chứng minh</span>
                {proofCourses.length > 0 ? (
                  <select
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-[#222] rounded-xl px-4 py-2.5 text-white text-sm focus:border-[#6c47ff] outline-none transition-colors"
                  >
                    <option value="">-- Chọn môn học --</option>
                    {proofCourses.map((c) => (
                      <option key={c.courseCode} value={c.courseCode}>
                        {c.courseCode}{c.courseName ? ` — ${c.courseName}` : ''} ({c.grade})
                      </option>
                    ))}
                  </select>
                ) : (
                  <Input
                    placeholder="VD: IT4527E"
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                  />
                )}
              </div>

              {error && <p className="text-red-400 text-xs">{error}</p>}
              <Button onClick={genProof} disabled={loading} className="w-full">
                {loading ? 'Đang tạo...' : 'Tạo Merkle Proof'}
              </Button>
            </div>
          </Card>

          {proof && (
            <Card glow>
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="purple">Proof đã tạo</Badge>
                <span className="text-sm text-white">{proof.courseCode} — {proof.grade}</span>
              </div>
              <div className="space-y-3">
                <CopyField label="Leaf Hash" value={proof.leaf} />
                <CopyField label="Merkle Root" value={proof.root} />
                <div>
                  <span className="text-[#555] text-xs block mb-1">Proof Path ({proof.proof?.length} nodes)</span>
                  <div className="bg-[#0a0a0a] rounded-lg p-3 space-y-1 max-h-40 overflow-y-auto">
                    {proof.proof?.map((p, i) => (
                      <p key={i} className="font-mono text-[#666] text-xs break-all">{p}</p>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-4 border-t border-[#1d1d1d] pt-4 space-y-3">
                <p className="text-xs text-[#666]">Copy JSON này để gửi cho Verifier:</p>
                <textarea
                  readOnly
                  value={JSON.stringify({ credentialId: proofCredId, proof: proof.proof, leaf: proof.leaf, courseCode: proof.courseCode, grade: proof.grade }, null, 2)}
                  className="w-full bg-[#0a0a0a] border border-[#222] rounded-lg p-3 text-xs font-mono text-[#666] h-32 resize-none outline-none"
                />
                <Button onClick={copyProofJson} variant="primary" className="w-full">
                  📋 Copy JSON Proof
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}
    </DashboardLayout>
  )
}

function InfoRow({ label, value, mono }) {
  return (
    <div>
      <span className="text-[#555] text-xs block mb-0.5">{label}</span>
      <span className={`text-[#bbb] break-all ${mono ? 'font-mono text-xs' : 'text-sm'}`}>{value}</span>
    </div>
  )
}
