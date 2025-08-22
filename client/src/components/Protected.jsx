import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Protected({ children }) {
  const { user, loading } = useAuth()
  if (loading)
    return (
      <div className="container-page">
        <div className="card">Loading…</div>
      </div>
    )
  if (!user) return <Navigate to="/login" replace />
  return children
}
