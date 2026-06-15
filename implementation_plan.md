# EcoTrack Implementation Plan

## Goal Description
Build a fully functional and fully deployable production-grade AI-powered sustainability web application called "EcoTrack". The project will use the connected Stitch MCP project as the primary UI source of truth, reusing its layouts, components, and design system (Dark Mode, Manrope/Inter fonts, specific color variables). 

The platform will include:
- Next.js 15 frontend with Tailwind CSS, Shadcn UI, Framer Motion, Zustand, and Recharts.
- FastAPI backend with PostgreSQL (Neon compatible), SQLAlchemy, Redis, and Celery for background tasks.
- Core features: JWT/Google Auth, Onboarding, Carbon Tracking Engine, AI Recommendations, Gamification, Reports, Chatbot, OCR Receipt Scanner, and Admin Dashboard.
- Docker & CI/CD deployment configuration.

## User Review Required
> [!IMPORTANT]
> The UI will strictly adhere to the Stitch MCP's Dark Mode, using the "Modern Climate-Tech" and "Data-Driven Serenity" aesthetics. The design uses `Manrope` for headings and `Inter` for body. All components will be built to map to the `surface`, `primary`, `secondary` etc. colors specified in the MCP. 
> Since we are building a large full-stack app, the initial setup will focus on the scaffolding, database, API layer, and translating the Stitch UI to Next.js components. 

## Open Questions
> [!WARNING]
> 1. Do you have a preferred OCR library/service for the receipt scanner (e.g., Tesseract locally vs Google Cloud Vision/AWS Textract)? We will use Tesseract via PyTesseract locally if not specified.
> 2. Should we use a specific port for the local Celery broker (Redis)? By default, we will use Redis on port 6379, Postgres on 5432, Backend on 8000, and Frontend on 3000.
> 3. For the AI recommendations and Assistant chatbot, do you want to integrate a specific LLM API (e.g., OpenAI, Gemini), or should we mock this logic for now?

## Proposed Changes

### Infrastructure
#### [NEW] `docker-compose.yml`
Sets up Postgres, Redis, FastAPI, Celery worker, and Next.js frontend.
#### [NEW] `.github/workflows/deploy.yml`
CI/CD pipeline configuration for Vercel/Railway.
#### [NEW] `.env.example`
Environment variables template.

---

### Backend (FastAPI)
#### [NEW] `backend/main.py`
Application entrypoint.
#### [NEW] `backend/requirements.txt`
Dependencies (fastapi, uvicorn, sqlalchemy, psycopg2, celery, redis, pytesseract, python-jose, passlib, etc.).
#### [NEW] `backend/models/`
SQLAlchemy models (User, Activity, Emission, Recommendation, Challenge, Reward, Report, Notification, Upload).
#### [NEW] `backend/schemas/`
Pydantic models for request/response validation.
#### [NEW] `backend/api/`
API routes (auth, users, activities, tracking, chatbot, ocr).
#### [NEW] `backend/services/`
Business logic (Carbon calculation engine, AI recommendations).
#### [NEW] `backend/workers/`
Celery background tasks (OCR processing, Report generation).

---

### Frontend (Next.js 15)
#### [NEW] `frontend/package.json`
Next.js, Tailwind, Framer Motion, Zustand, Recharts dependencies.
#### [NEW] `frontend/tailwind.config.ts` & `frontend/app/globals.css`
Tailwind configuration strictly mapped to the Stitch MCP design system tokens.
#### [NEW] `frontend/components/`
ShadCN and custom components matching the Stitch design (Glass cards, Circular gauge, Carbon chips).
#### [NEW] `frontend/store/`
Zustand state management (Auth store, User store, Tracking store).
#### [NEW] `frontend/app/`
App router pages (Dashboard, Onboarding, Login/Signup, Tracker, Challenges).
#### [NEW] `frontend/services/`
Axios/Fetch API clients for backend integration.

## Verification Plan

### Automated Tests
- Run backend unit tests using `pytest` for carbon calculation logic and auth.
- Run frontend linting and type checking.

### Manual Verification
- Start the entire stack using `docker-compose up`.
- Register a new user and complete onboarding.
- Upload a dummy receipt and verify OCR processing via Celery.
- Verify the dashboard layout and visual components match the Stitch MCP design visually.
- Test the chatbot and recommendations endpoint.
