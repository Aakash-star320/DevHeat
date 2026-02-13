import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ExternalLink, Edit, Clock, Plus, Briefcase } from 'lucide-react';
import Navbar from '../components/navbar';
import Footer from '../components/footer';
import LenisScroll from '../components/lenis-scroll';
import portfolioService from '../services/portfolioService';
import { useAuth } from '../hooks/useAuth';

export default function MyPortfolios() {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const [portfolios, setPortfolios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/');
        }
    }, [user, authLoading, navigate]);

    useEffect(() => {
        if (user) {
            fetchPortfolios();
        }
    }, [user]);

    const fetchPortfolios = async () => {
        try {
            setLoading(true);
            const data = await portfolioService.getMyPortfolios();
            setPortfolios(data);
        } catch (err) {
            console.error('Failed to fetch portfolios:', err);
            setError('Failed to load your portfolios');
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || (loading && portfolios.length === 0)) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="size-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                    <p className="text-slate-400">Loading your portfolios...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <LenisScroll />
            <Navbar />

            <main className="px-6 md:px-16 lg:px-24 xl:px-32 py-12 min-h-[70vh]">
                <div className="max-w-6xl mx-auto">
                    <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-2">My Portfolios</h1>
                            <p className="text-slate-400">Manage and refine your generated professional portfolios</p>
                        </div>
                        <Link
                            to="/generate"
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition active:scale-95"
                        >
                            <Plus className="size-5" />
                            Generate New
                        </Link>
                    </header>

                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 mb-8">
                            {error}
                        </div>
                    )}

                    {portfolios.length === 0 ? (
                        <motion.div
                            className="text-center py-20 bg-slate-900/50 backdrop-blur border border-slate-800 rounded-3xl"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className="size-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Briefcase className="size-10 text-slate-500" />
                            </div>
                            <h2 className="text-2xl font-semibold text-white mb-3">No portfolios yet</h2>
                            <p className="text-slate-400 max-w-md mx-auto mb-8">
                                You haven't generated any portfolios yet. Get started by providing your info and let our AI create one for you.
                            </p>
                            <Link
                                to="/generate"
                                className="inline-flex items-center gap-2 px-8 py-3 bg-white text-slate-950 font-bold rounded-xl hover:bg-slate-200 transition"
                            >
                                Get Started
                            </Link>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {portfolios.map((portfolio, index) => (
                                <motion.div
                                    key={portfolio.id}
                                    className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl overflow-hidden hover:border-indigo-500/50 transition group flex flex-col"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <div className="p-6 flex-grow">
                                        <div className="flex items-center justify-between mb-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${portfolio.status === 'completed' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                                portfolio.status === 'generating' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 animate-pulse' :
                                                    'bg-red-500/10 text-red-400 border border-red-500/20'
                                                }`}>
                                                {portfolio.status}
                                            </span>
                                            <span className="text-slate-500 text-xs flex items-center gap-1">
                                                <Clock className="size-3" />
                                                {new Date(portfolio.created_at).toLocaleDateString()}
                                            </span>
                                        </div>

                                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition">
                                            {portfolio.name}
                                        </h3>
                                        <p className="text-slate-400 text-sm mb-6 line-clamp-2">
                                            Focus: <span className="capitalize">{portfolio.portfolio_focus.replace('-', ' ')}</span>
                                        </p>
                                    </div>

                                    <div className="p-4 bg-slate-800/50 border-t border-slate-800 flex gap-2">
                                        <Link
                                            to={`/refine/${portfolio.slug}`}
                                            className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition"
                                        >
                                            <Edit className="size-4" />
                                            Manage
                                        </Link>
                                        <Link
                                            to={`/display/${portfolio.slug}`}
                                            target="_blank"
                                            className="px-3 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
                                        >
                                            <ExternalLink className="size-4" />
                                        </Link>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </>
    );
}
