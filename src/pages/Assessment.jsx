import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock3,
  Sparkles,
  Target,
} from "lucide-react";

const API_URL = "https://phoenix-hackathon.onrender.com";

function Assessment() {
  const navigate = useNavigate();
  const location = useLocation();

  const selectedCareer =
    location.state?.career ||
    localStorage.getItem("selectedCareer");

  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!selectedCareer) {
      navigate("/career-selection");
      return;
    }

    fetch(
      `${API_URL}/api/assessments/${encodeURIComponent(
        selectedCareer
      )}`
    )
      .then((res) => {
        if (!res.ok) {
          throw new Error("Unable to load assessment");
        }

        return res.json();
      })
      .then((data) => {
        const mcqs = data
          .filter((q) => q.assessment_type === "MCQ")
          .slice(0, 5);

        setQuestions(mcqs);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Unable to load your assessment.");
        setLoading(false);
      });
  }, [selectedCareer, navigate]);

  const handleAnswer = (answer) => {
    setAnswers((prev) => ({
      ...prev,
      [questions[current].assessment_id]: answer,
    }));
  };

  const finishAssessment = () => {
    let score = 0;

    questions.forEach((question) => {
      const answer = answers[question.assessment_id];

      if (answer === question.correct_answer) {
        score += Number(question.max_score || 5);
      }
    });

    localStorage.setItem("assessmentScore", score);
    localStorage.setItem(
      "assessmentTotalQuestions",
      questions.length
    );
    localStorage.setItem(
      "selectedCareer",
      selectedCareer
    );

    navigate("/dashboard", {
      state: {
        score,
        totalQuestions: questions.length,
        career: selectedCareer,
        answers,
        questions,
      },
    });
  };

  const nextQuestion = () => {
  if (current < questions.length - 1) {
    setCurrent((prev) => prev + 1);
    return;
  }

  const finalAnswers = {
    ...answers,
    [questions[current].assessment_id]:
      answers[questions[current].assessment_id],
  };

  let finalScore = 0;

  questions.forEach((question) => {
    if (
      finalAnswers[question.assessment_id] ===
      question.correct_answer
    ) {
      finalScore += Number(question.max_score || 5);
    }
  });

  const total = questions.reduce(
    (sum, question) =>
      sum + Number(question.max_score || 5),
    0
  );

  navigate("/dashboard", {
    state: {
      career: questions[0]?.career || "Selected Career",
      score: finalScore,
      total,
      answers: finalAnswers,
      questions,
    },
  });
};

  const previousQuestion = () => {
    if (current > 0) {
      setCurrent((prev) => prev - 1);
    }
  };

  if (loading) {
    return (
      <div className="assessment-new-page">
        <div className="assessment-loading">
          <Sparkles size={28} />
          <p>Preparing your assessment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="assessment-new-page">
        <div className="assessment-error">
          <h2>{error}</h2>
          <button onClick={() => navigate("/career-selection")}>
            Choose Career Again
          </button>
        </div>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="assessment-new-page">
        <div className="assessment-error">
          <h2>No assessment available.</h2>
          <button onClick={() => navigate("/career-selection")}>
            Choose Another Career
          </button>
        </div>
      </div>
    );
  }

  const question = questions[current];

  const options = [
    ["A", question.option_a],
    ["B", question.option_b],
    ["C", question.option_c],
    ["D", question.option_d],
  ];

  const selectedAnswer =
    answers[question.assessment_id];

  const progress =
    ((current + 1) / questions.length) * 100;

  return (
    <div className="assessment-new-page">

      {/* TOP */}
      <header className="assessment-new-header">

        <button
          className="assessment-back"
          onClick={() => navigate("/career-selection")}
        >
          <ArrowLeft size={17} />
          Exit
        </button>

        <div className="assessment-new-brand">
          <div>
            <span>CAREERPATH</span>
            <small>AI</small>
          </div>
        </div>

        <div className="assessment-career">
          <span>ASSESSING FOR</span>
          <strong>{selectedCareer}</strong>
        </div>

      </header>

      {/* PROGRESS */}
      <div className="assessment-progress-wrap">

        <div className="assessment-progress-info">
          <span>SKILL ASSESSMENT</span>

          <strong>
            {String(current + 1).padStart(2, "0")}
            <small>
              /{String(questions.length).padStart(2, "0")}
            </small>
          </strong>
        </div>

        <div className="assessment-progress-line">
          <div
            style={{ width: `${progress}%` }}
          />
        </div>

      </div>

      {/* MAIN */}
      <main className="assessment-new-main">

        {/* LEFT */}
        <aside className="assessment-side">

          <div className="assessment-side-number">
            {String(current + 1).padStart(2, "0")}
          </div>

          <div>
            <span className="side-label">
              CURRENT SKILL
            </span>

            <h3>{question.core_skill}</h3>
          </div>

          <div className="assessment-side-bottom">

            <div>
              <Clock3 size={15} />
              <span>~2 MIN</span>
            </div>

            <div>
              <Target size={15} />
              <span>{question.difficulty}</span>
            </div>

          </div>

        </aside>

        {/* QUESTION */}
        <section className="question-area">

          <div className="question-kicker">
            QUESTION {String(current + 1).padStart(2, "0")}
          </div>

          <h1>{question.question}</h1>

          <p className="question-helper">
            Select the answer that best represents your
            understanding.
          </p>

          <div className="new-options">

            {options.map(([key, value]) => {

              const selected =
                selectedAnswer === key;

              return (
                <button
                  key={key}
                  className={`new-option ${
                    selected ? "new-option-selected" : ""
                  }`}
                  onClick={() => handleAnswer(key)}
                >

                  <span className="new-option-key">
                    {selected ? (
                      <Check size={16} />
                    ) : (
                      key
                    )}
                  </span>

                  <span className="new-option-text">
                    {value}
                  </span>

                  <ArrowRight
                    size={17}
                    className="new-option-arrow"
                  />

                </button>
              );
            })}

          </div>

          {/* FOOTER */}
          <div className="assessment-new-footer">

            <button
              className="assessment-prev"
              onClick={previousQuestion}
              disabled={current === 0}
            >
              <ArrowLeft size={16} />
              Previous
            </button>

            <span>
              {selectedAnswer
                ? "Answer selected"
                : "Select an answer to continue"}
            </span>

            <button
              className="assessment-next"
              disabled={!selectedAnswer}
              onClick={nextQuestion}
            >
              {current === questions.length - 1
                ? "Complete Assessment"
                : "Next Question"}

              <ArrowRight size={17} />
            </button>

          </div>

        </section>

      </main>

    </div>
  );
}

export default Assessment;