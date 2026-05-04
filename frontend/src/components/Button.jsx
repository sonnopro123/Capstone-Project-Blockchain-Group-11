export default function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  const base = 'inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary: 'bg-[#6c47ff] hover:bg-[#7c5aff] text-white rounded-full',
    secondary: 'bg-transparent border border-[#333] hover:border-[#555] text-white rounded-full',
    ghost: 'bg-transparent hover:bg-[#1a1a1a] text-[#888] hover:text-white rounded-lg',
    danger: 'bg-red-600 hover:bg-red-500 text-white rounded-full',
  }

  const sizes = {
    sm: 'px-4 py-1.5 text-sm',
    md: 'px-6 py-2.5 text-sm',
    lg: 'px-8 py-3.5 text-base',
  }

  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  )
}
