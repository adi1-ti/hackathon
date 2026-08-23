const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { createClient } = require("@supabase/supabase-js");

dotenv.config({ path: __dirname + "/.env" });

const app = express();

app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// ==========================================
// TEST ROUTE
// ==========================================

app.get("/", (req, res) => {
  res.json({
    message: "Career & Skill Development API is running!",
  });
});

// ==========================================
// GET ALL CAREERS
// ==========================================

app.get("/api/careers", async (req, res) => {
  const { data, error } = await supabase
    .from("careers")
    .select("*");

  if (error) {
    return res.status(500).json({
      error: error.message,
    });
  }

  res.json(data);
});

// ==========================================
// GET SKILLS FOR A CAREER
// ==========================================

app.get("/api/careers/:careerId/skills", async (req, res) => {
  const { careerId } = req.params;

  const { data: careerSkills, error: careerSkillsError } =
    await supabase
      .from("career_skills")
      .select("*")
      .eq("career_id", careerId);

  if (careerSkillsError) {
    return res.status(500).json({
      error: careerSkillsError.message,
    });
  }

  const skillIds = careerSkills.map(
    (row) => row.skill_id
  );

  if (skillIds.length === 0) {
    return res.json([]);
  }

  const { data: skills, error: skillsError } =
    await supabase
      .from("skills")
      .select("*")
      .in("id", skillIds);

  if (skillsError) {
    return res.status(500).json({
      error: skillsError.message,
    });
  }

  const result = careerSkills.map((row) => {
    const skill = skills.find(
      (skill) => skill.id === row.skill_id
    );

    return {
      skill_id: row.skill_id,
      name: skill?.name,
      category: skill?.category,
      required_level: row.required_level,
      priority: row.priority,
      suggested_project: row.suggested_project,
    };
  });

  res.json(result);
});

// ==========================================
// GET ALL ASSESSMENTS
// ==========================================

app.get("/api/assessments", async (req, res) => {
  const { data, error } = await supabase
    .from("assessments")
    .select("*");

  if (error) {
    return res.status(500).json({
      error: error.message,
    });
  }

  res.json(data);
});

// ==========================================
// GET 10 QUESTIONS FOR A SPECIFIC CAREER
// ==========================================

app.get("/api/assessments/:career", async (req, res) => {
  const { career } = req.params;

  const decodedCareer = decodeURIComponent(career);

  const { data, error } = await supabase
    .from("assessments")
    .select("*")
    .eq("career", decodedCareer);

  if (error) {
    return res.status(500).json({
      error: error.message,
    });
  }

  if (!data || data.length === 0) {
    return res.status(404).json({
      error: `No assessments found for ${decodedCareer}`,
    });
  }

  // ------------------------------------------
  // Select questions by type
  // 5 MCQ + 3 Scenario + 2 Self-Rating
  // ------------------------------------------

  const mcqs = data.filter(
    (q) => q.assessment_type === "MCQ"
  );

  const scenarios = data.filter(
    (q) => q.assessment_type === "Scenario"
  );

  const selfRatings = data.filter(
    (q) => q.assessment_type === "Self-Rating"
  );

  // Take maximum available from each category
  const selectedQuestions = [
    ...mcqs.slice(0, 5),
    ...scenarios.slice(0, 3),
    ...selfRatings.slice(0, 2),
  ];

  // If there aren't exactly 10, use additional questions
  // so the assessment can still work.
  if (selectedQuestions.length < 10) {
    const selectedIds = new Set(
      selectedQuestions.map((q) => q.id)
    );

    const remaining = data.filter(
      (q) => !selectedIds.has(q.id)
    );

    selectedQuestions.push(
      ...remaining.slice(
        0,
        10 - selectedQuestions.length
      )
    );
  }

  // Shuffle the final questions
  const shuffled = [...selectedQuestions].sort(
    () => Math.random() - 0.5
  );

  res.json(shuffled.slice(0, 10));
});

// ==========================================
// START SERVER
// ==========================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend running on port ${PORT}`);
});