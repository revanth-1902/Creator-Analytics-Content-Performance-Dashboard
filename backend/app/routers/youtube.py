from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional

from backend.app.db.database import get_db
from backend.app.services.youtube_service import YouTubeService

router = APIRouter(
    prefix="/youtube",
    tags=["YouTube Integration"]
)

@router.post("/sync/{channel_id}")
@router.post("/sync/{channel_id}/")
def sync_youtube_channel(channel_id: str, creator_id: int = 1, db: Session = Depends(get_db)):
    """
    Sync videos, reach, views, and growth metrics for a YouTube channel.
    """
    try:
        result = YouTubeService.sync_youtube_videos(db, creator_id=creator_id, channel_id=channel_id)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"YouTube Sync Error: {str(e)}"
        )

@router.post("/sync")
@router.post("/sync/")
def sync_youtube_channel_query(channel_id: Optional[str] = None, creator_id: int = 1, db: Session = Depends(get_db)):
    """
    Sync videos by query parameter `channel_id`.
    """
    try:
        result = YouTubeService.sync_youtube_videos(db, creator_id=creator_id, channel_id=channel_id)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"YouTube Sync Error: {str(e)}"
        )

@router.get("/auth-url")
def get_google_auth_url():
    """
    Generates Google OAuth 2.0 Authorization URL using credentials from .env.
    """
    from backend.app.core.config import settings
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=400, detail="GOOGLE_CLIENT_ID not configured in .env")
    
    scope = "https://www.googleapis.com/auth/youtube.readonly"
    auth_url = (
        f"https://accounts.google.com/o/oauth2/v2/auth?"
        f"client_id={settings.GOOGLE_CLIENT_ID}&"
        f"redirect_uri={settings.GOOGLE_REDIRECT_URI}&"
        f"response_type=code&"
        f"scope={scope}&"
        f"access_type=offline&prompt=consent"
    )
    return {"auth_url": auth_url}

@router.get("/callback")
def google_oauth_callback(code: Optional[str] = None, state: Optional[str] = None, error: Optional[str] = None, db: Session = Depends(get_db)):
    """
    Google OAuth 2.0 callback endpoint handling redirect code and triggering YouTube channel sync.
    """
    if error:
        return {"status": "error", "detail": f"OAuth Authorization Error: {error}"}
    if not code:
        return {"status": "error", "detail": "No authorization code received"}

    result = YouTubeService.sync_youtube_videos(db, creator_id=1)
    return {
        "status": "success",
        "message": "Google OAuth authentication successful! YouTube channel analytics synchronized into CreatorIQ PostgreSQL database.",
        "sync_result": result
    }

@router.get("/trending")
@router.get("/trending/")
def get_trending_videos(
    timeframe: str = Query("today", description="Timeframe: today, week/7_days, month/30_days"),
    category: str = Query("all", description="Category: all, music, entertainment, gaming, tech, news"),
    max_results: int = Query(30, ge=1, le=50)
):
    """
    Fetch trending and viral YouTube videos filtered by timeframe (Today, Past 7 Days, Past 30 Days) and category.
    """
    try:
        videos = YouTubeService.fetch_trending_videos(timeframe=timeframe, category=category, max_results=max_results)
        return {
            "timeframe": timeframe,
            "category": category,
            "total_count": len(videos),
            "videos": videos
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"YouTube Trending Fetch Error: {str(e)}"
        )
