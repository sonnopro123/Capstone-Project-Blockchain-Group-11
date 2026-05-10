export default function WorkflowStepper({ steps, activeStep, completedSteps = [] }) {
  return (
    <div className="flex items-start mb-8">
      {steps.map((label, i) => {
        const isDone   = completedSteps.includes(i)
        const isActive = i === activeStep

        return (
          <div key={i} className="flex items-start flex-1">
            {/* circle + label */}
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all duration-300 ${
                isDone   ? 'bg-green-600 text-white' :
                isActive ? 'bg-[#6c47ff] text-white ring-4 ring-[#6c47ff]/20' :
                           'bg-[#1a1a1a] text-[#555] border border-[#2a2a2a]'
              }`}>
                {isDone ? '✓' : i + 1}
              </div>
              <span className={`text-xs mt-2 text-center font-medium leading-tight max-w-[80px] transition-colors duration-300 ${
                isDone ? 'text-green-400' : isActive ? 'text-white' : 'text-[#444]'
              }`}>
                {label}
              </span>
            </div>

            {/* connector line */}
            {i < steps.length - 1 && (
              <div className={`h-px flex-1 mx-2 mt-4 transition-all duration-500 ${
                isDone ? 'bg-green-600' : 'bg-[#222]'
              }`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
