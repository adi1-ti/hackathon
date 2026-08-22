const XLSX = require("xlsx");
const fs = require("fs");

const excelPath = "../core_career_skill_dataset_39.xlsx";

const workbook = XLSX.readFile(excelPath);
const sheet = workbook.Sheets["Core Skills Dataset"];

const data = XLSX.utils.sheet_to_json(sheet);

// These IDs match YOUR Supabase careers table
const careerIds = {
    "Frontend Developer": 1,
    "Backend Developer": 2,
    "Data Analyst": 3,
    "UI/UX Designer": 4,
    "Cybersecurity Analyst": 5,
    "AI/ML Engineer": 6
};

// These IDs match the skills.csv we already imported
const skillsWorkbook = XLSX.readFile("../core_career_skill_dataset_39.xlsx");

// Recreate the exact same skill ordering used by prepare_data.js
const skillMap = new Map();

data.forEach(row => {
    const key = `${row["Core Skill"]}|${row.Category}`;

    if (!skillMap.has(key)) {
        skillMap.set(key, {
            name: row["Core Skill"],
            category: row.Category
        });
    }
});

const skills = [...skillMap.values()]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((skill, index) => ({
        id: index + 1,
        ...skill
    }));


// Create career_skills rows
const careerSkills = data.map((row, index) => {

    const skill = skills.find(
        s =>
            s.name === row["Core Skill"] &&
            s.category === row.Category
    );

    return {
        id: index + 1,
        career_id: careerIds[row.Career],
        skill_id: skill.id,
        required_level: row["Required Level"],
        priority: row.Priority,
        suggested_project: row["Suggested Project"]
    };
});


// Convert to CSV
function toCSV(rows) {

    const headers = Object.keys(rows[0]);

    const escape = value => {
        const text = String(value ?? "");

        if (
            text.includes(",") ||
            text.includes('"') ||
            text.includes("\n")
        ) {
            return `"${text.replace(/"/g, '""')}"`;
        }

        return text;
    };

    return [
        headers.join(","),
        ...rows.map(row =>
            headers
                .map(header => escape(row[header]))
                .join(",")
        )
    ].join("\n");
}

fs.writeFileSync(
    "career_skills.csv",
    toCSV(careerSkills)
);

console.log("career_skills.csv created!");
console.log(`Rows: ${careerSkills.length}`);