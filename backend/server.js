const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { createClient } = require("@supabase/supabase-js");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "Career & Skill Development API is running!"
  });
});

// Get all careers
app.get("/api/careers", async (req, res) => {
  const { data, error } = await supabase
    .from("careers")
    .select("*");

  if (error) {
    return res.status(500).json({
      error: error.message
    });
  }

  res.json(data);
});

// Get skills for a specific career
app.get("/api/careers/:careerId/skills", async (req, res) => {
  const { careerId } = req.params;

  // Get career-skill records
  const { data: careerSkills, error: careerSkillsError } = await supabase
    .from("career_skills")
    .select("*")
    .eq("career_id", careerId);

  if (careerSkillsError) {
    return res.status(500).json({
      error: careerSkillsError.message
    });
  }

  // Get the skill IDs
  const skillIds = careerSkills.map(row => row.skill_id);

  // Get the actual skills
  const { data: skills, error: skillsError } = await supabase
    .from("skills")
    .select("*")
    .in("id", skillIds);

  if (skillsError) {
    return res.status(500).json({
      error: skillsError.message
    });
  }

  // Combine the data
  const result = careerSkills.map(row => {
    const skill = skills.find(
      skill => skill.id === row.skill_id
    );

    return {
      skill_id: row.skill_id,
      name: skill?.name,
      category: skill?.category,
      required_level: row.required_level,
      priority: row.priority,
      suggested_project: row.suggested_project
    };
  });

  res.json(result);
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});