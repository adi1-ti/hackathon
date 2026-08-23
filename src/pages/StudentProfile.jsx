import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

import {
  ArrowRight,
  Sparkles,
  Check,
  Code2,
  Server,
  Database,
  BrainCircuit,
  ShieldCheck,
  Palette,
} from "lucide-react";

import "./StudentProfile.css";

const interestCategories = [
  {
    id: "frontend",
    title: "Frontend Development",
    description: "Build websites and interactive user interfaces.",
    icon: Code2,
    skills: [
      "HTML & Web Semantics",
      "CSS, Layout & Responsive Design",
      "JavaScript",
      "React & Component Development",
      "APIs & Data Integration",
      "Testing, Debugging & Version Control",
    ],
  },

  {
    id: "backend",
    title: "Backend Development",
    description: "Build servers, APIs, databases and backend systems.",
    icon: Server,
    skills: [
      "Programming Fundamentals",
      "Backend Framework & Server Development",
      "API Development",
      "Databases & SQL",
      "SQL & Database Querying",
      "Authentication, Authorization & Security",
      "Testing, Debugging & Version Control",
    ],
  },

  {
    id: "data",
    title: "Data & Analytics",
    description: "Work with data to discover insights and patterns.",
    icon: Database,
    skills: [
      "Python for Data Analysis",
      "Data Cleaning & Processing",
      "Data Processing & Analysis",
      "Databases & SQL",
      "SQL & Database Querying",
      "Statistics & Data Interpretation",
      "Data Visualization & Exploration",
      "Data Visualization & BI Tools",
      "Excel & Spreadsheet Analysis",
      "Mathematics, Statistics & Probability",
    ],
  },

  {
    id: "aiml",
    title: "AI / Machine Learning",
    description: "Explore machine learning, AI and intelligent systems.",
    icon: BrainCircuit,
    skills: [
      "Python Programming",
      "Machine Learning Fundamentals",
      "Deep Learning & Neural Networks",
      "Model Training & Evaluation",
      "ML Frameworks & Tools",
      "Mathematics, Statistics & Probability",
      "Data Processing & Analysis",
    ],
  },

  {
    id: "cybersecurity",
    title: "Cybersecurity",
    description: "Protect systems, networks, applications and data.",
    icon: ShieldCheck,
    skills: [
      "Cybersecurity Fundamentals",
      "Linux & System Fundamentals",
      "Networking & Network Security",
      "Web & Application Security",
      "Vulnerability Assessment",
      "Security Monitoring & Incident Response",
      "Security Scripting & Automation",
      "Authentication, Authorization & Security",
    ],
  },

  {
    id: "uiux",
    title: "UI / UX Design",
    description: "Design useful, accessible and engaging experiences.",
    icon: Palette,
    skills: [
      "UI Design & Visual Principles",
      "Figma & Prototyping",
      "Wireframing & Information Architecture",
      "User Research & Problem Definition",
      "Usability Testing & UX Evaluation",
      "Design Communication & Presentation",
    ],
  },
];

function StudentProfile() {
  const navigate = useNavigate();

  const [selectedInterests, setSelectedInterests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadInterests();
  }, []);

  const loadInterests = async () => {
    try {
      setLoading(true);

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        navigate("/login");
        return;
      }

      const { data, error } = await supabase
        .from("students")
        .select("interests")
        .eq("auth_id", user.id)
        .single();

      if (error) {
        console.error("Could not load interests:", error);
        return;
      }

      if (Array.isArray(data?.interests)) {
        setSelectedInterests(data.interests);
      }
    } catch (error) {
      console.error("Interest loading error:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleInterest = (skill) => {
    setSelectedInterests((current) => {
      if (current.includes(skill)) {
        return current.filter((item) => item !== skill);
      }

      return [...current, skill];
    });
  };

  const handleContinue = async (event) => {
    event.preventDefault();

    if (selectedInterests.length === 0) {
      alert("Please select at least one area of interest.");
      return;
    }

    try {
      setSaving(true);

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        alert("Your session has expired. Please login again.");
        navigate("/login");
        return;
      }

      const { error } = await supabase
        .from("students")
        .update({
          interests: selectedInterests,
        })
        .eq("auth_id", user.id);

      if (error) {
        console.error("INTEREST SAVE ERROR:", error);
        alert(error.message);
        return;
      }

      console.log("INTERESTS SAVED:", selectedInterests);

      navigate("/career-selection");
    } catch (error) {
      console.error("PROFILE ERROR:", error);
      alert("Something went wrong while saving your interests.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="student-interest-page">
        <div className="student-interest-loading">
          <Sparkles size={22} />
          <p>Preparing your interest profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="student-interest-page">
      <div className="student-interest-container">

        {/* HEADER */}

        <header className="student-interest-header">
          <Link to="/" className="auth-brand">
            <div className="brand-mark">
              <Sparkles size={18} />
            </div>

            <div>
              <span className="brand-name">CAREERPATH</span>
              <span className="brand-subtitle">AI</span>
            </div>
          </Link>

          <div className="interest-progress">
            PROFILE SETUP <span>01 / 03</span>
          </div>
        </header>

        {/* INTRO */}

        <section className="student-interest-intro">
          <div className="student-interest-kicker">
            <span />
            YOUR INTERESTS
          </div>

          <h1>
            What do you want
            <br />
            to <span>explore?</span>
          </h1>

          <p>
            Select the technologies and skills that interest you.
            We'll use them to understand which career paths may suit you.
          </p>

          <div className="selection-counter">
            <strong>{selectedInterests.length}</strong>
            <span>
              {selectedInterests.length === 1 ? "skill" : "skills"} selected
            </span>
          </div>
        </section>

        {/* INTEREST CATEGORIES */}

        <form onSubmit={handleContinue}>
          <div className="interest-category-grid">

            {interestCategories.map((category) => {
              const Icon = category.icon;

              return (
                <section
                  className="interest-category-card"
                  key={category.id}
                >
                  <div className="interest-category-header">
                    <div className="interest-category-icon">
                      <Icon size={20} />
                    </div>

                    <div>
                      <h2>{category.title}</h2>
                      <p>{category.description}</p>
                    </div>
                  </div>

                  <div className="interest-skill-grid">
                    {category.skills.map((skill) => {
                      const selected = selectedInterests.includes(skill);

                      return (
                        <button
                          type="button"
                          key={skill}
                          className={`interest-skill ${
                            selected ? "selected" : ""
                          }`}
                          onClick={() => toggleInterest(skill)}
                        >
                          <span>{skill}</span>

                          <span className="interest-check">
                            {selected && <Check size={13} />}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </section>
              );
            })}

          </div>

          {/* BOTTOM ACTION */}

          <div className="student-interest-footer">
            <div>
              <span className="footer-label">NEXT</span>
              <strong>Find careers that match your interests</strong>
            </div>

            <button
              type="submit"
              className="student-interest-button"
              disabled={saving || selectedInterests.length === 0}
            >
              {saving ? "Saving..." : "Continue"}
              {!saving && <ArrowRight size={17} />}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

export default StudentProfile;