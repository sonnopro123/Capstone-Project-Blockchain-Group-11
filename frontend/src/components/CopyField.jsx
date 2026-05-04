import { useState } from 'react'

export default function CopyField({ value, label, mono = true, truncate = true }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(value || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const display =
    truncate && value?.length > 20
      ? value.slice(0, 10) + '...' + value.slice(-8)
      : value

  return (
    <div className="flex flex-col gap-1">
      {label && <span className="text-xs text-[#888]">{label}</span>}
      <div className="flex items-center gap-2 bg-[#0a0a0a] border border-[#222] rounded-xl px-3 py-2">
        <span className={`flex-1 text-sm text-white break-all ${mono ? 'font-mono' : ''}`}>
          {display}
        </span>
        <button
          onClick={handleCopy}
          className="text-[#888] hover:text-white transition-colors text-sm shrink-0"
          title="Copy"
        >
          {copied ? '✅' : '📋'}
        </button>
      </div>
    </div>
  )
}
