import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/navbar';
import Footer from '../components/footer';
import LenisScroll from '../components/lenis-scroll';
import CareerBotChat from '../components/CareerBotChat';
import { useAuth } from '../hooks/useAuth';
import portfolioService from '../services/portfolioService';

export default function CareerBot() {
    const { user, loading } = useAuth();
    const [hasPortfolio, setHasPortfolio] = useState(null);

    useEffect(() => {
        if (!user) return;
        let active = true;
        portfolioService.getMyPortfolios()
            .then((portfolios) => {
                if (!active) return;
                if (portfolios.some((portfolio) => portfolio.status === 'completed')) {
                    setHasPortfolio(true);
                } else {
                    setHasPortfolio(false);
                }
            })
            .catch(() => {
                if (active) setHasPortfolio(false);
            });
        return () => { active = false; };
    }, [user]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    return (
        <>
            <LenisScroll />
            <div className="min-h-screen flex flex-col bg-black">
                <Navbar />

                <main className="flex-grow container mx-auto px-3 py-5 sm:px-4 sm:py-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="max-w-6xl mx-auto"
                    >
                        <div className="text-center mb-8">
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                AI Career Coach
                            </h1>
                            <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto">
                                Get personalized career guidance based on your GitHub profile, resume, and coding achievements.
                            </p>
                        </div>

                        {!user ? (
                            <div className="min-h-72 flex items-center justify-center rounded-3xl border border-violet-400/25 bg-violet-500/10 px-6 text-center">
                                <div className="max-w-lg">
                                    <p className="mb-3 text-sm font-bold tracking-[0.18em] text-violet-300">SIGN IN REQUIRED</p>
                                    <h2 className="mb-3 text-2xl font-semibold text-white">Sign in to continue</h2>
                                    <p className="text-gray-300">Please sign in with GitHub first, then create your portfolio to get personalized career guidance.</p>
                                </div>
                            </div>
                        ) : hasPortfolio === null ? (
                            <div className="min-h-72 flex items-center justify-center rounded-3xl border border-white/10 bg-white/5 text-gray-300">
                                Checking your portfolio access…
                            </div>
                        ) : !hasPortfolio ? (
                            <div className="min-h-72 flex items-center justify-center rounded-3xl border border-violet-400/25 bg-violet-500/10 px-6 text-center">
                                <div className="max-w-lg">
                                    <p className="mb-3 text-sm font-bold tracking-[0.18em] text-violet-300">PORTFOLIO REQUIRED</p>
                                    <h2 className="mb-3 text-2xl font-semibold text-white">Create your portfolio first</h2>
                                    <p className="text-gray-300">AI Career Coach needs your resume, LinkedIn profile, and selected projects to give guidance that is actually about you.</p>
                                </div>
                            </div>
                        ) : (
                            <CareerBotChat />
                        )}

                        <div className="mt-8 text-center text-sm text-gray-400">
                            <p>
                                💡 Tip: Ask about your skills, career paths, interview preparation, or learning resources.
                            </p>
                        </div>
                    </motion.div>
                </main>

                <Footer />
            </div>
        </>
    );
}
