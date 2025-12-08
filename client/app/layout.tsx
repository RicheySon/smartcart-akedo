import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
})

const poppins = Poppins({
    weight: ['600', '700'],
    subsets: ['latin'],
    variable: '--font-poppins',
})

export const metadata: Metadata = {
    title: 'SmartCart - AI Shopping Assistant',
    description: 'AI-powered grocery shopping with budget management',
}

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic'

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className="dark">
            <body className={`${inter.variable} ${poppins.variable} font-sans antialiased`}>
                <Providers>{children}</Providers>
            </body>
        </html>
    )
}
