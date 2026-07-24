import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Activity, ArrowDownRight, ArrowUpRight, Award, Check, ChevronRight, Code2,
    Github, Linkedin, Mail, Menu, Sparkles,
    Trophy, X,
} from 'lucide-react';
import portfolioService from '../services/portfolioService';
import './ViewPortfolio.css';

const asList = (value) => Array.isArray(value) ? value.filter(Boolean) : [];
const niceFocus = (value) => value ? value.replace(/[-_]/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()) : 'Software';
const compactValue = (value) => typeof value === 'number' ? value.toLocaleString() : value;

function SectionHeading({ eyebrow, title, copy }) {
    return (
        <div className="folio-section-heading">
            <span>{eyebrow}</span>
            <h2>{title}</h2>
            {copy && <p>{copy}</p>}
        </div>
    );
}

function ProjectCard({ project, index }) {
    const isString = typeof project === 'string';
    const name = isString ? `Selected project ${String(index + 1).padStart(2, '0')}` : (project.name || project.title || `Selected project ${String(index + 1).padStart(2, '0')}`);
    const description = isString ? project : (project.description || project.summary || 'A focused software project built to solve a practical problem.');
    const technologies = asList(project.technologies || project.tech_stack || project.skills);
    const highlights = asList(project.highlights || project.impact || project.description_bullets);
    const link = !isString && (project.github_url || project.url || project.link);

    return (
        <article className={`folio-project-card folio-project-${(index % 3) + 1}`}>
            <div className="folio-project-topline">
                <span>0{index + 1} / SELECTED WORK</span>
                {link && <a href={link} target="_blank" rel="noreferrer" aria-label={`Open ${name}`}><ArrowUpRight size={18} /></a>}
            </div>
            <h3>{name}</h3>
            <p>{description}</p>
            {highlights.length > 0 && (
                <ul className="folio-project-highlights">
                    {highlights.slice(0, 3).map((highlight, highlightIndex) => <li key={highlightIndex}><Check size={13} />{highlight}</li>)}
                </ul>
            )}
            {technologies.length > 0 && <div className="folio-tags">{technologies.slice(0, 6).map((tech, techIndex) => <span key={techIndex}>{tech}</span>)}</div>}
        </article>
    );
}

