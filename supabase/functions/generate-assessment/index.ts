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

type Difficulty =
  | "Easy"
  | "Intermediate"
  | "Advanced";

interface GeneratedQuestion {
  id?: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: "A" | "B" | "C" | "D";
  max_score: number;
  difficulty: Difficulty;
  skill_mapping: string;
  time_minutes?: number;
}

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  error?: {
    message?: string;
  };
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

/* ============================================================
   NORMALIZATION
   ============================================================ */

function normalizeText(
  text: string,
): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getWords(
  text: string,
): Set<string> {
  const stopWords = new Set([
    "the",
    "a",
    "an",
    "is",
    "are",
    "was",
    "were",
    "what",
    "which",
    "when",
    "where",
    "why",
    "how",
    "for",
    "to",
    "of",
    "in",
    "on",
    "at",
    "and",
    "or",
    "with",
    "from",
    "that",
    "this",
    "these",
    "those",
    "best",
    "most",
    "used",
    "use",
    "using",
    "can",
    "does",
    "do",
    "should",
    "would",
  ]);

  return new Set(
    normalizeText(text)
      .split(" ")
      .filter(
        (word) =>
          word.length > 2 &&
          !stopWords.has(word),
      ),
  );
}

/* ============================================================
   SIMILARITY CHECK
   ============================================================ */

function questionSimilarity(
  first: string,
  second: string,
): number {
  const firstWords = getWords(first);
  const secondWords = getWords(second);

  if (
    firstWords.size === 0 ||
    secondWords.size === 0
  ) {
    return 0;
  }

  let intersection = 0;

  for (const word of firstWords) {
    if (secondWords.has(word)) {
      intersection++;
    }
  }

  const union = new Set([
    ...firstWords,
    ...secondWords,
  ]).size;

  return union === 0
    ? 0
    : intersection / union;
}

function isDuplicateQuestion(
  question: string,
  existingQuestions: GeneratedQuestion[],
  previousQuestions: string[],
): boolean {
  const normalized =
    normalizeText(question);

  for (const existing of existingQuestions) {
    const existingNormalized =
      normalizeText(existing.question);

    if (
      normalized ===
      existingNormalized
    ) {
      return true;
    }

    if (
      questionSimilarity(
        question,
        existing.question,
      ) >= 0.58
    ) {
      return true;
    }
  }

  for (const previous of previousQuestions) {
    const previousNormalized =
      normalizeText(previous);

    if (
      normalized ===
      previousNormalized
    ) {
      return true;
    }

    if (
      questionSimilarity(
        question,
        previous,
      ) >= 0.58
    ) {
      return true;
    }
  }

  return false;
}

/* ============================================================
   CLEAN GEMINI QUESTIONS
   ============================================================ */

function cleanQuestions(
  rawQuestions: unknown,
): GeneratedQuestion[] {
  if (!Array.isArray(rawQuestions)) {
    return [];
  }

  const cleaned: GeneratedQuestion[] =
    [];

  for (const raw of rawQuestions) {
    if (
      !raw ||
      typeof raw !== "object"
    ) {
      continue;
    }

    const item =
      raw as Record<string, unknown>;

    const question =
      typeof item.question === "string"
        ? item.question.trim()
        : "";

    const optionA =
      typeof item.option_a ===
      "string"
        ? item.option_a.trim()
        : "";

    const optionB =
      typeof item.option_b ===
      "string"
        ? item.option_b.trim()
        : "";

    const optionC =
      typeof item.option_c ===
      "string"
        ? item.option_c.trim()
        : "";

    const optionD =
      typeof item.option_d ===
      "string"
        ? item.option_d.trim()
        : "";

    const correctAnswer =
      typeof item.correct_answer ===
      "string"
        ? item.correct_answer
            .trim()
            .toUpperCase()
        : "";

    const difficulty =
      typeof item.difficulty ===
      "string"
        ? item.difficulty.trim()
        : "";

    const skillMapping =
      typeof item.skill_mapping ===
      "string"
        ? item.skill_mapping.trim()
        : "";

    if (
      !question ||
      !optionA ||
      !optionB ||
      !optionC ||
      !optionD
    ) {
      continue;
    }

    if (
      !["A", "B", "C", "D"].includes(
        correctAnswer,
      )
    ) {
      continue;
    }

    if (
      ![
        "Easy",
        "Intermediate",
        "Advanced",
      ].includes(difficulty)
    ) {
      continue;
    }

    cleaned.push({
      question,
      option_a: optionA,
      option_b: optionB,
      option_c: optionC,
      option_d: optionD,
      correct_answer:
        correctAnswer as
          | "A"
          | "B"
          | "C"
          | "D",
      max_score: 5,
      difficulty:
        difficulty as Difficulty,
      skill_mapping:
        skillMapping || "General",
      time_minutes: 2,
    });
  }

  return cleaned;
}

