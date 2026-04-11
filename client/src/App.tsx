import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/hooks/useAuth'
import { SettingsProvider } from '@/hooks/useSettings'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AppLayout } from '@/components/layout/AppLayout'
import { LoginPage } from '@/pages/LoginPage'
import { SignupPage } from '@/pages/SignupPage'
import { HomePage } from '@/pages/HomePage'
import { PracticePage } from '@/pages/PracticePage'
import { CustomPracticePage } from '@/pages/CustomPracticePage'
import { SettingsPage } from '@/pages/SettingsPage'
import { HistoryPage } from '@/pages/HistoryPage'
import { SessionDetailPage } from '@/pages/SessionDetailPage'
import { ProgressPage } from '@/pages/ProgressPage'
import { VocabularyReviewPage } from '@/pages/VocabularyReviewPage'
import { LessonsPage } from '@/pages/LessonsPage'
import { LessonPracticePage } from '@/pages/LessonPracticePage'

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Protected routes */}
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="/" element={<HomePage />} />
              <Route path="/practice/custom" element={<CustomPracticePage />} />
              <Route path="/practice/:scenarioId" element={<PracticePage />} />
              <Route path="/lessons" element={<LessonsPage />} />
              <Route path="/lessons/:lessonId" element={<LessonPracticePage />} />
              <Route path="/vocabulary" element={<VocabularyReviewPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/history/:id" element={<SessionDetailPage />} />
              <Route path="/progress" element={<ProgressPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </SettingsProvider>
    </AuthProvider>
  )
}

export default App
