export default function Tooltip({ text, children }) {
  return (
    <span className="relative group inline-flex items-center">
      {children ?? (
        <span className="w-4 h-4 rounded-full border border-[#444] text-[#555] text-[10px] flex items-center justify-center cursor-help hover:border-[#6c47ff] hover:text-[#6c47ff] transition-colors">
          ?
        </span>
      )}
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[#1a1a1a] border border-[#333] text-[#ccc] text-xs rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl max-w-[220px] text-center leading-relaxed">
        {text}
      </span>
    </span>
  )
}
