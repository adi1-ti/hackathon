import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

import {
  ArrowRight,
  GraduationCap,
  UserRound,
  Building2,
  Sparkles,
  Check,
} from "lucide-react";

function StudentProfile() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [student, setStudent] = useState({
    name: "",
    education: "",
    institution: "",
    yearOfStudy: "",
  });

  const [selectedInterests, setSelectedInterests] = useState([]);

  const interests = [
    "Web Development",
    "Cybersecurity",
    "Artificial Intelligence",
    "Data & Analytics",
    "Cloud Computing",
    "Design & User Experience",
  ];

  // ==========================================
  // LOAD LOGGED-IN USER
  // ==========================================

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

      console.log("LOGGED IN USER:", user);

      // Get student information from your students table
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Student profile error:", error);
        return;
      }

      console.log("STUDENT PROFILE:", data);

      setStudent({
        name: data.name || "",
        education: data.education || "",
        institution: data.institution || "",
        yearOfStudy: data.year_of_study || "",
      });

      if (data.interests) {
        setSelectedInterests(data.interests);
      }
    } catch (error) {
      console.error("Profile loading error:", error);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // SELECT / UNSELECT INTEREST
  // ==========================================

  const toggleInterest = (interest) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((item) => item !== interest)
        : [...prev, interest]
    );
  };

  // ==========================================
  // SAVE PROFILE
  // ==========================================

  const handleContinue = async (e) => {
  e.preventDefault();

  try {
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
          name: formData.name,
          education: formData.education,
          institution: formData.university,
          year_of_study: formData.semester,
          email: user.email,
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
  }
};

  // ==========================================
  // LOADING SCREEN
  // ==========================================

  if (loading) {
    return (
      <div className="profile-page">
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================

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

            <span className="sidebar-kicker">
              YOUR JOURNEY
            </span>

            <h2>
              Let's understand
              <br />
              <span>you first.</span>
            </h2>

            <p>
              We've already collected your basic information.
              Now tell us what areas you're interested in.
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
              YOUR PROFILE
            </div>

            <h1>
              Let's understand
              <br />
              <span>you better.</span>
            </h1>

            <p>
              We've already saved your basic information.
              Review it below and choose the areas you're
              interested in.
            </p>

          </div>


          {/* STUDENT INFORMATION */}

          <div className="profile-summary">

            <div className="profile-summary-item">

              <UserRound size={17} />

              <div>
                <small>FULL NAME</small>
                <strong>{student.name || "Not provided"}</strong>
              </div>

            </div>


            <div className="profile-summary-item">

              <GraduationCap size={17} />

              <div>
                <small>EDUCATION</small>
                <strong>{student.education || "Not provided"}</strong>
              </div>

            </div>


            <div className="profile-summary-item">

              <Building2 size={17} />

              <div>
                <small>INSTITUTION</small>
                <strong>
                  {student.institution || "Not provided"}
                </strong>
              </div>

            </div>


            <div className="profile-summary-item">

              <GraduationCap size={17} />

              <div>
                <small>YEAR OF STUDY</small>
                <strong>
                  {student.yearOfStudy || "Not provided"}
                </strong>
              </div>

            </div>

          </div>


          {/* INTERESTS */}

          <form
            className="profile-form"
            onSubmit={handleContinue}
          >

            <div className="interest-section">

              <div className="interest-heading">

                <div>

                  <label>
                    Areas You're Interested In
                  </label>

                  <p>
                    Select all areas that interest you.
                  </p>

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

            </div>


            {/* CONTINUE */}

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

          </form>

        </section>

      </main>

    </div>
  );
}

export default StudentProfile;