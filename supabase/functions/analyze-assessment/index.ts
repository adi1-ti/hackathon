export {};

declare const Deno: {
  serve(
    handler: (
      request: Request,
    ) => Response | Promise<Response>,
  ): void;

  env: {
    get(name: string): string | undefined;
  };
};

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods":
    "POST, OPTIONS",
  "Content-Type": "application/json",
};

const GEMINI_MODEL = "gemini-3.5-flash-lite";

interface Question {
  id?: string;
  question?: string;
  option_a?: string;
  option_b?: string;
  option_c?: string;
  option_d?: string;
  correct_answer?: string;
  max_score?: number;
  difficulty?: string;
  skill_mapping?: string;
}

interface AssessmentRow {
  id: string;
  user_id: string;
  career: string;
  questions: Question[];
  completed: boolean;
}

interface AnswerMap {
  [key: string]: string;
}

interface QuestionResult {
  question_number: number;
  question_id: string;
  question: string;
  user_answer: string | null;
  correct_answer: string | null;
  correct: boolean;
  score: number;
  max_score: number;
  skill: string;
  difficulty: string;
}

interface SkillProfileItem {
  skill: string;
  correct: number;
  total: number;
  percentage: number;
}

function jsonResponse(
  body: unknown,
  status = 200,
): Response {
  return new Response(
    JSON.stringify(body),
    {
      status,
      headers: corsHeaders,
    },
  );
}

// ============================================================
// SUPABASE REST
// ============================================================

async function supabaseRequest(
  path: string,
  options: RequestInit = {},
): Promise<any> {
  const supabaseUrl =
    Deno.env.get("SUPABASE_URL");

  const serviceRoleKey =
    Deno.env.get(
      "SUPABASE_SERVICE_ROLE_KEY",
    );

  if (!supabaseUrl) {
    throw new Error(
      "SUPABASE_URL is not configured.",
    );
  }

  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not configured.",
    );
  }

  const response = await fetch(
    `${supabaseUrl}${path}`,
    {
      ...options,
      headers: {
        apikey: serviceRoleKey,
        Authorization:
          `Bearer ${serviceRoleKey}`,
        "Content-Type":
          "application/json",
        ...(options.headers || {}),
      },
    },
  );

  const text =
    await response.text();

  let data: any = null;

  try {
    data = text
      ? JSON.parse(text)
      : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    console.error(
      "SUPABASE REST ERROR:",
      response.status,
      data,
    );

    throw new Error(
      data?.message ||
        data?.details ||
        data?.hint ||
        data?.error ||
        `Supabase request failed with status ${response.status}.`,
    );
  }

  return data;
}

// ============================================================
// ANSWERS
// ============================================================

function normalizeAnswers(
  value: unknown,
): AnswerMap {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return {};
  }

  const result: AnswerMap = {};

  for (
    const [key, rawValue] of Object.entries(
      value as Record<string, unknown>,
    )
  ) {
    if (
      typeof rawValue === "string"
    ) {
      result[String(key)] =
        rawValue
          .trim()
          .toUpperCase();
    }
  }

  return result;
}

function getAnswerForQuestion(
  question: Question,
  index: number,
  answers: AnswerMap,
): string | null {
  const possibleKeys = [
    question.id,
    `question-${index + 1}`,
    String(index),
    String(index + 1),
  ].filter(Boolean) as string[];

  for (
    const key of possibleKeys
  ) {
    const answer =
      answers[String(key)];

    if (
      typeof answer === "string" &&
      answer.trim() !== ""
    ) {
      return answer
        .trim()
        .toUpperCase();
    }
  }

  return null;
}

// ============================================================
// FETCH ASSESSMENT
// ============================================================

