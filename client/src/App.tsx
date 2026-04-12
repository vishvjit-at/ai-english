import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/hooks/useAuth'
import { SettingsProvider } from '@/hooks/useSettings'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AppLayout } from '@/components/layout/AppLayout'

const LoginPage          = lazy(() => import('@/pages/LoginPage').then(m => ({ default: m.LoginPage })))
const SignupPage         = lazy(() => import('@/pages/SignupPage').then(m => ({ default: m.SignupPage })))
const HomePage           = lazy(() => import('@/pages/HomePage').then(m => ({ default: m.HomePage })))
const PracticePage       = lazy(() => import('@/pages/PracticePage').then(m => ({ default: m.PracticePage })))
const CustomPracticePage = lazy(() => import('@/pages/CustomPracticePage').then(m => ({ default: m.CustomPracticePage })))
const SettingsPage       = lazy(() => import('@/pages/SettingsPage').then(m => ({ default: m.SettingsPage })))
const HistoryPage        = lazy(() => import('@/pages/HistoryPage').then(m => ({ default: m.HistoryPage })))
const SessionDetailPage  = lazy(() => import('@/pages/SessionDetailPage').then(m => ({ default: m.SessionDetailPage })))
const ProgressPage       = lazy(() => import('@/pages/ProgressPage').then(m => ({ default: m.ProgressPage })))
const VocabularyReviewPage = lazy(() => import('@/pages/VocabularyReviewPage').then(m => ({ default: m.VocabularyReviewPage })))
const LessonsPage        = lazy(() => import('@/pages/LessonsPage').then(m => ({ default: m.LessonsPage })))
const LessonPracticePage = lazy(() => import('@/pages/LessonPracticePage').then(m => ({ default: m.LessonPracticePage })))

function PageSpinner() {
  return (
    <div className="flex h-screen items-center justify-center" style={{ background: 'var(--sem-surface)' }}>
      <div className="w-8 h-8 rounded-full border-2 border-primary-200 border-t-primary-500 animate-spin" />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <BrowserRouter>
          <Suspense fallback={<PageSpinner />}>
            <Routes>
              {/* Public routes */}
              <Route path="/login"  element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />

              {/* Home — public, no sidebar */}
              <Route path="/" element={<HomePage />} />

              {/* Protected routes with sidebar */}
              <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                <Route path="/practice/custom"        element={<CustomPracticePage />} />
                <Route path="/practice/:scenarioId"   element={<PracticePage />} />
                <Route path="/lessons"                element={<LessonsPage />} />
                <Route path="/lessons/:lessonId"      element={<LessonPracticePage />} />
                <Route path="/vocabulary"             element={<VocabularyReviewPage />} />
                <Route path="/history"                element={<HistoryPage />} />
                <Route path="/history/:id"            element={<SessionDetailPage />} />
                <Route path="/progress"               element={<ProgressPage />} />
                <Route path="/settings"               element={<SettingsPage />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </SettingsProvider>
    </AuthProvider>
  )
}

export default App
