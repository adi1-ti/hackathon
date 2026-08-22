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
  const [customEducation, setCustomEducation] = useState("");
  const [customInterest, setCustomInterest] = useState("");

  const interests = [
    "Web Development",
    "App Development",
    "Cybersecurity",
    "Artificial Intelligence",
    "Machine Learning",
    "Data Science",
    "Data Analytics",
    "Cloud Computing",
    "DevOps",
    "UI/UX Design",
    "Software Engineering",
    "Game Development",
    "Blockchain",
    "Networking",
    "Robotics",
    "IoT",
    "Graphic Design",
    "Digital Marketing",
    "Content Creation",
    "Finance",
    "Entrepreneurship",
    "Business Management",
    "Research",
    "Teaching",
    "Writing",
    "Other",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Reset semester when switching to Class 11 or Class 12
    if (name === "education") {
      if (value === "class11" || value === "class12") {
        setFormData((prev) => ({
          ...prev,
          education: value,
          semester: "",
        }));
      }

      if (value !== "other") {
        setCustomEducation("");
      }
    }
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

  const isSchoolStudent =
    formData.education === "class11" ||
    formData.education === "class12";

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
          <div className="form-heading-layout">

  <div className="profile-avatar">
    <svg
      viewBox="0 0 120 120"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Profile illustration"
    >
      <circle cx="60" cy="60" r="48" className="avatar-glow" />

      <circle cx="60" cy="45" r="20" className="avatar-head" />

      <path
        d="M28 100C30 77 43 68 60 68C77 68 90 77 92 100"
        className="avatar-body"
      />

      <circle cx="53" cy="44" r="2.5" className="avatar-eye" />
      <circle cx="67" cy="44" r="2.5" className="avatar-eye" />

      <path
        d="M54 53 Q60 58 66 53"
        className="avatar-smile"
        fill="none"
      />

      <path
        d="M21 31 L23 36 L28 38 L23 40 L21 45 L19 40 L14 38 L19 36 Z"
        className="avatar-spark"
      />

      <path
        d="M96 55 L98 60 L103 62 L98 64 L96 69 L94 64 L89 62 L94 60 Z"
        className="avatar-spark"
      />
    </svg>
  </div>

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

                  <option value="class11">Class 11</option>
                  <option value="class12">Class 12</option>

                  <option value="diploma">Diploma</option>
                  <option value="iti">ITI / Vocational</option>

                  <option value="bca">
                    Bachelor of Computer Applications
                  </option>

                  <option value="btech">
                    Bachelor of Technology / Engineering
                  </option>

                  <option value="bsc">
                    Bachelor of Science
                  </option>

                  <option value="bba">
                    Bachelor of Business Administration
                  </option>

                  <option value="ba">
                    Bachelor of Arts
                  </option>

                  <option value="bcom">
                    Bachelor of Commerce
                  </option>

                  <option value="bcs">
                    Bachelor of Computer Science
                  </option>

                  <option value="bpharm">
                    Bachelor of Pharmacy
                  </option>

                  <option value="bdes">
                    Bachelor of Design
                  </option>

                  <option value="llb">
                    Bachelor of Law
                  </option>

                  <option value="mca">
                    Master of Computer Applications
                  </option>

                  <option value="mba">
                    Master of Business Administration
                  </option>

                  <option value="msc">
                    Master of Science
                  </option>

                  <option value="mcom">
                    Master of Commerce
                  </option>

                  <option value="mtech">M.Tech / M.E.</option>

                  <option value="phd">PhD</option>

                  <option value="other">Other</option>
                </select>
              </div>

              {/* CUSTOM EDUCATION */}
              {formData.education === "other" && (
                <div
                  className="profile-input"
                  style={{ marginTop: "10px" }}
                >
                  <GraduationCap size={17} />

                  <input
                    type="text"
                    value={customEducation}
                    onChange={(e) =>
                      setCustomEducation(e.target.value)
                    }
                    placeholder="Enter your education"
                    required
                  />
                </div>
              )}
            </div>

            {/* UNIVERSITY / INSTITUTION */}
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
              <label htmlFor="semester">
                Current Semester <span>(if applicable)</span>
              </label>

              <div className="profile-input">
                <CalendarDays size={17} />

                <select
                  id="semester"
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  disabled={isSchoolStudent}
                  required={!isSchoolStudent}
                >
                  <option value="">
                    {isSchoolStudent
                      ? "Not applicable"
                      : "Select semester"}
                  </option>

                  {!isSchoolStudent && (
                    <>
                      <option value="1">Semester 1</option>
                      <option value="2">Semester 2</option>
                      <option value="3">Semester 3</option>
                      <option value="4">Semester 4</option>
                      <option value="5">Semester 5</option>
                      <option value="6">Semester 6</option>
                      <option value="7">Semester 7</option>
                      <option value="8">Semester 8</option>
                    </>
                  )}
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

              {/* CUSTOM INTEREST */}
              {selectedInterests.includes("Other") && (
                <div
                  className="profile-input"
                  style={{ marginTop: "12px" }}
                >
                  <Sparkles size={17} />

                  <input
                    type="text"
                    value={customInterest}
                    onChange={(e) =>
                      setCustomInterest(e.target.value)
                    }
                    placeholder="Write your area of interest"
                    required
                  />
                </div>
              )}
            </div>

            {/* CONTINUE */}
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