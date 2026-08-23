import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Award,
  Brain,
  CheckCircle2,
  Loader2,
  LogOut,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { supabase } from "../supabaseClient";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [student, setStudent] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (!user) {
        navigate("/login");
        return;
      }

      setUser(user);

      const { data: studentData, error: studentError } = await supabase
        .from("students")
        .select("*")
        .eq("auth_id", user.id)
        .maybeSingle();

      if (studentError) throw studentError;

      setStudent(studentData);

      const { data: assessmentData, error: assessmentError } =
        await supabase
          .from("assessment_results")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

      if (assessmentError) throw assessmentError;

      setAssessment(assessmentData);
    } catch (err) {
      console.error("Dashboard loading error:", err);
      setError(err.message || "Unable to load your dashboard.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/login");
  }

  function getPerformanceLabel(percentage) {
    if (percentage >= 80) return "Excellent";
    if (percentage >= 60) return "Good";
    if (percentage >= 40) return "Needs Improvement";
    return "Beginner";
  }

  function getPerformanceMessage(percentage) {
    if (percentage >= 80) {
      return "You have a strong foundation for your selected career.";
    }

    if (percentage >= 60) {
      return "You have a good foundation. A few focused improvements can take you further.";
    }

    if (percentage >= 40) {
      return "You have started well. Focus on strengthening your core skills.";
    }

    return "This is a great starting point. Let's build your skills step by step.";
  }

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-loading">
          <Loader2 className="dashboard-spinner" size={30} />
          <p>Preparing your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-error">
          <Sparkles size={32} />
          <h1>Something went wrong</h1>
          <p>{error}</p>

          <button type="button" onClick={loadDashboard}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const career =
    assessment?.career || student?.selected_career || "Your Career";

  const score = assessment?.score ?? student?.assessment_score ?? 0;

  const totalScore =
    assessment?.total_score ?? student?.assessment_total ?? 25;

  const percentage =
    assessment?.percentage ?? student?.assessment_percentage ?? 0;

  const performance = getPerformanceLabel(percentage);
  const performanceMessage = getPerformanceMessage(percentage);

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <header className="dashboard-header">
          <button
            type="button"
            className="dashboard-logo"
            onClick={() => navigate("/")}
          >
            <Sparkles size={19} />
          </button>

          <div className="dashboard-brand">
            <span>CAREERPATH</span>
            <small>AI</small>
          </div>

          <div className="dashboard-header-actions">
            <span className="dashboard-user">{user?.email}</span>

            <button
              type="button"
              className="dashboard-logout"
              onClick={handleLogout}
              title="Logout"
            >
              <LogOut size={17} />
            </button>
          </div>
        </header>

        <section className="dashboard-hero">
          <div>
            <div className="dashboard-kicker">
              <span />
              YOUR CAREER DASHBOARD
            </div>

            <h1>
              Welcome back,
              <br />
              <span>{career}</span> explorer.
            </h1>

            <p>
              Here's a snapshot of your current skill level and assessment
              performance.
            </p>
          </div>

          <div className="dashboard-hero-icon">
            <Brain size={42} />
          </div>
        </section>

        <section className="dashboard-stats">
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-icon">
              <Target size={21} />
            </div>

            <div>
              <span>SELECTED CAREER</span>
              <strong>{career}</strong>
            </div>
          </div>

          <div className="dashboard-stat-card">
            <div className="dashboard-stat-icon">
              <Award size={21} />
            </div>

            <div>
              <span>ASSESSMENT SCORE</span>
              <strong>
                {score}/{totalScore}
              </strong>
            </div>
          </div>

          <div className="dashboard-stat-card">
            <div className="dashboard-stat-icon">
              <TrendingUp size={21} />
            </div>

            <div>
              <span>PERFORMANCE</span>
              <strong>{percentage}%</strong>
            </div>
          </div>
        </section>

        <section className="dashboard-result-grid">
          <div className="dashboard-score-card">
            <div className="dashboard-card-heading">
              <div>
                <span>ASSESSMENT RESULT</span>
                <h2>Your current skill level</h2>
              </div>

              <CheckCircle2 size={24} />
            </div>

            <div className="dashboard-score">
              <div
                className="dashboard-score-circle"
                style={{
                  "--progress": `${percentage * 3.6}deg`,
                }}
              >
                <div className="dashboard-score-inner">
                  <strong>{percentage}%</strong>
                  <span>Score</span>
                </div>
              </div>

              <div className="dashboard-performance">
                <span className="dashboard-performance-label">
                  {performance}
                </span>

                <p>{performanceMessage}</p>
              </div>
            </div>
          </div>

          <div className="dashboard-career-card">
            <div className="dashboard-card-heading">
              <div>
                <span>CAREER PATH</span>
                <h2>{career}</h2>
              </div>

              <Target size={24} />
            </div>

            <p>
              Your assessment has been evaluated based on the skills associated
              with your selected career.
            </p>

            <button
              type="button"
              className="dashboard-primary-button"
              onClick={() => navigate("/assessment")}
            >
              Retake Assessment
              <ArrowRight size={17} />
            </button>
          </div>
        </section>

        <section className="dashboard-next">
          <div className="dashboard-next-header">
            <div>
              <div className="dashboard-kicker">
                <span />
                WHAT'S NEXT
              </div>

              <h2>
                Build your career
                <br />
                <span>step by step.</span>
              </h2>
            </div>
          </div>

          <div className="dashboard-actions">
            <button
              type="button"
              className="dashboard-action-card"
              onClick={() => navigate("/assessment")}
            >
              <div className="dashboard-action-icon">
                <Brain size={22} />
              </div>

              <div>
                <strong>Improve your score</strong>
                <p>Retake the assessment and track your progress.</p>
              </div>

              <ArrowRight size={18} />
            </button>

            <button
              type="button"
              className="dashboard-action-card"
              onClick={() => navigate("/career-selection")}
            >
              <div className="dashboard-action-icon">
                <Target size={22} />
              </div>

              <div>
                <strong>Explore another career</strong>
                <p>Discover a different career path.</p>
              </div>

              <ArrowRight size={18} />
            </button>
          </div>
        </section>

        <footer className="dashboard-footer">
          <span>CAREERPATH AI</span>
          <span>Your journey. Your skills. Your future.</span>
        </footer>
      </div>
    </div>
  );
}

export default Dashboard;