async function getAssessment(
  assessmentId: string,
  userId: string,
): Promise<AssessmentRow> {
  const encodedAssessmentId =
    encodeURIComponent(
      assessmentId,
    );

  const encodedUserId =
    encodeURIComponent(
      userId,
    );

  const rows =
    await supabaseRequest(
      `/rest/v1/generated_assessments?id=eq.${encodedAssessmentId}&user_id=eq.${encodedUserId}&select=id,user_id,career,questions,completed`,
      {
        method: "GET",
      },
    );

  if (
    !Array.isArray(rows) ||
    rows.length === 0
  ) {
    throw new Error(
      "Generated assessment was not found.",
    );
  }

  const row = rows[0];

  let questions =
    row.questions;

  if (
    typeof questions === "string"
  ) {
    try {
      questions =
        JSON.parse(questions);
    } catch {
      throw new Error(
        "Stored assessment questions are invalid JSON.",
      );
    }
  }

  if (
    !Array.isArray(questions) ||
    questions.length !== 5
  ) {
    throw new Error(
      "Generated assessment must contain exactly 5 questions.",
    );
  }

  return {
    id: String(row.id),
    user_id: String(row.user_id),
    career: String(row.career),
    questions,
    completed:
      Boolean(row.completed),
  };
}

// ============================================================
// SCORE
// ============================================================

function calculateScore(
  questions: Question[],
  answers: AnswerMap,
) {
  let score = 0;
  let totalScore = 0;

  const questionResults: QuestionResult[] =
    [];

  for (
    let index = 0;
    index < questions.length;
    index++
  ) {
    const question =
      questions[index];

    const maxScore =
      Number(
        question.max_score,
      ) || 5;

    const userAnswer =
      getAnswerForQuestion(
        question,
        index,
        answers,
      );

    const correctAnswer =
      typeof question.correct_answer ===
      "string"
        ? question.correct_answer
            .trim()
            .toUpperCase()
        : null;

    const isCorrect =
      !!userAnswer &&
      !!correctAnswer &&
      userAnswer === correctAnswer;

    if (isCorrect) {
      score += maxScore;
    }

    totalScore += maxScore;

    questionResults.push({
      question_number:
        index + 1,

      question_id:
        String(
          question.id ||
            `question-${index + 1}`,
        ),

      question:
        String(
          question.question || "",
        ),

      user_answer:
        userAnswer,

      correct_answer:
        correctAnswer,

      correct:
        isCorrect,

      score:
        isCorrect
          ? maxScore
          : 0,

      max_score:
        maxScore,

      skill:
        String(
          question.skill_mapping ||
            "General",
        ),

      difficulty:
        String(
          question.difficulty ||
            "Intermediate",
        ),
    });
  }

  const percentage =
    totalScore > 0
      ? Math.round(
          (score /
            totalScore) *
            100,
        )
      : 0;

  let overallLevel:
    | "Beginner"
    | "Intermediate"
    | "Advanced" =
    "Beginner";

  if (percentage >= 80) {
    overallLevel =
      "Advanced";
  } else if (percentage >= 60) {
    overallLevel =
      "Intermediate";
  }

  return {
    score,
    totalScore,
    percentage,
    overallLevel,
    questionResults,
  };
}

// ============================================================
// AGGREGATED SKILL PROFILE
// ============================================================

function buildSkillProfile(
  questionResults: QuestionResult[],
): SkillProfileItem[] {
  const skillMap =
    new Map<
      string,
      {
        correct: number;
        total: number;
      }
    >();

  for (
    const item of questionResults
  ) {
    const existing =
      skillMap.get(item.skill) || {
        correct: 0,
        total: 0,
      };

    existing.total += 1;

    if (item.correct) {
      existing.correct += 1;
    }

    skillMap.set(
      item.skill,
      existing,
    );
  }

  return Array.from(
    skillMap.entries(),
  ).map(
    ([skill, value]) => ({
      skill,
      correct:
        value.correct,
      total:
        value.total,
      percentage:
        value.total > 0
          ? Math.round(
              (value.correct /
                value.total) *
                100,
            )
          : 0,
    }),
  );
}

// ============================================================
// FALLBACK ANALYSIS
// ============================================================

