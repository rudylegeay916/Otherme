import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Analytics from './components/Analytics'
import { AuthProvider } from './contexts/AuthContext'
import { LanguageProvider } from './contexts/LanguageContext'
import ProtectedRoute from './components/ProtectedRoute'
import PublicOnlyRoute from './components/PublicOnlyRoute'
import Landing from './pages/Landing'
import Onboarding from './pages/Onboarding'
import Paywall from './pages/Paywall'
import Success from './pages/Success'
import Cancel from './pages/Cancel'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import Dashboard from './pages/Dashboard'
import Account from './pages/Account'
import SocialProof from './pages/SocialProof'
import Results from './pages/Results'
import AdminLogin from './pages/AdminLogin'
import LandingV2 from './pages/LandingV2'

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
      <AuthProvider>
        <Analytics />
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/landing-v2" element={<LandingV2 />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/social-proof/:reportId" element={<SocialProof />} />
          <Route path="/paywall/:reportId" element={<Paywall />} />
          <Route path="/results/:reportId" element={<Results />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/success" element={<Success />} />
          <Route path="/cancel" element={<Cancel />} />

          {/* Auth — redirige vers /dashboard si déjà connecté */}
          <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
          <Route path="/signup" element={<PublicOnlyRoute><Signup /></PublicOnlyRoute>} />
          <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>} />

          {/* Protégés — redirige vers /login si non connecté */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  )
}
