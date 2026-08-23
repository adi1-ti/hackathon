import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Brain,
  BriefcaseBusiness,
  ChevronDown,
  CircleCheck,
  Compass,
  Crown,
  Gauge,
  GraduationCap,
  Map,
  Menu,
  Network,
  Play,
  Sparkles,
  Target,
  TrendingUp,
  X,
} from "lucide-react";

function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeMatch, setActiveMatch] = useState(0);

  const careerMatches = [
    {
      title: "Cybersecurity Analyst",
      score: 94,
      skills: "Security • Networking • Linux",
    },
    {
      title: "Full Stack Developer",
      score: 88,
      skills: "React • Node.js • Databases",
    },
    {
      title: "Cloud Engineer",
      score: 81,
      skills: "AWS • Linux • DevOps",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveMatch((prev) => (prev + 1) % careerMatches.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const currentMatch = careerMatches[activeMatch];

  return (
    <div className="career-home">

      {/* Ambient background */}
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="grid-overlay" />

      {/* NAVBAR */}
      <header className="site-header">
        <div className="navbar">

          <Link to="/" className="brand">
            <div className="brand-mark">
              <Crown size={19} />
            </div>

            <div>
              <span className="brand-name">CAREERPATH</span>
              <span className="brand-subtitle">AI</span>
            </div>
          </Link>

          <nav className={`nav-menu ${menuOpen ? "open" : ""}`}>
            <a href="#home" onClick={() => setMenuOpen(false)}>Home</a>
            <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
            <a href="#how-it-works" onClick={() => setMenuOpen(false)}>How It Works</a>
            <a href="#roadmap" onClick={() => setMenuOpen(false)}>Roadmap</a>

            <Link
              to="/login"
              className="nav-login mobile-login"
              onClick={() => setMenuOpen(false)}
            >
              Login
            </Link>
          </nav>

          <div className="nav-actions">
            <Link to="/login" className="nav-login">
              Login
            </Link>

            <Link to="/register" className="nav-cta">
              Get Started
            </Link>
          </div>

          <button
            className="mobile-menu-button"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation"
          >
            {menuOpen ? <X size={23} /> : <Menu size={23} />}
          </button>

        </div>
      </header>

      {/* HERO */}
      <main id="home">

        <section className="hero-section">

          <div className="hero-copy">

            <div className="eyebrow">
              <Sparkles size={14} />
              AI-POWERED CAREER INTELLIGENCE
            </div>

            <h1>
              YOUR CAREER
              <br />
              <span>DESERVES A</span>
              <br />
              <strong>BETTER PATH.</strong>
            </h1>

            <p className="hero-text">
              Discover careers that match your strengths, understand the
              skills you need, and build a personalized roadmap toward your
              future with AI.
            </p>

            <div className="hero-buttons">
              <Link to="/login" className="gold-button">
                Explore Your Path
                <ArrowRight size={17} />
              </Link>

              <a href="#how-it-works" className="outline-button">
                <Play size={14} />
                See How It Works
              </a>
            </div>

            <div className="hero-trust">
              <div className="trust-item">
                <CircleCheck size={15} />
                Personalized
              </div>

              <div className="trust-item">
                <CircleCheck size={15} />
                AI-driven
              </div>

              <div className="trust-item">
                <CircleCheck size={15} />
                Skill-focused
              </div>
            </div>

          </div>

          {/* HERO VISUAL */}
          <div className="hero-visual">

            <div className="visual-glow" />

            <div className="ai-orbit orbit-one" />
            <div className="ai-orbit orbit-two" />
            <div className="ai-orbit orbit-three" />

            <div className="career-core">
              <div className="core-icon">
                <Brain size={29} />
              </div>

              <span>CAREER AI</span>

              <strong>
                Finding your
                <br />
                best-fit path
              </strong>

              <div className="core-status">
                <span className="status-dot" />
                ANALYZING PROFILE
              </div>
            </div>

            <div className="floating-card match-card">

              <div className="card-label">
                <span>AI CAREER MATCH</span>
                <Target size={15} />
              </div>

              <div className="match-title">
                {currentMatch.title}
              </div>

              <div className="match-score-row">
                <div className="match-bar">
                  <div
                    className="match-progress"
                    style={{ width: `${currentMatch.score}%` }}
                  />
                </div>

                <strong>{currentMatch.score}%</strong>
              </div>

              <p>{currentMatch.skills}</p>

            </div>

            <div className="floating-card skill-card">
              <div className="mini-card-icon">
                <TrendingUp size={17} />
              </div>

              <div>
                <small>SKILL READINESS</small>
                <strong>82%</strong>
              </div>
            </div>

            <div className="floating-card roadmap-card">
              <div className="mini-card-icon">
                <Map size={17} />
              </div>

              <div>
                <small>ROADMAP</small>
                <strong>12 MILESTONES</strong>
              </div>
            </div>

          </div>

        </section>

        {/* FEATURES */}
        <section id="features" className="section features-section">

          <div className="section-heading">

            <div className="section-kicker">
              <span />
              BUILT AROUND YOU
              <span />
            </div>

            <h2>
              Your future needs more than
              <span> guesswork.</span>
            </h2>

            <p>
              CareerPath AI turns your interests, strengths, and goals into
              something actionable.
            </p>

          </div>

          <div className="features-grid">

            <article className="luxury-card featured-card">
              <div className="card-number">01</div>

              <div className="large-icon">
                <Compass size={28} />
              </div>

              <h3>Discover Your Direction</h3>

              <p>
                Explore career options based on your interests, strengths,
                personality, and current skills.
              </p>

              <div className="card-link">
                EXPLORE
                <ArrowRight size={14} />
              </div>
            </article>

            <article className="luxury-card">
              <div className="card-number">02</div>

              <div className="large-icon">
                <Brain size={28} />
              </div>

              <h3>AI Career Intelligence</h3>

              <p>
                Get intelligent career recommendations instead of generic
                one-size-fits-all suggestions.
              </p>

              <div className="card-link">
                ANALYZE
                <ArrowRight size={14} />
              </div>
            </article>

            <article className="luxury-card">
              <div className="card-number">03</div>

              <div className="large-icon">
                <GraduationCap size={28} />
              </div>

              <h3>Build Your Skills</h3>

              <p>
                See what you already know, what you're missing, and what to
                learn next.
              </p>

              <div className="card-link">
                BUILD
                <ArrowRight size={14} />
              </div>
            </article>

          </div>

        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="section process-section">

          <div className="section-heading">

            <div className="section-kicker">
              <span />
              THE PROCESS
              <span />
            </div>

            <h2>
              From <span>confusion</span> to clarity.
            </h2>

            <p>
              Four simple steps between where you are and where you want to go.
            </p>

          </div>

          <div className="process-grid">

            <div className="process-item">
              <span className="process-number">01</span>
              <div className="process-icon">
                <GraduationCap size={23} />
              </div>
              <h3>Tell Us About You</h3>
              <p>
                Share your interests, strengths, education, and ambitions.
              </p>
            </div>

            <div className="process-line" />

            <div className="process-item">
              <span className="process-number">02</span>
              <div className="process-icon">
                <Brain size={23} />
              </div>
              <h3>AI Analyzes Your Profile</h3>
              <p>
                Our system identifies patterns and potential career matches.
              </p>
            </div>

            <div className="process-line" />

            <div className="process-item">
              <span className="process-number">03</span>
              <div className="process-icon">
                <Target size={23} />
              </div>
              <h3>Discover Your Matches</h3>
              <p>
                Compare careers and understand why each one fits you.
              </p>
            </div>

            <div className="process-line" />

            <div className="process-item">
              <span className="process-number">04</span>
              <div className="process-icon">
                <Map size={23} />
              </div>
              <h3>Follow Your Roadmap</h3>
              <p>
                Turn your recommendation into a practical learning journey.
              </p>
            </div>

          </div>

        </section>

        {/* ROADMAP */}
        <section id="roadmap" className="section roadmap-section">

          <div className="roadmap-copy">

            <div className="section-kicker left-kicker">
              <span />
              YOUR ROADMAP
            </div>

            <h2>
              See exactly what
              <br />
              comes <span>next.</span>
            </h2>

            <p>
              Stop wondering what to learn. CareerPath AI turns a destination
              into a sequence of manageable milestones.
            </p>

            <Link to="/login" className="text-button">
              Build My Roadmap
              <ArrowRight size={16} />
            </Link>

          </div>

          <div className="roadmap-visual">

            <div className="roadmap-line" />

            <div className="roadmap-node completed">
              <div className="node-icon">
                <CircleCheck size={15} />
              </div>

              <div>
                <small>PHASE 01</small>
                <strong>Foundation</strong>
                <span>HTML • CSS • JavaScript</span>
              </div>
            </div>

            <div className="roadmap-node active">
              <div className="node-icon">
                <Gauge size={15} />
              </div>

              <div>
                <small>PHASE 02</small>
                <strong>Core Development</strong>
                <span>React • APIs • Git</span>
              </div>
            </div>

            <div className="roadmap-node">
              <div className="node-icon">
                <Network size={15} />
              </div>

              <div>
                <small>PHASE 03</small>
                <strong>Specialization</strong>
                <span>Security • Cloud • Systems</span>
              </div>
            </div>

            <div className="roadmap-node">
              <div className="node-icon">
                <BriefcaseBusiness size={15} />
              </div>

              <div>
                <small>PHASE 04</small>
                <strong>Career Ready</strong>
                <span>Projects • Portfolio • Internship</span>
              </div>
            </div>

          </div>

        </section>

        {/* CTA */}
        <section className="final-cta">

          <div className="cta-glow" />

          <div className="cta-icon">
            <Sparkles size={24} />
          </div>

          <div className="section-kicker">
            <span />
            YOUR NEXT MOVE
            <span />
          </div>

          <h2>
            Don't just choose
            <br />
            a career.
            <span> Design it.</span>
          </h2>

          <p>
            Start building a career path that actually makes sense for you.
          </p>

          <Link to="/Register" className="gold-button">
            Start Your Journey
            <ArrowRight size={17} />
          </Link>

        </section>

      </main>

      {/* FOOTER */}
      <footer className="site-footer">

        <div className="footer-brand">
          <div className="brand-mark">
            <Crown size={18} />
          </div>

          <div>
            <span className="brand-name">CAREERPATH</span>
            <span className="brand-subtitle">AI</span>
          </div>
        </div>

        <p>
          Intelligent career guidance for the next generation.
        </p>

        <span className="footer-copy">
          © 2026 CareerPath AI
        </span>

      </footer>

      {/* MOBILE SCROLL ARROW */}
      <button
        className="scroll-top"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Scroll to top"
      >
        <ChevronDown size={17} />
      </button>

    </div>
  );
}

export default Home;