const XLSX = require("xlsx");
const fs = require("fs");

const excelPath = "../core_career_skill_dataset_39.xlsx";

const workbook = XLSX.readFile(excelPath);

const sheet = workbook.Sheets["Core Skills Dataset"];

const data = XLSX.utils.sheet_to_json(sheet);

console.log(`Found ${data.length} skill records.`);

// -----------------------------
// Careers
// -----------------------------

const careerNames = [
    ...new Set(data.map(row => row.Career))
].sort();

const careers = careerNames.map((name, index) => ({
    id: index + 1,
    name
}));


// -----------------------------
// Skills
// -----------------------------

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


// -----------------------------
// Career-Skills
// -----------------------------

const careerSkills = data.map((row, index) => {

    const career = careers.find(
        c => c.name === row.Career
    );

    const skill = skills.find(
        s =>
            s.name === row["Core Skill"] &&
            s.category === row.Category
    );

    return {
        id: index + 1,
        career_id: career.id,
        skill_id: skill.id,
        required_level: row["Required Level"],
        priority: row.Priority,
        suggested_project: row["Suggested Project"]
    };
});


// -----------------------------
// CSV converter
// -----------------------------

function toCSV(rows) {

    if (rows.length === 0) return "";

    const headers = Object.keys(rows[0]);

    const escape = value => {
        if (value === null || value === undefined) {
            return "";
        }

        const text = String(value);

        if (
            text.includes(",") ||
            text.includes('"') ||
            text.includes("\n")
        ) {
            return `"${text.replace(/"/g, '""')}"`;
        }

        return text;
    };

    const lines = [
        headers.join(","),
        ...rows.map(row =>
            headers
                .map(header => escape(row[header]))
                .join(",")
        )
    ];

    return lines.join("\n");
}


// -----------------------------
// Save files
// -----------------------------

fs.writeFileSync(
    "careers.csv",
    toCSV(careers)
);

fs.writeFileSync(
    "skills.csv",
    toCSV(skills)
);

fs.writeFileSync(
    "career_skills.csv",
    toCSV(careerSkills)
);


console.log("\nData preparation complete!");
console.log(`Careers: ${careers.length}`);
console.log(`Skills: ${skills.length}`);
console.log(`Career-skill relationships: ${careerSkills.length}`);

console.log("\nCreated:");
console.log("✓ careers.csv");
console.log("✓ skills.csv");
console.log("✓ career_skills.csv");