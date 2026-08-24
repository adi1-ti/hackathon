# CareerPath AI

> **Your journey. Your skills. Your future.**

CareerPath AI is an AI-powered career development platform that helps students understand their current skills, identify career-specific skill gaps, and create a personalized path toward their target career.

Instead of simply suggesting a career, CareerPath AI answers a more practical question:

> **What should I learn and build to become career-ready?**

🔗 **Live Demo:** https://careerpathai-phoenix.netlify.app/

---

## How It Works

```text
Register / Login
       ↓
Student Profile
       ↓
Select Target Career
       ↓
Take 5-MCQ Assessment
       ↓
Calculate Score + Skill Profile
       ↓
AI Analysis using Gemini
       ↓
Strengths + Weaknesses + Skill Gaps
       ↓
Recommendations + 4-Week Roadmap
       ↓
Project Recommendations
       ↓
Personalized Dashboard
       ↓
Learn → Build → Retake → Improve
```

### Workflow

1. The student registers or logs in.
2. The student completes their profile and selects a target career.
3. A career-specific 5-question assessment evaluates relevant skills.
4. The system calculates the overall score and skill-wise performance.
5. Assessment data is sent to a Supabase Edge Function.
6. Gemini AI analyzes the student's performance.
7. The system generates strengths, weaknesses, skill gaps, recommendations, a 4-week roadmap, and project suggestions.
8. Results are stored in Supabase and displayed on the student's dashboard.

---

## Key Features

* **Career Selection** — Choose a target career and its required skills.
* **Career-Specific Assessment** — 5 MCQs designed around relevant career skills.
* **Skill-Wise Analysis** — See performance for individual skills instead of only an overall score.
* **AI Career Analysis** — Gemini identifies strengths, weaknesses, and skill gaps.
* **Personalized Recommendations** — Get actionable next steps based on assessment performance.
* **4-Week Learning Roadmap** — Receive a structured weekly learning plan.
* **AI Project Recommendations** — Get project ideas aligned with career goals and skill gaps.
* **Personalized Dashboard** — View assessment results and AI-generated insights in one place.
* **Retake Assessment** — Reassess skills after learning and practice.
* **Explore Other Careers** — Try a different career path and assessment.
* **Secure Authentication** — User authentication is handled through Supabase Auth.

---

## AI Integration

CareerPath AI uses **Google Gemini** to transform assessment results into personalized career guidance.

```text
Assessment Results
        +
Career
        +
Skill Profile
        ↓
Supabase Edge Function
        ↓
Google Gemini
        ↓
Structured AI Analysis
        ↓
Strengths
Weaknesses
Skill Gaps
Recommendations
4-Week Roadmap
Projects
        ↓
Student Dashboard
```

The AI output is structured so that the frontend can dynamically display the generated insights.

---

## Technology Stack

| Layer               | Technology                      |
| ------------------- | ------------------------------- |
| Frontend            | React.js, Vite, JavaScript, CSS |
| Routing             | React Router                    |
| Icons               | Lucide React                    |
| Authentication      | Supabase Auth                   |
| Database            | Supabase PostgreSQL             |
| Backend             | Node.js, Express.js             |
| AI                  | Google Gemini                   |
| AI Runtime          | Supabase Edge Functions         |
| Data                | Career and assessment datasets  |
| Version Control     | Git & GitHub                    |
| Frontend Deployment | Netlify                         |
| Backend Deployment  | Render                          |

---

## Project Structure

```text
hackathon/
│
├── backend/
│   └── server.js
│
├── data/
│   └── career and assessment datasets
│
├── public/
│   └── static assets
│
├── src/
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── StudentProfile.jsx
│   │   ├── CareerSelection.jsx
│   │   ├── Assessment.jsx
│   │   └── Dashboard.jsx
│   │
│   └── supabaseClient.js
│
├── supabase/
│   └── functions/
│       └── analyze-assessment/
│
├── package.json
├── vite.config.js
└── README.md
```

---

## Getting Started

### Prerequisites

* Node.js 18+
* npm
* Supabase project
* Google Gemini API key

### 1. Clone the Repository

```bash
git clone https://github.com/adi1-ti/hackathon.git
cd hackathon
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Install Backend Dependencies

```bash
cd backend
npm install
cd ..
```

### 4. Configure Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_publishable_key
```

Create `backend/.env`:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_server_side_key
PORT=5000
```

Configure the Gemini API key as a **Supabase Edge Function secret**:

```text
GEMINI_API_KEY=your_gemini_api_key
```

**Never commit real API keys or service-role keys to GitHub.**

### 5. Set Up Supabase

Create the required database tables and import the career and assessment data.

The application uses Supabase for:

* Authentication
* Student data
* Career data
* Assessment results
* AI-generated analysis

### 6. Run the Backend

From the `backend` directory:

```bash
node server.js
```

### 7. Run the Frontend

From the project root, open another terminal:

```bash
npm run dev
```

Open the local URL provided by Vite.

---

## System Architecture

```text
                  React + Vite
                       │
              ┌────────┴────────┐
              ↓                 ↓
        Supabase Auth       Application API
              │                 │
              └────────┬────────┘
                       ↓
               Supabase Database
                       │
                       ↓
             Assessment Results
                       │
                       ↓
          Supabase Edge Function
             analyze-assessment
                       │
                       ↓
                 Gemini AI
                       │
                       ↓
             Structured AI Output
                       │
                       ↓
              Supabase Database
                       │
                       ↓
             React Dashboard
```

---

## 💡 What Makes CareerPath AI Different?

Most career platforms focus on **career discovery**.

CareerPath AI focuses on **career development**.

```text
Current Skills
      ↓
Skill Assessment
      ↓
Skill Gaps
      ↓
Personalized Learning
      ↓
Portfolio Projects
      ↓
Career Readiness
```

The platform connects assessment results directly to actionable learning and project recommendations.

---

## Expected Impact

CareerPath AI helps students:

* Understand their current skill level.
* Identify strengths and weaknesses.
* Discover important skill gaps.
* Follow a structured learning plan.
* Build relevant portfolio projects.
* Make more informed career decisions.

---

## Future Scope

Potential future improvements include:

* Larger and adaptive assessments.
* Progress tracking across multiple attempts.
* Resume analysis.
* Job and internship matching.
* Learning-resource recommendations.
* More career paths.
* Conversational AI career mentoring.

---

## Hackathon

Built for **[TigmaMinds Acadamy Hackathon]**.

**Challenge/Theme:** Education & Future Learning — Career & Skill Development

---

## Team

**Team:** [PHOENIX]

**Members:**

* [Aditi Agarwal]
* [Shabnam Sultana]
* [Pangkita Thakuria]

---

## License

This project was developed as a hackathon prototype.
