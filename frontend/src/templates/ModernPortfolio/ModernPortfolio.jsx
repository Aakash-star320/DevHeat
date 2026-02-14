import React, { useState, useCallback } from "react";
import { Container, Row, Col, Navbar, Nav, Button } from "react-bootstrap";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import Typewriter from "typewriter-effect";
import {
    AiFillStar,
    AiOutlineHome,
    AiOutlineFundProjectionScreen,
    AiOutlineUser,
    AiFillGithub,
    AiOutlineTwitter,
    AiFillInstagram
} from "react-icons/ai";
import { FaLinkedinIn } from "react-icons/fa";
import { CgCPlusPlus, CgWorkAlt, CgFileDocument } from "react-icons/cg";
import { ImTrophy } from "react-icons/im";
import { SiLeetcode, SiCodeforces } from "react-icons/si";

import "bootstrap/dist/css/bootstrap.min.css";

// --- CSS Styles (Scoped) ---
const styles = {
    section: {
        padding: "60px 0",
        position: "relative",
        zIndex: 1, // Ensure content is above stars
    },
    heroSection: {
        paddingTop: "150px",
        paddingBottom: "100px",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
    },
    navbar: {
        backgroundColor: "#1b1a2eE6", // Slight transparency
        backdropFilter: "blur(10px)",
        transition: "all 0.3s",
        padding: "10px 20px",
    },
    navLink: {
        color: "white",
        fontSize: "0.95rem", // Reduced font size
        marginLeft: "15px",
        fontWeight: "500",
    },
    heading: {
        fontSize: "2.6em",
        color: "white",
        marginBottom: "20px",
    },
    subHeading: {
        fontSize: "1.5em",
        color: "#c770f0", // Purple accent
        marginBottom: "40px",
        height: "50px", // Prevent layout shift
    },
    purple: {
        color: "#c770f0",
    },
    footer: {
        backgroundColor: "#0a0416",
        color: "white",
        padding: "20px 0",
        textAlign: "center",
        zIndex: 1,
        position: "relative",
    },
    socialIcon: {
        color: "white",
        fontSize: "1.5em",
        margin: "0 15px",
        transition: "color 0.3s",
    },
    experienceDate: {
        color: "#c770f0",
        fontWeight: "bold",
        fontSize: "1.0em",
        marginBottom: "10px"
    },
    experienceRole: {
        fontSize: "1.4em",
        fontWeight: "bold"
    },
    experienceCompany: {
        fontSize: "1.1em",
        marginBottom: "15px"
    },
    projectCard: {
        textAlign: "center",
        backgroundColor: "rgba(0, 0, 0, 0.3)",
        padding: "30px",
        borderRadius: "15px",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        height: "100%",
        boxShadow: "0 4px 5px 3px rgba(119, 53, 136, 0.459)",
        transition: "all 0.4s ease-out",
        color: "white"
    },
    techIcons: {
        fontSize: "4.5em",
        margin: "15px",
        padding: "10px",
        opacity: "0.93",
        border: "1.7px solid rgba(200, 137, 230, 0.637)",
        verticalAlign: "middle",
        textAlign: "center",
        borderRadius: "5px",
        display: "table",
        boxShadow: "4px 5px 4px 3px rgba(89, 4, 168, 0.137)",
        overflow: "hidden",
        transition: "all 0.4s ease 0s",
        cursor: "pointer",
        color: "white"
    },
    techIconHover: {
        transform: "scale(1.05) !important",
        borderColor: "#c770f0",
    },
};

// --- Components ---

function ParticleBackground() {
    const particlesInit = useCallback(async (engine) => {
        await loadFull(engine);
    }, []);

    return (
        <Particles
            id="tsparticles"
            init={particlesInit}
            options={{
                background: { color: { value: "#1b1a2e" } }, // Deep space blue
                fpsLimit: 120,
                interactivity: {
                    events: {
                        onClick: { enable: true, mode: "push" },
                        onHover: { enable: true, mode: "repulse" },
                        resize: true,
                    },
                    modes: {
                        push: { quantity: 4 },
                        repulse: { distance: 200, duration: 0.4 },
                    },
                },
                particles: {
                    color: { value: "#ffffff" },
                    links: {
                        color: "#ffffff",
                        distance: 150,
                        enable: true,
                        opacity: 0.2, // Subtle links
                        width: 1,
                    },
                    collisions: { enable: true },
                    move: {
                        direction: "none",
                        enable: true,
                        outModes: { default: "bounce" },
                        random: false,
                        speed: 1, // Slow movement
                        straight: false,
                    },
                    number: {
                        density: { enable: true, area: 800 },
                        value: 80,
                    },
                    opacity: { value: 0.5 },
                    shape: { type: "circle" },
                    size: { value: { min: 1, max: 3 } }, // Varied star sizes
                },
                detectRetina: true,
            }}
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                zIndex: 0, // Behind everything
            }}
        />
    );
}

