import { useState } from "react";
import { MenuIcon, XIcon, Github, LogOut, User as UserIcon, Briefcase, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Navbar() {
    const navigate = useNavigate();
    const { user, login, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const navlinks = [

    ];
    return (
        <>
            <motion.nav className="sticky top-0 z-50 flex items-center justify-between w-full h-18 px-6 md:px-16 lg:px-24 xl:px-32 backdrop-blur"
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 250, damping: 70, mass: 1 }}
            >
                <Link to="/" className="text-2xl font-bold text-white hover:text-indigo-400 transition">
                    SmartFolio
                </Link>

                <div className="hidden lg:flex items-center gap-8 transition duration-500">
                    {navlinks.map((link) => (
                        <a key={link.href} href={link.href} className="hover:text-slate-300 transition">
                            {link.text}
                        </a>
                    ))}
                </div>

                <div className="hidden lg:flex items-center space-x-4">
                    <button
                        onClick={() => navigate('/generate')}
                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 transition text-white rounded-md active:scale-95"
                    >
                        Generate Portfolio
                    </button>

                    {user && (
                        <button
                            onClick={() => navigate('/career-bot')}
                            className="flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 transition text-white rounded-md active:scale-95"
                        >
                            <MessageSquare className="size-4" />
                            AI Career Coach
                        </button>
                    )}

                    {user ? (
                        <div className="relative">
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-800 transition"
                            >
                                {user.avatar_url ? (
                                    <img src={user.avatar_url} alt={user.username} className="size-8 rounded-full border border-indigo-500" />
                                ) : (
                                    <div className="size-8 rounded-full bg-indigo-600 flex items-center justify-center">
                                        <UserIcon className="size-5 text-white" />
                                    </div>
                                )}
                            </button>

                            {isProfileOpen && (
                                <motion.div
                                    className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-[60]"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <div className="px-4 py-2 border-b border-slate-800 mb-2">
                                        <p className="text-sm font-semibold text-white truncate">{user.username}</p>
                                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                                    </div>
                                    <Link
                                        to="/my-portfolios"
                                        className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 flex items-center gap-2 transition"
                                        onClick={() => setIsProfileOpen(false)}
                                    >
                                        <Briefcase className="size-4" />
                                        My Portfolios
                                    </Link>
                                    <Link
                                        to="/career-bot"
                                        className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 flex items-center gap-2 transition"
                                        onClick={() => setIsProfileOpen(false)}
                                    >
                                        <MessageSquare className="size-4" />
                                        AI Career Coach
                                    </Link>
                                    <button
                                        onClick={logout}
                                        className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-800 flex items-center gap-2 transition"
                                    >
                                        <LogOut className="size-4" />
                                        Logout
                                    </button>
                                </motion.div>
                            )}
                        </div>
                    ) : (
                        <button
                            onClick={login}
                            className="flex items-center gap-2 px-6 py-2 bg-slate-800 hover:bg-slate-700 transition text-white rounded-md active:scale-95"
                        >
                            <Github className="size-4" />
                            Sign in with GitHub
                        </button>
                    )}
                </div>
                <button onClick={() => setIsMenuOpen(true)} className="lg:hidden active:scale-90 transition">
                    <MenuIcon className="size-6.5" />
                </button>
            </motion.nav>
            <div className={`fixed inset-0 z-[100] bg-black/60 backdrop-blur flex flex-col items-center justify-center text-lg gap-8 lg:hidden transition-transform duration-400 ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
                {navlinks.map((link) => (
                    <a key={link.href} href={link.href} onClick={() => setIsMenuOpen(false)}>
                        {link.text}
                    </a>
                ))}
                {user && (
                    <>
                        <Link to="/my-portfolios" className="text-white hover:text-indigo-400 transition" onClick={() => setIsMenuOpen(false)}>
                            My Portfolios
                        </Link>
                        <Link to="/career-bot" className="flex items-center gap-2 text-white hover:text-purple-400 transition" onClick={() => setIsMenuOpen(false)}>
                            <MessageSquare className="size-5" />
                            AI Career Coach
                        </Link>
                    </>
                )}
                <button onClick={() => setIsMenuOpen(false)} className="active:ring-3 active:ring-white aspect-square size-10 p-1 items-center justify-center bg-slate-100 hover:bg-slate-200 transition text-black rounded-md flex">
                    <XIcon />
                </button>
            </div>
        </>
    );
}