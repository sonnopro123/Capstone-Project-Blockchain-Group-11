export default function StepGuide({ title, steps }) {
  return (
    <div className="bg-[#111] border border-[#222] rounded-2xl p-4 mb-6">
      <p className="text-xs text-[#888] mb-3 uppercase tracking-wider">
        {title || 'Hướng dẫn nhanh'}
      </p>
      <div className="flex flex-wrap gap-3">
        {steps.map((step, i) => (
          <div key={i} className="flex items-start gap-2 flex-1 min-w-[180px]">
            <span className="w-6 h-6 rounded-full bg-[#6c47ff] text-white text-xs flex items-center justify-center shrink-0 mt-0.5">
              {i + 1}
            </span>
            <div>
              <p className="text-sm text-white font-medium">{step.title}</p>
              {step.desc && <p className="text-xs text-[#888] mt-0.5">{step.desc}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
