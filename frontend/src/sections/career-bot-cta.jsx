import { MessageSquare, Sparkles, Brain, Target, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function CareerBotCTA() {
    const navigate = useNavigate();
    const { user, login } = useAuth();

    const handleGetStarted = () => {
        if (user) {
            navigate('/career-bot');
        } else {
            sessionStorage.setItem('redirectAfterLogin', '/career-bot');
            login();
        }
    };

    const features = [
        {
            icon: <Brain className="w-6 h-6" />,
            title: "Personalized Insights",
            description: "Get career advice tailored to your GitHub profile, resume, and coding stats"
        },
        {
            icon: <Target className="w-6 h-6" />,
            title: "Skill Recommendations",
            description: "Discover which skills to learn next based on your career goals"
        },
        {
            icon: <TrendingUp className="w-6 h-6" />,
            title: "Interview Prep",
            description: "Prepare for interviews with AI-powered guidance and practice"
        }
    ];

    return (
        <section className="py-20 relative overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20"></div>

            <div className="max-w-6xl mx-auto px-6 relative">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600/20 border border-purple-500/30 rounded-full mb-6">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        <span className="text-sm font-medium text-purple-300">NEW FEATURE</span>
                    </div>

                    <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                        Meet Your AI Career Coach
                    </h2>

                    <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                        Get instant, personalized career guidance powered by AI. Chat with our career coach to unlock your full potential.
                    </p>
                </motion.div>

                {/* Features grid */}
                <div className="grid md:grid-cols-3 gap-6 mb-12">
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-purple-500/50 transition"
                        >
                            <div className="w-12 h-12 bg-purple-600/20 border border-purple-500/30 rounded-lg flex items-center justify-center mb-4 text-purple-400">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
                            <p className="text-gray-400">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>

                {/* CTA Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 md:p-12 text-center shadow-2xl"
                >
                    <MessageSquare className="w-16 h-16 mx-auto mb-6 text-white" />
                    <h3 className="text-3xl font-bold text-white mb-4">
                        Ready to Accelerate Your Career?
                    </h3>
                    <p className="text-purple-100 mb-8 max-w-2xl mx-auto text-lg">
                        {user
                            ? "Start chatting with your AI Career Coach now and get personalized advice!"
                            : "Sign in with GitHub to unlock personalized career coaching powered by AI"}
                    </p>
                    <button
                        onClick={handleGetStarted}
                        className="inline-flex items-center gap-3 bg-white text-purple-600 hover:bg-gray-100 font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition transform hover:scale-105 active:scale-95"
                    >
                        <MessageSquare className="w-5 h-5" />
                        {user ? "Start Career Coaching" : "Sign In & Get Started"}
                        <Sparkles className="w-5 h-5" />
                    </button>
                </motion.div>
            </div>
        </section>
    );
}
