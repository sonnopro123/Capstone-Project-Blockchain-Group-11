export default function Input({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-[#888]">{label}</label>
      )}
      <input
        className={`w-full bg-[#0a0a0a] border border-[#222] hover:border-[#333] focus:border-[#6c47ff] rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#444] outline-none transition-colors ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  )
}
