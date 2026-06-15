from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.auth import router as auth_router
from api.activities import router as activities_router
from api.ocr import router as ocr_router
from api.ws import router as ws_router
from db.session import engine
from db.base import Base

# Auto-create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="EcoTrack API",
    description="Backend API for EcoTrack Sustainability Platform",
    version="1.0.0",
)

from api.chat import router as chat_router
from api.shopping import router as shopping_router
from api.travel import router as travel_router
from api.notifications import router as notifications_router

app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(activities_router, prefix="/activities", tags=["activities"])
app.include_router(ocr_router, prefix="/ocr", tags=["ocr"])
app.include_router(chat_router, prefix="/chat", tags=["chat"])
app.include_router(shopping_router, prefix="/shopping", tags=["shopping"])
app.include_router(travel_router, prefix="/travel", tags=["travel"])
app.include_router(notifications_router, prefix="/notifications", tags=["notifications"])
app.include_router(ws_router, tags=["websockets"])

from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from core.security import limiter
from fastapi import Request

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://frontend:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    return response

@app.get("/")
def read_root():
    return {"message": "Welcome to EcoTrack API"}

@app.get("/health")
def health_check():
    return {"status": "ok"}
