export default function Card({ children, className = '', glow = false }) {
  return (
    <div
      className={`bg-[#141414] border border-[#222] rounded-2xl p-6 ${glow ? 'shadow-[0_0_40px_rgba(108,71,255,0.08)]' : ''} ${className}`}
    >
      {children}
    </div>
  )
}
