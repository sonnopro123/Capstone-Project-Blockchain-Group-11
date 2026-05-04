import Navbar from '../components/Navbar'

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <main className="pt-14">{children}</main>
    </div>
  )
}