function fallbackAnalysis(
  career: string,
  score: number,
  totalScore: number,
  percentage: number,
  skillProfile: SkillProfileItem[],
) {
  const strengths =
    skillProfile
      .filter(
        (item) =>
          item.percentage >= 70,
      )
      .map(
        (item) => ({
          skill:
            item.skill,
          reason:
            `You demonstrated solid performance in ${item.skill}.`,
        }),
      );

  const weaknesses =
    skillProfile
      .filter(
        (item) =>
          item.percentage < 70,
      )
      .map(
        (item) => ({
          skill:
            item.skill,
          reason:
            `Your ${item.skill} performance shows an area that needs more practice.`,
        }),
      );

  const skillGaps =
    skillProfile
      .filter(
        (item) =>
          item.percentage < 70,
      )
      .map(
        (item) => ({
          skill:
            item.skill,
          priority:
            item.percentage < 40
              ? "High"
              : "Medium",
          reason:
            `Improving ${item.skill} will strengthen your ${career} foundation.`,
        }),
      );

  return {
    overall_level:
      percentage >= 80
        ? "Advanced"
        : percentage >= 60
          ? "Intermediate"
          : "Beginner",

    performance_analysis:
      `You scored ${score} out of ${totalScore} (${percentage}%) in your ${career} assessment.`,

    strengths,

    weaknesses,

    skill_gaps:
      skillGaps,

    recommendations: [
      `Practice your lowest-scoring ${career} skills first.`,
      "Use hands-on exercises to reinforce concepts.",
      "Build projects that apply the skills tested in this assessment.",
    ],

    roadmap: [
      {
        week: 1,
        title:
          "Strengthen Fundamentals",
        tasks: [
          "Review incorrect answers.",
          "Study the related concepts.",
          "Complete focused exercises.",
        ],
      },
      {
        week: 2,
        title:
          "Practical Practice",
        tasks: [
          "Solve realistic problems.",
          "Build small exercises.",
          "Review mistakes.",
        ],
      },
      {
        week: 3,
        title:
          "Build a Project",
        tasks: [
          `Start a ${career} project.`,
          "Apply weak skills.",
          "Test and improve the project.",
        ],
      },
      {
        week: 4,
        title:
          "Portfolio Preparation",
        tasks: [
          "Complete the project.",
          "Document what you learned.",
          "Prepare it for your portfolio.",
        ],
      },
    ],

    projects: [
      {
        title:
          `${career} Starter Project`,
        difficulty:
          "Beginner",
        description:
          `Build a beginner-friendly ${career} project using your core skills.`,
        skills:
          skillProfile
            .slice(0, 2)
            .map(
              (item) =>
                item.skill,
            ),
        why_this_project:
          "It gives you practical experience while reinforcing your assessment skills.",
      },
    ],
  };
}

// ============================================================
// GEMINI ANALYSIS
// ============================================================

