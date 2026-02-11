import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import portfolioService from '../services/portfolioService';

export default function ViewPortfolio() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [portfolio, setPortfolio] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadPortfolio();
    }, [slug]);

    const loadPortfolio = async () => {
        try {
            setLoading(true);
            const data = await portfolioService.getPortfolio(slug);
            setPortfolio(data);
            setError(null);
        } catch (err) {
            setError('Portfolio not found');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
                <div className="text-white text-xl">Loading portfolio...</div>
            </div>
        );
    }

    if (error || !portfolio) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-400 text-xl mb-4">{error || 'Portfolio not found'}</div>
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-16 px-6 md:px-16 lg:px-24 xl:px-32">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold text-white mb-4">
                        {portfolio?.personal_info?.name || 'Professional Portfolio'}
                    </h1>
                    <p className="text-gray-400 text-lg">
                        {portfolio?.personal_info?.portfolio_focus
                            ? `${portfolio.personal_info.portfolio_focus.charAt(0).toUpperCase() + portfolio.personal_info.portfolio_focus.slice(1)} Developer`
                            : 'Software Developer'}
                    </p>

                </div>

                {/* Content */}
                <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-gray-700 space-y-8">
                    {/* Professional Summary */}
                    {portfolio?.ai_generated_content?.professional_summary && (
                        <section>
                            <h2 className="text-3xl font-bold text-white mb-4 pb-2 border-b border-gray-700">
                                About Me
                            </h2>
                            <p className="text-gray-300 text-lg leading-relaxed">
                                {portfolio.ai_generated_content.professional_summary}
                            </p>
                        </section>
                    )}

                    {/* Key Strengths */}
                    {portfolio?.ai_generated_content?.key_strengths?.length > 0 && (
                        <section>
                            <h2 className="text-3xl font-bold text-white mb-4 pb-2 border-b border-gray-700">
                                Key Strengths
                            </h2>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {portfolio.ai_generated_content.key_strengths.map((strength, idx) => (
                                    <li key={idx} className="flex items-start bg-gray-900/50 p-4 rounded-lg">
                                        <span className="text-blue-500 mr-3 text-xl">✓</span>
                                        <span className="text-gray-300">{strength}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    {/* Skills */}
                    {portfolio?.ai_generated_content?.skills?.length > 0 && (
                        <section>
                            <h2 className="text-3xl font-bold text-white mb-4 pb-2 border-b border-gray-700">
                                Technical Skills
                            </h2>
                            <div className="flex flex-wrap gap-3">
                                {portfolio.ai_generated_content.skills.map((skill, idx) => (
                                    <span
                                        key={idx}
                                        className="px-5 py-2.5 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/50 rounded-full text-blue-300 font-medium hover:scale-105 transition"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Work Experience */}
                    {portfolio?.ai_generated_content?.work_experience?.length > 0 && (
                        <section>
                            <h2 className="text-3xl font-bold text-white mb-4 pb-2 border-b border-gray-700">
                                Work Experience
                            </h2>
                            <div className="space-y-6">
                                {portfolio.ai_generated_content.work_experience.map((exp, idx) => (
                                    <div key={idx} className="bg-gray-900/50 p-6 rounded-xl border border-gray-700">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h3 className="text-xl font-semibold text-white">{exp.title}</h3>
                                                <p className="text-blue-400">{exp.company}</p>
                                            </div>
                                            <span className="text-gray-400 text-sm">{exp.duration}</span>
                                        </div>
                                        {exp.description_bullets && (
                                            <ul className="space-y-2 mt-4">
                                                {exp.description_bullets.map((bullet, bIdx) => (
                                                    <li key={bIdx} className="flex items-start text-gray-300">
                                                        <span className="text-blue-500 mr-2">•</span>
                                                        {bullet}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Project Highlights */}
                    {portfolio?.ai_generated_content?.project_highlights?.length > 0 && (
                        <section>
                            <h2 className="text-3xl font-bold text-white mb-4 pb-2 border-b border-gray-700">
                                Featured Projects
                            </h2>
                            <div className="space-y-6">
                                {portfolio.ai_generated_content.project_highlights.map((project, idx) => (
                                    <div key={idx} className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 p-6 rounded-xl border border-gray-700 hover:border-blue-500/50 transition">
                                        <h3 className="text-2xl font-semibold text-white mb-3">
                                            {project.name || project.title || `Project ${idx + 1}`}
                                        </h3>
                                        <p className="text-gray-400 leading-relaxed mb-4">
                                            {project.description || project}
                                        </p>
                                        {project.technologies && (
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                {project.technologies.map((tech, tIdx) => (
                                                    <span key={tIdx} className="px-3 py-1 bg-purple-600/20 border border-purple-500/30 rounded-full text-purple-300 text-sm">
                                                        {tech}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        {project.highlights && (
                                            <ul className="space-y-1 mt-3">
                                                {project.highlights.map((highlight, hIdx) => (
                                                    <li key={hIdx} className="flex items-start text-gray-400 text-sm">
                                                        <span className="text-green-500 mr-2">✓</span>
                                                        {highlight}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Achievements */}
                    {portfolio?.ai_generated_content?.achievements?.length > 0 && (
                        <section>
                            <h2 className="text-3xl font-bold text-white mb-4 pb-2 border-b border-gray-700">
                                Achievements
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {portfolio.ai_generated_content.achievements.map((achievement, idx) => (
                                    <div key={idx} className="bg-gradient-to-br from-yellow-900/10 to-yellow-800/10 p-4 rounded-lg border border-yellow-500/20">
                                        <div className="flex items-start">
                                            <span className="text-yellow-500 mr-3 text-2xl">🏆</span>
                                            <p className="text-gray-300">{achievement}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Skills Summary */}
                    {portfolio?.ai_generated_content?.skills_summary && (
                        <section>
                            <h2 className="text-3xl font-bold text-white mb-4 pb-2 border-b border-gray-700">
                                Skills & Technologies
                            </h2>
                            <div className="space-y-6">
                                {portfolio.ai_generated_content.skills_summary.languages && (
                                    <div>
                                        <h3 className="text-xl font-semibold text-white mb-3">Languages</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {portfolio.ai_generated_content.skills_summary.languages.map((lang, idx) => (
                                                <span key={idx} className="px-4 py-2 bg-blue-600/20 border border-blue-500/50 rounded-lg text-blue-300">
                                                    {lang}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {portfolio.ai_generated_content.skills_summary.frameworks && (
                                    <div>
                                        <h3 className="text-xl font-semibold text-white mb-3">Frameworks & Libraries</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {portfolio.ai_generated_content.skills_summary.frameworks.map((framework, idx) => (
                                                <span key={idx} className="px-4 py-2 bg-purple-600/20 border border-purple-500/50 rounded-lg text-purple-300">
                                                    {framework}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {portfolio.ai_generated_content.skills_summary.tools && (
                                    <div>
                                        <h3 className="text-xl font-semibold text-white mb-3">Tools & Technologies</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {portfolio.ai_generated_content.skills_summary.tools.map((tool, idx) => (
                                                <span key={idx} className="px-4 py-2 bg-green-600/20 border border-green-500/50 rounded-lg text-green-300">
                                                    {tool}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    {/* Projects */}
                    {portfolio?.data_sources?.github_projects?.length > 0 && (
                        <section>
                            <h2 className="text-3xl font-bold text-white mb-4 pb-2 border-b border-gray-700">
                                Projects
                            </h2>
                            <div className="grid grid-cols-1 gap-4">
                                {portfolio.data_sources.github_projects.map((project, idx) => (
                                    <div key={idx} className="bg-gray-900/50 p-5 rounded-lg border border-gray-700">
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="text-xl font-semibold text-white">
                                                {project.name}
                                            </h3>
                                            {project.language && (
                                                <span className="px-3 py-1 bg-purple-600/20 border border-purple-500/50 rounded-full text-purple-300 text-sm">
                                                    {project.language}
                                                </span>
                                            )}
                                        </div>
                                        {project.description && project.description.trim() && (
                                            <p className="text-gray-400 mb-3">{project.description}</p>
                                        )}
                                        {project.github_url && (
                                            <a
                                                href={project.github_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-400 hover:text-blue-300 text-sm mb-3 inline-block"
                                            >
                                                View on GitHub →
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Competitive Programming */}
                    {portfolio?.data_sources?.competitive_programming && (
                        <section>
                            <h2 className="text-3xl font-bold text-white mb-4 pb-2 border-b border-gray-700">
                                Competitive Programming
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {portfolio.data_sources.competitive_programming.codeforces && (
                                    <div className="bg-gradient-to-br from-orange-900/20 to-orange-800/20 p-6 rounded-xl border border-orange-500/30">
                                        <h3 className="text-xl font-semibold text-white mb-4">Codeforces</h3>
                                        <div className="space-y-2 text-gray-300">
                                            <p><span className="text-gray-400">Username:</span> {portfolio.data_sources.competitive_programming.codeforces.username}</p>
                                            <p><span className="text-gray-400">Rating:</span> <span className="text-orange-400 font-bold text-2xl">{portfolio.data_sources.competitive_programming.codeforces.current_rating}</span></p>
                                            <p><span className="text-gray-400">Max Rating:</span> {portfolio.data_sources.competitive_programming.codeforces.max_rating}</p>
                                            <p><span className="text-gray-400">Rank:</span> <span className="capitalize">{portfolio.data_sources.competitive_programming.codeforces.rank}</span></p>
                                            <p><span className="text-gray-400">Contests:</span> {portfolio.data_sources.competitive_programming.codeforces.contest_count}</p>
                                            <p><span className="text-gray-400">Problems Solved:</span> {portfolio.data_sources.competitive_programming.codeforces.problems_solved}</p>
                                            <a
                                                href={`https://codeforces.com/profile/${portfolio.data_sources.competitive_programming.codeforces.username}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-orange-400 hover:text-orange-300 inline-block mt-2"
                                            >
                                                View Profile →
                                            </a>
                                        </div>
                                    </div>
                                )}
                                {portfolio.data_sources.competitive_programming.leetcode && (
                                    <div className="bg-gradient-to-br from-yellow-900/20 to-yellow-800/20 p-6 rounded-xl border border-yellow-500/30">
                                        <h3 className="text-xl font-semibold text-white mb-4">LeetCode</h3>
                                        <div className="space-y-2 text-gray-300">
                                            <p><span className="text-gray-400">Username:</span> {portfolio.data_sources.competitive_programming.leetcode.username}</p>
                                            <p><span className="text-gray-400">Total Solved:</span> <span className="text-yellow-400 font-bold text-2xl">{portfolio.data_sources.competitive_programming.leetcode.total_solved}</span></p>
                                            <p><span className="text-gray-400">Easy:</span> {portfolio.data_sources.competitive_programming.leetcode.breakdown.easy}</p>
                                            <p><span className="text-gray-400">Medium:</span> {portfolio.data_sources.competitive_programming.leetcode.breakdown.medium}</p>
                                            <p><span className="text-gray-400">Hard:</span> {portfolio.data_sources.competitive_programming.leetcode.breakdown.hard}</p>
                                            {portfolio.data_sources.competitive_programming.leetcode.profile_url && (
                                                <a
                                                    href={portfolio.data_sources.competitive_programming.leetcode.profile_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-yellow-400 hover:text-yellow-300 inline-block mt-2"
                                                >
                                                    View Profile →
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    {/* Code Quality Metrics */}
                    {portfolio?.code_quality_metrics && (
                        <section>
                            <h2 className="text-3xl font-bold text-white mb-4 pb-2 border-b border-gray-700">
                                Code Quality
                            </h2>
                            <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    {Object.entries(portfolio.code_quality_metrics).map(([key, value]) => (
                                        <div key={key} className="text-center">
                                            <div className="text-3xl font-bold text-blue-400 mb-2">
                                                {typeof value === 'number' ? value.toFixed(1) : value}
                                            </div>
                                            <div className="text-gray-400 text-sm capitalize">
                                                {key.replace(/_/g, ' ')}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Contact Info */}
                    {portfolio?.ai_generated_content?.contact_info && (
                        <section>
                            <h2 className="text-3xl font-bold text-white mb-4 pb-2 border-b border-gray-700">
                                Get in Touch
                            </h2>
                            <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 p-6 rounded-xl border border-indigo-500/30">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                                    {portfolio.ai_generated_content.contact_info.email && (
                                        <a
                                            href={`mailto:${portfolio.ai_generated_content.contact_info.email}`}
                                            className="flex flex-col items-center justify-center p-4 bg-gray-900/50 rounded-lg hover:bg-gray-900/70 transition"
                                        >
                                            <span className="text-2xl mb-2">📧</span>
                                            <span className="text-gray-400 text-sm mb-1">Email</span>
                                            <span className="text-blue-400">{portfolio.ai_generated_content.contact_info.email}</span>
                                        </a>
                                    )}
                                    {portfolio.ai_generated_content.contact_info.linkedin && (
                                        <a
                                            href={portfolio.ai_generated_content.contact_info.linkedin}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex flex-col items-center justify-center p-4 bg-gray-900/50 rounded-lg hover:bg-gray-900/70 transition"
                                        >
                                            <span className="text-2xl mb-2">💼</span>
                                            <span className="text-gray-400 text-sm mb-1">LinkedIn</span>
                                            <span className="text-blue-400">View Profile</span>
                                        </a>
                                    )}
                                    {portfolio.ai_generated_content.contact_info.github && (
                                        <a
                                            href={portfolio.ai_generated_content.contact_info.github}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex flex-col items-center justify-center p-4 bg-gray-900/50 rounded-lg hover:bg-gray-900/70 transition"
                                        >
                                            <span className="text-2xl mb-2">💻</span>
                                            <span className="text-gray-400 text-sm mb-1">GitHub</span>
                                            <span className="text-blue-400">View Repositories</span>
                                        </a>
                                    )}
                                </div>
                            </div>
                        </section>
                    )}
                </div>

                {/* Footer */}
                <div className="text-center mt-12 text-gray-500">
                </div>
            </div>
        </div>
    );
}
