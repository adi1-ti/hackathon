import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request) => {
  // ============================================================
  // CORS
  // ============================================================

  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    // ============================================================
    // 1. GET GEMINI API KEY
    // ============================================================

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured.");
    }

    // ============================================================
    // 2. READ REQUEST BODY
    // ============================================================

    const body = await req.json();

    const {
      career,
      score,
      totalScore,
      percentage,
      skillProfile,
      questions,
    } = body;

    console.log("=================================");
    console.log("AI ANALYSIS REQUEST");
    console.log("=================================");
    console.log("Career:", career);
    console.log("Score:", score);
    console.log("Total Score:", totalScore);
    console.log("Percentage:", percentage);
    console.log(
      "Skill Profile:",
      JSON.stringify(skillProfile, null, 2)
    );

    // ============================================================
    // 3. VALIDATE INPUT
    // ============================================================

    if (!career) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Career is missing.",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (!Array.isArray(skillProfile)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Skill profile is missing or invalid.",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // ============================================================
    // 4. GEMINI PROMPT
    // ============================================================

    const prompt = `
You are CareerPath AI, an AI-powered career mentor.

Analyze the student's career assessment.

IMPORTANT:
The supplied skill profile is the SOURCE OF TRUTH for the student's
actual assessment performance.

Do NOT invent or change the scores.

CAREER:
${career}

ASSESSMENT SCORE:
${score}/${totalScore}

PERCENTAGE:
${percentage}%

SKILL PROFILE:
${JSON.stringify(skillProfile, null, 2)}

QUESTIONS AND ANSWERS:
${JSON.stringify(questions || [], null, 2)}

============================================================
YOUR TASK
============================================================

Generate a complete personalized career analysis.

You MUST provide ALL of the following:

1. overall_level
2. performance_analysis
3. strengths
4. weaknesses
5. skill_gaps
6. recommendations
7. roadmap
8. projects

IMPORTANT RULES:

- Use the supplied skill_profile as the source of truth.
- Do not invent assessment scores.
- If a skill has 100%, it should normally be considered a strength.
- If a skill has 0% or a low percentage, it should normally appear as a weakness or skill gap.
- Recommendations must match the selected career.
- Roadmap must be realistic for the student's current level.
- Projects must match the selected career and current skill level.
- Do not leave any requested field out.
- Return ALL fields even if some arrays contain only one item.
- Return ONLY valid JSON.
- Do NOT use markdown.
- Do NOT wrap the JSON inside \`\`\`json.

============================================================
REQUIRED JSON FORMAT
============================================================

{
  "overall_level": "Beginner | Intermediate | Advanced",

  "performance_analysis": "A short personalized explanation of the student's current performance and what it means for their career.",

  "strengths": [
    {
      "skill": "Skill name",
      "reason": "Why this skill is a strength based on the assessment."
    }
  ],

  "weaknesses": [
    {
      "skill": "Skill name",
      "reason": "Why this skill needs improvement based on the assessment."
    }
  ],

  "skill_gaps": [
    {
      "skill": "Skill name",
      "priority": "High | Medium | Low",
      "reason": "Why learning this skill matters for the selected career."
    }
  ],

  "recommendations": [
    "Practical recommendation 1",
    "Practical recommendation 2",
    "Practical recommendation 3"
  ],

  "roadmap": [
    {
      "week": 1,
      "title": "Week 1 topic",
      "tasks": [
        "Task 1",
        "Task 2",
        "Task 3"
      ]
    },
    {
      "week": 2,
      "title": "Week 2 topic",
      "tasks": [
        "Task 1",
        "Task 2",
        "Task 3"
      ]
    },
    {
      "week": 3,
      "title": "Week 3 topic",
      "tasks": [
        "Task 1",
        "Task 2",
        "Task 3"
      ]
    },
    {
      "week": 4,
      "title": "Week 4 topic",
      "tasks": [
        "Task 1",
        "Task 2",
        "Task 3"
      ]
    }
  ],

  "projects": [
    {
      "title": "Project name",
      "difficulty": "Beginner | Intermediate | Advanced",
      "description": "What the project does.",
      "skills": [
        "Skill 1",
        "Skill 2"
      ],
      "why_this_project": "Why this project is suitable for the student."
    },
    {
      "title": "Project name",
      "difficulty": "Beginner | Intermediate | Advanced",
      "description": "What the project does.",
      "skills": [
        "Skill 1",
        "Skill 2"
      ],
      "why_this_project": "Why this project is suitable for the student."
    },
    {
      "title": "Project name",
      "difficulty": "Beginner | Intermediate | Advanced",
      "description": "What the project does.",
      "skills": [
        "Skill 1",
        "Skill 2"
      ],
      "why_this_project": "Why this project is suitable for the student."
    }
  ]
}
`;

    console.log("Sending request to Gemini...");

    // ============================================================
    // 5. CALL GEMINI
    // ============================================================

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
            
            responseMimeType: "application/json",
          },
        }),
      }
    );

    const data = await geminiResponse.json();

    console.log("=================================");
    console.log("GEMINI RESPONSE");
    console.log("=================================");
    console.log(JSON.stringify(data, null, 2));

    // ============================================================
    // 6. HANDLE GEMINI ERROR
    // ============================================================

    if (!geminiResponse.ok) {
      console.error("Gemini API error:", data);

      throw new Error(
        data?.error?.message ||
          "Gemini API request failed."
      );
    }

    // ============================================================
    // 7. EXTRACT GENERATED TEXT
    // ============================================================

    const generatedText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    console.log("GENERATED TEXT:");
    console.log(generatedText);

    if (!generatedText) {
      throw new Error(
        "Gemini returned an empty response."
      );
    }

    // ============================================================
    // 8. PARSE JSON
    // ============================================================

    let analysis;

    try {
      analysis = JSON.parse(generatedText);
    } catch (parseError) {
      console.error(
        "Gemini JSON parse error:",
        parseError
      );

      console.error(
        "Invalid Gemini response:",
        generatedText
      );

      throw new Error(
        "Gemini returned invalid JSON."
      );
    }

    // ============================================================
    // 9. MAKE SURE SKILL PROFILE IS ALWAYS PRESENT
    // ============================================================

    analysis.skill_profile = skillProfile;

    // ============================================================
    // 10. ENSURE ALL REQUIRED FIELDS EXIST
    // ============================================================

    if (!Array.isArray(analysis.strengths)) {
      analysis.strengths = [];
    }

    if (!Array.isArray(analysis.weaknesses)) {
      analysis.weaknesses = [];
    }

    if (!Array.isArray(analysis.skill_gaps)) {
      analysis.skill_gaps = [];
    }

    if (!Array.isArray(analysis.recommendations)) {
      analysis.recommendations = [];
    }

    if (!Array.isArray(analysis.roadmap)) {
      analysis.roadmap = [];
    }

    if (!Array.isArray(analysis.projects)) {
      analysis.projects = [];
    }

    if (!analysis.overall_level) {
      analysis.overall_level =
        percentage >= 80
          ? "Advanced"
          : percentage >= 60
          ? "Intermediate"
          : "Beginner";
    }

    if (!analysis.performance_analysis) {
      analysis.performance_analysis =
        `You scored ${percentage}% in your ${career} assessment. Focus on strengthening the skills identified in your assessment and continue building practical experience.`;
    }

    // ============================================================
    // 11. DEBUG COMPLETE ANALYSIS
    // ============================================================

    console.log("=================================");
    console.log("FINAL COMPLETE AI ANALYSIS");
    console.log("=================================");
    console.log(
      JSON.stringify(analysis, null, 2)
    );

    // ============================================================
    // 12. RETURN COMPLETE ANALYSIS
    // ============================================================

    return new Response(
      JSON.stringify({
        success: true,
        analysis: analysis,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error(
      "================================="
    );

    console.error("AI ANALYSIS ERROR:", error);

    const errorMessage =
      error instanceof Error
        ? `${error.name}: ${error.message}`
        : String(error);

    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});