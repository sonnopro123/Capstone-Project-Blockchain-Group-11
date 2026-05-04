export default function Badge({ children, variant = 'default' }) {
  const variants = {
    default: 'bg-[#1a1a1a] text-[#888] border-[#333]',
    purple: 'bg-[#6c47ff]/10 text-[#a78bfa] border-[#6c47ff]/20',
    green: 'bg-green-500/10 text-green-400 border-green-500/20',
    red: 'bg-red-500/10 text-red-400 border-red-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[variant]}`}>
      {children}
    </span>
  )
}
