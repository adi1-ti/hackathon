import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Sparkles,
  Code2,
  ShieldCheck,
  BrainCircuit,
  Database,
  Cloud,
  Palette,
  BriefcaseBusiness,
  Megaphone,
  Gamepad2,
  Smartphone,
  BarChart3,
  Rocket,
  Check,
} from "lucide-react";

function CareerSelection() {
  const navigate = useNavigate();

  const [selectedCareers, setSelectedCareers] = useState([]);

  const careers = [
    {
      name: "Software Developer",
      category: "Technology",
      icon: Code2,
    },
    {
      name: "Web Developer",
      category: "Technology",
      icon: Code2,
    },
    {
      name: "App Developer",
      category: "Technology",
      icon: Smartphone,
    },
    {
      name: "Cybersecurity Analyst",
      category: "Technology",
      icon: ShieldCheck,
    },
    {
      name: "AI / ML Engineer",
      category: "Technology",
      icon: BrainCircuit,
    },
    {
      name: "Data Scientist",
      category: "Technology",
      icon: Database,
    },
    {
      name: "Cloud Engineer",
      category: "Technology",
      icon: Cloud,
    },
    {
      name: "UI/UX Designer",
      category: "Creative",
      icon: Palette,
    },
    {
      name: "Game Designer",
      category: "Creative",
      icon: Gamepad2,
    },
    {
      name: "Content Creator",
      category: "Creative",
      icon: Megaphone,
    },
    {
      name: "Business Analyst",
      category: "Business",
      icon: BarChart3,
    },
    {
      name: "Product Manager",
      category: "Business",
      icon: BriefcaseBusiness,
    },
    {
      name: "Digital Marketing",
      category: "Business",
      icon: Megaphone,
    },
    {
      name: "Entrepreneur",
      category: "Business",
      icon: Rocket,
    },
  ];

  const toggleCareer = (career) => {
    setSelectedCareers((prev) => {
      if (prev.includes(career)) {
        return prev.filter((item) => item !== career);
      }

      if (prev.length >= 3) {
        return prev;
      }

      return [...prev, career];
    });
  };

  const handleContinue = (e) => {
    e.preventDefault();

    navigate("/career-goals");
  };

  return (
    <div className="career-page">
      {/* HEADER */}
      <header className="profile-header">
        <Link to="/" className="auth-brand">
          <div className="brand-mark">
            <Sparkles size={18} />
          </div>

          <div>
            <span className="brand-name">CAREERPATH</span>
            <span className="brand-subtitle">AI</span>
          </div>
        </Link>

        <div className="profile-progress-text">
          PROFILE SETUP <span>02 / 03</span>
        </div>
      </header>

      {/* MAIN */}
      <main className="career-main">
        {/* SIDEBAR */}
        <aside className="profile-sidebar">
          <div className="sidebar-title">
            <span className="sidebar-kicker">YOUR JOURNEY</span>

            <h2>
              Discover where
              <br />
              <span>you could go.</span>
            </h2>

            <p>
              Your interests are a starting point. Now let's explore the
              career directions that excite you.
            </p>
          </div>

          <div className="setup-steps">
            <div className="setup-step completed">
              <div className="step-icon">
                <Check size={17} />
              </div>

              <div>
                <small>STEP 01</small>
                <strong>About You</strong>
              </div>
            </div>

            <div className="setup-line active-line" />

            <div className="setup-step active">
              <div className="step-icon">
                <Sparkles size={17} />
              </div>

              <div>
                <small>STEP 02</small>
                <strong>Career Selection</strong>
              </div>
            </div>

            <div className="setup-line" />

            <div className="setup-step">
              <div className="step-icon">
                <Rocket size={17} />
              </div>

              <div>
                <small>STEP 03</small>
                <strong>Career Goals</strong>
              </div>
            </div>
          </div>
        </aside>

        {/* CONTENT */}
        <section className="career-selection-section">
          <div className="form-heading">
            <div className="profile-kicker">
              <span />
              CAREER SELECTION
            </div>

            <h1>
              Where do you see
              <br />
              <span>yourself going?</span>
            </h1>

            <p>
              Choose up to 3 career paths that interest you. You can always
              change them later.
            </p>
          </div>

          <form onSubmit={handleContinue}>
            <div className="career-grid">
              {careers.map((career) => {
                const Icon = career.icon;
                const selected = selectedCareers.includes(career.name);

                return (
                  <button
                    key={career.name}
                    type="button"
                    className={`career-card ${
                      selected ? "selected" : ""
                    }`}
                    onClick={() => toggleCareer(career.name)}
                  >
                    <div className="career-card-icon">
                      <Icon size={20} />
                    </div>

                    <div className="career-card-content">
                      <small>{career.category}</small>
                      <strong>{career.name}</strong>
                    </div>

                    {selected && (
                      <div className="career-check">
                        <Check size={14} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="career-selection-footer">
              <span>
                {selectedCareers.length} / 3 selected
              </span>

              <button
                type="submit"
                className="profile-continue"
                disabled={selectedCareers.length === 0}
              >
                Continue to Career Goals
                <ArrowRight size={17} />
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}

export default CareerSelection;