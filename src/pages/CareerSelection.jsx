import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BrainCircuit,
  Check,
  Code2,
  Database,
  Palette,
  ShieldCheck,
  Sparkles,
  Server,
  BarChart3,
} from "lucide-react";

import { supabase } from "../supabaseClient";
import "./CareerSelection.css";

const CAREERS = [
  {
    id: "frontend",
    name: "Frontend Developer",
    description:
      "Build beautiful, responsive and interactive websites and web applications.",
    icon: Code2,
    skills: [
      "HTML",
      "HTML & Web Semantics",
      "CSS",
      "CSS & Responsive Design",
      "JavaScript",
      "React",
      "React & Component Development",
      "UI Design",
    ],
  },
  {
    id: "backend",
    name: "Backend Developer",
    description:
      "Build APIs, server-side applications, databases and the systems behind modern products.",
    icon: Server,
    skills: [
      "Node.js",
      "Node.js & Server Development",
      "JavaScript",
      "Python",
      "APIs",
      "API Development",
      "REST APIs",
      "SQL",
      "Databases",
      "Databases & SQL",
    ],
  },
  {
    id: "data",
    name: "Data Analyst",
    description:
      "Turn raw data into useful insights that help organizations make better decisions.",
    icon: BarChart3,
    skills: [
      "Python",
      "SQL",
      "Statistics",
      "Data Analysis",
      "Data Cleaning",
      "Data Visualization",
      "Excel",
      "Pandas",
    ],
  },
  {
    id: "uiux",
    name: "UI/UX Designer",
    description:
      "Design intuitive digital experiences focused on users, usability and visual communication.",
    icon: Palette,
    skills: [
      "UI Design",
      "UX Design",
      "User Research",
      "Wireframing",
      "Prototyping",
      "Figma",
      "Accessibility",
      "Usability",
    ],
  },
  {
    id: "cybersecurity",
    name: "Cybersecurity Analyst",
    description:
      "Protect systems, networks and applications from security threats and vulnerabilities.",
    icon: ShieldCheck,
    skills: [
      "Linux",
      "Linux & System Fundamentals",
      "Networking",
      "Cybersecurity",
      "Web Security",
      "Authentication",
      "Authentication & Access Control",
      "Incident Response",
      "Security",
    ],
  },
  {
    id: "aiml",
    name: "AI/ML Engineer",
    description:
      "Build intelligent systems using Python, machine learning, data and neural networks.",
    icon: BrainCircuit,
    skills: [
      "Python",
      "Python for AI/ML",
      "Machine Learning",
      "Machine Learning Fundamentals",
      "Artificial Intelligence",
      "AI",
      "Data Science",
      "Statistics",
      "Neural Networks",
    ],
  },
];

function normalizeSkill(skill) {
  return skill
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ");
}

function calculateMatch(interests, careerSkills) {
  if (!interests.length) {
    return 0;
  }

  const normalizedInterests = interests.map(normalizeSkill);

  const matches = careerSkills.filter((careerSkill) => {
    const normalizedCareerSkill = normalizeSkill(careerSkill);

    return normalizedInterests.some((interest) => {
      return (
        interest === normalizedCareerSkill ||
        interest.includes(normalizedCareerSkill) ||
        normalizedCareerSkill.includes(interest)
      );
    });
  });

  const uniqueMatches = [...new Set(matches.map(normalizeSkill))];

  return Math.min(
    100,
    Math.round((uniqueMatches.length / Math.max(careerSkills.length, 1)) * 100)
  );
}

