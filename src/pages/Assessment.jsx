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

  useEffect(() => {
    loadAssessment();
  }, []);

  async function loadAssessment() {
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        navigate("/login");
        return;
      }

      setUser(user);

      // 1. Fetch Student Career Choice
      const { data: student, error: studentError } = await supabase
        .from("students")
        .select("selected_career")
        .eq("auth_id", user.id)
        .maybeSingle();

      if (studentError) throw studentError;

      if (!student?.selected_career) {
        setError("No career has been selected yet. Please choose a career first.");
        return;
      }

      const selectedCareer = student.selected_career;
      setCareer(selectedCareer);

      // 2. Query Assessment Questions (Using ilike for Case-Insensitive Match)
      const { data: assessmentQuestions, error: assessmentError } =
        await supabase
          .from("assessments")
          .select("*")
          .ilike("career", selectedCareer)
          .limit(5);

      if (assessmentError) throw assessmentError;

      if (!assessmentQuestions || assessmentQuestions.length === 0) {
        setError(`No assessment questions were found for ${selectedCareer}.`);
        return;
      }

      setQuestions(assessmentQuestions.slice(0, 5));
    } catch (err) {
      console.error("Assessment loading error:", err);
      setError(
        err.message || "Something went wrong while loading your assessment."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleAnswer(questionId, option) {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }));
  }

  function handleNext() {
    const question = questions[currentQuestion];
    if (!answers[question.id]) {
      setError("Please select an answer before continuing.");
      return;
    }

    setError("");
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    }
  }

  function handlePrevious() {
    setError("");
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  }

  async function handleSubmit() {
    const unanswered = questions.find((q) => !answers[q.id]);
    if (unanswered) {
      setError("Please answer all questions before submitting.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      let score = 0;
      questions.forEach((question) => {
        if (answers[question.id] === question.correct_answer) {
          score += Number(question.max_score || 5);
        }
      });

      const totalScore = questions.reduce(
        (total, question) => total + Number(question.max_score || 5),
        0
      );

      const percentage =
        totalScore > 0 ? Math.round((score / totalScore) * 100) : 0;

      // Insert Results
      const { data: result, error: resultError } = await supabase
        .from("assessment_results")
        .insert({
          user_id: user.id,
          career: career,
          score: score,
          total_score: totalScore,
          percentage: percentage,
          answers: answers,
        })
        .select()
        .single();

      if (resultError) throw resultError;

      // Update Student Table
      await supabase
        .from("students")
        .update({
          assessment_score: score,
          assessment_total: totalScore,
          assessment_percentage: percentage,
        })
        .eq("auth_id", user.id);

      if (result?.id) {
        localStorage.setItem("latestAssessmentResultId", result.id);
      }

      navigate("/dashboard");
    } catch (err) {
      console.error("Assessment submission error:", err);
      setError(
        err.message || "Something went wrong while submitting your assessment."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="assessment-page">
        <div className="assessment-loading">
          <Loader2 className="assessment-spinner" size={28} />
          <p>Preparing your assessment...</p>
        </div>
      </div>
    );
  }

  if (error && questions.length === 0) {
    return (
      <div className="assessment-page">
        <div className="assessment-container">
          <div className="assessment-error-screen">
            <Sparkles size={30} />
            <h1>Assessment unavailable</h1>
            <p>{error}</p>
            <button
              type="button"
              onClick={() => navigate("/career-selection")}
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

  if (questions.length === 0) return null;

  const question = questions[currentQuestion];
  const selectedAnswer = answers[question.id];
  const progress = Math.round(
    ((currentQuestion + 1) / questions.length) * 100
  );

  const options = [
    { key: "A", text: question.option_a },
    { key: "B", text: question.option_b },
    { key: "C", text: question.option_c },
    { key: "D", text: question.option_d },
  ];

  return (
    <div className="assessment-page">
      <div className="assessment-container">
        <header className="assessment-header">
          <button
            type="button"
            className="assessment-logo"
            onClick={() => navigate("/")}
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
              {currentQuestion + 1} / {questions.length}
            </strong>
          </div>
        </header>

        <div className="assessment-progress">
          <div
            className="assessment-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>

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
          <p>Answer these questions to help us understand your current skill level.</p>
        </section>

        <section className="assessment-card">
          <div className="assessment-question-meta">
            <div>
              <span>QUESTION</span>
              <strong>{String(currentQuestion + 1).padStart(2, "0")}</strong>
            </div>
            <div className="assessment-meta-right">
              <span className="assessment-difficulty">
                {question.difficulty || "Medium"}
              </span>
              <span className="assessment-time">
                <Clock3 size={14} />
                {question.time_minutes || 2} min
              </span>
            </div>
          </div>

          <div className="assessment-skill">
            {question.skill_mapping || question.core_skill || "General"}
          </div>

          <h2 className="assessment-question">{question.question}</h2>

          <div className="assessment-options">
            {options.map((option) => {
              const selected = selectedAnswer === option.key;

              return (
                <button
                  key={option.key}
                  type="button"
                  className={`assessment-option ${
                    selected ? "assessment-option-selected" : ""
                  }`}
                  onClick={() => handleAnswer(question.id, option.key)}
                >
                  <span className="assessment-option-letter">{option.key}</span>
                  <span className="assessment-option-text">{option.text}</span>
                  <span className="assessment-option-check">
                    {selected && <Check size={15} />}
                  </span>
                </button>
              );
            })}
          </div>

          {error && <div className="assessment-inline-error">{error}</div>}

          <div className="assessment-navigation">
            <button
              type="button"
              className="assessment-previous"
              disabled={currentQuestion === 0}
              onClick={handlePrevious}
            >
              <ArrowLeft size={17} />
              Previous
            </button>

            {currentQuestion < questions.length - 1 ? (
              <button
                type="button"
                className="assessment-next"
                onClick={handleNext}
              >
                Next Question
                <ArrowRight size={17} />
              </button>
            ) : (
              <button
                type="button"
                className="assessment-submit"
                disabled={submitting}
                onClick={handleSubmit}
              >
                {submitting ? "Submitting..." : "Submit Assessment"}
                {!submitting && <Check size={17} />}
              </button>
            )}
          </div>
        </section>

        <div className="assessment-footer">
          <span>{questions.length} questions</span>
          <span>Maximum score: {questions.length * 5}</span>
        </div>
      </div>
    </div>
  );
}

export default Assessment;