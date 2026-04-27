import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/context/AuthContext'
import QuizPage from '@/pages/QuizPage'
import ExercisePage from '@/pages/ExercisePage'
import ProgressPage from '@/pages/ProgressPage'
import CoveragePage from '@/pages/CoveragePage'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 60_000 },
  },
})

const root = document.getElementById('root')
if (!root) throw new Error('Root element not found. Remediation: ensure index.html has <div id="root">.')

createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {/* FilterContext added in Phase 7 (T057) */}
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/quiz" replace />} />
            <Route path="/quiz" element={<QuizPage />} />
            <Route path="/exercises" element={<ExercisePage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/coverage" element={<CoveragePage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