function CareerSelection() {
  const navigate = useNavigate();

  const [interests, setInterests] = useState([]);
  const [selectedCareer, setSelectedCareer] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadStudentInterests();
  }, []);

  async function loadStudentInterests() {
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        throw authError;
      }

      if (!user) {
        navigate("/login");
        return;
      }

      const { data, error: studentError } = await supabase
        .from("students")
        .select("interests")
        .eq("auth_id", user.id)
        .maybeSingle();

      if (studentError) {
        throw studentError;
      }

      let studentInterests = data?.interests || [];

      /*
       * Supports both:
       * ["HTML", "JavaScript"]
       *
       * and, if your Supabase column happens to contain
       * a JSON string:
       * '["HTML","JavaScript"]'
       */
      if (typeof studentInterests === "string") {
        try {
          studentInterests = JSON.parse(studentInterests);
        } catch {
          studentInterests = studentInterests
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);
        }
      }

      if (!Array.isArray(studentInterests)) {
        studentInterests = [];
      }

      setInterests(studentInterests);
    } catch (err) {
      console.error("Error loading student interests:", err);

      setError(
        "We couldn't load your interests. Please go back to your profile and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  const careerMatches = useMemo(() => {
    return CAREERS.map((career) => ({
      ...career,
      match: calculateMatch(interests, career.skills),
    })).sort((a, b) => b.match - a.match);
  }, [interests]);

  const recommendedCareer = careerMatches[0];

  function handleCareerSelect(careerId) {
    setSelectedCareer(careerId);
    setError("");
  }

  async function handleContinue() {
    if (!selectedCareer) {
      setError("Please select a career before continuing.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        throw authError;
      }

      if (!user) {
        navigate("/login");
        return;
      }

      const career = CAREERS.find((item) => item.id === selectedCareer);

      if (!career) {
        throw new Error("Selected career was not found.");
      }

      /*
       * IMPORTANT:
       * This assumes your students table has a column named
       * selected_career.
       *
       * If your column has a different name, change it here.
       */
      const { error: updateError } = await supabase
        .from("students")
        .update({
          selected_career: career.name,
        })
        .eq("auth_id", user.id);

      if (updateError) {
        throw updateError;
      }

      navigate("/assessment");
    } catch (err) {
      console.error("Error saving career:", err);

      setError(
        err.message ||
          "Something went wrong while saving your career selection."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="career-selection-page">
        <div className="career-selection-container career-loading">
          <Sparkles size={24} />
          <p>Analyzing your interests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="career-selection-page">
      <div className="career-selection-container">
        {/* HEADER */}
        <header className="career-selection-header">
          <div className="career-logo">
            <Sparkles size={20} />
          </div>

          <div>
            <span className="career-brand">CAREERPATH</span>
            <span className="career-brand-ai">AI</span>
          </div>
        </header>

        {/* HEADING */}
        <section className="career-selection-heading">
          <span className="career-kicker">YOUR CAREER PATH</span>

          <h1>
            Choose the career that
            <br />
            <span>feels right for you.</span>
          </h1>

          <p>
            We've analyzed your interests and highlighted the careers that
            match your current skill profile.
          </p>
        </section>

        {/* INTEREST SUMMARY */}
        {interests.length > 0 && (
          <section className="interest-summary">
            <div className="interest-summary-label">
              <span>YOUR INTERESTS</span>
              <strong>{interests.length} selected</strong>
            </div>

            <div className="interest-tags">
              {interests.map((interest) => (
                <span key={interest} className="interest-tag">
                  {interest}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* ERROR */}
        {error && <div className="career-error">{error}</div>}

        {/* CAREER GRID */}
        <section className="career-grid">
          {careerMatches.map((career) => {
            const Icon = career.icon;

            const isRecommended =
              recommendedCareer && career.id === recommendedCareer.id;

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
                {isRecommended && (
                  <div className="recommended-badge">
                    <Sparkles size={13} />
                    AI RECOMMENDED
                  </div>
                )}

                <div className="career-card-top">
                  <div className="career-icon">
                    <Icon size={22} />
                  </div>

                  <div className="career-match">
                    {career.match}% match
                  </div>
                </div>

                <h2>{career.name}</h2>

                <p>{career.description}</p>

                <div className="career-card-footer">
                  <span>
                    {career.match >= 70
                      ? "Strong match"
                      : career.match >= 40
                      ? "Good match"
                      : "Explore this path"}
                  </span>

                  <div className="career-radio">
                    {isSelected && <Check size={15} />}
                  </div>
                </div>
              </button>
            );
          })}
        </section>

        {/* SELECTED CAREER */}
        <div className="selected-career">
          <div>
            <span>SELECTED CAREER</span>

            <strong>
              {selectedCareer
                ? CAREERS.find((career) => career.id === selectedCareer)?.name
                : "Choose a career above"}
            </strong>
          </div>

          {selectedCareer && (
            <div className="selected-career-check">
              <Check size={17} />
            </div>
          )}
        </div>

        {/* CONTINUE */}
        <button
          type="button"
          className="career-start-button"
          disabled={!selectedCareer || saving}
          onClick={handleContinue}
        >
          {saving ? "Saving..." : "Continue to Assessment"}

          {!saving && <ArrowRight size={17} />}
        </button>
      </div>
    </div>
  );
}

export default CareerSelection;