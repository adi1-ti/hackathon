import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Sparkles,
  Check,
  Target,
  BriefcaseBusiness,
  Clock3,
  Laptop,
  GraduationCap,
} from "lucide-react";

function CareerGoals() {
  const navigate = useNavigate();

  const [selectedGoal, setSelectedGoal] = useState("");
  const [selectedTimeline, setSelectedTimeline] = useState("");
  const [selectedWorkStyle, setSelectedWorkStyle] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");

  const goals = [
    "Get my first job",
    "Get an internship",
    "Switch careers",
    "Build my skills",
    "Prepare for higher studies",
    "Start my own business",
  ];

  const timelines = [
    "3–6 months",
    "6–12 months",
    "1–2 years",
    "I'm exploring for now",
  ];

  const workStyles = [
    "Remote",
    "Hybrid",
    "On-site",
    "I'm flexible",
  ];

  const handleContinue = (e) => {
    e.preventDefault();

    navigate("/career-roadmap");
  };

  return (
    <div className="career-goals-page">

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
          PROFILE SETUP <span>03 / 03</span>
        </div>
      </header>


      {/* MAIN */}
      <main className="career-goals-main">

        {/* LEFT INTRO */}
        <section className="career-goals-intro">

          <div className="profile-kicker">
            <span />
            CAREER GOALS
          </div>

          <h1>
            What are you
            <br />
            hoping to <span>achieve?</span>
          </h1>

          <p>
            Tell us what you're working toward, and we'll shape
            your career journey around your goals.
          </p>


          {/* MINI PROGRESS */}
          <div className="goal-progress">

            <div className="goal-progress-step completed">
              <div className="goal-step-icon">
                <Check size={15} />
              </div>

              <span>About You</span>
            </div>

            <div className="goal-progress-line active" />

            <div className="goal-progress-step completed">
              <div className="goal-step-icon">
                <Check size={15} />
              </div>

              <span>Career Selection</span>
            </div>

            <div className="goal-progress-line active" />

            <div className="goal-progress-step active">
              <div className="goal-step-icon">
                <Target size={15} />
              </div>

              <span>Career Goals</span>
            </div>

          </div>

        </section>


        {/* FORM */}
        <section className="career-goals-form-section">

          <form
            className="career-goals-form"
            onSubmit={handleContinue}
          >

            {/* MAIN GOAL */}
            <div className="goal-section">

              <div className="goal-section-heading">
                <div className="goal-heading-icon">
                  <Target size={17} />
                </div>

                <div>
                  <h3>What is your main goal?</h3>
                  <p>Choose the option that best describes you.</p>
                </div>
              </div>


              <div className="goal-options-grid">

                {goals.map((goal) => {
                  const selected = selectedGoal === goal;

                  return (
                    <button
                      key={goal}
                      type="button"
                      className={`goal-option ${
                        selected ? "selected" : ""
                      }`}
                      onClick={() => setSelectedGoal(goal)}
                    >
                      <span>{goal}</span>

                      {selected && (
                        <span className="goal-option-check">
                          <Check size={13} />
                        </span>
                      )}
                    </button>
                  );
                })}

              </div>

            </div>


            {/* TIMELINE */}
            <div className="goal-section">

              <div className="goal-section-heading">
                <div className="goal-heading-icon">
                  <Clock3 size={17} />
                </div>

                <div>
                  <h3>How soon do you want to achieve it?</h3>
                  <p>We'll use this to shape your roadmap.</p>
                </div>
              </div>


              <div className="goal-options-row">

                {timelines.map((timeline) => {
                  const selected =
                    selectedTimeline === timeline;

                  return (
                    <button
                      key={timeline}
                      type="button"
                      className={`goal-option ${
                        selected ? "selected" : ""
                      }`}
                      onClick={() =>
                        setSelectedTimeline(timeline)
                      }
                    >
                      <span>{timeline}</span>

                      {selected && (
                        <span className="goal-option-check">
                          <Check size={13} />
                        </span>
                      )}
                    </button>
                  );
                })}

              </div>

            </div>


            {/* WORK STYLE */}
            <div className="goal-section">

              <div className="goal-section-heading">
                <div className="goal-heading-icon">
                  <Laptop size={17} />
                </div>

                <div>
                  <h3>What type of work environment do you prefer?</h3>
                  <p>Pick the environment that feels right for you.</p>
                </div>
              </div>


              <div className="goal-options-row">

                {workStyles.map((style) => {
                  const selected =
                    selectedWorkStyle === style;

                  return (
                    <button
                      key={style}
                      type="button"
                      className={`goal-option ${
                        selected ? "selected" : ""
                      }`}
                      onClick={() =>
                        setSelectedWorkStyle(style)
                      }
                    >
                      <span>{style}</span>

                      {selected && (
                        <span className="goal-option-check">
                          <Check size={13} />
                        </span>
                      )}
                    </button>
                  );
                })}

              </div>

            </div>


            {/* ADDITIONAL INFORMATION */}
            <div className="goal-section">

              <div className="goal-section-heading">
                <div className="goal-heading-icon">
                  <BriefcaseBusiness size={17} />
                </div>

                <div>
                  <h3>
                    Anything else you'd like us to know?
                  </h3>
                  <p>
                    This is optional. Tell us anything that could
                    help personalize your journey.
                  </p>
                </div>
              </div>


              <textarea
                value={additionalInfo}
                onChange={(e) =>
                  setAdditionalInfo(e.target.value)
                }
                placeholder="Tell us about your goals, interests, dream role, or anything else..."
                rows="4"
              />

            </div>


            {/* CONTINUE */}
            <div className="career-goals-footer">

              <div className="footer-progress">
                <GraduationCap size={15} />
                <span>FINAL STEP</span>
              </div>

              <button
                type="submit"
                className="profile-continue"
                disabled={
                  !selectedGoal ||
                  !selectedTimeline ||
                  !selectedWorkStyle
                }
              >
                Build My Career Roadmap
                <ArrowRight size={17} />
              </button>

            </div>

          </form>

        </section>

      </main>

    </div>
  );
}

export default CareerGoals;