import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  ArrowRight,
  Award,
  BarChart3,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  LogOut,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";

function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    career = "Frontend Developer",
    score = 0,
    total = 25,
    answers = {},
    questions = [],
  } = location.state || {};

  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

  const getLevel = () => {
    if (percentage >= 80) return "Strong Foundation";
    if (percentage >= 60) return "Developing";
    return "Needs Improvement";
  };

  const getMessage = () => {
    if (percentage >= 80) {
      return "You already have a strong foundation for this career path.";
    }

    if (percentage >= 60) {
      return "You have a good starting point. Strengthening a few key skills can move you closer to your target role.";
    }

    return "You have room to grow. Focus on the recommended skills to build a stronger foundation.";
  };

  // Build skill results from assessment questions
  const skillResults = {};

  questions.forEach((question) => {
    const skill = question.skill_mapping || question.core_skill;

    if (!skill) return;

    if (!skillResults[skill]) {
      skillResults[skill] = {
        skill,
        correct: 0,
        total: 0,
      };
    }

    skillResults[skill].total += 1;

    const answer = answers[question.assessment_id];

    if (answer === question.correct_answer) {
      skillResults[skill].correct += 1;
    }
  });

  let skills = Object.values(skillResults);

  // Fallback for dashboard preview
  if (!skills.length) {
    skills = [
      {
        skill: "Core Technical Skills",
        correct: percentage >= 70 ? 4 : 2,
        total: 5,
      },
      {
        skill: "Problem Solving",
        correct: percentage >= 70 ? 4 : 3,
        total: 5,
      },
      {
        skill: "Tools & Technologies",
        correct: percentage >= 70 ? 3 : 2,
        total: 5,
      },
    ];
  }

  return (
    <div className="dashboard-page">

      {/* HEADER */}
      <header className="dashboard-header">

        <Link to="/" className="dashboard-brand">
          <div className="dashboard-brand-mark">
            <Sparkles size={17} />
          </div>

          <div>
            <span>CAREERPATH</span>
            <small>AI</small>
          </div>
        </Link>

        <div className="dashboard-header-right">
          <span className="dashboard-status">
            <span className="status-dot" />
            ASSESSMENT COMPLETE
          </span>

          <button
            className="dashboard-logout"
            onClick={() => navigate("/")}
          >
            <LogOut size={16} />
            Exit
          </button>
        </div>

      </header>


      {/* MAIN */}
      <main className="dashboard-main">

        {/* HERO */}
        <section className="dashboard-hero">

          <div className="hero-copy">

            <span className="dashboard-kicker">
              YOUR CAREERPATH
            </span>

            <h1>
              Your path to becoming a
              <span>{career}</span>
            </h1>

            <p>
              {getMessage()}
            </p>

            <div className="hero-actions">

              <button
                className="gold-button"
                onClick={() => navigate("/career-selection")}
              >
                Explore Career Paths
                <ArrowRight size={17} />
              </button>

              <button
                className="outline-button"
                onClick={() =>
                  navigate("/assessment", {
                    state: { career },
                  })
                }
              >
                Retake Assessment
              </button>

            </div>

          </div>


          {/* SCORE */}
          <div className="score-card">

            <div className="score-card-top">
              <span>OVERALL SCORE</span>
              <Award size={19} />
            </div>

            <div className="score-circle">

              <div>
                <strong>{percentage}%</strong>
                <span>SKILL MATCH</span>
              </div>

            </div>

            <div className="score-bottom">
              <strong>{getLevel()}</strong>
              <span>
                {score} / {total} points
              </span>
            </div>

          </div>

        </section>


        {/* STATS */}
        <section className="dashboard-stats">

          <div className="stat-card">
            <div className="stat-icon">
              <Target size={18} />
            </div>

            <div>
              <span>TARGET CAREER</span>
              <strong>{career}</strong>
            </div>
          </div>


          <div className="stat-card">
            <div className="stat-icon">
              <BarChart3 size={18} />
            </div>

            <div>
              <span>ASSESSMENT SCORE</span>
              <strong>{percentage}%</strong>
            </div>
          </div>


          <div className="stat-card">
            <div className="stat-icon">
              <BrainCircuit size={18} />
            </div>

            <div>
              <span>SKILLS ANALYZED</span>
              <strong>{skills.length}</strong>
            </div>
          </div>


          <div className="stat-card">
            <div className="stat-icon">
              <TrendingUp size={18} />
            </div>

            <div>
              <span>STATUS</span>
              <strong>{getLevel()}</strong>
            </div>
          </div>

        </section>


        {/* CONTENT GRID */}
        <section className="dashboard-grid">

          {/* SKILL BREAKDOWN */}
          <div className="dashboard-panel skills-panel">

            <div className="panel-heading">

              <div>
                <span className="panel-kicker">
                  SKILL ANALYSIS
                </span>

                <h2>Your skill breakdown</h2>
              </div>

              <BarChart3 size={20} />

            </div>


            <div className="skills-list">

              {skills.map((item, index) => {

                const skillPercentage =
                  item.total > 0
                    ? Math.round(
                        (item.correct / item.total) * 100
                      )
                    : 0;

                return (
                  <div className="skill-row" key={index}>

                    <div className="skill-row-header">

                      <span>{item.skill}</span>

                      <strong>
                        {skillPercentage}%
                      </strong>

                    </div>

                    <div className="skill-progress">

                      <div
                        style={{
                          width: `${skillPercentage}%`,
                        }}
                      />

                    </div>

                    <small>
                      {skillPercentage >= 70
                        ? "Strong"
                        : skillPercentage >= 50
                        ? "Developing"
                        : "Needs focus"}
                    </small>

                  </div>
                );
              })}

            </div>

          </div>


          {/* RECOMMENDATIONS */}
          <div className="dashboard-panel">

            <div className="panel-heading">

              <div>
                <span className="panel-kicker">
                  AI INSIGHTS
                </span>

                <h2>Recommended next steps</h2>
              </div>

              <Sparkles size={20} />

            </div>


            <div className="recommendation-list">

              <div className="recommendation">

                <div className="recommendation-number">
                  01
                </div>

                <div>
                  <strong>
                    Strengthen your core skills
                  </strong>

                  <p>
                    Focus on the skills where your
                    assessment score is below 70%.
                  </p>
                </div>

                <ChevronRight size={17} />

              </div>


              <div className="recommendation">

                <div className="recommendation-number">
                  02
                </div>

                <div>
                  <strong>
                    Build a practical project
                  </strong>

                  <p>
                    Apply what you learn through a
                    real-world portfolio project.
                  </p>
                </div>

                <ChevronRight size={17} />

              </div>


              <div className="recommendation">

                <div className="recommendation-number">
                  03
                </div>

                <div>
                  <strong>
                    Continue your learning roadmap
                  </strong>

                  <p>
                    Follow a structured learning path
                    based on your target career.
                  </p>
                </div>

                <ChevronRight size={17} />

              </div>

            </div>

          </div>

        </section>


        {/* ROADMAP */}
        <section className="roadmap-section">

          <div className="roadmap-heading">

            <div>
              <span className="panel-kicker">
                YOUR JOURNEY
              </span>

              <h2>Career roadmap</h2>
            </div>

            <span className="roadmap-label">
              01 / 04
            </span>

          </div>


          <div className="roadmap">

            <div className="roadmap-item active">

              <div className="roadmap-icon">
                <CheckCircle2 size={18} />
              </div>

              <div>
                <span>STEP 01</span>
                <strong>Skill Assessment</strong>
                <p>Completed</p>
              </div>

            </div>


            <div className="roadmap-line" />


            <div className="roadmap-item">

              <div className="roadmap-icon">
                <GraduationCap size={18} />
              </div>

              <div>
                <span>STEP 02</span>
                <strong>Learning Roadmap</strong>
                <p>Recommended next</p>
              </div>

            </div>


            <div className="roadmap-line" />


            <div className="roadmap-item">

              <div className="roadmap-icon">
                <Target size={18} />
              </div>

              <div>
                <span>STEP 03</span>
                <strong>Projects</strong>
                <p>Build your portfolio</p>
              </div>

            </div>


            <div className="roadmap-line" />


            <div className="roadmap-item">

              <div className="roadmap-icon">
                <Award size={18} />
              </div>

              <div>
                <span>STEP 04</span>
                <strong>Career Ready</strong>
                <p>Track your progress</p>
              </div>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default Dashboard;