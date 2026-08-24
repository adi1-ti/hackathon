import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock3,
  Loader2,
  Sparkles,
} from "lucide-react";
import { supabase } from "../supabaseClient";
import "./Assessment.css";

function Assessment() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [career, setCareer] = useState("");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // ============================================================
  // LOAD ASSESSMENT
  // ============================================================

  useEffect(() => {
    loadAssessment();
  }, []);

  async function loadAssessment() {
    setLoading(true);
    setError("");

    try {
      // ----------------------------------------------------------
      // 1. GET LOGGED-IN USER
      // ----------------------------------------------------------

      const {
        data: { user: currentUser },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        throw authError;
      }

      if (!currentUser) {
        navigate("/login");
        return;
      }

      setUser(currentUser);

      // ----------------------------------------------------------
      // 2. GET STUDENT CAREER
      // ----------------------------------------------------------

      const {
        data: student,
        error: studentError,
      } = await supabase
        .from("students")
        .select("selected_career")
        .eq("auth_id", currentUser.id)
        .maybeSingle();

      if (studentError) {
        throw studentError;
      }

      if (!student?.selected_career) {
        setError(
          "No career has been selected yet. Please choose a career first."
        );
        return;
      }

      const selectedCareer = student.selected_career;

      setCareer(selectedCareer);

      // ----------------------------------------------------------
      // 3. GET 5 QUESTIONS
      // ----------------------------------------------------------

      const {
        data: assessmentQuestions,
        error: assessmentError,
      } = await supabase
        .from("assessments")
        .select("*")
        .ilike("career", selectedCareer)
        .limit(5);

      if (assessmentError) {
        throw assessmentError;
      }

      if (
        !assessmentQuestions ||
        assessmentQuestions.length === 0
      ) {
        setError(
          `No assessment questions were found for ${selectedCareer}.`
        );
        return;
      }

      // Only 5 questions for hackathon prototype
      setQuestions(assessmentQuestions.slice(0, 5));
    } catch (err) {
      console.error("Assessment loading error:", err);

      setError(
        err.message ||
          "Something went wrong while loading your assessment."
      );
    } finally {
      setLoading(false);
    }
  }

  // ============================================================
  // ANSWER HANDLING
  // ============================================================

  function handleAnswer(questionId, option) {
    setAnswers((previousAnswers) => ({
      ...previousAnswers,
      [questionId]: option,
    }));

    setError("");
  }

  // ============================================================
  // NEXT QUESTION
  // ============================================================

  function handleNext() {
    const question = questions[currentQuestion];

    if (!answers[question.id]) {
      setError(
        "Please select an answer before continuing."
      );
      return;
    }

    setError("");

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(
        (previousQuestion) => previousQuestion + 1
      );
    }
  }

  // ============================================================
  // PREVIOUS QUESTION
  // ============================================================

  function handlePrevious() {
    setError("");

    if (currentQuestion > 0) {
      setCurrentQuestion(
        (previousQuestion) => previousQuestion - 1
      );
    }
  }

  // ============================================================
  // SUBMIT ASSESSMENT
  // ============================================================

  async function handleSubmit() {
  const unanswered = questions.find(
    (question) => !answers[question.id]
  );

  if (unanswered) {
    setError("Please answer all questions before submitting.");
    return;
  }

  setSubmitting(true);
  setError("");

  try {
    // ============================================================
    // 1. CALCULATE SCORE
    // ============================================================

    let score = 0;

    questions.forEach((question) => {
      if (answers[question.id] === question.correct_answer) {
        score += Number(question.max_score || 5);
      }
    });

    const totalScore = questions.reduce(
      (total, question) =>
        total + Number(question.max_score || 5),
      0
    );

    const percentage =
      totalScore > 0
        ? Math.round((score / totalScore) * 100)
        : 0;

    console.log("SCORE:", score);
    console.log("TOTAL SCORE:", totalScore);
    console.log("PERCENTAGE:", percentage);

    // ============================================================
    // 2. BUILD SKILL PROFILE
    // ============================================================

    const skillStats = {};

    questions.forEach((question) => {
      const skill =
        question.skill_mapping ||
        question.core_skill ||
        "General";

      if (!skillStats[skill]) {
        skillStats[skill] = {
          correct: 0,
          total: 0,
        };
      }

      skillStats[skill].total += 1;

      if (
        answers[question.id] ===
        question.correct_answer
      ) {
        skillStats[skill].correct += 1;
      }
    });

    const skillProfile = Object.entries(skillStats).map(
      ([skill, stats]) => ({
        skill,
        total: stats.total,
        correct: stats.correct,
        percentage:
          stats.total > 0
            ? Math.round(
                (stats.correct / stats.total) * 100
              )
            : 0,
      })
    );

    console.log("SKILL PROFILE:", skillProfile);

    // ============================================================
    // 3. CALL AI FUNCTION
    // ============================================================

    console.log("STARTING AI ANALYSIS...");

    const { data: aiData, error: aiError } =
      await supabase.functions.invoke(
        "analyze-assessment",
        {
          body: {
            career,
            score,
            totalScore,
            percentage,
            skillProfile,

            questions: questions.map((question) => ({
              id: question.id,

              question: question.question,

              skill:
                question.skill_mapping ||
                question.core_skill ||
                "General",

              correctAnswer:
                question.correct_answer,

              userAnswer:
                answers[question.id],
            })),
          },
        }
      );

    // ============================================================
    // 4. HANDLE AI ERROR
    // ============================================================

    if (aiError) {
      console.error(
        "AI FUNCTION ERROR:",
        aiError
      );

      throw new Error(
        aiError.message ||
          "AI analysis failed."
      );
    }

    console.log(
      "AI FUNCTION RESPONSE:",
      aiData
    );

    // ============================================================
    // 5. BUILD COMPLETE AI ANALYSIS
    // ============================================================

    let completeAIAnalysis = {
      skill_profile: skillProfile,
    };

    if (
      aiData &&
      aiData.success &&
      aiData.analysis
    ) {
      completeAIAnalysis = {
        ...aiData.analysis,

        // ALWAYS keep our calculated skill profile
        skill_profile: skillProfile,
      };
    }

    console.log(
      "COMPLETE AI ANALYSIS:",
      JSON.stringify(
        completeAIAnalysis,
        null,
        2
      )
    );

    // ============================================================
    // 6. INSERT EVERYTHING ONCE
    // ============================================================

    console.log(
      "SAVING COMPLETE RESULT TO DATABASE..."
    );

    const { data: result, error: resultError } =
      await supabase
        .from("assessment_results")
        .insert({
          user_id: user.id,

          career: career,

          score: score,

          total_score: totalScore,

          percentage: percentage,

          answers: answers,

          ai_analysis: completeAIAnalysis,
        })
        .select()
        .single();

    if (resultError) {
      console.error(
        "DATABASE INSERT ERROR:",
        resultError
      );

      throw resultError;
    }

    console.log(
      "ASSESSMENT SAVED SUCCESSFULLY:",
      result
    );

    // ============================================================
    // 7. VERIFY WHAT WAS ACTUALLY SAVED
    // ============================================================

    console.log(
      "SAVED AI ANALYSIS:",
      JSON.stringify(
        result?.ai_analysis,
        null,
        2
      )
    );

    // ============================================================
    // 8. UPDATE STUDENTS TABLE
    // ============================================================

    const { error: studentUpdateError } =
      await supabase
        .from("students")
        .update({
          assessment_score: score,
          assessment_total: totalScore,
          assessment_percentage: percentage,
        })
        .eq("auth_id", user.id);

    if (studentUpdateError) {
      console.error(
        "STUDENT UPDATE ERROR:",
        studentUpdateError
      );
    }

    // ============================================================
    // 9. SAVE RESULT ID
    // ============================================================

    if (result?.id) {
      localStorage.setItem(
        "latestAssessmentResultId",
        result.id
      );
    }

    // ============================================================
    // 10. GO TO DASHBOARD
    // ============================================================

    navigate("/dashboard");

  } catch (err) {
    console.error(
      "ASSESSMENT SUBMISSION ERROR:",
      err
    );

    setError(
      err.message ||
        "Something went wrong while submitting your assessment."
    );
  } finally {
    setSubmitting(false);
  }
}
  // ============================================================
  // LOADING SCREEN
  // ============================================================

  if (loading) {
    return (
      <div className="assessment-page">
        <div className="assessment-loading">
          <Loader2
            className="assessment-spinner"
            size={28}
          />

          <p>
            Preparing your assessment...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // ERROR SCREEN
  // ============================================================

  if (
    error &&
    questions.length === 0
  ) {
    return (
      <div className="assessment-page">
        <div className="assessment-container">
          <div className="assessment-error-screen">
            <Sparkles size={30} />

            <h1>
              Assessment unavailable
            </h1>

            <p>{error}</p>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/career-selection"
                )
              }
              className="assessment-back-button"
            >
              <ArrowLeft size={17} />

              Back to Career Selection
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return null;
  }

  // ============================================================
  // CURRENT QUESTION
  // ============================================================

  const question =
    questions[currentQuestion];

  const selectedAnswer =
    answers[question.id];

  const progress = Math.round(
    ((currentQuestion + 1) /
      questions.length) *
      100
  );

  const options = [
    {
      key: "A",
      text: question.option_a,
    },
    {
      key: "B",
      text: question.option_b,
    },
    {
      key: "C",
      text: question.option_c,
    },
    {
      key: "D",
      text: question.option_d,
    },
  ];

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="assessment-page">
      <div className="assessment-container">

        {/* ======================================================
            HEADER
        ====================================================== */}

        <header className="assessment-header">
          <button
            type="button"
            className="assessment-logo"
            onClick={() =>
              navigate("/")
            }
          >
            <Sparkles size={19} />
          </button>

          <div className="assessment-brand">
            <span>CAREERPATH</span>
            <small>AI</small>
          </div>

          <div className="assessment-header-right">
            <span>ASSESSMENT</span>

            <strong>
              {currentQuestion + 1} /{" "}
              {questions.length}
            </strong>
          </div>
        </header>

        {/* ======================================================
            PROGRESS
        ====================================================== */}

        <div className="assessment-progress">
          <div
            className="assessment-progress-fill"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>

        {/* ======================================================
            INTRO
        ====================================================== */}

        <section className="assessment-intro">
          <div className="assessment-kicker">
            <span />
            CAREER SKILL ASSESSMENT
          </div>

          <h1>
            Test your
            <br />
            <span>{career}</span> skills.
          </h1>

          <p>
            Answer these questions to help us
            understand your current skill level.
          </p>
        </section>

        {/* ======================================================
            QUESTION CARD
        ====================================================== */}

        <section className="assessment-card">

          {/* QUESTION META */}

          <div className="assessment-question-meta">
            <div>
              <span>QUESTION</span>

              <strong>
                {String(
                  currentQuestion + 1
                ).padStart(2, "0")}
              </strong>
            </div>

            <div className="assessment-meta-right">
              <span className="assessment-difficulty">
                {question.difficulty ||
                  "Medium"}
              </span>

              <span className="assessment-time">
                <Clock3 size={14} />

                {question.time_minutes ||
                  2}{" "}
                min
              </span>
            </div>
          </div>

          {/* SKILL */}

          <div className="assessment-skill">
            {question.skill_mapping ||
              question.core_skill ||
              "General"}
          </div>

          {/* QUESTION */}

          <h2 className="assessment-question">
            {question.question}
          </h2>

          {/* OPTIONS */}

          <div className="assessment-options">
            {options.map((option) => {
              const selected =
                selectedAnswer ===
                option.key;

              return (
                <button
                  key={option.key}
                  type="button"
                  className={`assessment-option ${
                    selected
                      ? "assessment-option-selected"
                      : ""
                  }`}
                  onClick={() =>
                    handleAnswer(
                      question.id,
                      option.key
                    )
                  }
                >
                  <span className="assessment-option-letter">
                    {option.key}
                  </span>

                  <span className="assessment-option-text">
                    {option.text}
                  </span>

                  <span className="assessment-option-check">
                    {selected && (
                      <Check size={15} />
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ERROR */}

          {error && (
            <div className="assessment-inline-error">
              {error}
            </div>
          )}

          {/* NAVIGATION */}

          <div className="assessment-navigation">

            <button
              type="button"
              className="assessment-previous"
              disabled={
                currentQuestion === 0 ||
                submitting
              }
              onClick={
                handlePrevious
              }
            >
              <ArrowLeft size={17} />

              Previous
            </button>

            {currentQuestion <
            questions.length - 1 ? (
              <button
                type="button"
                className="assessment-next"
                disabled={submitting}
                onClick={handleNext}
              >
                Next Question

                <ArrowRight
                  size={17}
                />
              </button>
            ) : (
              <button
                type="button"
                className="assessment-submit"
                disabled={submitting}
                onClick={handleSubmit}
              >
                {submitting
                  ? "Analyzing..."
                  : "Submit Assessment"}

                {!submitting && (
                  <Check size={17} />
                )}
              </button>
            )}
          </div>
        </section>

        {/* ======================================================
            FOOTER
        ====================================================== */}

        <div className="assessment-footer">
          <span>
            {questions.length} questions
          </span>

          <span>
            Maximum score:{" "}
            {questions.length * 5}
          </span>
        </div>

      </div>
    </div>
  );
}

export default Assessment;