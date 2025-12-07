import Link from 'next/link'
import { ArrowRight, Sparkles, ShoppingCart, Brain } from 'lucide-react'

export default function HomePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <div className="flex justify-center mb-8">
                            <div className="relative inline-flex">
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-cyan-500 blur-3xl opacity-20"></div>
                                <ShoppingCart className="relative w-20 h-20 text-indigo-400" />
                            </div>
                        </div>

                        <h1 className="text-5xl font-bold tracking-tight text-white sm:text-7xl font-[family-name:var(--font-poppins)]">
                            Smart<span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Cart</span>
                        </h1>

                        <p className="mt-6 text-lg leading-8 text-gray-300">
                            AI-powered grocery shopping with intelligent budget management.
                            Track inventory, predict run-outs, and shop smarter.
                        </p>

                        <div className="mt-10 flex items-center justify-center gap-x-6">
                            <Link
                                href="/dashboard"
                                className="group relative inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-cyan-500 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-indigo-500/50"
                            >
                                Get Started
                                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                            </Link>

                            <Link
                                href="#features"
                                className="text-lg font-semibold leading-6 text-gray-300 hover:text-white transition-colors"
                            >
                                Learn more <span aria-hidden="true">→</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div id="features" className="py-24 sm:py-32">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl lg:text-center">
                        <h2 className="text-base font-semibold leading-7 text-indigo-400">Intelligent Shopping</h2>
                        <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                            Everything you need to shop smarter
                        </p>
                    </div>

                    <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                        <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                            <FeatureCard
                                icon={<Brain className="w-6 h-6" />}
                                title="AI Predictions"
                                description="Machine learning-powered run-out predictions based on your usage patterns."
                            />
                            <FeatureCard
                                icon={<ShoppingCart className="w-6 h-6" />}
                                title="Smart Cart"
                                description="Compare prices across Amazon and Walmart to get the best deals."
                            />
                            <FeatureCard
                                icon={<Sparkles className="w-6 h-6" />}
                                title="Budget Control"
                                description="Set spending caps and get real-time budget validation before checkout."
                            />
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="relative flex flex-col items-start rounded-2xl border border-slate-800 bg-slate-900/50 p-8 backdrop-blur transition-all hover:border-indigo-500/50 hover:bg-slate-900/80">
            <div className="rounded-lg bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 p-3 text-indigo-400 ring-1 ring-indigo-500/20">
                {icon}
            </div>
            <dt className="mt-4 font-semibold text-white text-xl">{title}</dt>
            <dd className="mt-2 leading-7 text-gray-400">{description}</dd>
        </div>
    )
}
