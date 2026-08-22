import pandas as pd

excel_path = "../core_career_skill_dataset_39.xlsx"

# Read the main sheet
df = pd.read_excel(
    excel_path,
    sheet_name="Core Skills Dataset"
)

# -------------------------------------------------
# 1. Careers
# -------------------------------------------------

careers = (
    df[["Career"]]
    .drop_duplicates()
    .sort_values("Career")
    .reset_index(drop=True)
)

careers.insert(0, "id", range(1, len(careers) + 1))

careers.to_csv("careers.csv", index=False)


# -------------------------------------------------
# 2. Skills
# -------------------------------------------------

skills = (
    df[["Core Skill", "Category"]]
    .drop_duplicates()
    .sort_values("Core Skill")
    .reset_index(drop=True)
)

skills.insert(0, "id", range(1, len(skills) + 1))

skills = skills.rename(columns={
    "Core Skill": "name",
    "Category": "category"
})

skills.to_csv("skills.csv", index=False)


# -------------------------------------------------
# 3. Career-Skills relationship
# -------------------------------------------------

career_skills = df.merge(
    careers,
    on="Career"
)

career_skills = career_skills.merge(
    skills,
    left_on=["Core Skill", "Category"],
    right_on=["name", "category"]
)

career_skills = career_skills.rename(columns={
    "id_x": "career_skill_id",
    "id_y": "skill_id",
    "Required Level": "required_level",
    "Priority": "priority",
    "Suggested Project": "suggested_project"
})

career_skills = career_skills[
    [
        "career_skill_id",
        "id",
        "skill_id",
        "required_level",
        "priority",
        "suggested_project"
    ]
]

career_skills = career_skills.rename(columns={
    "id": "career_id"
})

career_skills.to_csv(
    "career_skills.csv",
    index=False
)


# -------------------------------------------------
# Done
# -------------------------------------------------

print("Data preparation complete!")
print()
print(f"Careers: {len(careers)}")
print(f"Skills: {len(skills)}")
print(f"Career-skill relationships: {len(career_skills)}")
print()
print("Created:")
print("- careers.csv")
print("- skills.csv")
print("- career_skills.csv")