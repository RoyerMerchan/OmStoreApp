import { Outlet, Link } from 'react-router-dom'

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/catalogo" className="flex items-center gap-2">
              <img src="/omnegro.png" alt="OmStore" className="h-10" />
              <span className="font-bold text-xl text-gray-900">OmStore</span>
            </Link>
            <nav className="flex items-center gap-6">
              <Link to="/catalogo" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                Catálogo
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
