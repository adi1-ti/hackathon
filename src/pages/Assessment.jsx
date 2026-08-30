import { useEffect, useRef, useState } from "react";
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
import "./assessment.css";

function Assessment() {
  const navigate = useNavigate();
  const hasLoadedAssessment = useRef(false);

  const [user, setUser] = useState(null);
  const [career, setCareer] = useState("");
  const [assessmentId, setAssessmentId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (hasLoadedAssessment.current) return;

    hasLoadedAssessment.current = true;
    loadAssessment();
  }, []);

  async function loadAssessment() {
    setLoading(true);
    setError("");

    try {
      const {
        data: { user: currentUser },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (!currentUser) {
        navigate("/login");
        return;
      }

      setUser(currentUser);

      const { data: student, error: studentError } =
        await supabase
          .from("students")
          .select("selected_career")
          .eq("auth_id", currentUser.id)
          .maybeSingle();

      if (studentError) throw studentError;

      if (!student?.selected_career) {
        throw new Error(
          "No career has been selected yet. Please choose a career first."
        );
      }

      const selectedCareer = student.selected_career;
      setCareer(selectedCareer);

      const { data: generatedData, error: generatedError } =
        await supabase.functions.invoke("generate-assessment", {
          body: {
            student_id: currentUser.id,
            user_id: currentUser.id,
            career: selectedCareer,
          },
        });

      if (generatedError) {
        throw new Error(
          generatedError.message ||
            "Unable to generate assessment."
        );
      }

      if (!generatedData?.success) {
        throw new Error(
          generatedData?.error ||
            "AI failed to generate the assessment."
        );
      }

      if (!Array.isArray(generatedData.questions)) {
        throw new Error(
          "AI response does not contain questions."
        );
      }

      if (generatedData.questions.length !== 5) {
        throw new Error(
          `AI generated ${generatedData.questions.length} questions instead of 5.`
        );
      }

      /*
       * IMPORTANT:
       * generate-assessment creates the database assessment.
       * Accept assessment_id OR id from the Edge Function.
       */
      const generatedAssessmentId =
        generatedData.assessment_id ??
        generatedData.id ??
        null;

      if (!generatedAssessmentId) {
        throw new Error(
          "Assessment ID was not returned by the assessment generator."
        );
      }

      /*
       * Normalize questions.
       *
       * The database/function may return questions without IDs.
       * We create stable IDs for the React frontend.
       */
      const normalizedQuestions =
        generatedData.questions.map((question, index) => ({
          ...question,
          id:
            question.id ??
            question.question_id ??
            `question-${index + 1}`,
          question: String(question.question ?? ""),
          option_a: String(question.option_a ?? ""),
          option_b: String(question.option_b ?? ""),
          option_c: String(question.option_c ?? ""),
          option_d: String(question.option_d ?? ""),
          difficulty:
            question.difficulty ?? "Intermediate",
          skill_mapping:
            question.skill_mapping ?? "General",
          time_minutes:
            question.time_minutes ?? 2,
        }));

      normalizedQuestions.forEach((question, index) => {
        const required = [
          "id",
          "question",
          "option_a",
          "option_b",
          "option_c",
          "option_d",
        ];

        for (const field of required) {
          if (!question[field]) {
            throw new Error(
              `Question ${index + 1} is missing ${field}.`
            );
          }
        }
      });

      /*
       * THIS IS THE IMPORTANT FIX:
       * Store the actual database assessment ID.
       */
      setAssessmentId(String(generatedAssessmentId));

      setQuestions(normalizedQuestions);
      console.log(
  "ASSESSMENT QUESTIONS FULL:",
  JSON.stringify(normalizedQuestions, null, 2)
);
      setCurrentQuestion(0);
      setAnswers({});
    } catch (err) {
      console.error(
        "ASSESSMENT LOADING ERROR:",
        err
      );

      setError(
        err?.message ||
          "Something went wrong while generating your assessment."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleAnswer(questionId, option) {
    setAnswers((previous) => ({
      ...previous,
      [String(questionId)]: option,
    }));

    setError("");
  }

  function handleNext() {
    const question = questions[currentQuestion];

    if (!question) return;

    if (!answers[question.id]) {
      setError(
        "Please select an answer before continuing."
      );
      return;
    }

    setError("");

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((previous) => previous + 1);
    }
  }

  function handlePrevious() {
    setError("");

    if (currentQuestion > 0) {
      setCurrentQuestion((previous) => previous - 1);
    }
  }

 async function handleSubmit() {
  const unanswered = questions.find(
    (question) => !answers[question.id]
  );

  if (unanswered) {
    setError(
      "Please answer all questions before submitting."
    );
    return;
  }

  if (!assessmentId) {
    setError(
      "Assessment ID is missing. Please reload the assessment."
    );
    return;
  }

  if (!user) {
    setError(
      "User session is missing. Please log in again."
    );
    return;
  }

  setSubmitting(true);
  setError("");

  try {
    const submittedQuestions = questions.map(
      (question) => ({
        id: question.id,
        question: question.question,
        option_a: question.option_a,
        option_b: question.option_b,
        option_c: question.option_c,
        option_d: question.option_d,

        /*
         * IMPORTANT:
         * The generated assessment stored in Supabase
         * contains the correct answer.
         *
         * It is sent only to your Edge Function,
         * NOT displayed in the UI.
         */
        correct_answer:
          question.correct_answer,

        max_score:
          Number(question.max_score ?? 5),

        difficulty:
          question.difficulty ??
          "Intermediate",

        skill_mapping:
          question.skill_mapping ??
          "General",
      })
    );

    console.log(
      "SUBMITTING ASSESSMENT:",
      {
        assessmentId,
        userId: user.id,
        career,
        answers,
        questions: submittedQuestions,
      }
    );

    const {
      data: aiData,
      error: aiError,
    } = await supabase.functions.invoke(
      "analyze-assessment",
      {
        body: {
          assessment_id: assessmentId,
          user_id: user.id,
          career,

          /*
           * USER ANSWERS
           */
          answers,

          /*
           * QUESTIONS + CORRECT ANSWERS
           */
          questions:
            submittedQuestions,
        },
      }
    );

    if (aiError) {
      console.error(
        "ANALYZE FUNCTION ERROR:",
        aiError
      );

      throw new Error(
        aiError.message ||
          "AI analysis failed."
      );
    }

    console.log(
      "ANALYZE FUNCTION RESPONSE:",
      aiData
    );

    if (!aiData?.success) {
      throw new Error(
        aiData?.error ||
          "Assessment analysis failed."
      );
    }

    /*
     * Save returned result ID.
     */
    if (aiData.result_id) {
      localStorage.setItem(
        "latestAssessmentResultId",
        String(aiData.result_id)
      );
    }

    /*
     * Useful debugging.
     */
    console.log(
      "FINAL SCORE:",
      aiData.score,
      "/",
      aiData.totalScore
    );

    console.log(
      "FINAL PERCENTAGE:",
      aiData.percentage
    );

    console.log(
      "FINAL SKILL PROFILE:",
      aiData.skillProfile
    );

    navigate("/dashboard");
  } catch (err) {
    console.error(
      "ASSESSMENT SUBMISSION ERROR:",
      err
    );

    setError(
      err?.message ||
        "Something went wrong while submitting your assessment."
    );
  } finally {
    setSubmitting(false);
  }
}

  if (loading) {
    return (
      <div className="assessment-page">
        <div className="assessment-loading">
          <Loader2
            className="assessment-spinner"
            size={28}
          />

          <p>
            AI is preparing your personalized assessment...
          </p>
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
              onClick={() =>
                navigate(
                  "/career-recommendations"
                )
              }
              className="assessment-back-button"
            >
              <ArrowLeft size={17} />
              Back to Career Recommendations
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return null;
  }

  const question = questions[currentQuestion];

  if (!question) {
    return null;
  }

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
            <span>AI ASSESSMENT</span>

            <strong>
              {currentQuestion + 1} /{" "}
              {questions.length}
            </strong>
          </div>
        </header>

        <div className="assessment-progress">
          <div
            className="assessment-progress-fill"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>

        <section className="assessment-intro">
          <div className="assessment-kicker">
            <span />
            AI CAREER SKILL ASSESSMENT
          </div>

          <h1>
            Test your
            <br />
            <span>{career}</span> skills.
          </h1>

          <p>
            These questions were generated specifically
            for your career profile.
          </p>
        </section>

        <section className="assessment-card">

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
                  "Intermediate"}
              </span>

              <span className="assessment-time">
                <Clock3 size={14} />

                {question.time_minutes ||
                  2}{" "}
                min
              </span>
            </div>
          </div>

          <div className="assessment-skill">
            {question.skill_mapping ||
              "General"}
          </div>

          <h2 className="assessment-question">
            {question.question}
          </h2>

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
                  disabled={submitting}
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

          {error && (
            <div className="assessment-inline-error">
              {error}
            </div>
          )}

          <div className="assessment-navigation">

            <button
              type="button"
              className="assessment-previous"
              disabled={
                currentQuestion === 0 ||
                submitting
              }
              onClick={handlePrevious}
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
                <ArrowRight size={17} />
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

                {submitting ? (
                  <Loader2
                    size={17}
                    className="assessment-spinner"
                  />
                ) : (
                  <Check size={17} />
                )}
              </button>
            )}
          </div>
        </section>

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

/*
 * THIS MUST BE THE LAST LINE.
 * App.jsx is importing Assessment as a default export.
 */
export default Assessment;