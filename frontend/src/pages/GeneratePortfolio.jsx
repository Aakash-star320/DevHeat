import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Upload, Github, Code2, Trophy, Search, Check, Plus } from 'lucide-react';
import Navbar from '../components/navbar';
import Footer from '../components/footer';
import LenisScroll from '../components/lenis-scroll';
import portfolioService from '../services/portfolioService';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';

export default function GeneratePortfolio() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        portfolio_focus: 'general',
        linkedin_file: null,
        resume_file: null,
        github_repos: '',
        codeforces_username: '',
        codeforces_username: '',
        leetcode_username: '',
        linkedin_url: '',
        github_profile_url: '',
    });

    const [userRepos, setUserRepos] = useState([]);
    const [repoSearch, setRepoSearch] = useState('');
    const [selectedRepos, setSelectedRepos] = useState([]);
    const [fetchingRepos, setFetchingRepos] = useState(false);

    useEffect(() => {
        if (user) {
            fetchUserRepos();
        }
    }, [user]);

    const fetchUserRepos = async () => {
        setFetchingRepos(true);
        try {
            const response = await api.get('/github/user-repos');
            setUserRepos(response.data.repos);
        } catch (err) {
            console.error('Failed to fetch user repos:', err);
        } finally {
            setFetchingRepos(false);
        }
    };

    const toggleRepo = (repoUrl) => {
        setSelectedRepos(prev => {
            if (prev.includes(repoUrl)) {
                return prev.filter(r => r !== repoUrl);
            }
            if (prev.length >= 5) {
                return prev;
            }
            return [...prev, repoUrl];
        });
    };

    useEffect(() => {
        if (selectedRepos.length > 0) {
            setFormData(prev => ({
                ...prev,
                github_repos: selectedRepos.join('\n')
            }));
        }
    }, [selectedRepos]);

    const loadingMessages = [
        'Analyzing your professional profile...',
        'Fetching GitHub repositories...',
        'Analyzing code quality and structure...',
        'Gathering competitive programming stats...',
        'Generating AI-powered insights...',
        'Crafting your professional summary...',
        'Highlighting your key projects...',
        'Building your personalized portfolio...',
        'Almost done, finalizing details...',
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        setFormData(prev => ({ ...prev, [name]: files[0] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setLoadingMessage(loadingMessages[0]);

        // Rotate through loading messages
        let messageIndex = 0;
        const messageInterval = setInterval(() => {
            messageIndex = (messageIndex + 1) % loadingMessages.length;
            setLoadingMessage(loadingMessages[messageIndex]);
        }, 4000); // Change message every 4 seconds

        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('portfolio_focus', formData.portfolio_focus);

            if (formData.linkedin_file) {
                data.append('linkedin_file', formData.linkedin_file);
            }
            if (formData.resume_file) {
                data.append('resume_file', formData.resume_file);
            }
            if (formData.github_repos) {
                const repos = formData.github_repos.split('\n').filter(r => r.trim());
                data.append('github_repos', JSON.stringify(repos));
            }
            if (formData.codeforces_username) {
                data.append('codeforces_username', formData.codeforces_username);
            }
            if (formData.leetcode_username) {
                data.append('leetcode_username', formData.leetcode_username);
            }
            if (formData.linkedin_url) {
                data.append('linkedin_url', formData.linkedin_url);
            }
            if (formData.github_profile_url) {
                data.append('github_profile_url', formData.github_profile_url);
            }

            const response = await portfolioService.generatePortfolio(data);
            clearInterval(messageInterval);
            navigate(`/refine/${response.slug}`);
        } catch (err) {
            clearInterval(messageInterval);
            setError(err.response?.data?.detail || 'Failed to generate portfolio');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <LenisScroll />
            <Navbar />

            <main className="px-6 md:px-16 lg:px-24 xl:px-32">
                {/* Hero Section */}
                <motion.section
                    className="flex flex-col items-center pt-0 pb-16"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <motion.svg className="absolute -z-10 w-full -mt-40 md:mt-0" width="1440" height="676" viewBox="0 0 1440 676" fill="none" xmlns="http://www.w3.org/2000/svg"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <rect x="-92" y="-948" width="1624" height="1624" rx="812" fill="url(#a)" />
                        <defs>
                            <radialGradient id="a" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="rotate(90 428 292)scale(812)">
                                <stop offset=".63" stopColor="#372AAC" stopOpacity="0" />
                                <stop offset="1" stopColor="#372AAC" />
                            </radialGradient>
                        </defs>
                    </motion.svg>

                    <motion.div
                        className="flex items-center gap-2 border border-slate-600 text-gray-50 rounded-full px-4 py-2 mb-6"
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 320, damping: 70 }}
                    >
                        <div className="size-2.5 bg-green-500 rounded-full animate-pulse"></div>
                        <span>AI-Powered Portfolio Generation</span>
                    </motion.div>

                    <motion.h1
                        className="text-center text-5xl leading-[68px] md:text-6xl md:leading-[70px] font-semibold max-w-3xl mb-4"
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 240, damping: 70 }}
                    >
                        Generate Your Professional Portfolio
                    </motion.h1>

                    <motion.p
                        className="text-center text-base max-w-2xl text-slate-400 mb-12"
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 320, damping: 70 }}
                    >
                        Provide your information and let AI create a stunning portfolio that showcases your skills, projects, and achievements
                    </motion.p>

                    {/* Feature Cards */}
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mb-16"
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                    >
                        <div className="flex flex-col items-center text-center p-6 bg-slate-900/50 backdrop-blur border border-slate-700 rounded-2xl">
                            <Upload className="size-12 text-indigo-500 mb-4" />
                            <h3 className="text-lg font-semibold text-white mb-2">Upload Documents</h3>
                            <p className="text-sm text-slate-400">Add your resume and LinkedIn profile</p>
                        </div>
                        <div className="flex flex-col items-center text-center p-6 bg-slate-900/50 backdrop-blur border border-slate-700 rounded-2xl">
                            <Github className="size-12 text-indigo-500 mb-4" />
                            <h3 className="text-lg font-semibold text-white mb-2">Connect Projects</h3>
                            <p className="text-sm text-slate-400">Link your GitHub repositories</p>
                        </div>
                        <div className="flex flex-col items-center text-center p-6 bg-slate-900/50 backdrop-blur border border-slate-700 rounded-2xl">
                            <Trophy className="size-12 text-indigo-500 mb-4" />
                            <h3 className="text-lg font-semibold text-white mb-2">Showcase Skills</h3>
                            <p className="text-sm text-slate-400">Add competitive programming stats</p>
                        </div>
                    </motion.div>
                </motion.section>

                {/* Form Section */}
                <motion.section
                    className="max-w-4xl mx-auto pb-24"
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                >
                    <form onSubmit={handleSubmit} className="bg-slate-900/50 backdrop-blur-lg rounded-3xl p-8 md:p-12 shadow-2xl border border-slate-700">
                        {error && (
                            <motion.div
                                className="mb-8 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                {error}
                            </motion.div>
                        )}

                        <div className="space-y-8">
                            {/* Basic Info */}
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-6">Basic Information</h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-white font-medium mb-2">
                                            Full Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                                            placeholder="Sarah Chen"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-white font-medium mb-2">Portfolio Focus</label>
                                        <select
                                            name="portfolio_focus"
                                            value={formData.portfolio_focus}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                                        >
                                            <option value="general">General</option>
                                            <option value="fullstack">Full Stack</option>
                                            <option value="backend">Backend</option>
                                            <option value="ml">Machine Learning</option>
                                            <option value="competitive">Competitive Programming</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* File Uploads */}
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-6">Documents</h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-white font-medium mb-2">
                                            <Upload className="inline size-4 mr-2" />
                                            LinkedIn Profile (PDF)
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="file"
                                                name="linkedin_file"
                                                accept=".pdf"
                                                onChange={handleFileChange}
                                                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 file:cursor-pointer focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                                            />
                                        </div>
                                        <p className="text-slate-500 text-sm mt-2">Optional: Upload your LinkedIn profile PDF</p>
                                    </div>

                                    <div>
                                        <label className="block text-white font-medium mb-2">LinkedIn Profile URL</label>
                                        <input
                                            type="url"
                                            name="linkedin_url"
                                            value={formData.linkedin_url}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                                            placeholder="https://linkedin.com/in/username"
                                        />
                                        <p className="text-slate-500 text-sm mt-2">Optional: Link to your profile</p>
                                    </div>

                                    <div>
                                        <label className="block text-white font-medium mb-2">
                                            <Upload className="inline size-4 mr-2" />
                                            Resume (PDF/DOCX)
                                        </label>
                                        <input
                                            type="file"
                                            name="resume_file"
                                            accept=".pdf,.docx"
                                            onChange={handleFileChange}
                                            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 file:cursor-pointer focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                                        />
                                        <p className="text-slate-500 text-sm mt-2">Optional: Upload your resume</p>
                                    </div>
                                </div>
                            </div>

                            {/* GitHub */}
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                                    <Github className="size-6 mr-3" />
                                    Projects
                                </h2>

                                {user && (fetchingRepos || userRepos.length > 0) && (
                                    <div className="mb-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <label className="block text-white font-medium">Import from your GitHub</label>
                                            {fetchingRepos && (
                                                <div className="flex items-center gap-2 text-indigo-400 text-xs">
                                                    <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                    </svg>
                                                    Fetching...
                                                </div>
                                            )}
                                        </div>

                                        <div className="relative mb-4">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
                                            <input
                                                type="text"
                                                placeholder="Search your repositories..."
                                                value={repoSearch}
                                                onChange={(e) => setRepoSearch(e.target.value)}
                                                className="w-full pl-11 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                            {userRepos
                                                .filter(repo => repo.full_name.toLowerCase().includes(repoSearch.toLowerCase()))
                                                .map(repo => {
                                                    const isSelected = selectedRepos.includes(repo.html_url);
                                                    return (
                                                        <button
                                                            key={repo.full_name}
                                                            type="button"
                                                            onClick={() => toggleRepo(repo.html_url)}
                                                            className={`text-left p-3 rounded-xl border transition flex items-center justify-between group ${
                                                                isSelected
                                                                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-100'
                                                                    : 'bg-slate-800/30 border-slate-700 text-slate-400 hover:border-slate-500'
                                                            }`}
                                                        >
                                                            <div className="truncate mr-2">
                                                                <p className="text-sm font-medium truncate text-white">{repo.name}</p>
                                                                <p className="text-xs truncate opacity-60">{repo.language || 'Plain Text'}</p>
                                                            </div>
                                                            {isSelected ? (
                                                                <Check className="size-4 text-indigo-400 shrink-0" />
                                                            ) : (
                                                                <Plus className="size-4 opacity-0 group-hover:opacity-100 transition shrink-0" />
                                                            )}
                                                        </button>
                                                    );
                                                })
                                            }
                                        </div>
                                        <p className="text-slate-500 text-xs mt-3">Selected {selectedRepos.length} / 5 repositories</p>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-white font-medium mb-2">Repository URLs</label>
                                    <textarea
                                        name="github_repos"
                                        value={formData.github_repos}
                                        onChange={handleInputChange}
                                        rows="4"
                                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                                        placeholder="https://github.com/username/repo1&#10;https://github.com/username/repo2"
                                    />
                                    <p className="text-slate-500 text-sm mt-2">Optional: One repository URL per line (max 5)</p>
                                </div>

                                <div className="mt-6">
                                    <label className="block text-white font-medium mb-2">GitHub Profile URL</label>
                                    <input
                                        type="url"
                                        name="github_profile_url"
                                        value={formData.github_profile_url}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                                        placeholder="https://github.com/username"
                                    />
                                    <p className="text-slate-500 text-sm mt-2">Optional: Link to your GitHub profile</p>
                                </div>
                            </div>

                            {/* Competitive Programming */}
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                                    <Code2 className="size-6 mr-3" />
                                    Competitive Programming
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-white font-medium mb-2">Codeforces Username</label>
                                        <input
                                            type="text"
                                            name="codeforces_username"
                                            value={formData.codeforces_username}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                                            placeholder="tourist"
                                        />
                                        <p className="text-slate-500 text-sm mt-2">Optional: Your Codeforces handle</p>
                                    </div>

                                    <div>
                                        <label className="block text-white font-medium mb-2">LeetCode Username</label>
                                        <input
                                            type="text"
                                            name="leetcode_username"
                                            value={formData.leetcode_username}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                                            placeholder="schen"
                                        />
                                        <p className="text-slate-500 text-sm mt-2">Optional: Your LeetCode username</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <motion.button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-12 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center justify-center gap-2"
                            whileHover={{ scale: loading ? 1 : 1.02 }}
                            whileTap={{ scale: loading ? 1 : 0.98 }}
                        >
                            {loading ? (
                                <>
                                    <div className="flex items-center gap-2">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        <span>{loadingMessage}</span>
                                    </div>
                                    <span className="text-sm text-indigo-200">Estimated time: 30-60 seconds</span>
                                </>
                            ) : (
                                <div className="flex items-center gap-2 group">
                                    Generate Portfolio with AI
                                    <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
                                </div>
                            )}
                        </motion.button>
                    </form>
                </motion.section>
            </main>

            <Footer />
        </>
    );
}
