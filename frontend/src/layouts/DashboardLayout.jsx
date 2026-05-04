import { Link, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'

export default function DashboardLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <div className="pt-14">
        {/* Page header */}
        <div className="border-b border-[#1a1a1a] bg-[#0a0a0a]">
          <div className="max-w-6xl mx-auto px-6 py-8">
            <h1 className="text-2xl font-bold text-white">{title}</h1>
            {subtitle && <p className="text-[#888] text-sm mt-1">{subtitle}</p>}
          </div>
        </div>
        {/* Content */}
        <div className="max-w-6xl mx-auto px-6 py-8">{children}</div>
      </div>
    </div>
  )
}
