import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/navbar';
import Footer from '../components/footer';
import LenisScroll from '../components/lenis-scroll';
import CareerBotChat from '../components/CareerBotChat';
import { useAuth } from '../hooks/useAuth';
import authService from '../services/authService';

export default function CareerBot() {
    const navigate = useNavigate();
    const { user, loading } = useAuth();

    useEffect(() => {
        // Redirect to sign in if not authenticated, then come back after login
        if (!loading && !user) {
            sessionStorage.setItem('redirectAfterLogin', '/career-bot');
            authService.login();
        }
    }, [user, loading, navigate]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <>
            <LenisScroll />
            <div className="min-h-screen flex flex-col bg-black">
                <Navbar />

                <main className="flex-grow container mx-auto px-4 py-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="max-w-6xl mx-auto"
                    >
                        <div className="text-center mb-8">
                            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                AI Career Coach
                            </h1>
                            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                                Get personalized career guidance based on your GitHub profile, resume, and coding achievements.
                            </p>
                        </div>

                        <CareerBotChat />

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
