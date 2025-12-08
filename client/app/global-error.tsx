'use client'

// Global error boundary - must be a client component in Next.js 14.2+

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    return (
        <html>
            <body>
                <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950">
                    <div className="text-center">
                        <h1 className="mb-4 text-6xl font-bold text-red-400">Error</h1>
                        <p className="mb-4 text-xl text-gray-400">Something went wrong</p>
                        <p className="mb-8 text-sm text-gray-500">{error.message || 'An unexpected error occurred'}</p>
                        <button
                            onClick={reset}
                            className="inline-block rounded-lg bg-gradient-to-r from-indigo-500 to-cyan-500 px-6 py-3 font-semibold text-white transition-all hover:scale-105 cursor-pointer"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </body>
        </html>
    )
}
