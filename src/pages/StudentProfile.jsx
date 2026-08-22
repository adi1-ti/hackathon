import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  GraduationCap,
  UserRound,
  Building2,
  CalendarDays,
  Sparkles,
  Check,
} from "lucide-react";

function StudentProfile() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    education: "",
    university: "",
    semester: "",
  });

  const [selectedInterests, setSelectedInterests] = useState([]);

  const interests = [
    "Web Development",
    "Cybersecurity",
    "Artificial Intelligence",
    "Data Science",
    "Cloud Computing",
    "UI/UX Design",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleInterest = (interest) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((item) => item !== interest)
        : [...prev, interest]
    );
  };

  const handleContinue = (e) => {
    e.preventDefault();

    // Frontend-only for now
    navigate("/career-selection");
  };

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
              <span>you first.</span>
            </h2>

            <p>
              A better understanding of your background helps us create a
              more relevant career journey.
            </p>
          </div>

          <div className="setup-steps">
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

        {/* FORM */}
        <section className="profile-form-section">
          <div className="form-heading">
            <div className="profile-kicker">
              <span />
              ABOUT YOU
            </div>

            <h1>
              Tell us a little
              <br />
              about <span>yourself.</span>
            </h1>

            <p>
              This information will help CareerPath AI understand your
              current starting point.
            </p>
          </div>

          <form className="profile-form" onSubmit={handleContinue}>
            {/* NAME */}
            <div className="profile-input-group">
              <label htmlFor="profile-name">Full Name</label>

              <div className="profile-input">
                <UserRound size={17} />

                <input
                  id="profile-name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>

            {/* EDUCATION */}
            <div className="profile-input-group">
              <label htmlFor="education">Education</label>

              <div className="profile-input">
                <GraduationCap size={17} />

                <select
                  id="education"
                  name="education"
                  value={formData.education}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select your education</option>
                  <option value="bca">
                    Bachelor of Computer Applications
                  </option>
                  <option value="btech">
                    Bachelor of Technology
                  </option>
                  <option value="bsc">
                    Bachelor of Science
                  </option>
                  <option value="bba">
                    Bachelor of Business Administration
                  </option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* UNIVERSITY */}
            <div className="profile-input-group">
              <label htmlFor="university">
                University / Institution
              </label>

              <div className="profile-input">
                <Building2 size={17} />

                <input
                  id="university"
                  name="university"
                  type="text"
                  value={formData.university}
                  onChange={handleChange}
                  placeholder="Enter your university or college"
                  required
                />
              </div>
            </div>

            {/* SEMESTER */}
            <div className="profile-input-group">
              <label htmlFor="semester">Current Semester</label>

              <div className="profile-input">
                <CalendarDays size={17} />

                <select
                  id="semester"
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select semester</option>
                  <option value="1">Semester 1</option>
                  <option value="2">Semester 2</option>
                  <option value="3">Semester 3</option>
                  <option value="4">Semester 4</option>
                  <option value="5">Semester 5</option>
                  <option value="6">Semester 6</option>
                  <option value="7">Semester 7</option>
                  <option value="8">Semester 8</option>
                </select>
              </div>
            </div>

            {/* INTERESTS */}
            <div className="interest-section">
              <div className="interest-heading">
                <div>
                  <label>Areas You're Interested In</label>
                  <p>Select all that interest you.</p>
                </div>

                <span>
                  {selectedInterests.length} selected
                </span>
              </div>

              <div className="interest-grid">
                {interests.map((interest) => {
                  const selected =
                    selectedInterests.includes(interest);

                  return (
                    <button
                      type="button"
                      key={interest}
                      className={`interest-chip ${
                        selected ? "selected" : ""
                      }`}
                      onClick={() => toggleInterest(interest)}
                    >
                      <span>{interest}</span>

                      {selected && <Check size={15} />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CONTINUE */}
            <button type="submit" className="profile-continue">
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