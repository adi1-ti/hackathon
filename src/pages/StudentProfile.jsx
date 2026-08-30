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
  ChevronDown,
  Code2,
  Database,
  Palette,
  Cloud,
  BarChart3,
  ShieldCheck,
  MessageSquareText,
} from "lucide-react";

function StudentProfile() {
  const navigate = useNavigate();

  // ============================================================
  // PROFILE DATA
  // ============================================================

  const [selectedInterests, setSelectedInterests] = useState([]);

  // Structured skills:
  // [
  //   { name: "Python", level: "Intermediate" },
  //   { name: "React", level: "Beginner" }
  // ]

  const [selectedSkills, setSelectedSkills] = useState([]);

  // Optional free-text skills
  const [skillsText, setSkillsText] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // ============================================================
  // SKILL LEVELS
  // ============================================================

  const skillLevels = [
    "Beginner",
    "Intermediate",
    "Advanced",
  ];

  // ============================================================
  // INTEREST CATEGORIES
  // ============================================================

  const interestCategories = [
    {
      title: "Technology & Development",
      description:
        "Build software, websites and digital products.",
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
      description:
        "Protect systems, networks and digital information.",
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
      description:
        "Work with intelligent systems, data and analytics.",
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
      description:
        "Work with cloud platforms and modern infrastructure.",
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
      description:
        "Organize, manage and work with digital information.",
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
      description:
        "Create engaging digital experiences and visuals.",
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

  // ============================================================
  // LOAD EXISTING PROFILE
  // ============================================================

  useEffect(() => {
    loadStudentProfile();
  }, []);

  async function loadStudentProfile() {
    setLoading(true);
    setError("");

    try {
      // ----------------------------------------------------------
      // GET LOGGED-IN USER
      // ----------------------------------------------------------

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

      // ----------------------------------------------------------
      // GET EXISTING STUDENT DATA
      // ----------------------------------------------------------

      const {
        data,
        error: studentError,
      } = await supabase
        .from("students")
        .select("interests, skills")
        .eq("auth_id", user.id)
        .maybeSingle();

      if (studentError) {
        throw studentError;
      }

      // ==========================================================
      // LOAD INTERESTS
      // ==========================================================

      let interests = data?.interests || [];

      if (typeof interests === "string") {
        try {
          interests = JSON.parse(interests);
        } catch {
          interests = interests
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);
        }
      }

      if (!Array.isArray(interests)) {
        interests = [];
      }

      setSelectedInterests(interests);

      // ==========================================================
      // LOAD SKILLS
      // ==========================================================

      let skills = data?.skills || [];

      if (typeof skills === "string") {
        try {
          skills = JSON.parse(skills);
        } catch {
          skills = skills
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);
        }
      }

      if (!Array.isArray(skills)) {
        skills = [];
      }

      // ----------------------------------------------------------
      // Support OLD format:
      // ["Python", "React", "SQL"]
      //
      // Support NEW format:
      // [
      //   { name: "Python", level: "Intermediate" },
      //   { name: "React", level: "Beginner" }
      // ]
      // ----------------------------------------------------------

      const structuredSkills = skills
        .map((skill) => {
          if (typeof skill === "string") {
            return {
              name: skill,
              level: "Beginner",
            };
          }

          if (
            skill &&
            typeof skill === "object" &&
            skill.name
          ) {
            return {
              name: skill.name,
              level: skill.level || "Beginner",
            };
          }

          return null;
        })
        .filter(Boolean);

      setSelectedSkills(structuredSkills);

      // ----------------------------------------------------------
      // Existing skill names also appear in the optional text box
      // for backward compatibility.
      // ----------------------------------------------------------

      const skillNames = structuredSkills
        .map((skill) => skill.name)
        .filter(Boolean);

      setSkillsText(skillNames.join(", "));
    } catch (err) {
      console.error(
        "Profile loading error:",
        err
      );

      setError(
        err.message ||
          "Unable to load your profile."
      );
    } finally {
      setLoading(false);
    }
  }

  // ============================================================
  // TOGGLE INTEREST
  // ============================================================

  function toggleInterest(interest) {
    setSelectedInterests((previous) => {
      if (previous.includes(interest)) {
        return previous.filter(
          (item) => item !== interest
        );
      }

      return [...previous, interest];
    });
  }

  // ============================================================
  // TOGGLE SKILL
  // ============================================================

  function toggleSkill(skill) {
    setSelectedSkills((previous) => {
      const exists = previous.some(
        (item) => item.name === skill
      );

      if (exists) {
        return previous.filter(
          (item) => item.name !== skill
        );
      }

      return [
        ...previous,
        {
          name: skill,
          level: "Beginner",
        },
      ];
    });
  }

  // ============================================================
  // CHANGE SKILL LEVEL
  // ============================================================

  function changeSkillLevel(skillName, level) {
    setSelectedSkills((previous) =>
      previous.map((skill) =>
        skill.name === skillName
          ? {
              ...skill,
              level,
            }
          : skill
      )
    );
  }

  // ============================================================
  // GET SELECTED SKILL
  // ============================================================

  function getSelectedSkill(skillName) {
    return selectedSkills.find(
      (skill) => skill.name === skillName
    );
  }

  // ============================================================
  // SAVE PROFILE
  // ============================================================

  async function handleContinue(event) {
    event.preventDefault();

    setError("");

    // Interests remain required.
    if (selectedInterests.length === 0) {
      setError(
        "Please select at least one area of interest."
      );
      return;
    }

    setSaving(true);

    try {
      // ----------------------------------------------------------
      // GET USER
      // ----------------------------------------------------------

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        navigate("/login");
        return;
      }

      // ----------------------------------------------------------
      // OPTIONAL EXTRA SKILLS
      // ----------------------------------------------------------

      const extraSkills = skillsText
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);

      // ----------------------------------------------------------
      // COMBINE STRUCTURED SKILLS + FREE TEXT SKILLS
      //
      // Prevent duplicates.
      //
      // Skills selected from the cards keep their level.
      // Extra skills from the text box get Beginner by default.
      // ----------------------------------------------------------

      const skillMap = new Map();

      selectedSkills.forEach((skill) => {
        if (skill?.name?.trim()) {
          skillMap.set(skill.name.trim().toLowerCase(), {
            name: skill.name.trim(),
            level:
              skill.level || "Beginner",
          });
        }
      });

      extraSkills.forEach((skill) => {
        const key = skill.toLowerCase();

        if (!skillMap.has(key)) {
          skillMap.set(key, {
            name: skill,
            level: "Beginner",
          });
        }
      });

      const finalSkills = Array.from(
        skillMap.values()
      );

      // ----------------------------------------------------------
      // SAVE EXISTING DATABASE FIELD
      // ----------------------------------------------------------

      const {
        error: updateError,
      } = await supabase
        .from("students")
        .update({
          interests: selectedInterests,
          skills: finalSkills,
        })
        .eq("auth_id", user.id);

      if (updateError) {
        throw updateError;
      }

      console.log(
        "STUDENT PROFILE SAVED SUCCESSFULLY:",
        {
          interests: selectedInterests,
          skills: finalSkills,
        }
      );

      // ----------------------------------------------------------
      // NEXT PAGE
      // ----------------------------------------------------------

      navigate("/career-selection");
    } catch (err) {
      console.error(
        "PROFILE SAVE ERROR:",
        err
      );

      setError(
        err.message ||
          "Something went wrong while saving your profile."
      );
    } finally {
      setSaving(false);
    }
  }

  // ============================================================
  // LOADING SCREEN
  // ============================================================

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">
          <Sparkles size={28} />

          <p>
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="profile-page">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="profile-header">

        <Link
          to="/"
          className="auth-brand"
        >
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
          PROFILE SETUP{" "}
          <span>02 / 03</span>
        </div>

      </header>

      {/* ======================================================
          MAIN
      ====================================================== */}

      <main className="profile-main">

        {/* ====================================================
            JOURNEY
        ==================================================== */}

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
              Tell us about your interests and current
              skills. CareerPath AI will use this
              information to understand which career
              paths fit you best.
            </p>

          </div>

          <div className="setup-steps">

            {/* STEP 01 */}

            <div className="setup-step">

              <div className="step-icon">
                <UserRound size={17} />
              </div>

              <div>
                <small>
                  STEP 01
                </small>

                <strong>
                  About You
                </strong>
              </div>

            </div>

            <div className="setup-line" />

            {/* STEP 02 */}

            <div className="setup-step active">

              <div className="step-icon">
                <Sparkles size={17} />
              </div>

              <div>
                <small>
                  STEP 02
                </small>

                <strong>
                  Profile
                </strong>
              </div>

            </div>

            <div className="setup-line" />

            {/* STEP 03 */}

            <div className="setup-step">

              <div className="step-icon">
                <GraduationCap size={17} />
              </div>

              <div>
                <small>
                  STEP 03
                </small>

                <strong>
                  Career Path
                </strong>
              </div>

            </div>

          </div>

        </aside>

        {/* ====================================================
            FORM SECTION
        ==================================================== */}

        <section className="profile-form-section">

          <div className="form-heading">

            <div className="profile-kicker">

              <span />

              YOUR PROFILE

              <span />

            </div>

            <h1>
              What drives
              <br />
              <span>your career?</span>
            </h1>

            <p>
              Select the areas you're interested in
              and tell us about the skills you already
              have.
            </p>

          </div>

          <form
            className="profile-form"
            onSubmit={handleContinue}
          >

            {/* =================================================
                INTERESTS
            ================================================= */}

            <section className="profile-review-card">

              <div className="profile-review-header">

                <div>

                  <span className="review-kicker">
                    INTERESTS
                  </span>

                  <h2>
                    What interests you?
                  </h2>

                  <p className="review-description">
                    Select the areas you'd like to
                    explore as a career.
                  </p>

                </div>

                <div className="review-header-icon">
                  <Sparkles size={19} />
                </div>

              </div>

              <div className="interest-grid">

                {interestCategories.map(
                  (category) =>
                    category.skills.map(
                      (skill) => {

                        const selectedSkill =
                          getSelectedSkill(skill);

                        const selected =
                          Boolean(selectedSkill);

                        return (
                          <div
                            key={skill}
                            className={`skill-selection-wrapper ${
                              selected
                                ? "selected"
                                : ""
                            }`}
                          >

                            {/* SKILL BUTTON */}

                            <button
                              type="button"
                              className={`interest-chip ${
                                selected
                                  ? "selected"
                                  : ""
                              }`}
                              onClick={() =>
                                toggleSkill(skill)
                              }
                              aria-expanded={selected}
                            >

                              <span>
                                {skill}
                              </span>

                              <span className="interest-chip-right">

                                {selected && (
                                  <Check size={13} />
                                )}

                                <ChevronDown
                                  size={13}
                                  className={`skill-dropdown-chevron ${
                                    selected
                                      ? "open"
                                      : ""
                                  }`}
                                />

                              </span>

                            </button>

                            {/* LEVEL SELECTOR */}

                            {selected && (
                              <div className="skill-level-box">

                                <span>
                                  Skill Level
                                </span>

                                <select
                                  value={
                                    selectedSkill.level ||
                                    "Beginner"
                                  }
                                  onChange={(event) =>
                                    changeSkillLevel(
                                      skill,
                                      event.target.value
                                    )
                                  }
                                  onClick={(event) =>
                                    event.stopPropagation()
                                  }
                                >

                                  {skillLevels.map(
                                    (level) => (
                                      <option
                                        key={level}
                                        value={level}
                                      >
                                        {level}
                                      </option>
                                    )
                                  )}

                                </select>

                              </div>
                            )}

                          </div>
                        );
                      }
                    )
                )}

              </div>

            </section>

            {/* =================================================
                CURRENT SKILLS
            ================================================= */}

            <section className="profile-review-card skills-message-card">

              <div className="profile-review-header">

                <div>

                  <div className="review-kicker-row">

                    <span className="review-kicker">
                      CURRENT SKILLS
                    </span>

                    <span className="optional-label">
                      OPTIONAL
                    </span>

                  </div>

                  <h2>
                    What can you do?
                  </h2>

                  <p className="review-description">
                    Already know some skills, tools or
                    technologies? Add anything that isn't
                    listed above.
                  </p>

                </div>

                <div className="review-header-icon">
                  <MessageSquareText size={19} />
                </div>

              </div>

              <div className="skills-message-wrapper">

                <MessageSquareText size={17} />

                <textarea
                  value={skillsText}
                  onChange={(event) =>
                    setSkillsText(
                      event.target.value
                    )
                  }
                  placeholder="e.g. Python, React, SQL, JavaScript, HTML/CSS, Git, Linux..."
                  rows={6}
                />

              </div>

              <p className="skills-message-hint">
                Optional. Add additional skills separated
                by commas.
              </p>

            </section>

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
              <div className="profile-form-error">
                {error}
              </div>
            )}

            {/* =================================================
                SUMMARY + CONTINUE
            ================================================= */}

            <div className="profile-selection-footer">

              <div className="selected-count">

                {selectedInterests.length}{" "}
                {selectedInterests.length === 1
                  ? "interest"
                  : "interests"}

                {" • "}

                {selectedSkills.length}{" "}

                {selectedSkills.length === 1
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
                  : "Continue to Career Recommendations"}

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