export default function ViewPortfolio() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [portfolio, setPortfolio] = useState(null);
    const [error, setError] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        let active = true;
        const loadPortfolio = async () => {
            try {
                setLoading(true);
                const data = await portfolioService.getPortfolio(slug);
                if (active) {
                    setPortfolio(data);
                    setError(null);
                }
            } catch (requestError) {
                console.error(requestError);
                if (active) setError('This portfolio is not available.');
            } finally {
                if (active) setLoading(false);
            }
        };
        loadPortfolio();
        return () => { active = false; };
    }, [slug]);

    const view = useMemo(() => {
        const content = portfolio?.ai_generated_content || {};
        const source = portfolio?.data_sources || {};
        const skillsSummary = content.skills_summary || {};
        const highlightedProjects = asList(content.project_highlights);
        const githubProjects = asList(source.github_projects);
        const projects = highlightedProjects.length ? highlightedProjects : githubProjects;
        const competitive = source.competitive_programming || {};
        const contact = content.contact_info || {};
        const name = portfolio?.personal_info?.name || 'Portfolio owner';
        const initial = name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'PF';
        const skillGroups = [
            { label: 'Languages', values: asList(skillsSummary.languages) },
            { label: 'Frameworks', values: asList(skillsSummary.frameworks) },
            { label: 'Tools & platforms', values: asList(skillsSummary.tools) },
        ].filter((group) => group.values.length);
        if (!skillGroups.length && asList(content.skills).length) skillGroups.push({ label: 'Core stack', values: asList(content.skills) });
        const stats = [];
        if (competitive.codeforces?.current_rating) stats.push({ label: 'Codeforces rating', value: compactValue(competitive.codeforces.current_rating), tone: 'violet' });
        if (competitive.leetcode?.total_solved) stats.push({ label: 'LeetCode solved', value: compactValue(competitive.leetcode.total_solved), tone: 'gold' });
        if (asList(content.achievements).length) stats.push({ label: 'Notable achievements', value: asList(content.achievements).length, tone: 'mint' });
        return { content, source, projects, competitive, contact, name, initial, skillGroups, stats };
    }, [portfolio]);

    if (loading) {
        return <div className="folio-loading"><div className="folio-loader-mark">S</div><p>Loading the portfolio</p></div>;
    }
    if (error || !portfolio) {
        return <div className="folio-loading"><div className="folio-loader-mark is-error">!</div><h1>{error || 'Portfolio unavailable'}</h1><button onClick={() => navigate('/')}>Return home <ArrowUpRight size={16} /></button></div>;
    }

    const { content, projects, competitive, contact, name, initial, skillGroups, stats } = view;
    const focus = niceFocus(portfolio.personal_info?.portfolio_focus);
    const navItems = [['Work', '#work'], ['Story', '#story'], ['Stack', '#stack'], ['Contact', '#contact']];
    const profileLinks = [
        contact.github && { icon: <Github size={16} />, label: 'GitHub', href: contact.github },
        contact.linkedin && { icon: <Linkedin size={16} />, label: 'LinkedIn', href: contact.linkedin },
    ].filter(Boolean);

    return (
        <div className="folio-page">
            <div className="folio-grain" />
            <div className="folio-orb folio-orb-one" />
            <div className="folio-orb folio-orb-two" />

            <header className="folio-nav-shell">
                <nav className="folio-nav">
                    <a className="folio-brand" href="#top" aria-label={`${name} portfolio home`}>
                        <span>{initial}</span><b>{name.split(' ')[0]}<i>.</i></b>
                    </a>
                    <div className={`folio-nav-links ${menuOpen ? 'is-open' : ''}`}>
                        {navItems.map(([label, href]) => <a key={label} href={href} onClick={() => setMenuOpen(false)}>{label}</a>)}
                    </div>
                    <a className="folio-nav-cta" href="#contact">Let&apos;s connect <ArrowUpRight size={15} /></a>
                    <button className="folio-menu-button" onClick={() => setMenuOpen((open) => !open)} aria-label="Toggle navigation">
                        {menuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </nav>
            </header>

            <main id="top" className="folio-main">
                <section className="folio-hero">
                    <div className="folio-hero-copy">
                        <div className="folio-availability"><span /> Available for meaningful work</div>
                        <p className="folio-hero-kicker">{focus.toUpperCase()} DEVELOPER · BUILDER · PROBLEM SOLVER</p>
                        <h1>{name.split(' ').map((part, index) => <span key={`${part}-${index}`}>{part}</span>)}</h1>
                        <p className="folio-hero-summary">{content.professional_summary || `I build thoughtful ${focus.toLowerCase()} experiences with an eye for clarity, technical depth, and real-world impact.`}</p>
                        <div className="folio-hero-actions">
                            <a href="#work" className="folio-primary-action">Explore selected work <ArrowDownRight size={18} /></a>
                            {contact.email && <a href={`mailto:${contact.email}`} className="folio-quiet-action"><Mail size={16} /> Write an email</a>}
                        </div>
                    </div>
                    <div className="folio-hero-art" aria-hidden="true">
                        <div className="folio-monogram"><span>{initial}</span><i>01</i></div>
                        <div className="folio-art-card folio-art-card-top"><Sparkles size={15} /><span>Building with intent</span></div>
                        <div className="folio-art-card folio-art-card-bottom"><Activity size={15} /><span>Always learning</span></div>
                        <div className="folio-art-ring folio-art-ring-one" /><div className="folio-art-ring folio-art-ring-two" />
                    </div>
                </section>

                {(content.key_strengths?.length > 0 || stats.length > 0) && (
                    <section className="folio-proof-strip">
                        <div className="folio-proof-intro"><span>AT A GLANCE</span><p>Signals of craft,<br />curiosity, and impact.</p></div>
                        <div className="folio-proof-list">
                            {asList(content.key_strengths).slice(0, 3).map((strength, index) => <div className="folio-proof-item" key={index}><b>0{index + 1}</b><p>{strength}</p></div>)}
                            {!content.key_strengths?.length && <div className="folio-proof-item"><b>01</b><p>Focused on purposeful software and measurable outcomes.</p></div>}
                        </div>
                    </section>
                )}

                {projects.length > 0 && (
                    <section id="work" className="folio-section folio-work-section">
                        <SectionHeading eyebrow="SELECTED WORK" title="A few things worth opening." copy="Projects shaped around practical problems, deliberate systems, and details that hold up." />
                        <div className="folio-project-grid">{projects.slice(0, 6).map((project, index) => <ProjectCard key={index} project={project} index={index} />)}</div>
                    </section>
                )}

                <section id="story" className="folio-section folio-story-layout">
                    <div className="folio-story-sticky"><SectionHeading eyebrow="THE STORY" title="Built through real iteration." copy="The best work is usually the result of learning quickly, then making the next version more useful." />
                        {profileLinks.length > 0 && <div className="folio-social-line">{profileLinks.map(({ icon, label, href }) => <a key={label} href={href} target="_blank" rel="noreferrer">{icon}{label}<ArrowUpRight size={13} /></a>)}</div>}
                    </div>
                    <div className="folio-timeline">
                        {asList(content.work_experience).length ? asList(content.work_experience).map((experience, index) => (
                            <article className="folio-timeline-entry" key={index}>
                                <div className="folio-timeline-index">0{index + 1}</div>
                                <div><span>{experience.duration || 'EXPERIENCE'}</span><h3>{experience.title || 'Software builder'}</h3><h4>{experience.company || 'Independent work'}</h4>
                                    {asList(experience.description_bullets).length > 0 && <ul>{asList(experience.description_bullets).slice(0, 4).map((bullet, bulletIndex) => <li key={bulletIndex}>{bullet}</li>)}</ul>}
                                </div>
                            </article>
                        )) : <article className="folio-timeline-entry"><div className="folio-timeline-index">01</div><div><span>NOW</span><h3>Building, learning, refining.</h3><p>Turning technical curiosity into useful, considered software.</p></div></article>}
                    </div>
                </section>

                {skillGroups.length > 0 && (
                    <section id="stack" className="folio-section folio-stack-section">
                        <SectionHeading eyebrow="TECHNICAL PALETTE" title="Tools chosen to make ideas real." />
                        <div className="folio-skill-grid">{skillGroups.map((group, index) => <article className="folio-skill-card" key={group.label}><span>0{index + 1} / {group.label}</span><div>{group.values.map((skill, skillIndex) => <b key={skillIndex}>{skill}</b>)}</div></article>)}</div>
                    </section>
                )}

                {(asList(content.achievements).length > 0 || stats.length > 0 || competitive.codeforces || competitive.leetcode) && (
                    <section className="folio-section folio-recognition-layout">
                        <div className="folio-recognition-panel"><SectionHeading eyebrow="PROOF OF WORK" title="The details behind the momentum." />
                            <div className="folio-achievement-list">{asList(content.achievements).slice(0, 5).map((achievement, index) => <div key={index}><Trophy size={16} /><p>{achievement}</p></div>)}</div>
                        </div>
                        <div className="folio-stat-grid">
                            {stats.map((stat) => <div className={`folio-stat-card ${stat.tone}`} key={stat.label}><span>{stat.label}</span><strong>{stat.value}</strong><i /> </div>)}
                            {competitive.codeforces?.profile_url && <a className="folio-profile-link" href={competitive.codeforces.profile_url} target="_blank" rel="noreferrer"><Code2 size={18} /> Explore Codeforces <ArrowUpRight size={16} /></a>}
                            {competitive.leetcode?.profile_url && <a className="folio-profile-link" href={competitive.leetcode.profile_url} target="_blank" rel="noreferrer"><Award size={18} /> Explore LeetCode <ArrowUpRight size={16} /></a>}
                        </div>
                    </section>
                )}

                <section id="contact" className="folio-contact-section">
                    <div><span>START A CONVERSATION</span><h2>Have a problem worth<br /><em>building for?</em></h2></div>
                    <div className="folio-contact-actions">
                        {contact.email ? <a className="folio-contact-main" href={`mailto:${contact.email}`}>{contact.email}<ArrowUpRight size={19} /></a> : <a className="folio-contact-main" href={contact.github || '#top'}>Find me online<ArrowUpRight size={19} /></a>}
                        <p>Open to thoughtful collaborations, ambitious products, and the next difficult problem.</p>
                    </div>
                </section>
            </main>
            <footer className="folio-footer"><span>© {new Date().getFullYear()} {name}</span><span>Designed with intent <ChevronRight size={13} /> Powered by SmartFolio</span></footer>
        </div>
    );
}
