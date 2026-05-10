import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { IssuerProvider } from './context/IssuerContext'
import { ToastProvider } from './components/Toast'
import Landing from './pages/Landing'
import IssuerDashboard from './pages/IssuerDashboard'
import StudentDashboard from './pages/StudentDashboard'
import VerifierDashboard from './pages/VerifierDashboard'

export default function App() {
  return (
    <IssuerProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/issuer" element={<IssuerDashboard />} />
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/verifier" element={<VerifierDashboard />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </IssuerProvider>
  )
}
