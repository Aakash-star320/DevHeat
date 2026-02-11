import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import portfolioService from '../services/portfolioService';

export default function RefinePortfolio() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [portfolio, setPortfolio] = useState(null);
    const [versions, setVersions] = useState([]);
    const [selectedVersion, setSelectedVersion] = useState(null);
    const [error, setError] = useState(null);
    const [refining, setRefining] = useState(false);
    const [refinementInstruction, setRefinementInstruction] = useState('');
    const [activeTab, setActiveTab] = useState('portfolio');
    const [coachingData, setCoachingData] = useState(null);
    const [loadingCoaching, setLoadingCoaching] = useState(false);

    useEffect(() => {
        loadPortfolio();
        loadVersions();
        loadCoachingInsights(); // Auto-load coaching insights
    }, [slug]);

    const loadPortfolio = async () => {
        try {
            setLoading(true);
            const data = await portfolioService.getPortfolio(slug);
            setPortfolio(data);
            setError(null);
        } catch (err) {
            setError('Failed to load portfolio');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const loadVersions = async () => {
        try {
            const data = await portfolioService.getVersionHistory(slug);
            setVersions(data.versions || []);
        } catch (err) {
            console.error('Failed to load versions:', err);
        }
    };

    const loadCoachingInsights = async () => {
        try {
            setLoadingCoaching(true);
            const coaching = await portfolioService.getCoaching(slug);
            setCoachingData(coaching);
        } catch (err) {
            alert('Failed to load coaching insights: ' + (err.response?.data?.detail || err.message));
        } finally {
            setLoadingCoaching(false);
        }
    };

    const handleRefine = async () => {
        if (!refinementInstruction.trim()) {
            alert('Please enter refinement instructions');
            return;
        }

        try {
            setRefining(true);
            const result = await portfolioService.refinePortfolio(slug, {
                instruction: refinementInstruction,
                sections: ['all'],
            });
            setPortfolio(result.portfolio_json);
            setRefinementInstruction('');
            await loadVersions();
            alert('Portfolio refined successfully! Review and confirm to save changes.');
        } catch (err) {
            alert('Failed to refine portfolio: ' + (err.response?.data?.detail || err.message));
        } finally {
            setRefining(false);
        }
    };

    const handleConfirm = async () => {
        if (!confirm('Are you sure you want to confirm this version? This will become the new committed version.')) {
            return;
        }

        try {
            await portfolioService.confirmPortfolio(slug);
            await loadVersions();
            alert('Portfolio confirmed successfully!');
        } catch (err) {
            alert('Failed to confirm portfolio: ' + (err.response?.data?.detail || err.message));
        }
    };

    const handleRevert = async (versionId) => {
        if (!confirm('Are you sure you want to revert to this version? All other versions will be deleted.')) {
            return;
        }

        try {
            await portfolioService.revertPortfolio(slug, versionId);
            await loadPortfolio();
            await loadVersions();
            alert('Portfolio reverted successfully!');
        } catch (err) {
            alert('Failed to revert portfolio: ' + (err.response?.data?.detail || err.message));
        }
    };

    const handleViewVersion = async (versionId) => {
        try {
            const versionData = await portfolioService.getVersion(slug, versionId);
            setSelectedVersion(versionData);
            setPortfolio(versionData.portfolio_json);
        } catch (err) {
            alert('Failed to load version: ' + (err.response?.data?.detail || err.message));
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
                <div className="text-white text-xl">Loading portfolio...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-400 text-xl mb-4">{error}</div>
                    <button
                        onClick={() => navigate('/generate')}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                    >
                        Generate New Portfolio
                    </button>
                </div>
            </div>
        );
    }

    const hasDraft = versions.some(v => v.version_state === 'draft');

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-16 px-6 md:px-16 lg:px-24 xl:px-32">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/')}
                        className="text-gray-400 hover:text-white mb-4 flex items-center gap-2"
                    >
                        ← Back to Home
                    </button>
                    <h1 className="text-4xl font-bold text-white mb-2">
                        {portfolio?.personal_info?.name}'s Portfolio
                    </h1>
                    <p className="text-gray-400">Refine and manage your AI-generated portfolio</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Panel - Portfolio Content */}
                    <div className="lg:col-span-2">
                        {/* Tabs */}
                        <div className="flex gap-4 mb-6 border-b border-gray-700">
                            <button
                                onClick={() => setActiveTab('portfolio')}
                                className={`pb-3 px-4 transition ${activeTab === 'portfolio'
                                    ? 'text-blue-500 border-b-2 border-blue-500'
                                    : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                Portfolio
                            </button>
                            <button
                                onClick={() => setActiveTab('coaching')}
                                className={`pb-3 px-4 transition ${activeTab === 'coaching'
                                    ? 'text-blue-500 border-b-2 border-blue-500'
                                    : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                Personalized Insights
                            </button>
                        </div>

                        {/* Content */}
                        <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-gray-700">
                            {activeTab === 'portfolio' ? (
                                <div className="space-y-6">
                                    {/* Professional Summary */}
                                    {portfolio?.ai_generated_content?.professional_summary && (
                                        <div>
                                            <h2 className="text-2xl font-bold text-white mb-3">About Me</h2>
                                            <p className="text-gray-300 leading-relaxed">
                                                {portfolio.ai_generated_content.professional_summary}
                                            </p>
                                        </div>
                                    )}

                                    {/* Key Strengths */}
                                    {portfolio?.ai_generated_content?.key_strengths?.length > 0 && (
                                        <div>
                                            <h2 className="text-2xl font-bold text-white mb-3">Key Strengths</h2>
                                            <ul className="space-y-2">
                                                {portfolio.ai_generated_content.key_strengths.map((strength, idx) => (
                                                    <li key={idx} className="text-gray-300 flex items-start">
                                                        <span className="text-blue-500 mr-2">•</span>
                                                        {strength}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Project Highlights */}
                                    {portfolio?.ai_generated_content?.project_highlights?.length > 0 && (
                                        <div>
                                            <h2 className="text-2xl font-bold text-white mb-3">Featured Projects</h2>
                                            <div className="space-y-4">
                                                {portfolio.ai_generated_content.project_highlights.map((project, idx) => (
                                                    <div key={idx} className="bg-gray-900/50 p-4 rounded-lg">
                                                        <h3 className="text-xl font-semibold text-white mb-2">
                                                            {project.title || `Project ${idx + 1}`}
                                                        </h3>
                                                        <p className="text-gray-400">{project.description || project}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Skills */}
                                    {portfolio?.ai_generated_content?.skills?.length > 0 && (
                                        <div>
                                            <h2 className="text-2xl font-bold text-white mb-3">Technical Skills</h2>
                                            <div className="flex flex-wrap gap-2">
                                                {portfolio.ai_generated_content.skills.map((skill, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="px-4 py-2 bg-blue-600/20 border border-blue-500/50 rounded-full text-blue-300"
                                                    >
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Work Experience */}
                                    {portfolio?.ai_generated_content?.work_experience?.length > 0 && (
                                        <div>
                                            <h2 className="text-2xl font-bold text-white mb-3">Work Experience</h2>
                                            <div className="space-y-4">
                                                {portfolio.ai_generated_content.work_experience.map((exp, idx) => (
                                                    <div key={idx} className="bg-gray-900/50 p-4 rounded-lg">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div>
                                                                <h3 className="text-lg font-semibold text-white">{exp.title}</h3>
                                                                <p className="text-blue-400">{exp.company}</p>
                                                            </div>
                                                            <span className="text-gray-400 text-sm">{exp.duration}</span>
                                                        </div>
                                                        {exp.description_bullets && (
                                                            <ul className="space-y-1 mt-2">
                                                                {exp.description_bullets.map((bullet, bIdx) => (
                                                                    <li key={bIdx} className="flex items-start text-gray-300 text-sm">
                                                                        <span className="text-blue-500 mr-2">•</span>
                                                                        {bullet}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Achievements */}
                                    {portfolio?.ai_generated_content?.achievements?.length > 0 && (
                                        <div>
                                            <h2 className="text-2xl font-bold text-white mb-3">Achievements</h2>
                                            <ul className="space-y-2">
                                                {portfolio.ai_generated_content.achievements.map((achievement, idx) => (
                                                    <li key={idx} className="flex items-start bg-gray-900/50 p-3 rounded-lg">
                                                        <span className="text-yellow-500 mr-2">🏆</span>
                                                        <span className="text-gray-300">{achievement}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Skills & Technologies */}
                                    {portfolio?.ai_generated_content?.skills_summary && (
                                        <div>
                                            <h2 className="text-2xl font-bold text-white mb-3">Skills & Technologies</h2>
                                            <div className="space-y-4">
                                                {portfolio.ai_generated_content.skills_summary.languages && (
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-white mb-2">Languages</h3>
                                                        <div className="flex flex-wrap gap-2">
                                                            {portfolio.ai_generated_content.skills_summary.languages.map((lang, idx) => (
                                                                <span key={idx} className="px-3 py-1 bg-blue-600/20 border border-blue-500/50 rounded-lg text-blue-300 text-sm">
                                                                    {lang}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                {portfolio.ai_generated_content.skills_summary.frameworks && (
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-white mb-2">Frameworks & Libraries</h3>
                                                        <div className="flex flex-wrap gap-2">
                                                            {portfolio.ai_generated_content.skills_summary.frameworks.map((framework, idx) => (
                                                                <span key={idx} className="px-3 py-1 bg-purple-600/20 border border-purple-500/50 rounded-lg text-purple-300 text-sm">
                                                                    {framework}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                {portfolio.ai_generated_content.skills_summary.tools && (
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-white mb-2">Tools & Technologies</h3>
                                                        <div className="flex flex-wrap gap-2">
                                                            {portfolio.ai_generated_content.skills_summary.tools.map((tool, idx) => (
                                                                <span key={idx} className="px-3 py-1 bg-green-600/20 border border-green-500/50 rounded-lg text-green-300 text-sm">
                                                                    {tool}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Projects (GitHub) */}
                                    {portfolio?.data_sources?.github_projects?.length > 0 && (
                                        <div>
                                            <h2 className="text-2xl font-bold text-white mb-3">Projects</h2>
                                            <div className="space-y-3">
                                                {portfolio.data_sources.github_projects.map((project, idx) => (
                                                    <div key={idx} className="bg-gray-900/50 p-4 rounded-lg">
                                                        <div className="flex items-start justify-between mb-2">
                                                            <h3 className="text-lg font-semibold text-white">{project.name}</h3>
                                                            {project.language && (
                                                                <span className="px-2 py-1 bg-purple-600/20 border border-purple-500/50 rounded-full text-purple-300 text-xs">
                                                                    {project.language}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {project.description && project.description.trim() && (
                                                            <p className="text-gray-400 text-sm mb-2">{project.description}</p>
                                                        )}
                                                        {project.github_url && (
                                                            <a
                                                                href={project.github_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-blue-400 hover:text-blue-300 text-xs"
                                                            >
                                                                View on GitHub →
                                                            </a>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Competitive Programming */}
                                    {portfolio?.data_sources?.competitive_programming && (
                                        <div>
                                            <h2 className="text-2xl font-bold text-white mb-3">Competitive Programming</h2>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {portfolio.data_sources.competitive_programming.codeforces && (
                                                    <div className="bg-gradient-to-br from-orange-900/20 to-orange-800/20 p-4 rounded-lg border border-orange-500/30">
                                                        <h3 className="text-lg font-semibold text-white mb-2">Codeforces</h3>
                                                        <div className="space-y-1 text-sm text-gray-300">
                                                            <p><span className="text-gray-400">Username:</span> {portfolio.data_sources.competitive_programming.codeforces.username}</p>
                                                            <p><span className="text-gray-400">Rating:</span> <span className="text-orange-400 font-bold">{portfolio.data_sources.competitive_programming.codeforces.current_rating}</span></p>
                                                            <p><span className="text-gray-400">Max Rating:</span> {portfolio.data_sources.competitive_programming.codeforces.max_rating}</p>
                                                            <p><span className="text-gray-400">Rank:</span> <span className="capitalize">{portfolio.data_sources.competitive_programming.codeforces.rank}</span></p>
                                                            <p><span className="text-gray-400">Problems Solved:</span> {portfolio.data_sources.competitive_programming.codeforces.problems_solved}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {portfolio.data_sources.competitive_programming.leetcode && (
                                                    <div className="bg-gradient-to-br from-yellow-900/20 to-yellow-800/20 p-4 rounded-lg border border-yellow-500/30">
                                                        <h3 className="text-lg font-semibold text-white mb-2">LeetCode</h3>
                                                        <div className="space-y-1 text-sm text-gray-300">
                                                            <p><span className="text-gray-400">Username:</span> {portfolio.data_sources.competitive_programming.leetcode.username}</p>
                                                            <p><span className="text-gray-400">Total Solved:</span> <span className="text-yellow-400 font-bold">{portfolio.data_sources.competitive_programming.leetcode.total_solved}</span></p>
                                                            <p><span className="text-gray-400">Easy:</span> {portfolio.data_sources.competitive_programming.leetcode.breakdown.easy}</p>
                                                            <p><span className="text-gray-400">Medium:</span> {portfolio.data_sources.competitive_programming.leetcode.breakdown.medium}</p>
                                                            <p><span className="text-gray-400">Hard:</span> {portfolio.data_sources.competitive_programming.leetcode.breakdown.hard}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Code Quality */}
                                    {portfolio?.code_quality_metrics && (
                                        <div>
                                            <h2 className="text-2xl font-bold text-white mb-3">Code Quality</h2>
                                            <div className="bg-gray-900/50 p-4 rounded-lg">
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    {Object.entries(portfolio.code_quality_metrics).map(([key, value]) => (
                                                        <div key={key} className="text-center">
                                                            <div className="text-2xl font-bold text-blue-400 mb-1">
                                                                {typeof value === 'number' ? value.toFixed(1) : value}
                                                            </div>
                                                            <div className="text-gray-400 text-xs capitalize">
                                                                {key.replace(/_/g, ' ')}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Get in Touch */}
                                    {portfolio?.ai_generated_content?.contact_info && (
                                        <div>
                                            <h2 className="text-2xl font-bold text-white mb-3">Get in Touch</h2>
                                            <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 p-4 rounded-lg border border-indigo-500/30">
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                    {portfolio.ai_generated_content.contact_info.email && (
                                                        <div className="text-center p-3 bg-gray-900/50 rounded-lg">
                                                            <span className="text-xl mb-1 block">📧</span>
                                                            <span className="text-gray-400 text-xs block mb-1">Email</span>
                                                            <span className="text-blue-400 text-sm">{portfolio.ai_generated_content.contact_info.email}</span>
                                                        </div>
                                                    )}
                                                    {portfolio.ai_generated_content.contact_info.linkedin && (
                                                        <div className="text-center p-3 bg-gray-900/50 rounded-lg">
                                                            <span className="text-xl mb-1 block">💼</span>
                                                            <span className="text-gray-400 text-xs block mb-1">LinkedIn</span>
                                                            <a href={portfolio.ai_generated_content.contact_info.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-400 text-sm">View Profile</a>
                                                        </div>
                                                    )}
                                                    {portfolio.ai_generated_content.contact_info.github && (
                                                        <div className="text-center p-3 bg-gray-900/50 rounded-lg">
                                                            <span className="text-xl mb-1 block">💻</span>
                                                            <span className="text-gray-400 text-xs block mb-1">GitHub</span>
                                                            <a href={portfolio.ai_generated_content.contact_info.github} target="_blank" rel="noopener noreferrer" className="text-blue-400 text-sm">View Repos</a>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div>
                                    {!coachingData ? (
                                        <div className="text-center py-8">
                                            <p className="text-gray-400 mb-6">
                                                Get personalized insights based on your portfolio
                                            </p>
                                            <button
                                                onClick={loadCoachingInsights}
                                                disabled={loadingCoaching}
                                                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition disabled:opacity-50"
                                            >
                                                {loadingCoaching ? 'Loading...' : 'Load Personalized Insights'}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            {/* Skill Analysis */}
                                            {coachingData.skill_analysis && (
                                                <div>
                                                    {coachingData.skill_analysis.strengths?.length > 0 && (
                                                        <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-6 mb-6">
                                                            <h3 className="text-xl font-semibold text-white mb-3 flex items-center">
                                                                <span className="mr-2">💪</span>
                                                                Your Strengths
                                                            </h3>
                                                            <ul className="space-y-2">
                                                                {coachingData.skill_analysis.strengths.map((strength, idx) => (
                                                                    <li key={idx} className="text-gray-300 flex items-start">
                                                                        <span className="text-green-400 mr-2">✓</span>
                                                                        {strength}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}

                                                    {coachingData.skill_analysis.gaps?.length > 0 && (
                                                        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-6">
                                                            <h3 className="text-xl font-semibold text-white mb-3 flex items-center">
                                                                <span className="mr-2">🎯</span>
                                                                Skill Gaps to Address
                                                            </h3>
                                                            <ul className="space-y-2">
                                                                {coachingData.skill_analysis.gaps.map((gap, idx) => (
                                                                    <li key={idx} className="text-gray-300 flex items-start">
                                                                        <span className="text-yellow-400 mr-2">•</span>
                                                                        {gap}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Learning Path */}
                                            {coachingData.learning_path && (
                                                <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-6">
                                                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                                                        <span className="mr-2">📚</span>
                                                        Learning Path
                                                    </h3>
                                                    <div className="space-y-4">
                                                        {coachingData.learning_path.immediate?.length > 0 && (
                                                            <div>
                                                                <h4 className="text-white font-medium mb-2">Immediate Actions</h4>
                                                                <ul className="space-y-1">
                                                                    {coachingData.learning_path.immediate.map((step, idx) => (
                                                                        <li key={idx} className="text-gray-300 text-sm flex items-start">
                                                                            <span className="text-blue-400 mr-2">→</span>
                                                                            {step}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                        {coachingData.learning_path.short_term?.length > 0 && (
                                                            <div>
                                                                <h4 className="text-white font-medium mb-2">3-6 Month Goals</h4>
                                                                <ul className="space-y-1">
                                                                    {coachingData.learning_path.short_term.map((step, idx) => (
                                                                        <li key={idx} className="text-gray-300 text-sm flex items-start">
                                                                            <span className="text-blue-400 mr-2">→</span>
                                                                            {step}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                        {coachingData.learning_path.long_term?.length > 0 && (
                                                            <div>
                                                                <h4 className="text-white font-medium mb-2">Long-term Career Goals</h4>
                                                                <ul className="space-y-1">
                                                                    {coachingData.learning_path.long_term.map((step, idx) => (
                                                                        <li key={idx} className="text-gray-300 text-sm flex items-start">
                                                                            <span className="text-blue-400 mr-2">→</span>
                                                                            {step}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Interview Prep */}
                                            {coachingData.interview_prep && (
                                                <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-6">
                                                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                                                        <span className="mr-2">💼</span>
                                                        Interview Preparation
                                                    </h3>
                                                    <div className="space-y-4">
                                                        {coachingData.interview_prep.likely_questions?.length > 0 && (
                                                            <div>
                                                                <h4 className="text-white font-medium mb-2">Likely Questions</h4>
                                                                <ul className="space-y-2">
                                                                    {coachingData.interview_prep.likely_questions.map((q, idx) => (
                                                                        <li key={idx} className="text-gray-300 text-sm flex items-start">
                                                                            <span className="text-purple-400 mr-2">Q{idx + 1}:</span>
                                                                            {q}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                        {coachingData.interview_prep.talking_points?.length > 0 && (
                                                            <div>
                                                                <h4 className="text-white font-medium mb-2">Key Talking Points</h4>
                                                                <ul className="space-y-1">
                                                                    {coachingData.interview_prep.talking_points.map((point, idx) => (
                                                                        <li key={idx} className="text-gray-300 text-sm flex items-start">
                                                                            <span className="text-purple-400 mr-2">•</span>
                                                                            {point}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Market Positioning */}
                                            {coachingData.market_positioning && (
                                                <div className="bg-indigo-900/20 border border-indigo-500/30 rounded-xl p-6">
                                                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                                                        <span className="mr-2">🎯</span>
                                                        Market Positioning
                                                    </h3>
                                                    <div className="space-y-4">
                                                        {coachingData.market_positioning.target_roles?.length > 0 && (
                                                            <div>
                                                                <h4 className="text-white font-medium mb-2">Target Roles</h4>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {coachingData.market_positioning.target_roles.map((role, idx) => (
                                                                        <span key={idx} className="px-3 py-1 bg-indigo-600/20 border border-indigo-500/50 rounded-full text-indigo-300 text-sm">
                                                                            {role}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                        {coachingData.market_positioning.competitive_advantages?.length > 0 && (
                                                            <div>
                                                                <h4 className="text-white font-medium mb-2">Your Competitive Advantages</h4>
                                                                <ul className="space-y-1">
                                                                    {coachingData.market_positioning.competitive_advantages.map((adv, idx) => (
                                                                        <li key={idx} className="text-gray-300 text-sm flex items-start">
                                                                            <span className="text-indigo-400 mr-2">✓</span>
                                                                            {adv}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                        {coachingData.market_positioning.resume_improvements?.length > 0 && (
                                                            <div>
                                                                <h4 className="text-white font-medium mb-2">Resume Improvements</h4>
                                                                <ul className="space-y-1">
                                                                    {coachingData.market_positioning.resume_improvements.map((imp, idx) => (
                                                                        <li key={idx} className="text-gray-300 text-sm flex items-start">
                                                                            <span className="text-indigo-400 mr-2">→</span>
                                                                            {imp}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            <button
                                                onClick={loadCoachingInsights}
                                                disabled={loadingCoaching}
                                                className="w-full py-3 bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 rounded-lg transition disabled:opacity-50 border border-purple-500/50"
                                            >
                                                {loadingCoaching ? 'Refreshing...' : 'Refresh Insights'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Panel - Actions & Versions */}
                    <div className="space-y-6">
                        {/* AI Refinement */}
                        <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-gray-700">
                            <h3 className="text-xl font-bold text-white mb-4">AI Refinement</h3>
                            <textarea
                                value={refinementInstruction}
                                onChange={(e) => setRefinementInstruction(e.target.value)}
                                placeholder="E.g., Make the professional summary more concise and emphasize backend skills"
                                rows="4"
                                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition mb-4"
                            />
                            <button
                                onClick={handleRefine}
                                disabled={refining}
                                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
                            >
                                {refining ? 'Refining...' : 'Refine with AI'}
                            </button>

                            {hasDraft && (
                                <button
                                    onClick={handleConfirm}
                                    className="w-full mt-3 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition"
                                >
                                    Confirm Current Version
                                </button>
                            )}
                        </div>

                        {/* Version History */}
                        <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-gray-700">
                            <h3 className="text-xl font-bold text-white mb-4">Version History</h3>
                            <div className="space-y-3">
                                {versions.length === 0 ? (
                                    <p className="text-gray-400 text-sm">No versions yet</p>
                                ) : (
                                    versions.map((version) => (
                                        <div
                                            key={version.id}
                                            className="bg-gray-900/50 p-4 rounded-lg border border-gray-700"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-white font-medium">
                                                    Version {version.version_number}
                                                </span>
                                            </div>
                                            <p className="text-gray-400 text-sm mb-3">
                                                {version.changes_summary}
                                            </p>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleViewVersion(version.id)}
                                                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition"
                                                >
                                                    View
                                                </button>
                                                {version.version_state === 'committed' && (
                                                    <button
                                                        onClick={() => handleRevert(version.id)}
                                                        className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded transition"
                                                    >
                                                        Revert
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-gray-700">
                            <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
                            <div className="space-y-3">
                                <button
                                    onClick={() => window.open(`/portfolio/${slug}`, '_blank')}
                                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                                >
                                    View Public Portfolio
                                </button>
                                <button
                                    onClick={() => navigate('/generate')}
                                    className="w-full py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition"
                                >
                                    Generate New Portfolio
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
