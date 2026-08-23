import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
     PROFILE FORM DATA
     ========================================= */

  const [formData, setFormData] = useState({
    name: "",
    education: "",
    institution: "",
    yearOfStudy: "",
    email: "",
  });

  /* =========================================
     INTERESTS
     ========================================= */

  const [selectedInterests, setSelectedInterests] = useState([]);

  const interests = [
    "Web Development",
    "Cybersecurity",
    "Artificial Intelligence",
    "Data & Analytics",
    "Cloud Computing",
    "Design & User Experience",
  ];

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
     HANDLE INTEREST SELECTION
     ========================================= */

  const toggleInterest = (interest) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((item) => item !== interest)
        : [...prev, interest]
    );
  };

  /* =========================================
     CONTINUE
     ========================================= */

  const handleContinue = (e) => {
    e.preventDefault();

    // Frontend only for now.
    // Your teammate can connect formData and
    // selectedInterests to Supabase later.

    navigate("/career-selection");
  };

  return (
    <div className="profile-page">
      {/* =========================================
          HEADER
      ========================================== */}

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

      {/* =========================================
          MAIN
      ========================================== */}

      <main className="profile-main">
        {/* =======================================
            LEFT SIDEBAR
        ======================================== */}

        <aside className="profile-sidebar">
          <div className="sidebar-title">
            <span className="sidebar-kicker">YOUR JOURNEY</span>

            <h2>
              Let's understand
              <br />
              <span>you better.</span>
            </h2>

            <p>
              Your profile helps CareerPath AI understand your starting
              point and create a more relevant career journey for you.
            </p>
          </div>

          {/* JOURNEY STEPS */}

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

        {/* =======================================
            RIGHT CONTENT
        ======================================== */}

        <section className="profile-form-section">
          {/* =====================================
              PAGE HEADING
          ====================================== */}

          <div className="form-heading">
            <div className="profile-kicker">
              <span />
              YOUR PROFILE
            </div>

            <h1>
              Tell us a little more 
              <br />
              <span>about yourself.</span>
            </h1>

            <p>
              Tell us a little more about yourself and choose the areas
              you're interested in.
            </p>
          </div>

          {/* =====================================
              PROFILE FORM
          ====================================== */}

          <form
            className="profile-form"
            onSubmit={handleContinue}
          >
            {/* ===================================
                PROFILE DETAILS CARD
            ==================================== */}

            <section className="profile-review-card">
              <div className="profile-review-header">
                <div>
                  <span className="review-kicker">
                    BASIC INFORMATION
                  </span>

                  <h2>Your profile details</h2>

                  <p className="review-description">
                    Fill in your details so CareerPath AI can understand
                    your current academic background.
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
                      placeholder="Enter your full name"
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
                        Select your education level
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
                      placeholder="Enter your institution"
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
                        Enter your year of study
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
                      placeholder="Enter your email"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* ===================================
                INTERESTS CARD
            ==================================== */}

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

                      {selected && (
                        <Check size={15} />
                      )}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* ===================================
                CONTINUE BUTTON
            ==================================== */}

            <button
              type="submit"
              className="profile-continue"
            >
              Continue to Career Selection
              <ArrowRight size={17} />
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}

export default StudentProfile;