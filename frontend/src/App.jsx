import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import IssuerDashboard from './pages/IssuerDashboard'
import StudentDashboard from './pages/StudentDashboard'
import VerifierDashboard from './pages/VerifierDashboard'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/issuer" element={<IssuerDashboard />} />
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/verifier" element={<VerifierDashboard />} />
      </Routes>
    </BrowserRouter>
  )
}
