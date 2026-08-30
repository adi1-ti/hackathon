import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  GraduationCap,
  Loader2,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";

import { supabase } from "../supabaseClient";
import "./CareerDetails.css";

function CareerDetails() {
  const navigate = useNavigate();
  const location = useLocation();

  const recommendation =
    location.state?.recommendation;

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // ============================================================
  // NO CAREER DATA
  // ============================================================

  if (!recommendation) {
    return (
      <div className="career-details-page">

        <div className="career-details-container">

          <div className="career-details-error">

            <Sparkles size={30} />

            <h1>
              Career information unavailable
            </h1>

            <p>
              We couldn't find the career
              recommendation you selected.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/career-recommendations")
              }
              className="career-details-back"
            >
              <ArrowLeft size={17} />
              Back to Recommendations
            </button>

          </div>

        </div>

      </div>
    );
  }

  // ============================================================
  // CHOOSE CAREER
  // ============================================================

  async function handleChooseCareer() {
    setSaving(true);
    setError("");

    try {
      // ----------------------------------------------------------
      // GET USER
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
      // SAVE SELECTED CAREER
      // ----------------------------------------------------------

      const { error: updateError } =
        await supabase
          .from("students")
          .update({
            selected_career:
              recommendation.career,
          })
          .eq("auth_id", user.id);

      if (updateError) {
        throw updateError;
      }

      console.log(
        "SELECTED CAREER SAVED:",
        recommendation.career
      );

      // ----------------------------------------------------------
      // GO TO EXISTING ASSESSMENT
      // ----------------------------------------------------------

      navigate("/assessment");

    } catch (err) {
      console.error(
        "CAREER SELECTION ERROR:",
        err
      );

      setError(
        err.message ||
          "Unable to save your career selection."
      );
    } finally {
      setSaving(false);
    }
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="career-details-page">

      <div className="career-details-container">

        {/* ======================================================
            HEADER
        ====================================================== */}

        <header className="career-details-header">

          <button
            type="button"
            className="career-details-logo"
            onClick={() =>
              navigate("/career-recommendations")
            }
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="career-details-brand">

            <span>
              CAREERPATH
            </span>

            <small>
              AI
            </small>

          </div>

        </header>

        {/* ======================================================
            TOP LABEL
        ====================================================== */}

        <div className="career-details-kicker">

          <span />

          AI CAREER RECOMMENDATION

          <span />

        </div>

        {/* ======================================================
            CAREER TITLE
        ====================================================== */}

        <section className="career-details-hero">

          <div className="career-details-icon">
            <Target size={30} />
          </div>

          <div>

            <span className="career-details-number">
              YOUR RECOMMENDED CAREER
            </span>

            <h1>
              {recommendation.career}
            </h1>

            <div className="career-details-match">

              <strong>
                {recommendation.match_score ?? 0}%
              </strong>

              <span>
                Profile Match
              </span>

            </div>

          </div>

        </section>

        {/* ======================================================
            DESCRIPTION
        ====================================================== */}

        <section className="career-details-card">

          <div className="career-details-card-heading">

            <GraduationCap size={20} />

            <div>

              <span>
                ABOUT THIS CAREER
              </span>

              <h2>
                What this path involves
              </h2>

            </div>

          </div>

          <p className="career-details-description">
            {recommendation.description ||
              "This career path was recommended based on your profile."}
          </p>

        </section>


        {/* ======================================================
            WHY RECOMMENDED
        ====================================================== */}

        <section className="career-details-card">

          <div className="career-details-card-heading">

            <Sparkles size={20} />

            <div>

              <span>
                WHY CAREERPATH AI RECOMMENDED THIS
              </span>

              <h2>
                Why this career matches you
              </h2>

            </div>

          </div>

          <div className="career-details-reason">

            {recommendation.reason ||
              "This career was selected based on your interests and current skills."}

          </div>

        </section>

        {/* ======================================================
            REQUIRED SKILLS
        ====================================================== */}

        {Array.isArray(
          recommendation.required_skills
        ) &&
          recommendation.required_skills.length > 0 && (

            <section className="career-details-card">

              <div className="career-details-card-heading">

                <CheckCircle2 size={20} />

                <div>

                  <span>
                    REQUIRED SKILLS
                  </span>

                  <h2>
                    Skills you'll need
                  </h2>

                </div>

              </div>

              <div className="career-details-skills">

                {recommendation.required_skills.map(
                  (skill, index) => (

                    <div
                      className="career-details-skill"
                      key={`${skill}-${index}`}
                    >

                      <CheckCircle2 size={15} />

                      <span>
                        {typeof skill ===
                        "string"
                          ? skill
                          : skill?.name ||
                            "Skill"}
                      </span>

                    </div>

                  )
                )}

              </div>

            </section>

          )}

        {/* ======================================================
            ERROR
        ====================================================== */}

        {error && (
          <div className="career-details-inline-error">
            {error}
          </div>
        )}

        {/* ======================================================
            CHOOSE CAREER
        ====================================================== */}

        <section className="career-details-action">

          <div>

            <span>
              READY TO BEGIN?
            </span>

            <p>
              Choose this career to start your
              personalized skill assessment.
            </p>

          </div>

          <button
            type="button"
            className="career-details-choose-button"
            disabled={saving}
            onClick={handleChooseCareer}
          >

            {saving ? (
              <>
                <Loader2
                  size={17}
                  className="career-details-spinner"
                />

                Saving...
              </>
            ) : (
              <>
                Choose This Career

                <ArrowRight size={17} />
              </>
            )}

          </button>

        </section>

      </div>

    </div>
  );
}

export default CareerDetails;