import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { supabase } from "../supabaseClient";

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
  AlertTriangle,
  BookOpen,
  Rocket,
  Lightbulb,
  X,
} from "lucide-react";

import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const hasLoadedDashboard = useRef(false);

  const [user, setUser] = useState(null);
  const [student, setStudent] = useState(null);
  const [assessment, setAssessment] = useState(null);

  const [assessmentResult, setAssessmentResult] = useState(null);
  const [assessmentQuestions, setAssessmentQuestions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [resultLoading, setResultLoading] = useState(true);
  const [error, setError] = useState("");

  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // ============================================================
  // HELPERS
  // ============================================================

  function safelyParseJSON(value, fallback = {}) {
    if (!value) return fallback;

    if (typeof value === "object") {
      return value;
    }

    if (typeof value === "string") {
      try {
        return JSON.parse(value);
      } catch (error) {
        console.error("JSON parse error:", error);
        return fallback;
      }
    }

    return fallback;
  }

  function normalizeQuestions(questions) {
    if (!questions) return [];

    if (Array.isArray(questions)) {
      return questions;
    }

    if (typeof questions === "string") {
      try {
        const parsed = JSON.parse(questions);
        return Array.isArray(parsed) ? parsed : [];
      } catch (error) {
        console.error("Could not parse questions:", error);
        return [];
      }
    }

    return [];
  }

  function normalizeAnswers(answers) {
    if (!answers) return {};

    if (typeof answers === "object") {
      return answers;
    }

    if (typeof answers === "string") {
      try {
        return JSON.parse(answers);
      } catch (error) {
        console.error("Could not parse answers:", error);
        return {};
      }
    }

    return {};
  }

  // ============================================================
  // LOAD ASSESSMENT RESULT + QUESTIONS
  // ============================================================

  async function loadAssessmentResult(currentUser = null) {
    try {
      setResultLoading(true);

      let loggedInUser = currentUser;

      if (!loggedInUser) {
        const {
          data: { user: authUser },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) {
          throw authError;
        }

        loggedInUser = authUser;
      }

      if (!loggedInUser) {
        return;
      }

      // ----------------------------------------------------------
      // LATEST RESULT
      // ----------------------------------------------------------

      const {
        data: result,
        error: resultError,
      } = await supabase
        .from("assessment_results")
        .select("*")
        .eq("user_id", loggedInUser.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (resultError) {
        throw resultError;
      }

      if (!result) {
        console.log("NO ASSESSMENT RESULT FOUND");

        setAssessmentResult(null);
        setAssessmentQuestions([]);

        return;
      }

      console.log("LATEST ASSESSMENT RESULT:", result);

      setAssessmentResult(result);

      // ----------------------------------------------------------
      // USER ANSWERS
      // ----------------------------------------------------------

      const normalizedAnswers = normalizeAnswers(result.answers);

      console.log(
        "NORMALIZED USER ANSWERS:",
        normalizedAnswers
      );

      // ----------------------------------------------------------
      // FIND GENERATED ASSESSMENT THAT BELONGS TO THIS RESULT
      // ----------------------------------------------------------

      let generated = null;

      const {
        data: generatedBeforeResult,
        error: generatedBeforeError,
      } = await supabase
        .from("generated_assessments")
        .select("*")
        .eq("user_id", loggedInUser.id)
        .eq("career", result.career)
        .lte("created_at", result.created_at)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (generatedBeforeError) {
        console.error(
          "Error loading generated assessment before result:",
          generatedBeforeError
        );
      }

      generated = generatedBeforeResult;

      // ----------------------------------------------------------
      // FALLBACK
      // ----------------------------------------------------------

      if (!generated) {
        const {
          data: latestGenerated,
          error: latestGeneratedError,
        } = await supabase
          .from("generated_assessments")
          .select("*")
          .eq("user_id", loggedInUser.id)
          .eq("career", result.career)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (latestGeneratedError) {
          console.error(
            "Error loading latest generated assessment:",
            latestGeneratedError
          );
        }

        generated = latestGenerated;
      }

      if (!generated) {
        console.log(
          "NO GENERATED ASSESSMENT FOUND FOR RESULT"
        );

        setAssessmentQuestions([]);

        return;
      }

      console.log(
        "GENERATED ASSESSMENT USED FOR RESULT:",
        generated
      );

      const questions = normalizeQuestions(
        generated.questions
      );

      console.log(
        "GENERATED QUESTIONS:",
        questions
      );

      console.log(
        "QUESTION COUNT:",
        questions.length
      );

      setAssessmentQuestions(questions);
    } catch (error) {
      console.error(
        "Error loading assessment result:",
        error
      );

      setError(
        error?.message ||
          "Unable to load your assessment result."
      );
    } finally {
      setResultLoading(false);
    }
  }

  // ============================================================
  // LOAD COMPLETE DASHBOARD
  // ============================================================

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        throw authError;
      }

      if (!authUser) {
        navigate("/login");
        return;
      }

      setUser(authUser);

      // ----------------------------------------------------------
      // STUDENT PROFILE
      // ----------------------------------------------------------

      const {
        data: studentData,
        error: studentError,
      } = await supabase
        .from("students")
        .select("*")
        .eq("auth_id", authUser.id)
        .maybeSingle();

      if (studentError) {
        throw studentError;
      }

      console.log(
        "STUDENT PROFILE:",
        studentData
      );

      setStudent(studentData);

      // ----------------------------------------------------------
      // LATEST ASSESSMENT RESULT
      // ----------------------------------------------------------

      const {
        data: assessmentData,
        error: assessmentError,
      } = await supabase
        .from("assessment_results")
        .select("*")
        .eq("user_id", authUser.id)
        .order("created_at", {
          ascending: false,
        })
        .limit(1)
        .maybeSingle();

      if (assessmentError) {
        throw assessmentError;
      }

      console.log(
        "LATEST ASSESSMENT FROM DATABASE:",
        assessmentData
      );

      if (assessmentData) {
        console.log(
          "FULL AI ANALYSIS FROM DATABASE:",
          JSON.stringify(
            assessmentData.ai_analysis,
            null,
            2
          )
        );

        const finalAssessment = {
          ...assessmentData,
          ai_analysis: safelyParseJSON(
            assessmentData.ai_analysis,
            {}
          ),
          answers: normalizeAnswers(
            assessmentData.answers
          ),
        };

        setAssessment(finalAssessment);
      } else {
        setAssessment(null);
      }

      await loadAssessmentResult(authUser);
    } catch (err) {
      console.error(
        "Dashboard loading error:",
        err
      );

      setError(
        err?.message ||
          "Unable to load your dashboard."
      );
    } finally {
      setLoading(false);
    }
  }

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    if (hasLoadedDashboard.current) {
      return;
    }

    hasLoadedDashboard.current = true;

    loadDashboard();
  }, []);

  // ============================================================
  // LOGOUT
  // ============================================================

  function openLogoutPopup() {
    setShowLogoutPopup(true);
  }

  function closeLogoutPopup() {
    if (loggingOut) {
      return;
    }

    setShowLogoutPopup(false);
  }

  async function confirmLogout() {
    try {
      setLoggingOut(true);

      const { error: logoutError } =
        await supabase.auth.signOut();

      if (logoutError) {
        throw logoutError;
      }

      setShowLogoutPopup(false);

      navigate("/login");
    } catch (err) {
      console.error(
        "Logout error:",
        err
      );

      setLoggingOut(false);

      setError(
        err?.message ||
          "Unable to logout. Please try again."
      );
    }
  }

  // ============================================================
  // PERFORMANCE HELPERS
  // ============================================================

  function getPerformanceLabel(percentageValue) {
    const value =
      Number(percentageValue) || 0;

    if (value >= 80) return "Excellent";
    if (value >= 60) return "Good";
    if (value >= 40) return "Needs Improvement";

    return "Beginner";
  }

  function getPerformanceMessage(percentageValue) {
    const value =
      Number(percentageValue) || 0;

    if (value >= 80) {
      return "You have a strong foundation for your selected career.";
    }

    if (value >= 60) {
      return "You have a good foundation. A few focused improvements can take you further.";
    }

    if (value >= 40) {
      return "You have started well. Focus on strengthening your core skills.";
    }

    return "This is a great starting point. Let's build your skills step by step.";
  }

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-loading">
          <Loader2
            className="dashboard-spinner"
            size={30}
          />

          <p>
            Preparing your dashboard...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-error">
          <Sparkles size={32} />

          <h1>
            Something went wrong
          </h1>

          <p>
            {error}
          </p>

          <button
            type="button"
            onClick={loadDashboard}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // BASIC DATA
  // ============================================================

  const career =
    assessment?.career ||
    student?.selected_career ||
    "Your Career";

  const score =
    assessment?.score ??
    student?.assessment_score ??
    0;

  const totalScore =
    assessment?.total_score ??
    student?.assessment_total ??
    25;

  const percentage =
    Number(
      assessment?.percentage ??
        student?.assessment_percentage ??
        0
    ) || 0;

  // ============================================================
  // AI ANALYSIS
  // ============================================================

  const aiAnalysis = safelyParseJSON(
    assessment?.ai_analysis,
    {}
  );

  const skillProfile =
    Array.isArray(aiAnalysis.skill_profile)
      ? aiAnalysis.skill_profile
      : [];

  const strengths =
    Array.isArray(aiAnalysis.strengths)
      ? aiAnalysis.strengths
      : [];

  const weaknesses =
    Array.isArray(aiAnalysis.weaknesses)
      ? aiAnalysis.weaknesses
      : [];

  const skillGaps =
    Array.isArray(aiAnalysis.skill_gaps)
      ? aiAnalysis.skill_gaps
      : [];

  const recommendations =
    Array.isArray(aiAnalysis.recommendations)
      ? aiAnalysis.recommendations
      : [];

  const roadmap =
    Array.isArray(aiAnalysis.roadmap)
      ? aiAnalysis.roadmap
      : [];

  const projects =
    Array.isArray(aiAnalysis.projects)
      ? aiAnalysis.projects
      : [];

  const overallLevel =
    aiAnalysis.overall_level ||
    getPerformanceLabel(percentage);

  const performanceAnalysis =
    aiAnalysis.performance_analysis ||
    getPerformanceMessage(percentage);

  // ============================================================
  // ASSESSMENT REVIEW
  // ============================================================

  const resultAnswers = normalizeAnswers(
    assessmentResult?.answers
  );

  const answerKeys =
    Object.keys(resultAnswers);

  function getUserAnswer(question, index) {
    const possibleIds = [
      question?.id,
      question?.question_id,
      question?.uuid,
    ].filter(Boolean);

    // First try matching by question ID.
    for (const id of possibleIds) {
      if (
        Object.prototype.hasOwnProperty.call(
          resultAnswers,
          id
        )
      ) {
        return resultAnswers[id];
      }
    }

    // Fallback to answer order.
    if (answerKeys.length > index) {
      return resultAnswers[
        answerKeys[index]
      ];
    }

    return null;
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="dashboard-page">

      {/* ======================================================
          LOGOUT POPUP
      ====================================================== */}

      {showLogoutPopup && (
        <div
          className="logout-popup-overlay"
          onClick={closeLogoutPopup}
        >
          <div
            className="logout-popup"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              type="button"
              className="logout-popup-close"
              onClick={closeLogoutPopup}
              disabled={loggingOut}
              aria-label="Close"
            >
              <X size={17} />
            </button>

            <div className="logout-popup-icon">
              <LogOut size={24} />
            </div>

            <div className="logout-popup-content">
              <span>
                ACCOUNT
              </span>

              <h2>
                Are you sure you want
                to logout?
              </h2>

              <p>
                You'll be signed out of your
                CareerPath AI account.
              </p>
            </div>

            <div className="logout-popup-actions">
              <button
                type="button"
                className="logout-cancel-button"
                onClick={closeLogoutPopup}
                disabled={loggingOut}
              >
                Cancel
              </button>

              <button
                type="button"
                className="logout-confirm-button"
                onClick={confirmLogout}
                disabled={loggingOut}
              >
                {loggingOut
                  ? "Logging out..."
                  : "Logout"}

                {!loggingOut && (
                  <LogOut size={16} />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="dashboard-container">

        {/* ====================================================
            HEADER
        ==================================================== */}

        <header className="dashboard-header">
          <button
            type="button"
            className="dashboard-logo"
            onClick={() =>
              navigate("/")
            }
            aria-label="Go to home"
          >
            <Sparkles size={19} />
          </button>

          <div className="dashboard-brand">
            <span>
              CAREERPATH
            </span>

            <small>
              AI
            </small>
          </div>

          <div className="dashboard-header-actions">
            <span className="dashboard-user">
              {user?.email}
            </span>

            <button
              type="button"
              className="dashboard-logout"
              onClick={openLogoutPopup}
              title="Logout"
              aria-label="Logout"
            >
              <LogOut size={17} />
            </button>
          </div>
        </header>

        {/* ====================================================
            HERO — FIRST CONTENT
        ==================================================== */}

        <section className="dashboard-hero">
          <div>
            <div className="dashboard-kicker">
              <span />
              YOUR CAREER DASHBOARD
            </div>

            <h1>
              Welcome back,
              <br />

              <span>
                {career}
              </span>{" "}
              explorer.
            </h1>

            <p>
              Here's a snapshot of your current
              skill level, assessment performance
              and personalized AI career plan.
            </p>
          </div>

          <div className="dashboard-hero-icon">
            <Brain size={42} />
          </div>
        </section>

        {/* ====================================================
            STATS
        ==================================================== */}

        <section className="dashboard-stats">
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-icon">
              <Target size={21} />
            </div>

            <div>
              <span>
                SELECTED CAREER
              </span>

              <strong>
                {career}
              </strong>
            </div>
          </div>

          <div className="dashboard-stat-card">
            <div className="dashboard-stat-icon">
              <Award size={21} />
            </div>

            <div>
              <span>
                ASSESSMENT SCORE
              </span>

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
              <span>
                PERFORMANCE
              </span>

              <strong>
                {percentage}%
              </strong>
            </div>
          </div>

          <div className="dashboard-stat-card">
            <div className="dashboard-stat-icon">
              <Brain size={21} />
            </div>

            <div>
              <span>
                AI LEVEL
              </span>

              <strong>
                {overallLevel}
              </strong>
            </div>
          </div>
        </section>

        {/* ====================================================
            SCORE + CAREER
        ==================================================== */}

        <section className="dashboard-result-grid">
          <div className="dashboard-score-card">
            <div className="dashboard-card-heading">
              <div>
                <span>
                  ASSESSMENT RESULT
                </span>

                <h2>
                  Your current skill level
                </h2>
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
                  <strong>
                    {percentage}%
                  </strong>

                  <span>
                    Score
                  </span>
                </div>
              </div>

              <div className="dashboard-performance">
                <span className="dashboard-performance-label">
                  {overallLevel}
                </span>

                <p>
                  {performanceAnalysis}
                </p>
              </div>
            </div>
          </div>

          <div className="dashboard-career-card">
            <div className="dashboard-card-heading">
              <div>
                <span>
                  CAREER PATH
                </span>

                <h2>
                  {career}
                </h2>
              </div>

              <Target size={24} />
            </div>

            <p>
              Your AI career mentor has analyzed
              your assessment and identified the
              skills you should focus on next.
            </p>

            <button
              type="button"
              className="dashboard-primary-button"
              onClick={() =>
                navigate("/assessment")
              }
            >
              Retake Assessment
              <ArrowRight size={17} />
            </button>
          </div>
        </section>

        {/* ====================================================
            AI SKILL PROFILE
        ==================================================== */}

        <section className="dashboard-ai-section">
          <div className="dashboard-section-heading">
            <div>
              <div className="dashboard-kicker">
                <span />
                AI SKILL ANALYSIS
              </div>

              <h2>
                Your Skill Profile
              </h2>

              <p>
                Based on your assessment
                performance, here's how your
                current skills compare.
              </p>
            </div>

            <Brain size={30} />
          </div>

          {skillProfile.length > 0 ? (
            <div className="dashboard-skill-profile">
              {skillProfile.map(
                (item, index) => {
                  const skillPercentage =
                    Math.max(
                      0,
                      Math.min(
                        100,
                        Number(
                          item.percentage
                        ) || 0
                      )
                    );

                  return (
                    <div
                      className="dashboard-skill"
                      key={`${item.skill}-${index}`}
                    >
                      <div className="dashboard-skill-top">
                        <strong>
                          {item.skill}
                        </strong>

                        <span>
                          {skillPercentage}%
                        </span>
                      </div>

                      <div className="dashboard-skill-bar">
                        <div
                          className="dashboard-skill-progress"
                          style={{
                            width: `${skillPercentage}%`,
                          }}
                        />
                      </div>

                      <small>
                        {item.correct ?? 0}{" "}
                        of{" "}
                        {item.total ?? 0}{" "}
                        correct
                      </small>
                    </div>
                  );
                }
              )}
            </div>
          ) : (
            <div className="dashboard-empty-ai">
              <Brain size={25} />

              <p>
                Complete an assessment to
                generate your AI skill profile.
              </p>
            </div>
          )}
        </section>

        {/* ====================================================
            STRENGTHS + WEAKNESSES
        ==================================================== */}

        <section className="dashboard-ai-grid">
          <div className="dashboard-ai-card">
            <div className="dashboard-ai-card-heading">
              <CheckCircle2 size={22} />

              <div>
                <span>
                  YOUR STRENGTHS
                </span>

                <h3>
                  Skills you're doing well in
                </h3>
              </div>
            </div>

            {strengths.length > 0 ? (
              <div className="dashboard-ai-list">
                {strengths.map(
                  (item, index) => (
                    <div
                      className="dashboard-ai-list-item"
                      key={index}
                    >
                      <strong>
                        {item.skill}
                      </strong>

                      <p>
                        {item.reason}
                      </p>
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="dashboard-empty-ai">
                <p>
                  Your AI analysis will identify
                  your strongest skills here.
                </p>
              </div>
            )}
          </div>

          <div className="dashboard-ai-card">
            <div className="dashboard-ai-card-heading">
              <AlertTriangle size={22} />

              <div>
                <span>
                  AREAS TO IMPROVE
                </span>

                <h3>
                  Your current weaknesses
                </h3>
              </div>
            </div>

            {weaknesses.length > 0 ? (
              <div className="dashboard-ai-list">
                {weaknesses.map(
                  (item, index) => (
                    <div
                      className="dashboard-ai-list-item"
                      key={index}
                    >
                      <strong>
                        {item.skill}
                      </strong>

                      <p>
                        {item.reason}
                      </p>
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="dashboard-empty-ai">
                <p>
                  No weaknesses identified yet.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ====================================================
            SKILL GAPS
        ==================================================== */}

        <section className="dashboard-ai-section">
          <div className="dashboard-section-heading">
            <div>
              <div className="dashboard-kicker">
                <span />
                SKILL GAPS
              </div>

              <h2>
                What you should learn next
              </h2>

              <p>
                AI-identified skills that can have
                the biggest impact on your career
                progress.
              </p>
            </div>

            <Target size={30} />
          </div>

          {skillGaps.length > 0 ? (
            <div className="dashboard-gap-grid">
              {skillGaps.map(
                (gap, index) => (
                  <div
                    className="dashboard-gap-card"
                    key={index}
                  >
                    <div className="dashboard-gap-top">
                      <strong>
                        {gap.skill}
                      </strong>

                      <span
                        className={`gap-${String(
                          gap.priority ||
                            "medium"
                        ).toLowerCase()}`}
                      >
                        {gap.priority ||
                          "Medium"}
                      </span>
                    </div>

                    <p>
                      {gap.reason}
                    </p>
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="dashboard-empty-ai">
              <p>
                Your AI skill gaps will appear
                here after assessment analysis.
              </p>
            </div>
          )}
        </section>

        {/* ====================================================
            AI RECOMMENDATIONS
        ==================================================== */}

        <section className="dashboard-ai-section">
          <div className="dashboard-section-heading">
            <div>
              <div className="dashboard-kicker">
                <span />
                AI RECOMMENDATIONS
              </div>

              <h2>
                Personalized for you
              </h2>

              <p>
                Practical next steps based on
                your current performance.
              </p>
            </div>

            <Lightbulb size={30} />
          </div>

          {recommendations.length > 0 ? (
            <div className="dashboard-recommendations">
              {recommendations.map(
                (recommendation, index) => (
                  <div
                    className="dashboard-recommendation"
                    key={index}
                  >
                    <div className="dashboard-recommendation-number">
                      {index + 1}
                    </div>

                    <p>
                      {recommendation}
                    </p>
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="dashboard-empty-ai">
              <p>
                Personalized recommendations
                will appear here.
              </p>
            </div>
          )}
        </section>

        {/* ====================================================
            4 WEEK ROADMAP
        ==================================================== */}

        <section className="dashboard-ai-section">
          <div className="dashboard-section-heading">
            <div>
              <div className="dashboard-kicker">
                <span />
                PERSONALIZED ROADMAP
              </div>

              <h2>
                Your 4-week learning plan
              </h2>

              <p>
                A focused learning path generated
                from your skill gaps.
              </p>
            </div>

            <BookOpen size={30} />
          </div>

          {roadmap.length > 0 ? (
            <div className="dashboard-roadmap">
              {roadmap.map(
                (week, index) => (
                  <div
                    className="dashboard-roadmap-week"
                    key={index}
                  >
                    <div className="dashboard-roadmap-number">
                      {week.week ||
                        index + 1}
                    </div>

                    <div className="dashboard-roadmap-content">
                      <span>
                        WEEK{" "}
                        {week.week ||
                          index + 1}
                      </span>

                      <h3>
                        {week.title}
                      </h3>

                      {Array.isArray(
                        week.tasks
                      ) && (
                        <ul>
                          {week.tasks.map(
                            (
                              task,
                              taskIndex
                            ) => (
                              <li
                                key={
                                  taskIndex
                                }
                              >
                                {task}
                              </li>
                            )
                          )}
                        </ul>
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="dashboard-empty-ai">
              <p>
                Your personalized 4-week
                roadmap will appear here.
              </p>
            </div>
          )}
        </section>

        {/* ====================================================
            PROJECT RECOMMENDATIONS
        ==================================================== */}

        <section className="dashboard-ai-section">
          <div className="dashboard-section-heading">
            <div>
              <div className="dashboard-kicker">
                <span />
                AI PROJECT LAB
              </div>

              <h2>
                Projects you should build
              </h2>

              <p>
                Portfolio projects selected
                according to your current skill
                level and career goal.
              </p>
            </div>

            <Rocket size={30} />
          </div>

          {projects.length > 0 ? (
            <div className="dashboard-project-grid">
              {projects.map(
                (project, index) => (
                  <div
                    className="dashboard-project-card"
                    key={index}
                  >
                    <div className="dashboard-project-top">
                      <div className="dashboard-project-icon">
                        <Rocket size={20} />
                      </div>

                      <span>
                        {project.difficulty ||
                          "Beginner"}
                      </span>
                    </div>

                    <h3>
                      {project.title}
                    </h3>

                    <p>
                      {project.description}
                    </p>

                    {Array.isArray(
                      project.skills
                    ) &&
                      project.skills.length >
                        0 && (
                        <div className="dashboard-project-skills">
                          {project.skills.map(
                            (
                              skill,
                              skillIndex
                            ) => (
                              <span
                                key={
                                  skillIndex
                                }
                              >
                                {skill}
                              </span>
                            )
                          )}
                        </div>
                      )}

                    <div className="dashboard-project-why">
                      <strong>
                        Why this project?
                      </strong>

                      <p>
                        {project.why_this_project}
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="dashboard-empty-ai">
              <p>
                Complete your assessment to
                receive personalized project ideas.
              </p>
            </div>
          )}
        </section>

        {/* ====================================================
            WHAT'S NEXT
        ==================================================== */}

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

                <span>
                  step by step.
                </span>
              </h2>
            </div>
          </div>

          <div className="dashboard-actions">
            <button
              type="button"
              className="dashboard-action-card"
              onClick={() =>
                navigate("/assessment")
              }
            >
              <div className="dashboard-action-icon">
                <Brain size={22} />
              </div>

              <div>
                <strong>
                  Improve your score
                </strong>

                <p>
                  Retake the assessment and
                  track your progress.
                </p>
              </div>

              <ArrowRight size={18} />
            </button>

            <button
              type="button"
              className="dashboard-action-card"
              onClick={() =>
                navigate(
                  "/career-selection"
                )
              }
            >
              <div className="dashboard-action-icon">
                <Target size={22} />
              </div>

              <div>
                <strong>
                  Explore another career
                </strong>

                <p>
                  Discover a different career
                  path.
                </p>
              </div>

              <ArrowRight size={18} />
            </button>
          </div>
        </section>

        {/* ====================================================
            ASSESSMENT REVIEW — BOTTOM
        ==================================================== */}

        {!resultLoading &&
          assessmentResult &&
          assessmentQuestions.length > 0 && (
            <section className="assessment-review">
              <div className="assessment-review-header">
                <div>
                  <span className="section-label">
                    ASSESSMENT REVIEW
                  </span>

                  <h2>
                    Your Question-by-Question Results
                  </h2>

                  <p>
                    See what you answered and the
                    correct answer for each question.
                  </p>
                </div>

                <div className="assessment-review-score">
                  <strong>
                    {assessmentResult.percentage ??
                      percentage}
                    %
                  </strong>

                  <span>
                    {assessmentResult.score ??
                      score}{" "}
                    /{" "}
                    {assessmentResult.total_score ??
                      totalScore}
                  </span>
                </div>
              </div>

              <div className="assessment-review-list">
                {assessmentQuestions.map(
                  (question, index) => {
                    const userAnswer =
                      getUserAnswer(
                        question,
                        index
                      );

                    const correctAnswer =
                      String(
                        question.correct_answer ||
                          ""
                      ).toUpperCase();

                    const normalizedUserAnswer =
                      String(
                        userAnswer || ""
                      ).toUpperCase();

                    const isCorrect =
                      normalizedUserAnswer ===
                        correctAnswer &&
                      correctAnswer !== "";

                    const answerText = {
                      A: question.option_a,
                      B: question.option_b,
                      C: question.option_c,
                      D: question.option_d,
                    };

                    return (
                      <div
                        key={
                          question.id ||
                          question.question_id ||
                          index
                        }
                        className="assessment-result-card"
                      >
                        <div className="assessment-result-top">
                          <span>
                            QUESTION {index + 1}
                          </span>

                          <span
                            className={
                              isCorrect
                                ? "answer-correct"
                                : "answer-wrong"
                            }
                          >
                            {isCorrect
                              ? "Correct"
                              : "Incorrect"}
                          </span>
                        </div>

                        <h3>
                          {question.question}
                        </h3>

                        <div className="answer-details">

                          {/* USER ANSWER */}

                          <div
                            className={
                              isCorrect
                                ? "answer-box correct-box"
                                : "answer-box wrong-box"
                            }
                          >
                            <span>
                              YOUR ANSWER
                            </span>

                            <strong>
                              {userAnswer
                                ? normalizedUserAnswer
                                : "Not answered"}
                            </strong>

                            {userAnswer && (
                              <p>
                                {
                                  answerText[
                                    normalizedUserAnswer
                                  ]
                                }
                              </p>
                            )}
                          </div>

                          {/* CORRECT ANSWER */}

                          <div className="answer-box correct-answer-box">
                            <span>
                              CORRECT ANSWER
                            </span>

                            <strong>
                              {correctAnswer ||
                                "Not available"}
                            </strong>

                            <p>
                              {
                                answerText[
                                  correctAnswer
                                ]
                              }
                            </p>
                          </div>
                        </div>

                        <div className="question-meta">
                          <span>
                            Skill:{" "}
                            {question.skill_mapping ||
                              question.core_skill ||
                              "General"}
                          </span>

                          <span>
                            Difficulty:{" "}
                            {question.difficulty ||
                              "Intermediate"}
                          </span>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </section>
          )}

        {/* ====================================================
            NO ASSESSMENT REVIEW
        ==================================================== */}

        {!resultLoading &&
          assessmentResult &&
          assessmentQuestions.length === 0 && (
            <section className="assessment-review">
              <div className="assessment-review-header">
                <div>
                  <span className="section-label">
                    ASSESSMENT REVIEW
                  </span>

                  <h2>
                    Assessment completed
                  </h2>

                  <p>
                    Your score was saved, but the
                    assessment questions could not
                    be loaded.
                  </p>
                </div>

                <div className="assessment-review-score">
                  <strong>
                    {assessmentResult.percentage ??
                      percentage}
                    %
                  </strong>

                  <span>
                    {assessmentResult.score ??
                      score}{" "}
                    /{" "}
                    {assessmentResult.total_score ??
                      totalScore}
                  </span>
                </div>
              </div>
            </section>
          )}

        {/* ====================================================
            FOOTER
        ==================================================== */}

        <footer className="dashboard-footer">
          <span>
            CAREERPATH AI
          </span>

          <span>
            Your journey. Your skills.
            Your future.
          </span>
        </footer>

      </div>
    </div>
  );
}

export default Dashboard;