//@ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";


const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type CareerRequest = {
  userId?: string;
  selectedCareer?: string;
  skills?: string[];
  interests?: string[];
  education?: string;
  experience?: string;
};

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        {
          status: 405,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const body: CareerRequest = await req.json();

    const userId = body.userId ?? null;
    const selectedCareer = body.selectedCareer ?? null;
    const skills = Array.isArray(body.skills) ? body.skills : [];
    const interests = Array.isArray(body.interests) ? body.interests : [];

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Supabase environment variables are missing");
    }

    const supabase = createClient(
      supabaseUrl,
      serviceRoleKey
    );

    /*
     * Basic fallback recommendations.
     * This keeps the function working even if Gemini is unavailable.
     */
    const careers = [
      {
        career: "Frontend Developer",
        reason:
          "Good match for interests in web development, UI, JavaScript and visual interfaces.",
        skills: [
          "HTML",
          "CSS",
          "JavaScript",
          "React",
          "Git",
        ],
      },
      {
        career: "Backend Developer",
        reason:
          "Good match for programming, APIs, databases and server-side development.",
        skills: [
          "JavaScript",
          "Node.js",
          "APIs",
          "SQL",
          "Git",
        ],
      },
      {
        career: "Data Analyst",
        reason:
          "Good match for analytical thinking, data, SQL and visualization.",
        skills: [
          "SQL",
          "Excel",
          "Python",
          "Data Visualization",
          "Statistics",
        ],
      },
      {
        career: "UI/UX Designer",
        reason:
          "Good match for visual design, user experience and interface development.",
        skills: [
          "Figma",
          "UI Design",
          "UX Research",
          "Typography",
          "Prototyping",
        ],
      },
      {
        career: "DevOps Engineer",
        reason:
          "Good match for cloud infrastructure, deployment automation and development workflows.",
        skills: [
          "Git",
          "Docker",
          "CI/CD",
          "Linux",
          "Cloud",
        ],
      },
    ];

    const inputText = [
      selectedCareer ?? "",
      ...skills,
      ...interests,
      body.education ?? "",
      body.experience ?? "",
    ]
      .join(" ")
      .toLowerCase();

    const scored = careers.map((career) => {
      let score = 0;

      career.skills.forEach((skill) => {
        if (inputText.includes(skill.toLowerCase())) {
          score += 10;
        }
      });

      if (
        selectedCareer &&
        career.career.toLowerCase() ===
          selectedCareer.toLowerCase()
      ) {
        score += 30;
      }

      return {
        ...career,
        score,
      };
    });

    scored.sort((a, b) => b.score - a.score);

    const recommendations = scored.slice(0, 3).map((item) => ({
      career: item.career,
      match_score: Math.min(100, 50 + item.score),
      reason: item.reason,
      recommended_skills: item.skills,
    }));

    /*
     * Save profile if your table exists.
     * Failure here should NOT break the recommendation response.
     */
    if (userId) {
      try {
        await supabase
          .from("career_profiles")
          .upsert(
            {
              user_id: userId,
              selected_career: selectedCareer,
              skills,
              interests,
              education: body.education ?? null,
              experience: body.experience ?? null,
              recommendations,
            },
            {
              onConflict: "user_id",
            }
          );
      } catch (dbError) {
        console.error(
          "Career profile save failed:",
          dbError
        );
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        recommendations,
        profile: {
          user_id: userId,
          selected_career: selectedCareer,
          skills,
          interests,
        },
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
      "ANALYZE CAREER PROFILE ERROR:",
      error
    );

    return new Response(
      JSON.stringify({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
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