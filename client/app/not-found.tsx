'use client'

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950">
            <div className="text-center">
                <h1 className="mb-4 text-6xl font-bold text-indigo-400">404</h1>
                <p className="mb-8 text-xl text-gray-400">Page not found</p>
                <a
                    href="/"
                    className="rounded-lg bg-gradient-to-r from-indigo-500 to-cyan-500 px-6 py-3 font-semibold text-white transition-all hover:scale-105"
                >
                    Go Home
                </a>
            </div>
        </div>
    )
}
