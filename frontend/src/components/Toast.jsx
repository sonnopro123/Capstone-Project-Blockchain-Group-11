import { createContext, useContext, useState, useCallback } from 'react'

const ToastCtx = createContext(null)

const COLORS = {
  success: 'bg-[#0d2418] border-[#1a5c33] text-green-300',
  error:   'bg-[#2d0f0f] border-[#5c1a1a] text-red-300',
  info:    'bg-[#0f1a2d] border-[#1a335c] text-blue-300',
}

const ICONS = {
  success: '✓',
  error:   '✕',
  info:    'i',
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const push = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random()
    setToasts(p => [...p, { id, message, type }])
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000)
  }, [])

  const toast = {
    success: (msg) => push(msg, 'success'),
    error:   (msg) => push(msg, 'error'),
    info:    (msg) => push(msg, 'info'),
  }

  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`flex items-center gap-3 border rounded-xl px-4 py-3 text-sm max-w-sm shadow-2xl ${COLORS[t.type]}`}
          >
            <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-xs shrink-0 font-bold">
              {ICONS[t.type]}
            </span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}

export const useToast = () => useContext(ToastCtx)
