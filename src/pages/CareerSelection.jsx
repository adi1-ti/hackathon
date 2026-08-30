import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowRight,
  BriefcaseBusiness,
  Loader2,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";

import { supabase } from "../supabaseClient";
import "./CareerSelection.css";

function CareerSelection() {
  const navigate = useNavigate();

  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [usingFallback, setUsingFallback] = useState(false);

  const hasLoaded = useRef(false);

  // ============================================================
  // LOAD RECOMMENDATIONS
  // ============================================================

  useEffect(() => {
    if (hasLoaded.current) return;

    hasLoaded.current = true;
    loadCareerRecommendations();
  }, []);

  async function loadCareerRecommendations() {
    setLoading(true);
    setError("");
    setUsingFallback(false);

    try {
      // ========================================================
      // 1. GET LOGGED-IN USER
      // ========================================================

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

      // ========================================================
      // 2. GET STUDENT PROFILE
      // ========================================================

      const {
        data: student,
        error: studentError,
      } = await supabase
        .from("students")
        .select(
          "selected_career, skills, interests, education, experience"
        )
        .eq("auth_id", user.id)
        .maybeSingle();

      if (studentError) {
        throw studentError;
      }

      // ========================================================
      // 3. CALL AI FUNCTION
      // ========================================================

      try {
        const {
          data: aiData,
          error: functionError,
        } = await supabase.functions.invoke(
          "analyze-career-profile",
          {
            body: {
              userId: user.id,

              selectedCareer:
                student?.selected_career ?? null,

              skills: Array.isArray(student?.skills)
                ? student.skills
                : [],

              interests: Array.isArray(student?.interests)
                ? student.interests
                : [],

              education:
                student?.education ?? null,

              experience:
                student?.experience ?? null,
            },
          }
        );

        if (functionError) {
          console.error(
            "CAREER AI FUNCTION ERROR:",
            functionError
          );

          throw functionError;
        }

        console.log(
          "CAREER AI RESPONSE:",
          aiData
        );

        // ======================================================
        // IMPORTANT:
        // USE AI RECOMMENDATIONS HERE.
        // ======================================================

        if (
          aiData?.success === true &&
          Array.isArray(aiData.recommendations) &&
          aiData.recommendations.length > 0
        ) {
          const normalizedAIRecommendations =
            aiData.recommendations
              .slice(0, 2)
              .map((item) => ({
                career:
                  item?.career ||
                  "Career Recommendation",

                match_score:
                  Number(item?.match_score) || 0,

                description:
                  item?.description ||
                  item?.reason ||
                  "A career path selected based on your profile.",

                market_demand:
                  item?.market_demand ||
                  "Not available",

                job_opportunity:
                  item?.job_opportunity ||
                  "Not available",

                reason:
                  item?.reason ||
                  "This career was selected based on your profile.",

                required_skills:
                  Array.isArray(item?.required_skills)
                    ? item.required_skills
                    : Array.isArray(item?.recommended_skills)
                      ? item.recommended_skills
                      : [],
              }));

          if (
            normalizedAIRecommendations.length > 0
          ) {
            setRecommendations(
              normalizedAIRecommendations
            );

            setUsingFallback(false);
            setLoading(false);

            return;
          }
        }

        console.warn(
          "AI returned no usable recommendations. Using fallback."
        );
      } catch (aiError) {
        console.warn(
          "AI CAREER FUNCTION FAILED:",
          aiError
        );
      }

      // ========================================================
      // 4. FALLBACK PROFILE-BASED RECOMMENDATIONS
      // ========================================================

      console.log(
        "Loading profile-based fallback recommendations..."
      );

      let interests = student?.interests || [];
      let skills = student?.skills || [];

      // ========================================================
      // PARSE INTERESTS
      // ========================================================

      if (typeof interests === "string") {
        try {
          interests = JSON.parse(interests);
        } catch {
          interests = interests
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);
        }
      }

      if (!Array.isArray(interests)) {
        interests = [];
      }

      // ========================================================
      // PARSE SKILLS
      // ========================================================

      if (typeof skills === "string") {
        try {
          skills = JSON.parse(skills);
        } catch {
          skills = skills
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);
        }
      }

      if (!Array.isArray(skills)) {
        skills = [];
      }

      const skillNames = skills
        .map((skill) => {
          if (typeof skill === "string") {
            return skill;
          }

          if (
            skill &&
            typeof skill === "object"
          ) {
            return skill.name || "";
          }

          return "";
        })
        .filter(Boolean);

      // ========================================================
      // PROFILE TEXT
      // ========================================================

      const profileText = [
        ...interests,
        ...skillNames,
        student?.selected_career || "",
        student?.education || "",
        student?.experience || "",
      ]
        .join(" ")
        .toLowerCase();

      // ========================================================
      // FALLBACK
      // ========================================================

      const fallback = [];

      // --------------------------------------------------------
      // CYBERSECURITY
      // --------------------------------------------------------

      if (
        profileText.includes("cyber") ||
        profileText.includes("security") ||
        profileText.includes("hacking") ||
        profileText.includes("forensics") ||
        profileText.includes("penetration")
      ) {
        fallback.push({
          career: "Cybersecurity Analyst",
          match_score: 86,
          description:
            "Protect systems, networks and applications from security threats and vulnerabilities.",
          market_demand: "High",
          job_opportunity: "High",
          reason:
            "Your profile shows interest in cybersecurity, security analysis and related technical areas.",
          required_skills: [
            "Networking",
            "Linux",
            "Web Security",
            "Incident Response",
          ],
        });
      }

      // --------------------------------------------------------
      // FRONTEND / WEB
      // --------------------------------------------------------

      if (
        profileText.includes("frontend") ||
        profileText.includes("web") ||
        profileText.includes("react") ||
        profileText.includes("ui/ux") ||
        profileText.includes("ui ux") ||
        profileText.includes("design")
      ) {
        fallback.push({
          career: "Frontend Developer",
          match_score: 84,
          description:
            "Build responsive, interactive and visually engaging web applications.",
          market_demand: "High",
          job_opportunity: "High",
          reason:
            "Your profile contains strong interest in web development, frontend technologies and digital design.",
          required_skills: [
            "HTML",
            "CSS",
            "JavaScript",
            "React",
          ],
        });
      }

      // --------------------------------------------------------
      // DATA
      // --------------------------------------------------------

      if (
        profileText.includes("data") ||
        profileText.includes("sql") ||
        profileText.includes("analytics") ||
        profileText.includes("statistics") ||
        profileText.includes("python")
      ) {
        fallback.push({
          career: "Data Analyst",
          match_score: 80,
          description:
            "Analyze data and turn information into useful insights for better decisions.",
          market_demand: "High",
          job_opportunity: "Medium",
          reason:
            "Your profile contains skills or interests related to data, analytics, Python or SQL.",
          required_skills: [
            "SQL",
            "Python",
            "Statistics",
            "Data Visualization",
          ],
        });
      }

      // --------------------------------------------------------
      // BACKEND
      // --------------------------------------------------------

      if (
        profileText.includes("backend") ||
        profileText.includes("node") ||
        profileText.includes("api") ||
        profileText.includes("database") ||
        profileText.includes("server")
      ) {
        fallback.push({
          career: "Backend Developer",
          match_score: 82,
          description:
            "Build APIs, server-side applications and the systems that power digital products.",
          market_demand: "High",
          job_opportunity: "High",
          reason:
            "Your profile indicates an interest in backend development, APIs or database technologies.",
          required_skills: [
            "Node.js",
            "APIs",
            "SQL",
            "Databases",
          ],
        });
      }

      // --------------------------------------------------------
      // AI / ML
      // --------------------------------------------------------

      if (
        profileText.includes("artificial intelligence") ||
        profileText.includes("machine learning") ||
        profileText.includes("deep learning") ||
        profileText.includes("ai") ||
        profileText.includes("ml")
      ) {
        fallback.push({
          career: "AI/ML Engineer",
          match_score: 81,
          description:
            "Build intelligent applications using machine learning, data and AI technologies.",
          market_demand: "High",
          job_opportunity: "High",
          reason:
            "Your profile shows interest in artificial intelligence and machine learning technologies.",
          required_skills: [
            "Python",
            "Machine Learning",
            "Statistics",
            "Data Science",
          ],
        });
      }

      // ========================================================
      // GENERIC FALLBACK
      // ========================================================

      if (fallback.length < 2) {
        fallback.push(
          {
            career: "Software Developer",
            match_score: 76,
            description:
              "Design, build and maintain software applications and digital solutions.",
            market_demand: "High",
            job_opportunity: "High",
            reason:
              "Your technical interests indicate potential for a broad software development career.",
            required_skills: [
              "Programming",
              "Problem Solving",
              "Git",
              "Software Development",
            ],
          },
          {
            career: "Web Developer",
            match_score: 73,
            description:
              "Create modern websites and web applications for digital experiences.",
            market_demand: "High",
            job_opportunity: "Medium",
            reason:
              "Your profile contains technical interests that can be developed into a web development career.",
            required_skills: [
              "HTML",
              "CSS",
              "JavaScript",
            ],
          }
        );
      }

      // ========================================================
      // SAVE FALLBACK
      // ========================================================

      setRecommendations(
        fallback.slice(0, 2)
      );

      setUsingFallback(true);
    } catch (err) {
      console.error(
        "Career recommendation error:",
        err
      );

      setError(
        err?.message ||
          "Unable to load career recommendations."
      );
    } finally {
      setLoading(false);
    }
  }

  // ============================================================
  // EXPLORE CAREER
  // ============================================================

  function handleExploreCareer(recommendation) {
    navigate("/career-details", {
      state: {
        recommendation,
      },
    });
  }

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="career-selection-page">
        <div className="career-selection-container career-loading">
          <Loader2
            size={30}
            className="career-loading-spinner"
          />

          <h2>
            Analyzing your profile...
          </h2>

          <p>
            CareerPath AI is finding the career
            paths that best match your skills
            and interests.
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
      <div className="career-selection-page">
        <div className="career-selection-container">
          <div className="career-error-screen">
            <Sparkles size={30} />

            <h1>
              Recommendations unavailable
            </h1>

            <p>
              {error}
            </p>

            <button
              type="button"
              className="career-retry-button"
              onClick={loadCareerRecommendations}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="career-selection-page">
      <div className="career-selection-container">

        {/* HEADER */}

        <header className="career-selection-header">
          <button
            type="button"
            className="career-logo"
            onClick={() => navigate("/")}
            aria-label="Go to home"
          >
            <Sparkles size={19} />
          </button>

          <div className="career-brand-wrapper">
            <span className="career-brand">
              CAREERPATH
            </span>

            <span className="career-brand-ai">
              AI
            </span>
          </div>
        </header>

        {/* INTRO */}

        <section className="career-selection-heading">
          <div className="career-kicker">
            <span />
            AI CAREER ANALYSIS
            <span />
          </div>

          <h1>
            Your career path,
            <br />
            <span>personalized for you.</span>
          </h1>

          <p>
            We've analyzed your profile, interests
            and current skills to find the two
            career paths that best match you.
          </p>
        </section>

        {/* AI NOTICE */}

        <div className="career-ai-notice">
          <div className="career-ai-notice-icon">
            <Sparkles size={18} />
          </div>

          <div>
            <strong>
              {usingFallback
                ? "Profile-based recommendations"
                : "AI-powered recommendations"}
            </strong>

            <p>
              {usingFallback
                ? "Your recommendations are based on the interests and skills saved in your profile."
                : "These recommendations were generated specifically from your profile."}
            </p>
          </div>
        </div>

        {/* RECOMMENDATION GRID */}

        <section className="career-grid">
          {recommendations
            .slice(0, 2)
            .map((recommendation, index) => (
              <article
                key={`${recommendation.career}-${index}`}
                className="career-card"
              >
                <div className="career-card-top">
                  <div className="career-icon">
                    {index === 0 ? (
                      <Target size={22} />
                    ) : (
                      <BriefcaseBusiness size={22} />
                    )}
                  </div>

                  <div className="career-match">
                    {recommendation.match_score ?? 0}%
                    <span> Match</span>
                  </div>
                </div>

                <div className="career-card-content">
                  <span className="career-number">
                    0{index + 1}
                  </span>

                  <h2>
                    {recommendation.career ||
                      "Career Recommendation"}
                  </h2>

                  <p>
                    {recommendation.description ||
                      "A career path selected based on your profile."}
                  </p>
                </div>

                <div className="career-market-info">
                  <div className="career-market-item">
                    <TrendingUp size={15} />

                    <div>
                      <span>
                        MARKET DEMAND
                      </span>

                      <strong>
                        {recommendation.market_demand ||
                          "Not available"}
                      </strong>
                    </div>
                  </div>

                  <div className="career-market-item">
                    <BriefcaseBusiness size={15} />

                    <div>
                      <span>
                        JOB OPPORTUNITY
                      </span>

                      <strong>
                        {recommendation.job_opportunity ||
                          "Not available"}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="career-reason">
                  <span>
                    WHY THIS MATCHES
                  </span>

                  <p>
                    {recommendation.reason ||
                      "This career was selected based on the information in your profile."}
                  </p>
                </div>

                {Array.isArray(
                  recommendation.required_skills
                ) &&
                  recommendation.required_skills.length > 0 && (
                    <div className="career-required-skills">
                      <span>
                        IMPORTANT SKILLS
                      </span>

                      <div className="career-skill-tags">
                        {recommendation.required_skills
                          .slice(0, 8)
                          .map(
                            (skill, skillIndex) => (
                              <span
                                key={`${skill}-${skillIndex}`}
                              >
                                {typeof skill ===
                                "string"
                                  ? skill
                                  : skill?.name ||
                                    "Skill"}
                              </span>
                            )
                          )}
                      </div>
                    </div>
                  )}

                <button
                  type="button"
                  className="career-explore-button"
                  onClick={() =>
                    handleExploreCareer(
                      recommendation
                    )
                  }
                >
                  Explore Career
                  <ArrowRight size={17} />
                </button>
              </article>
            ))}
        </section>

        {/* FOOTER */}

        <footer className="career-selection-footer">
          <span>
            Exactly 2 career paths selected for you
          </span>

          <span>
            Explore a career to continue.
          </span>
        </footer>
      </div>
    </div>
  );
}

export default CareerSelection;