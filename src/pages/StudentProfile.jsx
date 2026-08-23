import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

import {
  ArrowRight,
  GraduationCap,
  UserRound,
  Building2,
  CalendarDays,
  Mail,
  Sparkles,
  Check,
} from "lucide-react";

function StudentProfile() {
  const navigate = useNavigate();

  /* =========================================
     PROFILE DATA
  ========================================= */

  const [formData, setFormData] = useState({
    name: "",
    education: "",
    institution: "",
    yearOfStudy: "",
    email: "",
  });

  const [selectedInterests, setSelectedInterests] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /* =========================================
     INTERESTS
  ========================================= */

  const interests = [
    "Web Development",
    "Cybersecurity",
    "Artificial Intelligence",
    "Data & Analytics",
    "Cloud Computing",
    "Design & User Experience",
  ];

  /* =========================================
     LOAD LOGGED-IN STUDENT
  ========================================= */

  useEffect(() => {
    loadStudentProfile();
  }, []);

  const loadStudentProfile = async () => {
    try {
      setLoading(true);

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        console.error("No logged-in user:", authError);
        navigate("/login");
        return;
      }

      const { data, error } = await supabase
        .from("students")
        .select(
          "id, auth_id, name, institution, education, year_of_study, email, interests"
        )
        .eq("auth_id", user.id)
        .single();

      if (error) {
        console.error("Student profile error:", error);
        return;
      }

      setFormData({
        name: data.name || "",
        education: data.education || "",
        institution: data.institution || "",
        yearOfStudy: data.year_of_study || "",
        email: data.email || user.email || "",
      });

      setSelectedInterests(
        Array.isArray(data.interests) ? data.interests : []
      );
    } catch (error) {
      console.error("Profile loading error:", error);
    } finally {
      setLoading(false);
    }
  };

  /* =========================================
     HANDLE PROFILE INPUTS
  ========================================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =========================================
     TOGGLE INTEREST
  ========================================= */

  const toggleInterest = (interest) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((item) => item !== interest)
        : [...prev, interest]
    );
  };

  /* =========================================
     SAVE PROFILE + CONTINUE
  ========================================= */

  const handleContinue = async (e) => {
    e.preventDefault();

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
        .upsert(
          {
            auth_id: user.id,
            name: formData.name.trim(),
            education: formData.education,
            institution: formData.institution.trim(),
            year_of_study: formData.yearOfStudy,
            email: formData.email.trim() || user.email || "",
            interests: selectedInterests,
          },
          {
            onConflict: "auth_id",
          }
        );

      if (error) {
        console.error("PROFILE SAVE ERROR:", error);
        alert(error.message);
        return;
      }

      console.log("PROFILE SAVED SUCCESSFULLY");

      navigate("/career-selection");
    } catch (error) {
      console.error("PROFILE ERROR:", error);
      alert("Something went wrong while saving your profile.");
    } finally {
      setSaving(false);
    }
  };

  /* =========================================
     LOADING SCREEN
  ========================================= */

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">
          <Sparkles size={28} />
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  /* =========================================
     PAGE
  ========================================= */

  return (
    <div className="profile-page">
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
          PROFILE SETUP <span>01 / 03</span>
        </div>
      </header>

      {/* MAIN */}

      <main className="profile-main">
        {/* SIDEBAR */}

        <aside className="profile-sidebar">
          <div className="sidebar-title">
            <span className="sidebar-kicker">YOUR JOURNEY</span>

            <h2>
              Let's understand
              <br />
              <span>you better.</span>
            </h2>

            <p>
              We've already saved your basic information. Review it below
              and choose the areas you're interested in.
            </p>
          </div>

          <div className="setup-steps">
            {/* STEP 01 */}

            <div className="setup-step active">
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

            <div className="setup-step">
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

        {/* CONTENT */}

        <section className="profile-form-section">
          {/* PAGE HEADING */}

          <div className="form-heading">
            <div className="profile-kicker">
              <span />
              YOUR PROFILE
            </div>

            <h1>
              Let's understand
              <br />
              <span>you better.</span>
            </h1>

            <p>
              We've already saved your basic information. Review it below
              and choose the areas you're interested in.
            </p>
          </div>

          {/* FORM */}

          <form
            className="profile-form"
            onSubmit={handleContinue}
          >
            {/* =====================================
                BASIC INFORMATION
            ====================================== */}

            <section className="profile-review-card">
              <div className="profile-review-header">
                <div>
                  <span className="review-kicker">
                    BASIC INFORMATION
                  </span>

                  <h2>Your profile details</h2>

                  <p className="review-description">
                    Review and update your information before continuing.
                  </p>
                </div>

                <div className="review-header-icon">
                  <UserRound size={20} />
                </div>
              </div>

              <div className="profile-info-grid">
                {/* FULL NAME */}

                <div className="profile-info-item">
                  <div className="profile-info-icon">
                    <UserRound size={17} />
                  </div>

                  <div className="profile-info-content">
                    <label htmlFor="profile-name">
                      Full Name
                    </label>

                    <input
                      id="profile-name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Not provided"
                    />
                  </div>
                </div>

                {/* EDUCATION */}

                <div className="profile-info-item">
                  <div className="profile-info-icon">
                    <GraduationCap size={17} />
                  </div>

                  <div className="profile-info-content">
                    <label htmlFor="education">
                      Education
                    </label>

                    <select
                      id="education"
                      name="education"
                      value={formData.education}
                      onChange={handleChange}
                    >
                      <option value="">
                        Not provided
                      </option>

                      <option value="Class 11">
                        Class 11
                      </option>

                      <option value="Class 12">
                        Class 12
                      </option>

                      <option value="Diploma">
                        Diploma
                      </option>

                      <option value="Bachelor of Computer Applications">
                        Bachelor of Computer Applications
                      </option>

                      <option value="Bachelor of Technology / Engineering">
                        Bachelor of Technology / Engineering
                      </option>

                      <option value="Bachelor of Science">
                        Bachelor of Science
                      </option>

                      <option value="Bachelor of Business Administration">
                        Bachelor of Business Administration
                      </option>

                      <option value="Bachelor of Arts">
                        Bachelor of Arts
                      </option>

                      <option value="Bachelor of Commerce">
                        Bachelor of Commerce
                      </option>

                      <option value="Master of Computer Applications">
                        Master of Computer Applications
                      </option>

                      <option value="Master of Business Administration">
                        Master of Business Administration
                      </option>

                      <option value="Master of Science">
                        Master of Science
                      </option>

                      <option value="M.Tech / M.E.">
                        M.Tech / M.E.
                      </option>

                      <option value="PhD">
                        PhD
                      </option>

                      <option value="Other">
                        Other
                      </option>
                    </select>
                  </div>
                </div>

                {/* INSTITUTION */}

                <div className="profile-info-item">
                  <div className="profile-info-icon">
                    <Building2 size={17} />
                  </div>

                  <div className="profile-info-content">
                    <label htmlFor="institution">
                      Institution
                    </label>

                    <input
                      id="institution"
                      name="institution"
                      type="text"
                      value={formData.institution}
                      onChange={handleChange}
                      placeholder="Not provided"
                    />
                  </div>
                </div>

                {/* YEAR OF STUDY */}

                <div className="profile-info-item">
                  <div className="profile-info-icon">
                    <CalendarDays size={17} />
                  </div>

                  <div className="profile-info-content">
                    <label htmlFor="yearOfStudy">
                      Year of Study
                    </label>

                    <select
                      id="yearOfStudy"
                      name="yearOfStudy"
                      value={formData.yearOfStudy}
                      onChange={handleChange}
                    >
                      <option value="">
                        Not provided
                      </option>

                      <option value="1st Year">
                        1st Year
                      </option>

                      <option value="2nd Year">
                        2nd Year
                      </option>

                      <option value="3rd Year">
                        3rd Year
                      </option>

                      <option value="4th Year">
                        4th Year
                      </option>

                      <option value="Final Year">
                        Final Year
                      </option>

                      <option value="Not Applicable">
                        Not Applicable
                      </option>
                    </select>
                  </div>
                </div>

                {/* EMAIL */}

                <div className="profile-info-item profile-info-item-full">
                  <div className="profile-info-icon">
                    <Mail size={17} />
                  </div>

                  <div className="profile-info-content">
                    <label htmlFor="email">
                      Email
                    </label>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Not provided"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* =====================================
                INTERESTS
            ====================================== */}

            <section className="profile-review-card interests-card">
              <div className="profile-review-header">
                <div>
                  <span className="review-kicker">
                    INTERESTS
                  </span>

                  <h2>Areas You're Interested In</h2>

                  <p className="review-description">
                    Select all areas that interest you.
                  </p>
                </div>

                <div className="selected-count">
                  {selectedInterests.length} selected
                </div>
              </div>

              <div className="interest-grid">
                {interests.map((interest) => {
                  const selected =
                    selectedInterests.includes(interest);

                  return (
                    <button
                      key={interest}
                      type="button"
                      className={`interest-chip ${
                        selected ? "selected" : ""
                      }`}
                      onClick={() =>
                        toggleInterest(interest)
                      }
                    >
                      <span>{interest}</span>

                      {selected && <Check size={15} />}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* CONTINUE */}

            <button
              type="submit"
              className="profile-continue"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : "Continue to Career Selection"}

              {!saving && <ArrowRight size={17} />}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}

export default StudentProfile;