async function generateAIAnalysis(
  career: string,
  score: number,
  totalScore: number,
  percentage: number,
  skillProfile: SkillProfileItem[],
  questionResults: QuestionResult[],
) {
  const apiKey =
    Deno.env.get(
      "GEMINI_API_KEY",
    );

  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not configured.",
    );
  }

  const prompt = `
You are CareerPath AI, an expert career mentor.

Analyze this completed ${career} assessment.

SOURCE OF TRUTH:

Score:
${score}/${totalScore}

Percentage:
${percentage}%

Skill profile:
${JSON.stringify(
  skillProfile,
  null,
  2,
)}

Question results:
${JSON.stringify(
  questionResults,
  null,
  2,
)}

Do not change the score.

Return ONLY valid JSON.

Required structure:

{
  "overall_level": "Beginner",
  "performance_analysis": "string",

  "strengths": [
    {
      "skill": "string",
      "reason": "string"
    }
  ],

  "weaknesses": [
    {
      "skill": "string",
      "reason": "string"
    }
  ],

  "skill_gaps": [
    {
      "skill": "string",
      "priority": "High",
      "reason": "string"
    }
  ],

  "recommendations": [
    "string",
    "string",
    "string"
  ],

  "roadmap": [
    {
      "week": 1,
      "title": "string",
      "tasks": [
        "string",
        "string",
        "string"
      ]
    },
    {
      "week": 2,
      "title": "string",
      "tasks": [
        "string",
        "string",
        "string"
      ]
    },
    {
      "week": 3,
      "title": "string",
      "tasks": [
        "string",
        "string",
        "string"
      ]
    },
    {
      "week": 4,
      "title": "string",
      "tasks": [
        "string",
        "string",
        "string"
      ]
    }
  ],

  "projects": [
    {
      "title": "string",
      "difficulty": "Beginner",
      "description": "string",
      "skills": [
        "string",
        "string"
      ],
      "why_this_project": "string"
    }
  ]
}

Rules:

- Use the supplied skill profile as the source of truth.
- Do not invent scores.
- Keep the score ${score}/${totalScore}.
- Keep the percentage ${percentage}%.
- Recommendations must match ${career}.
- Roadmap must match the student's current level.
- Projects must match ${career}.
- Return valid JSON only.
`;

  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const response =
    await fetch(
      url,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],

          generationConfig: {
            temperature: 0.4,
            responseMimeType:
              "application/json",
          },
        }),
      },
    );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error?.message ||
        "Gemini API request failed.",
    );
  }

  const text =
    data?.candidates?.[0]
      ?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error(
      "Gemini returned an empty response.",
    );
  }

  let parsed: any;

  try {
    parsed =
      JSON.parse(text);
  } catch {
    const cleaned =
      text
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

    parsed =
      JSON.parse(cleaned);
  }

  return parsed;
}

// ============================================================
// MARK AS COMPLETED
// ============================================================

async function markCompleted(
  assessmentId: string,
) {
  const encodedId =
    encodeURIComponent(
      assessmentId,
    );

  await supabaseRequest(
    `/rest/v1/generated_assessments?id=eq.${encodedId}`,
    {
      method: "PATCH",

      headers: {
        Prefer:
          "return=minimal",
      },

      body: JSON.stringify({
        completed: true,
      }),
    },
  );
}

// ============================================================
// SAVE RESULT
// ============================================================

async function saveAssessmentResult(
  userId: string,
  career: string,
  score: number,
  totalScore: number,
  percentage: number,
  answers: AnswerMap,
  aiAnalysis: unknown,
) {
  const payload = {
    user_id:
      userId,

    career,

    score,

    total_score:
      totalScore,

    percentage,

    answers,

    ai_analysis:
      aiAnalysis,
  };

  const saved =
    await supabaseRequest(
      "/rest/v1/assessment_results",
      {
        method: "POST",

        headers: {
          Prefer:
            "return=representation",
        },

        body:
          JSON.stringify(payload),
      },
    );

  const row =
    Array.isArray(saved)
      ? saved[0]
      : saved;

  if (!row) {
    throw new Error(
      "Assessment result was not returned after saving.",
    );
  }

  return row;
}

// ============================================================
// MAIN EDGE FUNCTION
// ============================================================

