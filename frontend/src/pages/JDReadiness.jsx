import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
    ArrowRight, CheckCircle2, ChevronDown, CircleAlert, Code2, FileText,
    Lightbulb, LoaderCircle, Radar, ShieldCheck, Sparkles, Target, TrendingUp,
} from 'lucide-react';
import Navbar from '../components/navbar';
import Footer from '../components/footer';
import LenisScroll from '../components/lenis-scroll';
import { useAuth } from '../hooks/useAuth';
import authService from '../services/authService';
import jdMatchService from '../services/jdMatchService';
import './JDReadiness.css';

const SECTION_META = {
    requirements: { label: 'Role requirements', icon: Target, accent: 'violet' },
    tools: { label: 'Required tools', icon: Code2, accent: 'cyan' },
};

const scoreLabel = (score) => {
    if (score >= 80) return 'Strong fit';
    if (score >= 60) return 'Promising fit';
    if (score >= 40) return 'Developing fit';
    return 'Early fit';
};

const statusClass = (status) => status?.toLowerCase() || 'weak';

function StatusPill({ status }) {
    return <span className={`jd-status ${statusClass(status)}`}>{status}</span>;
}

function DetailGroup({ group, section }) {
    return (
        <details className="jd-detail-group">
            <summary>
                <div>
                    <span className="jd-source-label">{group.label}</span>
                    <small>{group.logic.replaceAll('_', ' ')}{group.logic === 'at_least_n' ? ` · ${group.minimum_matches} needed` : ''}</small>
                </div>
                <ChevronDown size={17} />
            </summary>
            <p className="jd-source-text">“{group.source_text}”</p>
            <div className="jd-item-list">
                {group.items.map((item, index) => (
                    <div className="jd-item" key={`${item.name}-${index}`}>
                        <div className="jd-item-heading">
                            <strong>{item.name}</strong>
                            <div className="jd-item-labels">
                                {section === 'tools' && <span className="jd-level">{item.required_level}</span>}
                                <StatusPill status={item.match} />
                            </div>
                        </div>
                        {item.evidence && <p><b>Resume evidence:</b> {item.evidence}</p>}
                        {item.match !== 'Strong' && item.improvement && <p className="jd-improvement"><b>How to improve:</b> {item.improvement}</p>}
                    </div>
                ))}
            </div>
        </details>
    );
}

