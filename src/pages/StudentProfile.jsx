import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "./StudentProfile.css";

import {
  ArrowRight,
  GraduationCap,
  UserRound,
  Sparkles,
  Check,
  Code2,
  Database,
  Palette,
  Cloud,
  BarChart3,
  ShieldCheck,
} from "lucide-react";



function StudentProfile() {
  const navigate = useNavigate();

  // =========================================
  // PROFILE INTERESTS
  // =========================================

  const [selectedInterests, setSelectedInterests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // =========================================
  // INTEREST CATEGORIES + SKILLS
  // =========================================

  const interestCategories = [
    {
      title: "Technology & Development",
      description: "Build software, websites and digital products.",
      icon: <Code2 size={20} />,
      skills: [
        "Web Development",
        "App Development",
        "Software Development",
        "Frontend Development",
        "Backend Development",
        "Game Development",
      ],
    },

    {
      title: "Cybersecurity",
      description: "Protect systems, networks and digital information.",
      icon: <ShieldCheck size={20} />,
      skills: [
        "Cybersecurity",
        "Ethical Hacking",
        "Network Security",
        "Digital Forensics",
        "Penetration Testing",
        "Security Analysis",
      ],
    },

    {
      title: "Artificial Intelligence & Data",
      description: "Work with intelligent systems, data and analytics.",
      icon: <BarChart3 size={20} />,
      skills: [
        "Artificial Intelligence",
        "Machine Learning",
        "Data Science",
        "Data Analytics",
        "Deep Learning",
        "Natural Language Processing",
      ],
    },

    {
      title: "Cloud & Infrastructure",
      description: "Work with cloud platforms and modern infrastructure.",
      icon: <Cloud size={20} />,
      skills: [
        "Cloud Computing",
        "DevOps",
        "Cloud Security",
        "AWS",
        "Microsoft Azure",
        "System Administration",
      ],
    },

    {
      title: "Data & Databases",
      description: "Organize, manage and work with digital information.",
      icon: <Database size={20} />,
      skills: [
        "Database Management",
        "SQL",
        "Data Engineering",
        "Big Data",
        "Data Visualization",
        "Business Intelligence",
      ],
    },

    {
      title: "Design & Creativity",
      description: "Create engaging digital experiences and visuals.",
      icon: <Palette size={20} />,
      skills: [
        "UI/UX Design",
        "Graphic Design",
        "Product Design",
        "Animation",
        "Content Creation",
        "Creative Design",
      ],
    },
  ];

  // =========================================
  // LOAD EXISTING INTERESTS
  // =========================================

  useEffect(() => {
    loadStudentInterests();
  }, []);

  const loadStudentInterests = async () => {
    try {
      setLoading(true);

      // Check logged-in user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        console.error("No logged-in user:", authError);
        navigate("/login");
        return;
      }

      // Get previously saved interests
      const { data, error } = await supabase
        .from("students")
        .select("interests")
        .eq("auth_id", user.id)
        .single();

      if (error) {
        console.error("Interest loading error:", error);
        setSelectedInterests([]);
        return;
      }

      setSelectedInterests(
        Array.isArray(data?.interests) ? data.interests : []
      );
    } catch (error) {
      console.error("Profile loading error:", error);
      setSelectedInterests([]);
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // TOGGLE SKILL
  // =========================================

  const toggleInterest = (interest) => {
    setSelectedInterests((prev) => {
      if (prev.includes(interest)) {
        return prev.filter((item) => item !== interest);
      }

      return [...prev, interest];
    });
  };

  // =========================================
  // SAVE INTERESTS + CONTINUE
  // =========================================

  const handleContinue = async (e) => {
    e.preventDefault();

    if (selectedInterests.length === 0) {
      alert("Please select at least one area of interest.");
      return;
    }

    try {
      setSaving(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        alert("Please login again.");
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

      console.log("INTERESTS SAVED SUCCESSFULLY");

      navigate("/career-selection");
    } catch (error) {
      console.error("PROFILE SAVE ERROR:", error);
      alert("Something went wrong while saving your interests.");
    } finally {
      setSaving(false);
    }
  };

  // =========================================
  // LOADING SCREEN
  // =========================================

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">
          <Sparkles size={28} />

          <p>Loading your interests...</p>
        </div>
      </div>
    );
  }

  // =========================================
  // PAGE
  // =========================================

  return (
    <div className="profile-page">

      {/* =====================================
          HEADER
      ====================================== */}

      <header className="profile-header">

        <Link to="/" className="auth-brand">

          <div className="brand-mark">
            <Sparkles size={18} />
          </div>

          <div>
            <span className="brand-name">
              CAREERPATH
            </span>

            <span className="brand-subtitle">
              AI
            </span>
          </div>

        </Link>

        <div className="profile-progress-text">
          PROFILE SETUP <span>02 / 03</span>
        </div>

      </header>

      {/* =====================================
          MAIN
      ====================================== */}

      <main className="profile-main">

        {/* ===================================
            SIDEBAR
        ==================================== */}

        <aside className="profile-sidebar">

          <div className="sidebar-title">

            <span className="sidebar-kicker">
              YOUR JOURNEY
            </span>

            <h2>
              Discover what
              <br />
              <span>drives you.</span>
            </h2>

            <p>
              Tell us about the areas you're interested
              in. Choose as many skills as you'd like —
              we'll use them to understand your career
              direction.
            </p>

          </div>

          {/* JOURNEY STEPS */}

          <div className="setup-steps">

            {/* STEP 01 */}

            <div className="setup-step">

              <div className="step-icon">
                <UserRound size={17} />
              </div>

              <div>
                <small>STEP 01</small>
                <strong>About You</strong>
              </div>

            </div>

            <div className="setup-line" />

            {/* STEP 02 */}

            <div className="setup-step active">

              <div className="step-icon">
                <Sparkles size={17} />
              </div>

              <div>
                <small>STEP 02</small>
                <strong>Interests</strong>
              </div>

            </div>

            <div className="setup-line" />

            {/* STEP 03 */}

            <div className="setup-step">

              <div className="step-icon">
                <GraduationCap size={17} />
              </div>

              <div>
                <small>STEP 03</small>
                <strong>Career Goals</strong>
              </div>

            </div>

          </div>

        </aside>

        {/* ===================================
            RIGHT CONTENT
        ==================================== */}

        <section className="profile-form-section">

          {/* PAGE HEADING */}

          <div className="form-heading">

            <div className="profile-kicker">

              <span />

              YOUR INTERESTS

            </div>

            <h1>
              What are you
              <br />
              <span>interested in?</span>
            </h1>

            <p>
              Select the areas and skills that excite you.
              You can choose multiple skills across
              different categories.
            </p>

          </div>

          {/* =================================
              INTEREST FORM
          ================================== */}

          <form
            className="profile-form"
            onSubmit={handleContinue}
          >

            {/* =================================
                CATEGORIES
            ================================== */}

            {interestCategories.map((category) => (

              <section
                className="profile-review-card"
                key={category.title}
              >

                {/* CATEGORY HEADER */}

                <div className="profile-review-header">

                  <div>

                    <span className="review-kicker">
                      INTEREST AREA
                    </span>

                    <h2>
                      {category.title}
                    </h2>

                    <p className="review-description">
                      {category.description}
                    </p>

                  </div>

                  <div className="review-header-icon">
                    {category.icon}
                  </div>

                </div>

                {/* SKILLS */}

                <div className="interest-grid">

                  {category.skills.map((skill) => {

                    const selected =
                      selectedInterests.includes(skill);

                    return (

                      <button
                        key={skill}
                        type="button"
                        className={`interest-chip ${
                          selected ? "selected" : ""
                        }`}
                        onClick={() =>
                          toggleInterest(skill)
                        }
                      >

                        <span>
                          {skill}
                        </span>

                        {selected && (
                          <Check size={15} />
                        )}

                      </button>

                    );

                  })}

                </div>

              </section>

            ))}

            {/* =================================
                CONTINUE
            ================================== */}

            <div className="profile-selection-footer">

              <div className="selected-count">

                {selectedInterests.length}{" "}
                {selectedInterests.length === 1
                  ? "skill"
                  : "skills"}{" "}
                selected

              </div>

              <button
                type="submit"
                className="profile-continue"
                disabled={saving}
              >

                {saving
                  ? "Saving..."
                  : "Continue to Career Selection"}

                {!saving && (
                  <ArrowRight size={17} />
                )}

              </button>

            </div>

          </form>

        </section>

      </main>

    </div>
  );
}

export default StudentProfile;