const XLSX = require("xlsx");
const dotenv = require("dotenv");
const { createClient } = require("@supabase/supabase-js");

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Read Excel file
const workbook = XLSX.readFile("../questions.xlsx");
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(sheet);

console.log("Total rows:", rows.length);

console.log(
  rows.map(row => ({
    id: row.Assessment_ID,
    career: row.Career,
    skill: row.Core_Skill
  }))
);

const missingOptions = rows.filter(row =>
  !row.Option_A ||
  !row.Option_B ||
  !row.Option_C ||
  !row.Option_D
);

console.log("Rows with missing options:", missingOptions.length);
console.log(missingOptions);

// Convert Excel column names to Supabase column names
const assessments = rows.map(row => ({
  assessment_id: row.Assessment_ID,
  career: row.Career,
  core_skill: row.Core_Skill,
  category: row.Category,
  required_level: row.Required_Level,
  priority: row.Priority,
  assessment_type: row.Assessment_Type,
  question: row.Question,
  option_a: row.Option_A,
  option_b: row.Option_B,
  option_c: row.Option_C,
  option_d: row.Option_D,
  correct_answer: row.Correct_Answer,
  max_score: row.Max_Score,
  skill_mapping: row.Skill_Mapping,
  difficulty: row.Difficulty,
  time_minutes: row.Time_Minutes,
  evaluation_criteria: row.Evaluation_Criteria
}));

async function importData() {
  const { error } = await supabase
    .from("assessments")
    .insert(assessments);

  if (error) {
    console.error("Error:", error.message);
    return;
  }

  console.log("Assessment data imported successfully!");
}

importData();