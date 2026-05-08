import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ToastProvider } from './components/Toast'
import ProtectedRoute from './components/ProtectedRoute'

import Landing from './pages/Landing'
import Auth from './pages/Auth'

import CandidateDashboard from './pages/candidate/CandidateDashboard'
import TeamFormation from './pages/candidate/TeamFormation'
import ProblemStatements from './pages/candidate/ProblemStatements'
import IdeaSubmission from './pages/candidate/IdeaSubmission'
import PrototypeSubmission from './pages/candidate/PrototypeSubmission'
import Leaderboard from './pages/candidate/Leaderboard'

import JuryDashboard from './pages/jury/JuryDashboard'
import EvaluationList from './pages/jury/EvaluationList'
import FeedbackView from './pages/jury/FeedbackView'

import AdminDashboard from './pages/admin/AdminDashboard'
import UserManagement from './pages/admin/UserManagement'
import ProblemStatementManager from './pages/admin/ProblemStatementManager'
import InternalEvaluation from './pages/admin/InternalEvaluation'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />

            {/* Candidate */}
            <Route path="/candidate" element={<ProtectedRoute allowedRoles={['candidate']}><CandidateDashboard /></ProtectedRoute>} />
            <Route path="/candidate/team" element={<ProtectedRoute allowedRoles={['candidate']}><TeamFormation /></ProtectedRoute>} />
            <Route path="/candidate/problems" element={<ProtectedRoute allowedRoles={['candidate']}><ProblemStatements /></ProtectedRoute>} />
            <Route path="/candidate/submit-idea" element={<ProtectedRoute allowedRoles={['candidate']}><IdeaSubmission /></ProtectedRoute>} />
            <Route path="/candidate/prototype" element={<ProtectedRoute allowedRoles={['candidate']}><PrototypeSubmission /></ProtectedRoute>} />
            <Route path="/candidate/leaderboard" element={<ProtectedRoute allowedRoles={['candidate']}><Leaderboard /></ProtectedRoute>} />

            {/* Jury */}
            <Route path="/jury" element={<ProtectedRoute allowedRoles={['jury']}><JuryDashboard /></ProtectedRoute>} />
            <Route path="/jury/evaluate" element={<ProtectedRoute allowedRoles={['jury']}><EvaluationList /></ProtectedRoute>} />
            <Route path="/jury/feedback" element={<ProtectedRoute allowedRoles={['jury']}><FeedbackView /></ProtectedRoute>} />
            <Route path="/jury/leaderboard" element={<ProtectedRoute allowedRoles={['jury']}><Leaderboard /></ProtectedRoute>} />

            {/* Admin (Hidden) */}
            <Route path="/admin-portal" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin-portal/users" element={<ProtectedRoute allowedRoles={['admin']}><UserManagement /></ProtectedRoute>} />
            <Route path="/admin-portal/problems" element={<ProtectedRoute allowedRoles={['admin']}><ProblemStatementManager /></ProtectedRoute>} />
            <Route path="/admin-portal/evaluation" element={<ProtectedRoute allowedRoles={['admin']}><InternalEvaluation /></ProtectedRoute>} />
            <Route path="/admin-portal/leaderboard" element={<ProtectedRoute allowedRoles={['admin']}><Leaderboard /></ProtectedRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
