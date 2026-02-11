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
                                            <h2 className="text-2xl font-bold text-white mb-3">Professional Summary</h2>
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
                                            <h2 className="text-2xl font-bold text-white mb-3">Project Highlights</h2>
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
                                            <h2 className="text-2xl font-bold text-white mb-3">Skills</h2>
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