/* ============================================================
   SUPABASE REST HELPER
   ============================================================ */

async function supabaseRest(
  path: string,
  options: RequestInit = {},
): Promise<unknown> {
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

  const response =
    await fetch(
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

  let data: unknown = null;

  try {
    data = text
      ? JSON.parse(text)
      : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    const errorData =
      data as Record<
        string,
        unknown
      > | null;

    throw new Error(
      String(
        errorData?.message ??
          errorData?.details ??
          errorData?.hint ??
          errorData?.error ??
          `Supabase request failed with status ${response.status}.`,
      ),
    );
  }

  return data;
}

/* ============================================================
   PREVIOUS QUESTIONS
   ============================================================ */

async function loadPreviousQuestions(
  userId: string,
  career: string,
): Promise<string[]> {
  const user =
    encodeURIComponent(userId);

  const selectedCareer =
    encodeURIComponent(career);

  const path =
    `/rest/v1/generated_assessments` +
    `?user_id=eq.${user}` +
    `&career=eq.${selectedCareer}` +
    `&select=questions,created_at` +
    `&order=created_at.desc` +
    `&limit=20`;

  try {
    const result =
      await supabaseRest(path, {
        method: "GET",
      });

    if (!Array.isArray(result)) {
      return [];
    }

    const previousQuestions: string[] =
      [];

    for (const row of result) {
      const record =
        row as Record<
          string,
          unknown
        >;

      let questions =
        record.questions;

      if (
        typeof questions ===
        "string"
      ) {
        try {
          questions =
            JSON.parse(questions);
        } catch {
          continue;
        }
      }

      if (!Array.isArray(questions)) {
        continue;
      }

      for (const question of questions) {
        if (
          question &&
          typeof question ===
            "object"
        ) {
          const item =
            question as Record<
              string,
              unknown
            >;

          if (
            typeof item.question ===
            "string"
          ) {
            previousQuestions.push(
              item.question.trim(),
            );
          }
        }
      }
    }

    return previousQuestions.slice(
      0,
      100,
    );
  } catch (error) {
    console.warn(
      "Could not load previous questions:",
      error,
    );

    return [];
  }
}

/* ============================================================
   GEMINI PROMPT
   ============================================================ */

function buildPrompt(
  career: string,
  previousQuestions: string[],
  acceptedQuestions: string[],
): string {
  const previousSection =
    previousQuestions.length > 0
      ? `
PREVIOUS QUESTIONS:

${previousQuestions
  .map(
    (question, index) =>
      `${index + 1}. ${question}`,
  )
  .join("\n")}

Do NOT repeat, paraphrase, or test the
same underlying concept as any previous question.
`
      : `
No previous questions are available.
`;

  const acceptedSection =
    acceptedQuestions.length > 0
      ? `
QUESTIONS ALREADY ACCEPTED:

${acceptedQuestions
  .map(
    (question, index) =>
      `${index + 1}. ${question}`,
  )
  .join("\n")}

Do not create another question about the
same concept.
`
      : "";

  return `
You are CareerPath AI, an expert technical assessment designer.

Create exactly 5 NEW multiple-choice questions for:

CAREER:
${career}

${previousSection}

${acceptedSection}

QUESTION DIVERSITY RULES:

1. Every question MUST test a different underlying concept.
2. Never repeat a question.
3. Never paraphrase a previous question.
4. Never ask two questions about the same concept.
5. Each question should cover a meaningfully different skill.
6. Prefer practical scenarios, reasoning, troubleshooting,
   architecture, development decisions, and real-world use.
7. Do not repeatedly test the same technology.
8. Do not repeatedly test the same API, property, command,
   design pattern, or best practice.
9. Use different skill_mapping values whenever practical.

DIFFICULTY:

Question 1 = Easy
Question 2 = Easy
Question 3 = Intermediate
Question 4 = Intermediate
Question 5 = Advanced

Every question MUST contain:

- question
- option_a
- option_b
- option_c
- option_d
- correct_answer
- max_score
- difficulty
- skill_mapping

Rules:

- exactly 4 options
- exactly 1 correct answer
- correct_answer must be A, B, C, or D
- max_score must be 5
- difficulty must be Easy, Intermediate, or Advanced
- questions must be relevant to ${career}
- incorrect options must be plausible but wrong

FINAL CHECK:

Before returning the JSON:

- Compare every question against every other question.
- Compare every question against the previous questions.
- Reject conceptual duplicates.
- Reject paraphrases.
- Make sure all five questions test different concepts.
- Make sure the difficulty distribution is 2 Easy,
  2 Intermediate, and 1 Advanced.

Return ONLY valid JSON.

Format:

{
  "questions": [
    {
      "question": "Question text",
      "option_a": "Option A",
      "option_b": "Option B",
      "option_c": "Option C",
      "option_d": "Option D",
      "correct_answer": "A",
      "max_score": 5,
      "difficulty": "Easy",
      "skill_mapping": "Skill"
    }
  ]
}
`;
}

/* ============================================================
   GEMINI CALL
   ============================================================ */

async function callGemini(
  apiKey: string,
  prompt: string,
): Promise<string> {
  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(
      apiKey,
    )}`;

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
            temperature: 0.9,
            responseMimeType:
              "application/json",
          },
        }),
      },
    );

  const data =
    (await response.json()) as GeminiResponse;

  if (!response.ok) {
    throw new Error(
      data?.error?.message ||
        "Gemini API request failed.",
    );
  }

  const text =
    data?.candidates?.[0]
      ?.content?.parts?.[0]
      ?.text;

  if (!text) {
    throw new Error(
      "Gemini returned an empty response.",
    );
  }

  return text;
}

/* ============================================================
   PARSE GEMINI RESPONSE
   ============================================================ */

function parseQuestions(
  text: string,
): unknown[] {
  let cleaned =
    text.trim();

  if (
    cleaned.startsWith("```json")
  ) {
    cleaned =
      cleaned.slice(7);
  }

  if (
    cleaned.startsWith("```")
  ) {
    cleaned =
      cleaned.slice(3);
  }

  if (
    cleaned.endsWith("```")
  ) {
    cleaned =
      cleaned.slice(
        0,
        -3,
      );
  }

  cleaned =
    cleaned.trim();

  try {
    const parsed: unknown =
      JSON.parse(cleaned);

    if (
      parsed &&
      typeof parsed ===
        "object" &&
      "questions" in parsed
    ) {
      const object =
        parsed as {
          questions?: unknown;
        };

      return Array.isArray(
        object.questions,
      )
        ? object.questions
        : [];
    }

    return Array.isArray(parsed)
      ? parsed
      : [];
  } catch {
    return [];
  }
}

