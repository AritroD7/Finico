import { useAuth } from "../hooks/useAuth"

export default function Account(){
  const { user, signOut } = useAuth()

  if (!user) {
    return (
      <div className="container-page">
        <div className="card">
          <div className="mb-2 font-semibold">Please sign in to view your account.</div>
          <a className="btn" href="/login">Go to Sign in</a>
        </div>
      </div>
    )
  }

  return (
    <div className="container-page">
      <div className="card">
        <h1 className="text-lg font-semibold mb-2">Account</h1>
        <div className="text-sm text-slate-700 mb-3">Signed in as <span className="font-medium">{user.email}</span></div>
        <button className="btn-secondary" onClick={signOut}>Sign out</button>
      </div>
    </div>
  )
}
