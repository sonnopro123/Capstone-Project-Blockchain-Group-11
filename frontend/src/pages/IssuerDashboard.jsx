import { useState, useEffect } from 'react'
import DashboardLayout from '../layouts/DashboardLayout'
import Card from '../components/Card'
import Button from '../components/Button'
import Input from '../components/Input'
import Badge from '../components/Badge'
import CopyField from '../components/CopyField'
import StepGuide from '../components/StepGuide'
import CourseInput from '../components/CourseInput'
import { registerIssuer, issueCredential, revokeCredential } from '../services/api'

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

// ─── Tab: Đăng ký tổ chức ─────────────────────────────────────────────────
function RegisterTab() {
  const [form, setForm] = useState({ name: '', ethAddress: '', ethPrivateKey: '' })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fillHardhat = () => {
    setForm({
      ...form,
      ethAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      ethPrivateKey: '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
    })
  }

  const handle = async () => {
    setError('')
    setResult(null)
    if (!form.name || !form.ethAddress || !form.ethPrivateKey) {
      setError('Vui lòng điền đầy đủ thông tin')
      return
    }
    setLoading(true)
    try {
      const res = await registerIssuer(form)
      setResult(res.data)
      localStorage.setItem(
        'issuer',
        JSON.stringify({
          ethAddress: res.data.issuer.ethAddress,
          eccPrivateKey: res.data.issuer.eccPrivateKey,
          name: res.data.issuer.name,
        })
      )
    } catch (e) {
      setError(friendlyError(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl space-y-6">
      <StepGuide
        steps={[
          { title: 'Đăng ký tổ chức', desc: 'Nhập tên + địa chỉ Ethereum Hardhat' },
          { title: 'Lưu ECC Private Key', desc: 'Key này dùng để cấp credential' },
          { title: 'Sang tab Issue', desc: 'Cấp bằng cho sinh viên' },
        ]}
      />

      <Card>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-white">Thông tin tổ chức</h2>
          <Button variant="secondary" size="sm" onClick={fillHardhat}>
            ⚡ Dùng Account Hardhat #1 (test)
          </Button>
        </div>
        <div className="space-y-4">
          <Input
            label="Tên trường / tổ chức"
            placeholder="VD: Đại học Bách khoa Hà Nội"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            label="Địa chỉ Ethereum (Issuer wallet)"
            placeholder="0x70997970..."
            value={form.ethAddress}
            onChange={(e) => setForm({ ...form, ethAddress: e.target.value })}
          />
          <Input
            label="Private key Ethereum (Issuer wallet)"
            placeholder="0x59c6995e..."
            type="password"
            value={form.ethPrivateKey}
            onChange={(e) => setForm({ ...form, ethPrivateKey: e.target.value })}
          />
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <Button onClick={handle} disabled={loading} className="w-full">
            {loading ? 'Đang xử lý...' : 'Đăng ký tổ chức'}
          </Button>
        </div>
      </Card>

      {result && (
        <Card glow>
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="green">Thành công</Badge>
            <span className="text-sm text-white font-medium">Tổ chức đã được đăng ký</span>
          </div>
          <div className="space-y-3">
            <Row label="Tên" value={result.issuer.name} />
            <CopyField label="Ethereum Address" value={result.issuer.ethAddress} />
            <CopyField label="ECC Public Key" value={result.issuer.eccPublicKey} />
            <div className="border border-[#6c47ff]/20 bg-[#6c47ff]/5 rounded-xl p-3">
              <p className="text-[#6c47ff] font-medium mb-1 text-sm">⚠️ Lưu ECC Private Key ngay</p>
              <p className="text-[#888] mb-2 text-xs">Chỉ hiển thị một lần. Dùng để phát hành văn bằng.</p>
              <CopyField label="ECC Private Key (lưu lại!)" value={result.issuer.eccPrivateKey} truncate={false} />
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

// ─── Tab: Phát hành văn bằng ──────────────────────────────────────────────
function IssueTab() {
  const [form, setForm] = useState({
    issuerAddress: '',
    eccPrivateKey: '',
    studentId: '',
    studentName: '',
  })
  const [courses, setCourses] = useState([{ courseCode: '', courseName: '', grade: '' }])
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('issuer')
    if (saved) {
      try {
        const { ethAddress, eccPrivateKey } = JSON.parse(saved)
        setForm((f) => ({ ...f, issuerAddress: ethAddress, eccPrivateKey }))
      } catch {}
    }
  }, [])

  const addCourse = () => setCourses([...courses, { courseCode: '', courseName: '', grade: '' }])
  const removeCourse = (i) => setCourses(courses.filter((_, idx) => idx !== i))
  const updateCourse = (i, field, val) => {
    const next = [...courses]
    next[i][field] = val
    setCourses(next)
  }
  const selectCourse = (i, course) => {
    const next = [...courses]
    next[i] = { courseCode: course.courseCode, courseName: course.courseName, grade: course.grade }
    setCourses(next)
  }

  const handle = async () => {
    setError('')
    setResult(null)
    const filled = courses.filter((c) => c.courseCode && c.grade)
    if (!form.issuerAddress || !form.eccPrivateKey || !form.studentId || filled.length === 0) {
      setError('Vui lòng điền đầy đủ thông tin và ít nhất 1 môn học')
      return
    }
    setLoading(true)
    try {
      const res = await issueCredential({ ...form, courses: filled })
      setResult(res.data)
    } catch (e) {
      setError(friendlyError(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <h2 className="text-base font-semibold text-white mb-1">Thông tin phát hành</h2>
        {form.issuerAddress && (
          <p className="text-xs text-[#6c47ff] mb-4">✓ Đã tải thông tin issuer từ lần đăng ký trước</p>
        )}
        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Địa chỉ tổ chức (Issuer)"
              placeholder="0x70997970..."
              value={form.issuerAddress}
              onChange={(e) => setForm({ ...form, issuerAddress: e.target.value })}
            />
            <Input
              label="ECC Private Key của tổ chức"
              placeholder="b65d3b62..."
              type="password"
              value={form.eccPrivateKey}
              onChange={(e) => setForm({ ...form, eccPrivateKey: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Mã sinh viên"
              placeholder="SV-2021-001"
              value={form.studentId}
              onChange={(e) => setForm({ ...form, studentId: e.target.value })}
            />
            <Input
              label="Họ tên sinh viên"
              placeholder="Nguyễn Văn A"
              value={form.studentName}
              onChange={(e) => setForm({ ...form, studentName: e.target.value })}
            />
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-white">Bảng điểm</h2>
            <p className="text-xs text-[#555] mt-0.5">Gõ mã môn hoặc tên môn để tìm nhanh</p>
          </div>
          <Button variant="ghost" size="sm" onClick={addCourse}>
            + Thêm môn
          </Button>
        </div>
        <div className="space-y-3">
          {courses.map((c, i) => (
            <div key={i} className="flex items-center gap-3">
              <CourseInput
                value={c.courseCode}
                onChange={(e) => updateCourse(i, 'courseCode', e.target.value)}
                onSelect={(course) => selectCourse(i, course)}
              />
              <Input
                placeholder="Tên môn"
                value={c.courseName}
                onChange={(e) => updateCourse(i, 'courseName', e.target.value)}
                className="flex-1"
              />
              <Input
                placeholder="Điểm"
                value={c.grade}
                onChange={(e) => updateCourse(i, 'grade', e.target.value)}
                className="w-24"
              />
              {courses.length > 1 && (
                <button
                  onClick={() => removeCourse(i)}
                  className="text-[#444] hover:text-red-400 transition-colors text-lg leading-none"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
        {error && <p className="text-red-400 text-xs mt-3">{error}</p>}
        <Button onClick={handle} disabled={loading} className="w-full mt-5">
          {loading ? 'Đang phát hành...' : 'Phát hành văn bằng'}
        </Button>
      </Card>

      {result && (
        <Card glow>
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="green">Đã phát hành</Badge>
            <span className="text-sm text-white font-medium">Văn bằng lên blockchain thành công</span>
          </div>
          <div className="space-y-3">
            <CopyField label="Credential ID (gửi cho sinh viên)" value={result.credentialId} truncate={false} />
            <CopyField label="Merkle Root" value={result.merkleRoot} />
            <CopyField label="Chữ ký ECC (r)" value={result.signature?.r} />
            <CopyField label="Chữ ký ECC (s)" value={result.signature?.s} />
          </div>
        </Card>
      )}
    </div>
  )
}

// ─── Tab: Thu hồi văn bằng ────────────────────────────────────────────────
function RevokeTab() {
  const [credentialId, setCredentialId] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handle = async () => {
    setError('')
    setResult(null)
    if (!credentialId) { setError('Nhập Credential ID'); return }
    setLoading(true)
    try {
      const res = await revokeCredential(credentialId)
      setResult(res.data)
    } catch (e) {
      setError(friendlyError(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl space-y-4">
      <Card>
        <h2 className="text-base font-semibold text-white mb-5">Thu hồi văn bằng</h2>
        <Input
          label="Credential ID"
          placeholder="0x..."
          value={credentialId}
          onChange={(e) => setCredentialId(e.target.value)}
        />
        {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
        <Button variant="danger" onClick={handle} disabled={loading} className="w-full mt-4">
          {loading ? 'Đang xử lý...' : 'Thu hồi văn bằng'}
        </Button>
      </Card>
      {result && (
        <Card>
          <Badge variant="red">Đã thu hồi</Badge>
          <p className="text-sm text-[#888] mt-2">{result.message}</p>
          <p className="text-xs text-[#444] mt-1 font-mono break-all">{result.credentialId}</p>
        </Card>
      )}
    </div>
  )
}

// ─── Shared row component ──────────────────────────────────────────────────
function Row({ label, value, mono }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[#555] text-xs">{label}</span>
      <span className={`text-[#aaa] break-all ${mono ? 'font-mono text-xs' : ''}`}>{value}</span>
    </div>
  )
}

// ─── Main dashboard ────────────────────────────────────────────────────────
const TABS = [
  { id: 'register', label: 'Đăng ký tổ chức' },
  { id: 'issue', label: 'Phát hành văn bằng' },
  { id: 'revoke', label: 'Thu hồi văn bằng' },
]

export default function IssuerDashboard() {
  const [tab, setTab] = useState('register')

  return (
    <DashboardLayout
      title="Tổ chức cấp bằng"
      subtitle="Quản lý phát hành và thu hồi văn bằng học thuật số"
    >
      <div className="flex items-center gap-1 border border-[#1d1d1d] bg-[#0d0d0d] rounded-full p-1 w-fit mb-8">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
              tab === t.id
                ? 'bg-[#1d1d1d] text-white'
                : 'text-[#555] hover:text-[#888]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'register' && <RegisterTab />}
      {tab === 'issue' && <IssueTab />}
      {tab === 'revoke' && <RevokeTab />}
    </DashboardLayout>
  )
}
