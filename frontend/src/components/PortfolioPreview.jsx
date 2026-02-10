import './PortfolioPreview.css';

function PortfolioPreview({ portfolio }) {
    if (!portfolio) {
        return (
            <div className="portfolio-preview">
                <div className="empty-state">
                    <p>No portfolio content available</p>
                </div>
            </div>
        );
    }

    const aiContent = portfolio.ai_generated_content || {};

    return (
        <div className="portfolio-preview">
            {/* Summary Card */}
            {aiContent.professional_summary && (
                <div className="preview-card">
                    <h2>Professional Summary</h2>
                    <p>{aiContent.professional_summary}</p>
                </div>
            )}

            {/* Experience Card */}
            {aiContent.work_experience && aiContent.work_experience.length > 0 && (
                <div className="preview-card">
                    <h2>Work Experience</h2>
                    {aiContent.work_experience.map((exp, idx) => (
                        <div key={idx} className="experience-item">
                            <h3>{exp.title || exp.role} {exp.company && `at ${exp.company}`}</h3>
                            {exp.duration && <p className="date">{exp.duration}</p>}
                            {exp.description && <p>{exp.description}</p>}
                            {/* Support both responsibilities and description_bullets */}
                            {(exp.responsibilities || exp.description_bullets) && (
                                <ul>
                                    {(exp.responsibilities || exp.description_bullets).map((resp, i) => (
                                        <li key={i}>{resp}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Projects Card */}
            {aiContent.project_highlights && aiContent.project_highlights.length > 0 && (
                <div className="preview-card">
                    <h2>Projects</h2>
                    {aiContent.project_highlights.map((project, idx) => (
                        <div key={idx} className="project-item">
                            <h3>{project.name || project.title}</h3>
                            {project.description && <p>{project.description}</p>}
                            {project.technologies && project.technologies.length > 0 && (
                                <div className="tech-stack">
                                    {project.technologies.map((tech, i) => (
                                        <span key={i} className="tech-badge">{tech}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Skills Card */}
            {aiContent.skills_summary && (
                <div className="preview-card">
                    <h2>Skills</h2>
                    <div className="skills-grid">
                        {aiContent.skills_summary.languages && aiContent.skills_summary.languages.length > 0 && (
                            <div className="skill-category">
                                <h4>Languages</h4>
                                <div className="skill-tags">
                                    {aiContent.skills_summary.languages.map((lang, i) => (
                                        <span key={i} className="skill-tag">{lang}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                        {aiContent.skills_summary.frameworks && aiContent.skills_summary.frameworks.length > 0 && (
                            <div className="skill-category">
                                <h4>Frameworks</h4>
                                <div className="skill-tags">
                                    {aiContent.skills_summary.frameworks.map((fw, i) => (
                                        <span key={i} className="skill-tag">{fw}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                        {aiContent.skills_summary.tools && aiContent.skills_summary.tools.length > 0 && (
                            <div className="skill-category">
                                <h4>Tools</h4>
                                <div className="skill-tags">
                                    {aiContent.skills_summary.tools.map((tool, i) => (
                                        <span key={i} className="skill-tag">{tool}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Education Card */}
            {aiContent.education && aiContent.education.length > 0 && (
                <div className="preview-card">
                    <h2>Education</h2>
                    {aiContent.education.map((edu, idx) => (
                        <div key={idx} className="education-item">
                            <h3>{edu.degree || edu.title}</h3>
                            {edu.institution && <p className="institution">{edu.institution}</p>}
                            {edu.year && <p className="date">{edu.year}</p>}
                        </div>
                    ))}
                </div>
            )}

            {/* Achievements Card */}
            {aiContent.achievements && aiContent.achievements.length > 0 && (
                <div className="preview-card">
                    <h2>Achievements</h2>
                    <ul className="achievements-list">
                        {aiContent.achievements.map((achievement, idx) => (
                            <li key={idx}>{achievement}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Key Strengths Card */}
            {aiContent.key_strengths && aiContent.key_strengths.length > 0 && (
                <div className="preview-card">
                    <h2>Key Strengths</h2>
                    <ul className="strengths-list">
                        {aiContent.key_strengths.map((strength, idx) => (
                            <li key={idx}>{strength}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default PortfolioPreview;