export default function JDReadiness() {
    const { user, loading: authLoading } = useAuth();
    const [jobDescription, setJobDescription] = useState('');
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!authLoading && !user) {
            sessionStorage.setItem('redirectAfterLogin', '/jd-readiness');
            authService.login();
        }
    }, [authLoading, user]);

    const sectionEntries = useMemo(() => (
        report ? Object.entries(SECTION_META).filter(([key]) => Number.isFinite(report.section_scores[key])) : []
    ), [report]);

    const handleAnalyze = async (event) => {
        event.preventDefault();
        if (jobDescription.trim().length < 80 || loading) return;
        setLoading(true);
        setError('');
        try {
            setReport(await jdMatchService.analyze(jobDescription.trim()));
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (requestError) {
            setError(requestError.response?.data?.detail || 'We could not analyse this job description. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || !user) return null;

    return (
        <>
            <LenisScroll />
            <div className="jd-page">
                <Navbar />
                <main className="jd-main">
                    <motion.section
                        className="jd-hero"
                        initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .45 }}
                    >
                        <div className="jd-hero-glow jd-hero-glow-one" />
                        <div className="jd-hero-glow jd-hero-glow-two" />
                        <div className="jd-kicker"><Radar size={14} /> RESUME-BASED READINESS</div>
                        <h1>See how your profile<br /><span>aligns with the role.</span></h1>
                        <p>Your report compares this role only with your stored resume—no vague AI score, no GitHub assumptions.</p>
                        <div className="jd-trust-row">
                            <span><ShieldCheck size={15} /> Resume only</span>
                            <span><Target size={15} /> Deterministic scoring</span>
                            <span><Sparkles size={15} /> Gemini analysis</span>
                        </div>
                    </motion.section>

                    {!report ? (
                        <motion.section
                            className="jd-input-shell"
                            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .1, duration: .45 }}
                        >
                            <div className="jd-input-heading">
                                <div className="jd-input-icon"><FileText size={21} /></div>
                                <div><span>THE ROLE</span><h2>Paste the job description</h2></div>
                            </div>
                            <form onSubmit={handleAnalyze}>
                                <textarea
                                    value={jobDescription}
                                    onChange={(event) => setJobDescription(event.target.value)}
                                    placeholder="Paste the complete job description here…"
                                    maxLength={30000}
                                    aria-label="Job description"
                                />
                                <div className="jd-input-footer">
                                    <span>{jobDescription.length ? `${jobDescription.length.toLocaleString()} characters` : 'Minimum 80 characters'}</span>
                                    <button type="submit" disabled={loading || jobDescription.trim().length < 80}>
                                        {loading ? <LoaderCircle className="jd-spin" size={18} /> : <Radar size={18} />}
                                        {loading ? 'Building your report…' : 'Check my readiness'}
                                        {!loading && <ArrowRight size={17} />}
                                    </button>
                                </div>
                            </form>
                            {loading && <p className="jd-loading-note">Gemini is mapping the JD to your resume. It can take a few seconds.</p>}
                            {error && <p className="jd-error"><CircleAlert size={17} /> {error}</p>}
                        </motion.section>
                    ) : (
                        <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="jd-report">
                            <div className="jd-report-toolbar">
                                <div><span>YOUR READINESS REPORT</span><h2>Resume match for this role</h2></div>
                                <button onClick={() => { setReport(null); setError(''); }}><FileText size={16} /> Analyse another JD</button>
                            </div>
                            <div className="jd-score-layout">
                                <div className="jd-score-card">
                                    <div className="jd-score-orbit" style={{ '--score': `${report.score * 3.6}deg` }}>
                                        <div><strong>{report.score}</strong><span>/100</span></div>
                                    </div>
                                    <div className="jd-score-copy"><span>PROFILE READINESS</span><h2>{scoreLabel(report.score)}</h2><p>Your score is calculated in code from the structured matches below.</p></div>
                                </div>
                                <div className="jd-section-scores">
                                    {sectionEntries.map(([key, meta]) => {
                                        const Icon = meta.icon;
                                        return <div className={`jd-section-score ${meta.accent}`} key={key}>
                                            <Icon size={18} /><div><span>{meta.label}</span><strong>{report.section_scores[key]}<small>/100</small></strong></div><em>{report.weights[key]} pts</em>
                                        </div>;
                                    })}
                                </div>
                            </div>

                            <div className="jd-insight-grid">
                                <article className="jd-insight-card strengths-card">
                                    <div className="jd-card-title"><CheckCircle2 size={19} /><div><span>YOUR ADVANTAGE</span><h3>Top strengths</h3></div></div>
                                    {report.strengths.length ? report.strengths.map((item, index) => (
                                        <div className="jd-insight-row" key={`${item.name}-${index}`}><span className="jd-number">0{index + 1}</span><div><strong>{item.name}</strong><p>{item.evidence || item.requirement}</p></div></div>
                                    )) : <p className="jd-empty-note">No high-confidence strengths were found in this JD.</p>}
                                </article>
                                <article className="jd-insight-card gaps-card">
                                    <div className="jd-card-title"><TrendingUp size={19} /><div><span>BEST NEXT MOVES</span><h3>Close these gaps</h3></div></div>
                                    {report.gaps.slice(0, 5).map((item, index) => (
                                        <div className="jd-insight-row" key={`${item.name}-${index}`}><StatusPill status={item.match} /><div><strong>{item.name}</strong><p>{item.improvement || `Build clearer resume evidence for ${item.requirement}.`}</p></div></div>
                                    ))}
                                </article>
                            </div>

                            <article className="jd-tips-card">
                                <div className="jd-card-title"><Lightbulb size={19} /><div><span>APPLICATION PLAN</span><h3>How to position yourself</h3></div></div>
                                <div className="jd-tips-list">{report.tips.map((tip, index) => <p key={index}><span>{index + 1}</span>{tip}</p>)}</div>
                            </article>

                            <section className="jd-breakdown">
                                <div className="jd-breakdown-heading"><div><span>THE EVIDENCE</span><h2>Full JD breakdown</h2></div><p>Strong = direct resume evidence · Medium = listed or partial evidence · Weak = not shown in your resume</p></div>
                                {Object.entries(SECTION_META).map(([section, meta]) => {
                                    const groups = report.analysis[section] || [];
                                    const Icon = meta.icon;
                                    if (!groups.length) return null;
                                    return <article className="jd-section-breakdown" key={section}>
                                        <div className={`jd-breakdown-section-label ${meta.accent}`}><Icon size={17} /><span>{meta.label}</span><em>{report.section_scores[section]}/100</em></div>
                                        {groups.map((group, index) => <DetailGroup group={group} section={section} key={`${group.label}-${index}`} />)}
                                    </article>;
                                })}
                            </section>
                        </motion.section>
                    )}
                </main>
                <Footer />
            </div>
        </>
    );
}
