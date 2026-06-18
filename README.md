<div align="center">
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/NextJS-Dark.svg" alt="Next.js" width="50" height="50" />
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/FastAPI.svg" alt="FastAPI" width="50" height="50" />
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/PostgreSQL-Dark.svg" alt="PostgreSQL" width="50" height="50" />
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/Docker.svg" alt="Docker" width="50" height="50" />

  <h1 align="center">EcoTrack 🌱</h1>

  <p align="center">
    <strong>Your Personal, AI-Powered Sustainability Coach</strong>
  </p>

  <p align="center">
    <a href="https://github.com/Adi3595/EcoTrack/issues"><img alt="Issues" src="https://img.shields.io/github/issues/Adi3595/EcoTrack?style=for-the-badge&color=95d4b3"></a>
    <a href="https://github.com/Adi3595/EcoTrack/network"><img alt="Forks" src="https://img.shields.io/github/forks/Adi3595/EcoTrack?style=for-the-badge&color=95d4b3"></a>
    <a href="https://github.com/Adi3595/EcoTrack/stargazers"><img alt="Stars" src="https://img.shields.io/github/stars/Adi3595/EcoTrack?style=for-the-badge&color=95d4b3"></a>
    <a href="https://github.com/Adi3595/EcoTrack/blob/main/LICENSE"><img alt="License" src="https://img.shields.io/github/license/Adi3595/EcoTrack?style=for-the-badge&color=95d4b3"></a>
  </p>
</div>

<br/>

## 🌍 Overview

**EcoTrack** is a state-of-the-art web application designed to help individuals and businesses monitor, understand, and dramatically reduce their carbon footprint. Utilizing modern web architecture, gorgeous UI design, and powerful AI analysis, EcoTrack provides real-time insights into your daily activities, from your commute to your grocery shopping.

Built as part of a high-speed hackathon sprint, EcoTrack prioritizes a premium, cinematic user experience (inspired by top-tier design agencies like Zajno) backed by an ultra-reliable, asynchronous Python microservices architecture.

---

## ✨ Core Features

*   🏎️ **Cinematic UI/UX:** Built with Next.js App Router, Tailwind CSS, and Framer Motion for incredibly smooth, kinetic typography, zero-latency custom cursors, spherical wipe page transitions, and fluid 3D glassmorphic designs.
*   🌊 **Immersive True WebGL Water Physics:** Fully integrated `react-water-wave` for a true mathematical fluid simulation canvas. Features organic, real-time liquid morphing, massive custom ripple wakes, and 3D depth parallax CSS masking that reacts to every cursor movement without dropping a frame.
*   🧠 **AI-Powered Insights:** Deep integration with Groq API (LLaMA 3) to act as a 24/7 personal sustainability coach, featuring a 100% transparent floating chat window that seamlessly blends into the environment.
*   🗺️ **Live Travel Tracking:** Real-time GPS and WebSocket-based emission monitoring. Hit "Start Trip" and watch your distance and footprint dynamically calculate.
*   📸 **Smart OCR Receipt Scanner:** Upload a photo of your grocery or energy bill, and let our Celery background workers process it via AI to automatically extract the carbon footprint of your purchases.
*   🔐 **Secure Authentication:** JWT-based stateless authentication flow, including a fully integrated password-reset system powered by **Resend**.
*   📊 **Beautiful Analytics:** Visual data representations using Recharts inside glassmorphic bento-box dashboard layouts.

---

## 🛠️ Technology Stack

EcoTrack is structured as a monorepo, decoupling the highly-interactive frontend from the high-throughput Python backend.

### Frontend
*   **Framework:** Next.js 14 (App Router, Turbopack)
*   **Styling:** Tailwind CSS, PostCSS
*   **Animations:** Framer Motion, Lenis (Smooth Scroll)
*   **State Management:** Zustand (with local storage persistence)
*   **Data Fetching:** Axios
*   **Charting:** Recharts
*   **Mapping:** Leaflet.js

### Backend
*   **API Framework:** FastAPI (Python 3.10+)
*   **Database:** PostgreSQL (managed by Neon / Supabase)
*   **ORM:** SQLAlchemy + Pydantic
*   **Task Queue:** Celery + Redis
*   **AI Integration:** Groq API (Meta LLaMA models)
*   **Email Delivery:** Resend SDK

### DevOps
*   **Containerization:** Docker & Docker Compose
*   **Orchestration:** Multi-container network (Frontend, Backend, Redis, Celery Worker)

---

## 🚀 Getting Started

Running the entire ecosystem locally is incredibly simple thanks to Docker.

### 1. Clone the Repository
```bash
git clone https://github.com/Adi3595/EcoTrack.git
cd EcoTrack
```

### 2. Configure Environment Variables
Copy the `.env.example` file to create your own `.env` configuration.
```bash
cp .env.example .env
```
Ensure you fill out the following crucial keys in the `.env` file:
*   `DATABASE_URL`: Your PostgreSQL connection string.
*   `GROQ_API_KEY`: API key for the AI capabilities.
*   `RESEND_API_KEY`: API key for sending forgot-password emails.
*   `SECRET_KEY`: A secure random string for JWT hashing.

### 3. Build and Run (Docker Compose)
Fire up the entire stack using Docker Compose. This single command builds the Next.js frontend, the FastAPI backend, boots up a Redis cache, and spins up the Celery asynchronous worker.
```bash
docker-compose up --build
```

### 4. Access the Application
*   **Frontend UI:** [http://localhost:3000](http://localhost:3000)
*   **Backend API Documentation:** [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 📂 Project Structure

```
EcoTrack/
├── frontend/                 # Next.js 14 Frontend Application
│   ├── src/app/              # App Router Pages (Dashboard, Chat, Travel)
│   ├── src/components/       # Reusable UI & Framer Motion Components
│   └── src/store/            # Zustand global state (Auth, UI)
├── backend/                  # FastAPI Backend Application
│   ├── api/                  # REST API Route Handlers
│   ├── core/                 # App config & Security (JWT, Passwords)
│   ├── db/                   # SQLAlchemy Session & Migrations
│   ├── models/               # Database Tables
│   ├── schemas/              # Pydantic validation models
│   └── workers/              # Celery Async Tasks (OCR, Heavy processing)
├── docker-compose.yml        # Orchestration Config
└── .env                      # Global Environment Variables
```

---

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

<p align="center">
  <i>Built with ❤️ by Adi3595</i>
</p>
