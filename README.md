# HireLytix — Student Management & Recruitment Demo

This project implements the uploaded HireLytix-style requirements as a full-stack Next.js demo.

## Stack
- Next.js App Router + TypeScript
- Prisma ORM + SQLite for a zero-setup local database
- JWT httpOnly cookie sessions
- bcrypt password hashing
- Role-based Student / Recruiter access
- Local explainable AI-style skill analysis and job skill matching
- Responsive custom CSS
- MCQ assessment flow, history, leaderboard, jobs, applications, recruiter console

## 1. Install
```bash
npm ci
```
Run this once after cloning. Do not reinstall dependencies for normal code changes.

## 2. Configure
Copy `.env.example` to `.env` and keep the default SQLite URL for the demo.

Authentication uses separate portals at `/login/student` and `/login/recruiter`, with matching account creation routes at `/register/student` and `/register/recruiter`. Password recovery uses the phone number saved on the account; in local development, the verification code is logged in the server terminal because no SMS provider is configured.

## 3. Create database + seed demo data
```bash
npx prisma generate
npm run db:push
npm run db:seed
```

## 4. Run
```bash
npm run dev
```
Open http://localhost:3000

## Demo accounts
Student:
student@taskhive.demo
Student@123

Recruiter:
recruiter@taskhive.demo
Recruiter@123

## Important
Skill scoring and job matching remain deterministic and explainable. The student chatbot uses an OpenAI-compatible conversational model when `OPENAI_API_KEY` is configured, with student profile, assessment context, and recent chat history included server-side. Without a key, it uses a clearly marked local fallback so development still works.

To enable the production chatbot, add these server-only values to `.env` and restart the dev server:

```env
OPENAI_API_KEY="your-api-key"
OPENAI_MODEL="gpt-4o-mini"
OPENAI_BASE_URL="https://api.openai.com/v1/chat/completions"
```

## Production upgrades
- PostgreSQL instead of SQLite
- HTTPS and secure deployment
- Email/OTP verification
- Password reset mail
- Resume/object storage
- Redis/cache and background jobs
- Real LLM/ML model
- Admin dashboard and audit logs
- Automated database backups
- Rate limiting, CSRF protection, stronger validation and monitoring


## Certificate feature
A demo achievement certificate is automatically available when a student's assessment score is **above 80%**.
- Result page displays the locked/unlocked state.
- Certificate page generates a unique certificate number.
- Certificate displays student name, assessment, skill level, score and issue date.
- Browser Print / Save as PDF creates a shareable demo certificate.
- Certificate records are stored in the database.

## Certificate demo
Use the seeded student account and answer at least 5 questions with 5 correct answers to get 100%, then open the certificate from the result page.