/* ============================================================
   MAIN EDGE FUNCTION
   ============================================================ */

Deno.serve(
  async (
    req: Request,
  ): Promise<Response> => {
    if (
      req.method ===
      "OPTIONS"
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
      const apiKey =
        Deno.env.get(
          "GEMINI_API_KEY",
        );

      if (!apiKey) {
        throw new Error(
          "GEMINI_API_KEY is not configured.",
        );
      }

      const body =
        (await req.json()) as Record<
          string,
          unknown
        >;

      const userId =
        typeof body.student_id ===
        "string"
          ? body.student_id.trim()
          : typeof body.user_id ===
              "string"
            ? body.user_id.trim()
            : "";

      const career =
        typeof body.career ===
        "string"
          ? body.career.trim()
          : "";

      if (!userId) {
        throw new Error(
          "student_id is required.",
        );
      }

      if (!career) {
        throw new Error(
          "career is required.",
        );
      }

      console.log(
        "GENERATING ASSESSMENT:",
        {
          userId,
          career,
          model:
            GEMINI_MODEL,
        },
      );

      const previousQuestions =
        await loadPreviousQuestions(
          userId,
          career,
        );

      console.log(
        "PREVIOUS QUESTIONS:",
        previousQuestions.length,
      );

      let selectedQuestions: GeneratedQuestion[] =
        [];

      /*
       * Generate repeatedly until we have
       * five genuinely different questions.
       */
      for (
        let attempt = 1;
        attempt <= 5;
        attempt++
      ) {
        console.log(
          `GENERATION ATTEMPT ${attempt}/5`,
        );

        const acceptedTexts =
          selectedQuestions.map(
            (item) =>
              item.question,
          );

        const prompt =
          buildPrompt(
            career,
            previousQuestions,
            acceptedTexts,
          );

        const generatedText =
          await callGemini(
            apiKey,
            prompt,
          );

        const rawQuestions =
          parseQuestions(
            generatedText,
          );

        const candidates =
          cleanQuestions(
            rawQuestions,
          );

        console.log(
          "VALID GEMINI QUESTIONS:",
          candidates.length,
        );

        for (const candidate of candidates) {
          if (
            isDuplicateQuestion(
              candidate.question,
              selectedQuestions,
              previousQuestions,
            )
          ) {
            console.log(
              "REJECTED DUPLICATE:",
              candidate.question,
            );

            continue;
          }

          const duplicateSkill =
            selectedQuestions.some(
              (existing) =>
                normalizeText(
                  existing.skill_mapping,
                ) ===
                normalizeText(
                  candidate.skill_mapping,
                ),
            );

          /*
           * We prefer different skills.
           */
          if (
            duplicateSkill &&
            selectedQuestions.length <
              4
          ) {
            continue;
          }

          selectedQuestions.push(
            candidate,
          );

          if (
            selectedQuestions.length ===
            5
          ) {
            break;
          }
        }

        if (
          selectedQuestions.length ===
          5
        ) {
          break;
        }
      }

      if (
        selectedQuestions.length <
        5
      ) {
        throw new Error(
          `Could only generate ${selectedQuestions.length} unique questions. Please try generating the assessment again.`,
        );
      }

      /*
       * Stable IDs used by Assessment.jsx.
       */
      selectedQuestions =
        selectedQuestions.map(
          (
            question,
            index,
          ) => ({
            ...question,
            id:
              `question-${index + 1}`,
            max_score: 5,
            time_minutes: 2,
            difficulty:
              index < 2
                ? "Easy"
                : index < 4
                  ? "Intermediate"
                  : "Advanced",
          }),
        );

      /*
       * Double-check duplicates before saving.
       */
      for (
        let i = 0;
        i < selectedQuestions.length;
        i++
      ) {
        for (
          let j = i + 1;
          j <
          selectedQuestions.length;
          j++
        ) {
          if (
            isDuplicateQuestion(
              selectedQuestions[i]
                .question,
              [],
              [
                selectedQuestions[j]
                  .question,
              ],
            )
          ) {
            throw new Error(
              "Duplicate questions detected before saving. Please generate a new assessment.",
            );
          }
        }
      }

      /*
       * --------------------------------------------------------
       * SAVE GENERATED ASSESSMENT
       * --------------------------------------------------------
       */

      const supabaseUrl =
        Deno.env.get(
          "SUPABASE_URL",
        );

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

      const insertResponse =
        await fetch(
          `${supabaseUrl}/rest/v1/generated_assessments`,
          {
            method: "POST",
            headers: {
              apikey:
                serviceRoleKey,
              Authorization:
                `Bearer ${serviceRoleKey}`,
              "Content-Type":
                "application/json",
              Prefer:
                "return=representation",
            },
            body: JSON.stringify({
              user_id:
                userId,
              career,
              questions:
                selectedQuestions,
              completed:
                false,
            }),
          },
        );

      const savedText =
        await insertResponse.text();

      let savedData: unknown =
        null;

      try {
        savedData =
          savedText
            ? JSON.parse(
                savedText,
              )
            : null;
      } catch {
        savedData =
          savedText;
      }

      if (
        !insertResponse.ok
      ) {
        const errorData =
          savedData as Record<
            string,
            unknown
          > | null;

        throw new Error(
          String(
            errorData?.message ??
              errorData?.details ??
              errorData?.hint ??
              errorData?.error ??
              "Unable to save generated assessment.",
          ),
        );
      }

      const savedAssessment =
        Array.isArray(
          savedData,
        )
          ? savedData[0]
          : savedData as Record<
              string,
              unknown
            > | null;

      const assessmentId =
        savedAssessment?.id ??
        null;

      if (!assessmentId) {
        throw new Error(
          "Assessment was saved but no assessment ID was returned.",
        );
      }

      console.log(
        "ASSESSMENT SAVED:",
        assessmentId,
      );

      console.log(
        "QUESTION SUMMARY:",
        selectedQuestions.map(
          (
            question,
            index,
          ) => ({
            question:
              index + 1,
            skill:
              question.skill_mapping,
            difficulty:
              question.difficulty,
          }),
        ),
      );

      /*
       * IMPORTANT:
       * correct_answer is intentionally returned here
       * because your current Assessment.jsx needs it
       * for the current scoring flow.
       */
      return jsonResponse(
        {
          success: true,
          assessment_id:
            String(assessmentId),
          career,
          questions:
            selectedQuestions,
        },
        200,
      );
    } catch (error) {
      console.error(
        "GENERATE ASSESSMENT ERROR:",
        error,
      );

      return jsonResponse(
        {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Unknown error occurred.",
        },
        500,
      );
    }
  },
);