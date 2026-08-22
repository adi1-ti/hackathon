import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  Check,
  Code2,
  Palette,
  Server,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import "./CareerSelection.css";

const careers = [
  {
    id: "Frontend Developer",
    title: "Frontend Developer",
    description:
      "Build modern, responsive interfaces and engaging web experiences.",
    icon: Code2,
    skills: "HTML • CSS • JavaScript • React",
  },
  {
    id: "Backend Developer",
    title: "Backend Developer",
    description:
      "Design reliable servers, APIs, databases, and backend systems.",
    icon: Server,
    skills: "Node.js • APIs • SQL • Authentication",
  },
  {
    id: "Data Analyst",
    title: "Data Analyst",
    description:
      "Turn raw data into useful insights that support better decisions.",
    icon: BarChart3,
    skills: "SQL • Python • Statistics • Visualization",
  },
  {
    id: "UI/UX Designer",
    title: "UI/UX Designer",
    description:
      "Create intuitive digital experiences centered around real users.",
    icon: Palette,
    skills: "Research • Wireframes • UI • Usability",
  },
  {
    id: "Cybersecurity Analyst",
    title: "Cybersecurity Analyst",
    description:
      "Protect systems, networks, applications, and sensitive information.",
    icon: ShieldCheck,
    skills: "Networking • Linux • Security • Incident Response",
  },
  {
    id: "AI/ML Engineer",
    title: "AI/ML Engineer",
    description:
      "Build intelligent systems using machine learning and data.",
    icon: BrainCircuit,
    skills: "Python • ML • Data • Neural Networks",
  },
];

function CareerSelection() {
  const navigate = useNavigate();
  const [selectedCareer, setSelectedCareer] = useState("");

  const handleCareerSelect = (career) => {
    setSelectedCareer(career);
  };

  const handleStartAssessment = () => {
    if (!selectedCareer) return;

    // Save the selected career so it can also be accessed
    // after page navigation.
    localStorage.setItem("selectedCareer", selectedCareer);

    navigate("/assessment", {
      state: {
        career: selectedCareer,
      },
    });
  };

  return (
    <div className="career-selection-page">

      {/* HEADER */}
      <header className="career-selection-header">

        <Link to="/" className="career-brand">
          <div className="career-brand-mark">
            <Sparkles size={18} />
          </div>

          <div className="career-brand-text">
            <span>CAREERPATH</span>
            <small>AI</small>
          </div>
        </Link>

        <div className="career-step">
          CAREER SELECTION
          <span>02 / 03</span>
        </div>

      </header>

      {/* MAIN */}
      <main className="career-selection-container">

        {/* INTRO */}
        <section className="career-selection-heading">

          <div className="career-kicker">
            <span />
            FIND YOUR DIRECTION
            <span />
          </div>

          <h1>
            Choose your <em>career path.</em>
          </h1>

          <p>
            Select the career you want to assess your current skills for.
          </p>

        </section>

        {/* CAREER GRID */}
        <section className="career-grid">

          {careers.map((career) => {
            const Icon = career.icon;
            const isSelected = selectedCareer === career.id;

            return (
              <button
                key={career.id}
                type="button"
                className={`career-card ${
                  isSelected ? "career-card-selected" : ""
                }`}
                onClick={() => handleCareerSelect(career.id)}
              >

                {/* SELECTED CHECK */}
                <div className="career-check">
                  {isSelected && <Check size={14} strokeWidth={3} />}
                </div>

                {/* ICON */}
                <div className="career-icon">
                  <Icon size={25} strokeWidth={1.5} />
                </div>

                {/* CONTENT */}
                <div className="career-card-content">

                  <span className="career-number">
                    {String(careers.indexOf(career) + 1).padStart(2, "0")}
                  </span>

                  <h2>{career.title}</h2>

                  <p>{career.description}</p>

                  <div className="career-skills">
                    {career.skills}
                  </div>

                </div>

                {/* ARROW */}
                <div className="career-card-arrow">
                  <ArrowRight size={18} />
                </div>

              </button>
            );
          })}

        </section>

        {/* SELECTED CAREER */}
        <section
          className={`selected-career ${
            selectedCareer ? "selected-career-active" : ""
          }`}
        >

          <div className="selected-career-info">

            <span className="selected-label">
              SELECTED CAREER
            </span>

            {selectedCareer ? (
              <strong>{selectedCareer}</strong>
            ) : (
              <span className="selected-placeholder">
                Choose a career above to continue
              </span>
            )}

          </div>

          {selectedCareer && (
            <div className="selected-status">
              <Check size={15} />
              SELECTED
            </div>
          )}

        </section>

        {/* START BUTTON */}
        <button
          type="button"
          className="career-start-button"
          disabled={!selectedCareer}
          onClick={handleStartAssessment}
        >
          <span>
            {selectedCareer
              ? `START ${selectedCareer.toUpperCase()} ASSESSMENT`
              : "SELECT A CAREER TO CONTINUE"}
          </span>

          <ArrowRight size={18} />

        </button>

        <p className="assessment-note">
          You'll answer 5 skill-based questions tailored to your selected career.
        </p>

      </main>

    </div>
  );
}

export default CareerSelection;