const ModernPortfolio = ({ portfolio, slug }) => {
    const [expand, updateExpanded] = useState(false);
    const [navColour, updateNavbar] = useState(false);

    function scrollHandler() {
        if (window.scrollY >= 20) {
            updateNavbar(true);
        } else {
            updateNavbar(false);
        }
    }

    window.addEventListener("scroll", scrollHandler);

    // Default static data if portfolio is not provided (fallback)
    const data = portfolio || {};
    const aiContent = data.ai_generated_content || {};
    const personalInfo = data.personal_info || {};
    const dataSources = data.data_sources || {};
    const contactInfo = aiContent.contact_info || {};

    const name = personalInfo.name || "Portfolio User";
    const roles = aiContent.professional_titles || [
        "Software Developer",
        "MERN Stack Developer",
        "Open Source Contributor",
    ];

    return (
        <div style={{ position: "relative", minHeight: "100vh", overflowX: "hidden" }}>
            <ParticleBackground />

            {/* Navbar */}
            <Navbar
                expanded={expand}
                fixed="top"
                expand="md"
                style={{ ...styles.navbar, backgroundColor: navColour ? "#1b1a2e" : "transparent" }}
            >
                <Container>
                    <Navbar.Brand href={`/display/${slug}`} className="d-flex" style={{ textDecoration: "none" }}>
                        <span style={{ color: "#c770f0", fontWeight: "bold", fontSize: "1.5rem" }}>
                            {name.split(" ")[0] || "Pf."}
                        </span>
                    </Navbar.Brand>
                    <Navbar.Toggle
                        aria-controls="responsive-navbar-nav"
                        onClick={() => {
                            updateExpanded(expand ? false : "expanded");
                        }}
                    >
                        <span></span>
                        <span></span>
                        <span></span>
                    </Navbar.Toggle>
                    <Navbar.Collapse id="responsive-navbar-nav">
                        <Nav className="ms-auto" defaultActiveKey="#home">
                            <Nav.Link href="#home" style={styles.navLink} onClick={() => updateExpanded(false)}>
                                Home
                            </Nav.Link>
                            <Nav.Link href="#about" style={styles.navLink} onClick={() => updateExpanded(false)}>
                                Summary
                            </Nav.Link>
                            <Nav.Link href="#experience" style={styles.navLink} onClick={() => updateExpanded(false)}>
                                Experience
                            </Nav.Link>
                            <Nav.Link href="#projects" style={styles.navLink} onClick={() => updateExpanded(false)}>
                                Projects
                            </Nav.Link>
                            <Nav.Link href="#achievements" style={styles.navLink} onClick={() => updateExpanded(false)}>
                                Achievements
                            </Nav.Link>
                            <Nav.Link href="#key-strengths" style={styles.navLink} onClick={() => updateExpanded(false)}>
                                Strengths
                            </Nav.Link>
                            <Nav.Link href="#skills" style={styles.navLink} onClick={() => updateExpanded(false)}>
                                Skills
                            </Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            {/* Home Section */}
            <Container fluid id="home" style={styles.heroSection}>
                <Container className="home-content">
                    <Row>
                        <Col md={7} className="home-header">
                            <h1 style={{ paddingBottom: 15, color: "white" }} className="heading">
                                Hi There! <span className="wave" role="img" aria-labelledby="wave">👋🏻</span>
                            </h1>

                            <h1 className="heading-name" style={{ color: "white" }}>
                                I'M <strong style={styles.purple}> {name.toUpperCase()}</strong>
                            </h1>

                            <div style={{ padding: 50, textAlign: "left" }}>
                                <Typewriter
                                    key={roles.join(",")}
                                    options={{
                                        strings: roles,
                                        autoStart: true,
                                        loop: true,
                                        deleteSpeed: 50,
                                    }}
                                />
                            </div>
                        </Col>

                        <Col md={5} style={{ paddingBottom: 20 }}>
                            {/* Illustration or Image could go here */}
                            <div style={{ display: "flex", justifyContent: "center" }}>
                                <img src="https://raw.githubusercontent.com/soumyajit4419/Portfolio/master/src/Assets/home-main.svg" alt="home pic" className="img-fluid" style={{ maxHeight: "450px" }} />
                            </div>
                        </Col>
                    </Row>
                </Container>
            </Container>

            {/* Professional Summary Section (formerly About) */}
            <Container fluid id="about" style={{ ...styles.section, backgroundColor: "rgba(0,0,0,0.2)" }}>
                <Container>
                    <Row>
                        <Col md={8} style={{ margin: "0 auto", textAlign: "center" }}>
                            <h1 style={{ fontSize: "2.6em" }}>
                                Professional <span style={styles.purple}> Summary </span>
                            </h1>
                            <p style={{ fontSize: "1.2em", marginTop: "30px", textAlign: "left", color: "white" }}>
                                {aiContent.professional_summary || "Professional summary not available."}
                            </p>
                        </Col>
                    </Row>

                </Container>
            </Container>




            {/* Experience Section */}
            {aiContent.work_experience && aiContent.work_experience.length > 0 && (
                <Container fluid id="experience" style={styles.section}>
                    <Container>
                        <h1 className="text-center" style={{ marginBottom: "50px", color: "white" }}>
                            Work <strong style={styles.purple}>Experience </strong>
                        </h1>

                        <Row style={{ justifyContent: "center" }}>
                            <Col md={10}>
                                <div className="main-timeline">
                                    {aiContent.work_experience.map((exp, index) => (
                                        <div className={`timeline ${index % 2 === 0 ? "left" : "right"}`} key={index}>
                                            <div className="card" style={{ backgroundColor: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)" }}>
                                                <div className="card-body p-4">
                                                    <h3 style={{ ...styles.experienceRole, color: "white" }}>{exp.title}</h3>
                                                    <h4 style={{ ...styles.experienceCompany, color: "#c770f0" }}>{exp.company}</h4>
                                                    <p style={styles.experienceDate}>{exp.duration}</p>
                                                    <ul style={{ paddingLeft: "20px", color: "white" }}>
                                                        {exp.description_bullets && exp.description_bullets.map((bullet, i) => (
                                                            <li key={i}>{bullet}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Col>
                        </Row>
                    </Container>
                </Container>
            )}

            {/* Projects Section */}
            {(aiContent.project_highlights?.length > 0 || dataSources.github_projects?.length > 0) && (
                <Container fluid id="projects" style={styles.section}>
                    <Container>
                        <h1 className="text-center" style={{ marginBottom: "50px", color: "white" }}>
                            Project <strong style={styles.purple}>Highlights </strong>
                        </h1>
                        <p style={{ color: "white", textAlign: "center" }}>
                            Here are a few projects I've worked on recently.
                        </p>
                        <Row style={{ justifyContent: "center", paddingBottom: "10px" }}>
                            {/* Render AI Highlights first */}
                            {aiContent.project_highlights && aiContent.project_highlights.map((project, index) => (
                                <Col md={4} className="project-card" key={`ai-${index}`}>
                                    <div style={styles.projectCard}>
                                        <AiOutlineFundProjectionScreen size={50} style={{ color: "#c770f0", marginBottom: "20px" }} />
                                        <h3 style={{ color: "white" }}>{project.title || project.name}</h3>
                                        <p style={{ textAlign: "justify", color: "rgba(255, 255, 255, 0.7)" }}>
                                            {project.description}
                                        </p>
                                        {project.github_url && (
                                            <Button variant="primary" href={project.github_url} target="_blank" style={{ marginTop: "10px", marginBottom: "20px" }}>
                                                <AiFillGithub /> &nbsp; View GitHub Repo
                                            </Button>
                                        )}
                                        {project.technologies && (
                                            <div style={{ marginBottom: "15px" }}>
                                                {project.technologies.map((tech, i) => (
                                                    <span key={i} style={{ display: "inline-block", backgroundColor: "rgba(199, 112, 240, 0.2)", color: "white", padding: "2px 8px", borderRadius: "4px", margin: "2px", fontSize: "0.8em" }}>
                                                        {tech}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </Col>
                            ))}

                        </Row>
                    </Container>
                </Container>
            )}

            {/* Coding Profiles Section - Codeforces & LeetCode */}
            {dataSources.competitive_programming && (
                <Container fluid className="about-section" style={{ ...styles.section, paddingTop: "20px" }}>
                    <Container>
                        <h1 className="project-heading" style={{ color: "white", textAlign: "center" }}>
                            Coding <strong style={styles.purple}>Profiles</strong>
                        </h1>
                        <Row style={{ justifyContent: "center", paddingBottom: "50px" }}>

                            {/* Codeforces */}
                            {dataSources.competitive_programming.codeforces && (
                                <Col md={6} lg={4} className="mb-4">
                                    <div className="profile-card">
                                        <SiCodeforces style={{ fontSize: "4em", color: "#1f8acb", marginBottom: "20px" }} />
                                        <h3 style={{ marginBottom: "5px", color: "white" }}>Codeforces</h3>
                                        <p style={{ color: "#c770f0", marginBottom: "20px", fontWeight: "bold" }}>@{dataSources.competitive_programming.codeforces.username}</p>

                                        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", width: "100%", marginBottom: "20px" }}>
                                            <div className="profile-stat-box">
                                                <div className="profile-stat-label">Rating</div>
                                                <div className="profile-stat-value">{dataSources.competitive_programming.codeforces.current_rating}</div>
                                            </div>
                                            <div className="profile-stat-box">
                                                <div className="profile-stat-label">Max Rating</div>
                                                <div className="profile-stat-value">{dataSources.competitive_programming.codeforces.max_rating}</div>
                                            </div>
                                            <div className="profile-stat-box" style={{ width: "95%" }}>
                                                <div className="profile-stat-label">Rank</div>
                                                <div className="profile-stat-value" style={{ textTransform: "capitalize" }}>{dataSources.competitive_programming.codeforces.rank}</div>
                                            </div>
                                        </div>

                                        <Button variant="primary" href={`https://codeforces.com/profile/${dataSources.competitive_programming.codeforces.username}`} target="_blank" style={{ backgroundColor: "#623686", border: "none", width: "80%" }}>
                                            View Profile
                                        </Button>
                                    </div>
                                </Col>
                            )}

                            {/* LeetCode */}
                            {dataSources.competitive_programming.leetcode && (
                                <Col md={6} lg={4} className="mb-4">
                                    <div className="profile-card">
                                        <SiLeetcode style={{ fontSize: "4em", color: "#ffa116", marginBottom: "20px" }} />
                                        <h3 style={{ marginBottom: "5px", color: "white" }}>LeetCode</h3>
                                        <p style={{ color: "#c770f0", marginBottom: "20px", fontWeight: "bold" }}>@{dataSources.competitive_programming.leetcode.username}</p>

                                        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", width: "100%", marginBottom: "20px" }}>
                                            <div className="profile-stat-box" style={{ width: "95%" }}>
                                                <div className="profile-stat-label">Total Solved</div>
                                                <div className="profile-stat-value">{dataSources.competitive_programming.leetcode.total_solved}</div>
                                            </div>
                                            <div className="profile-stat-box" style={{ width: "95%", display: "flex", justifyContent: "space-around", alignItems: "center" }}>
                                                <div>
                                                    <span className="profile-stat-label" style={{ fontSize: "0.85em" }}>Easy: </span>
                                                    <span className="profile-stat-value" style={{ fontSize: "1em", color: "#00b8a3" }}>{dataSources.competitive_programming.leetcode.breakdown?.easy || 0}</span>
                                                </div>
                                                <div>
                                                    <span className="profile-stat-label" style={{ fontSize: "0.85em" }}>Med: </span>
                                                    <span className="profile-stat-value" style={{ fontSize: "1em", color: "#ffc01e" }}>{dataSources.competitive_programming.leetcode.breakdown?.medium || 0}</span>
                                                </div>
                                                <div>
                                                    <span className="profile-stat-label" style={{ fontSize: "0.85em" }}>Hard: </span>
                                                    <span className="profile-stat-value" style={{ fontSize: "1em", color: "#ff375f" }}>{dataSources.competitive_programming.leetcode.breakdown?.hard || 0}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <Button variant="primary" href={`https://leetcode.com/${dataSources.competitive_programming.leetcode.username}`} target="_blank" style={{ backgroundColor: "#623686", border: "none", width: "80%" }}>
                                            View Profile
                                        </Button>
                                    </div>
                                </Col>
                            )}
                        </Row>
                    </Container>
                </Container>
            )}

            {/* Achievements Section */}
            {aiContent.achievements && aiContent.achievements.length > 0 && (
                <Container fluid id="achievements" style={{ ...styles.section, backgroundColor: "rgba(0,0,0,0.2)" }}>
                    <Container>
                        <h1 className="text-center" style={{ marginBottom: "50px", color: "white" }}>
                            Achievements <strong style={styles.purple}></strong>
                        </h1>
                        <Row style={{ justifyContent: "center" }}>
                            <Col md={10}>
                                <div className="main-timeline">
                                    {aiContent.achievements.map((achievement, index) => (
                                        <div className={`timeline ${index % 2 === 0 ? "left" : "right"}`} key={index}>
                                            <div className="card" style={{ backgroundColor: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)" }}>
                                                <div className="card-body p-4" style={{ display: "flex", alignItems: "center" }}>
                                                    <ImTrophy size={30} style={{ color: "#c770f0", marginRight: "20px", flexShrink: 0 }} />
                                                    <p className="timeline-text">
                                                        {achievement}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Col>
                        </Row>
                    </Container>
                </Container>
            )}

            {/* Key Strengths Section - Moved Here */}
            {aiContent.key_strengths && aiContent.key_strengths.length > 0 && (
                <Container fluid id="key-strengths" style={styles.section}>
                    <Container>
                        <h1 className="text-center" style={{ marginBottom: "50px", color: "white" }}>
                            Key <strong style={styles.purple}>Strengths</strong>
                        </h1>
                        <Row style={{ justifyContent: "center", paddingBottom: "50px" }}>
                            {aiContent.key_strengths.map((strength, index) => (
                                <Col md={4} className="mb-4" key={index}>
                                    <div className="achievement-card">
                                        <h4 style={{ margin: 0, color: "white", fontSize: "1.2rem", fontWeight: "600", letterSpacing: "0.5px" }}>{strength}</h4>
                                    </div>
                                </Col>
                            ))}
                        </Row>
                    </Container>
                </Container>
            )}

            {/* Skills Section */}
            {aiContent.skills_summary && (
                <Container fluid id="skills" style={styles.section}>
                    <Container>
                        <h1 className="text-center" style={{ marginBottom: "50px", color: "white" }}>
                            Skills <strong style={styles.purple}>Summary </strong>
                        </h1>

                        {/* Languages */}
                        {aiContent.skills_summary.languages && (
                            <>
                                <h3 style={{ color: "white", marginBottom: "20px", textAlign: "center" }}>Languages</h3>
                                <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", paddingBottom: "50px" }}>
                                    {aiContent.skills_summary.languages.map((skill, index) => (
                                        <div className="tech-icons pill" key={index}>
                                            {skill}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* Frameworks & Libraries */}
                        {aiContent.skills_summary.frameworks && (
                            <>
                                <h3 style={{ color: "white", marginBottom: "20px", textAlign: "center" }}>Frameworks & Libraries</h3>
                                <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", paddingBottom: "50px" }}>
                                    {aiContent.skills_summary.frameworks.map((skill, index) => (
                                        <div className="tech-icons pill" key={index}>
                                            {skill}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* Tools */}
                        {aiContent.skills_summary.tools && (
                            <>
                                <h3 style={{ color: "white", marginBottom: "20px", textAlign: "center" }}>Tools & Technologies</h3>
                                <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", paddingBottom: "50px" }}>
                                    {aiContent.skills_summary.tools.map((skill, index) => (
                                        <div className="tech-icons pill" key={index}>
                                            {skill}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </Container>
                </Container>
            )}

            {/* Footer */}
            <footer style={styles.footer}>
                <Container>
                    <Row>
                        <Col md="12" className="footer-body">
                            <ul className="footer-icons" style={{ display: "inline-flex", listStyle: "none", padding: 0 }}>
                                {contactInfo.github && (
                                    <li className="social-icons">
                                        <a
                                            href={contactInfo.github}
                                            style={styles.socialIcon}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <AiFillGithub />
                                        </a>
                                    </li>
                                )}
                                {/* Add logic for other social links if we had them map in a standard way, e.g. twitter */}
                                {dataSources.competitive_programming?.codeforces && (
                                    <li className="social-icons">
                                        <a
                                            href={`https://codeforces.com/profile/${dataSources.competitive_programming.codeforces.username}`}
                                            style={styles.socialIcon}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <SiCodeforces />
                                        </a>
                                    </li>
                                )}
                                {dataSources.competitive_programming?.leetcode && (
                                    <li className="social-icons">
                                        <a
                                            href={`https://leetcode.com/${dataSources.competitive_programming.leetcode.username}`}
                                            style={styles.socialIcon}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <SiLeetcode />
                                        </a>
                                    </li>
                                )}
                                {contactInfo.linkedin && (
                                    <li className="social-icons">
                                        <a
                                            href={contactInfo.linkedin}
                                            style={styles.socialIcon}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <FaLinkedinIn />
                                        </a>
                                    </li>
                                )}
                            </ul>
                        </Col>
                    </Row>
                </Container>
            </footer>
        </div>
    );
};

export default ModernPortfolio;
