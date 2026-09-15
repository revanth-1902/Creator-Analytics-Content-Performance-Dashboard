from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.routers.users import router as users_router
from backend.app.routers.auth import router as auth_router
from backend.app.routers.content import router as content_router
from backend.app.routers.analytics import router as analytics_router
from backend.app.routers.audience import router as audience_router
from backend.app.routers.youtube import router as youtube_router
from backend.app.routers.social import router as social_router
from backend.app.routers.revenue import router as revenue_router
from backend.app.routers.sponsorships import router as sponsorships_router
from backend.app.routers.notifications import router as notifications_router
from backend.app.routers.reports import router as reports_router
from backend.app.routers.platforms import router as platforms_router
from backend.app.routers.ai import router as ai_router

from backend.app.db.init_db import init_db

init_db()

app = FastAPI(
    title="CreatorIQ API - Multi-Platform Analytics Engine",
    description="Sprint 9: Multi-Platform Integration, Instagram Graph API, Omnichannel Analytics & Cross-Platform Comparison",
    version="4.0.0"
)

# Permissive CORS configuration supporting credentials and all origins
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"http://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users_router)
app.include_router(users_router, prefix="/api")
app.include_router(auth_router)
app.include_router(auth_router, prefix="/api")
app.include_router(content_router)
app.include_router(content_router, prefix="/api")
app.include_router(analytics_router)
app.include_router(analytics_router, prefix="/api")
app.include_router(audience_router)
app.include_router(audience_router, prefix="/api")
app.include_router(youtube_router)
app.include_router(youtube_router, prefix="/api")
app.include_router(social_router)
app.include_router(social_router, prefix="/api")
app.include_router(platforms_router)
app.include_router(platforms_router, prefix="/api")
app.include_router(revenue_router)
app.include_router(revenue_router, prefix="/api")
app.include_router(sponsorships_router)
app.include_router(sponsorships_router, prefix="/api")
app.include_router(notifications_router)
app.include_router(notifications_router, prefix="/api")
app.include_router(reports_router)
app.include_router(reports_router, prefix="/api")
app.include_router(ai_router)
app.include_router(ai_router, prefix="/api")


@app.get("/")
def home():
    return {
        "message": "CreatorIQ API running - Sprint 7 Notifications, Reporting & PDF/Excel Export System Active",
        "version": "3.1.0"
    }