import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Analytics from './components/Analytics'
import Landing from './pages/Landing'
import Onboarding from './pages/Onboarding'
import Paywall from './pages/Paywall'
import Success from './pages/Success'
import Cancel from './pages/Cancel'

export default function App() {
  return (
    <BrowserRouter>
      {/* Injecte GA4 + Clarity si VITE_GA_MEASUREMENT_ID / VITE_CLARITY_PROJECT_ID sont définis */}
      <Analytics />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/paywall/:reportId" element={<Paywall />} />
        <Route path="/success" element={<Success />} />
        <Route path="/cancel" element={<Cancel />} />
      </Routes>
    </BrowserRouter>
  )
}
