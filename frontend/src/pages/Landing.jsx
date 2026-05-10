import { Link } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import { APP_NAME, APP_TAGLINE, APP_ABBR } from '../config/branding'

const features = [
  {
    icon: '🔐',
    title: 'Chữ ký số ECC',
    desc: 'Mọi văn bằng được ký bằng Elliptic Curve Cryptography. Không thể làm giả, không thể chỉnh sửa sau khi phát hành.',
  },
  {
    icon: '🌿',
    title: 'Merkle Selective Disclosure',
    desc: 'Sinh viên chỉ tiết lộ đúng môn học cần thiết khi xin việc — không lộ toàn bộ bảng điểm.',
  },
  {
    icon: '⛓️',
    title: 'Registry On-Chain',
    desc: 'Danh sách tổ chức cấp bằng được ủy quyền và danh sách thu hồi lưu trên Ethereum. Minh bạch tuyệt đối.',
  },
  {
    icon: '✅',
    title: 'Xác minh tức thời',
    desc: 'Nhà tuyển dụng xác minh chứng chỉ trong vài giây mà không cần liên hệ trường đại học.',
  },
]

const steps = [
  { num: '01', role: 'Trường đại học', action: 'Đăng ký làm tổ chức cấp bằng được ủy quyền trên blockchain.' },
  { num: '02', role: 'Phát hành', action: 'Ký văn bằng bằng ECC và lưu Merkle Root của bảng điểm lên on-chain.' },
  { num: '03', role: 'Sinh viên', action: 'Nhận chứng chỉ số, tạo proof chọn lọc cho từng môn khi cần.' },
  { num: '04', role: 'Nhà tuyển dụng', action: 'Xác minh proof trực tiếp — không cần trung gian, không cần gọi điện.' },
]

export default function Landing() {
  return (
    <MainLayout>
      {/* ─── HERO ────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[400px] rounded-full bg-[#6c47ff]/8 blur-[120px]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-6 pt-24 pb-20 text-center">
          {/* Tag */}
          <div className="inline-flex items-center gap-2 border border-[#222] bg-[#111] rounded-full px-4 py-1.5 text-xs text-[#888] mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6c47ff] animate-pulse" />
            Blockchain · ECC · Merkle Tree
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-[1.1] tracking-tight mb-3">
            <span className="bg-gradient-to-r from-[#6c47ff] to-[#3b82f6] bg-clip-text text-transparent">
              {APP_NAME}
            </span>
          </h1>

          {/* Tagline */}
          <p className="text-base md:text-lg font-medium text-[#6c7fff] tracking-wide mb-6">
            {APP_TAGLINE}
          </p>

          {/* Subtitle */}
          <p className="text-lg text-[#888] max-w-2xl mx-auto mb-10 leading-relaxed">
            Hệ thống cấp phát và xác minh bằng cấp học thuật trên blockchain.
            Sinh viên kiểm soát dữ liệu của mình — chỉ chia sẻ những gì cần thiết.
          </p>

          {/* CTA */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              to="/issuer"
              className="bg-[#6c47ff] hover:bg-[#7c5aff] text-white font-medium px-8 py-3.5 rounded-full transition-colors text-sm"
            >
              Phát hành văn bằng →
            </Link>
            <Link
              to="/verifier"
              className="border border-[#333] hover:border-[#555] text-white font-medium px-8 py-3.5 rounded-full transition-colors text-sm"
            >
              Xác minh chứng chỉ
            </Link>
          </div>
        </div>
      </section>

      {/* ─── STATS BAR ───────────────────────────────────────────── */}
      <section className="border-y border-[#1a1a1a] bg-[#0d0d0d]">
        <div className="max-w-4xl mx-auto px-6 py-6 grid grid-cols-3 gap-8 text-center">
          {[
            { val: 'ECC', sub: 'secp256k1 signature' },
            { val: 'Merkle', sub: 'Selective disclosure' },
            { val: 'On-chain', sub: 'Registry & Revocation' },
          ].map((s) => (
            <div key={s.val}>
              <div className="text-xl font-bold text-white">{s.val}</div>
              <div className="text-xs text-[#555] mt-0.5">{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FEATURES ────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <p className="text-xs text-[#6c47ff] font-medium uppercase tracking-widest mb-3">Tính năng cốt lõi</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Bảo mật ở mọi lớp
          </h2>
          <p className="text-[#888] mt-3 max-w-xl mx-auto text-sm">
            Kết hợp mật mã học hiện đại với công nghệ blockchain để tạo ra hệ thống văn bằng đáng tin cậy nhất.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-[#111] border border-[#1d1d1d] rounded-2xl p-6 hover:border-[#2a2a2a] transition-colors group"
            >
              <div className="text-2xl mb-4">{f.icon}</div>
              <h3 className="text-white font-semibold mb-2">{f.title}</h3>
              <p className="text-[#666] text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── HOW IT WORKS ────────────────────────────────────────── */}
      <section className="bg-[#0d0d0d] border-y border-[#1a1a1a]">
        <div className="max-w-4xl mx-auto px-6 py-24">
          <div className="text-center mb-14">
            <p className="text-xs text-[#6c47ff] font-medium uppercase tracking-widest mb-3">Quy trình</p>
            <h2 className="text-3xl font-bold text-white">Hoạt động như thế nào?</h2>
          </div>

          <div className="space-y-4">
            {steps.map((s, i) => (
              <div
                key={s.num}
                className="flex items-start gap-5 bg-[#111] border border-[#1d1d1d] rounded-xl p-5"
              >
                <span className="text-xs font-bold text-[#6c47ff] bg-[#6c47ff]/10 border border-[#6c47ff]/20 rounded-lg px-2.5 py-1 mt-0.5 shrink-0">
                  {s.num}
                </span>
                <div>
                  <div className="text-sm font-semibold text-white mb-0.5">{s.role}</div>
                  <div className="text-sm text-[#666]">{s.action}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA BOTTOM ──────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 py-24 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Bắt đầu ngay hôm nay
        </h2>
        <p className="text-[#888] mb-8 text-sm">
          Đăng ký tổ chức, phát hành văn bằng đầu tiên và trải nghiệm quy trình xác minh phi tập trung.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link
            to="/issuer"
            className="bg-[#6c47ff] hover:bg-[#7c5aff] text-white font-medium px-8 py-3.5 rounded-full transition-colors text-sm"
          >
            Đăng ký tổ chức →
          </Link>
          <Link
            to="/student"
            className="border border-[#333] hover:border-[#555] text-white font-medium px-8 py-3.5 rounded-full transition-colors text-sm"
          >
            Xem demo sinh viên
          </Link>
        </div>
      </section>

      {/* ─── FOOTER ──────────────────────────────────────────────── */}
      <footer className="border-t border-[#1a1a1a] bg-[#0a0a0a]">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#6c47ff] flex items-center justify-center text-white text-xs font-bold">{APP_ABBR}</div>
            <span className="text-sm text-[#555]">{APP_NAME} — IT4527E Capstone Project</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-[#444]">
            <span>Blockchain · ECC · Merkle Tree</span>
            <span>Ethereum Sepolia</span>
          </div>
        </div>
      </footer>
    </MainLayout>
  )
}