Deno.serve(
  async (
    req: Request,
  ): Promise<Response> => {
    if (
      req.method === "OPTIONS"
    ) {
      return new Response(
        "ok",
        {
          status: 200,
          headers:
            corsHeaders,
        },
      );
    }

    if (
      req.method !== "POST"
    ) {
      return jsonResponse(
        {
          success: false,
          error:
            "Method not allowed.",
        },
        405,
      );
    }

    try {
      const body =
        (await req.json()) as Record<
          string,
          unknown
        >;

      const assessmentId =
        typeof body.assessment_id ===
        "string"
          ? body.assessment_id.trim()
          : "";

      const userId =
        typeof body.user_id ===
        "string"
          ? body.user_id.trim()
          : "";

      const requestedCareer =
        typeof body.career ===
        "string"
          ? body.career.trim()
          : "";

      if (!assessmentId) {
        throw new Error(
          "assessment_id is missing.",
        );
      }

      if (!userId) {
        throw new Error(
          "user_id is missing.",
        );
      }

      const answers =
        normalizeAnswers(
          body.answers,
        );

      if (
        Object.keys(answers)
          .length === 0
      ) {
        throw new Error(
          "No answers were submitted.",
        );
      }

      // --------------------------------------------------------
      // LOAD EXACT ASSESSMENT
      // --------------------------------------------------------

      const assessment =
        await getAssessment(
          assessmentId,
          userId,
        );

      const career =
        assessment.career ||
        requestedCareer ||
        "Selected Career";

      // --------------------------------------------------------
      // CALCULATE SCORE
      // --------------------------------------------------------

      const calculated =
        calculateScore(
          assessment.questions,
          answers,
        );

      // --------------------------------------------------------
      // AGGREGATED SKILL PROFILE
      // --------------------------------------------------------

      const skillProfile =
        buildSkillProfile(
          calculated.questionResults,
        );

      console.log(
        "CALCULATED RESULT:",
        {
          assessmentId,
          career,
          score:
            calculated.score,
          totalScore:
            calculated.totalScore,
          percentage:
            calculated.percentage,
          skillProfile,
        },
      );

      // --------------------------------------------------------
      // AI ANALYSIS
      // --------------------------------------------------------

      let aiAnalysis: any;

      try {
        aiAnalysis =
          await generateAIAnalysis(
            career,
            calculated.score,
            calculated.totalScore,
            calculated.percentage,
            skillProfile,
            calculated.questionResults,
          );
      } catch (aiError) {
        console.error(
          "GEMINI ANALYSIS ERROR:",
          aiError,
        );

        aiAnalysis =
          fallbackAnalysis(
            career,
            calculated.score,
            calculated.totalScore,
            calculated.percentage,
            skillProfile,
          );
      }

      // --------------------------------------------------------
      // FORCE REAL VALUES
      // --------------------------------------------------------

      aiAnalysis.overall_level =
        calculated.overallLevel;

      aiAnalysis.score =
        calculated.score;

      aiAnalysis.total_score =
        calculated.totalScore;

      aiAnalysis.percentage =
        calculated.percentage;

      aiAnalysis.skill_profile =
        skillProfile;

      aiAnalysis.answer_details =
        calculated.questionResults;

      // --------------------------------------------------------
      // SAVE RESULT
      // --------------------------------------------------------

      const savedResult =
        await saveAssessmentResult(
          userId,
          career,
          calculated.score,
          calculated.totalScore,
          calculated.percentage,
          answers,
          aiAnalysis,
        );

      // --------------------------------------------------------
      // MARK COMPLETE
      // --------------------------------------------------------

      try {
        await markCompleted(
          assessmentId,
        );
      } catch (completionError) {
        console.warn(
          "Could not mark assessment completed:",
          completionError,
        );
      }

      // --------------------------------------------------------
      // SUCCESS
      // --------------------------------------------------------

      console.log(
        "ASSESSMENT RESULT SAVED:",
        savedResult.id,
      );

      return jsonResponse({
        success: true,

        result_id:
          savedResult.id,

        assessment_id:
          assessmentId,

        career,

        score:
          calculated.score,

        total_score:
          calculated.totalScore,

        percentage:
          calculated.percentage,

        analysis:
          aiAnalysis,

        question_results:
          calculated.questionResults,

        skill_profile:
          skillProfile,
      });
    } catch (error) {
      console.error(
        "ANALYZE ASSESSMENT ERROR:",
        error,
      );

      return jsonResponse(
        {
          success: false,

          error:
            error instanceof Error
              ? error.message
              : "Assessment analysis failed.",
        },
        500,
      );
    }
  },
);