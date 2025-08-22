import { Link } from "react-router-dom"
export default function NotFound(){
  return (
    <div className="container-page text-center">
      <h1 className="text-3xl font-bold text-slate-800 mb-2">Page not found</h1>
      <p className="text-slate-600 mb-6">The page you’re looking for doesn’t exist.</p>
      <Link className="btn" to="/">Go Home</Link>
    </div>
  )
}
