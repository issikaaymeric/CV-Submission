import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import FormulaireSubmission from './pages/FormulaireSubmission'
import AdminDashboard from './pages/AdminDashboard'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"       element={<FormulaireSubmission />} />
        <Route path="/admin"  element={<AdminDashboard />} />
        <Route path="*"       element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
