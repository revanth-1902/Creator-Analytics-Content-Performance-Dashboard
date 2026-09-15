from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional

from backend.app.db.database import get_db
from backend.app.models.user import User
from backend.app.core.deps import get_current_user
from backend.app.services.ai_copilot_service import AICopilotService

router = APIRouter(
    prefix="/ai",
    tags=["AI Copilot & Knowledge Assistant"]
)

@router.get("/quick-prompts")
def get_quick_prompts(
    role: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user)
):
    """
    Returns quick prompt recommendations tailored to the current user's assigned role.
    """
    active_role = role or (current_user.role if current_user else "creator")
    prompts = AICopilotService.get_quick_prompts(active_role)
    return {
        "role": active_role,
        "prompts": prompts
    }

@router.post("/chat")
def ai_chat(
    payload: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Conversational AI Assistant endpoint with full system awareness and PostgreSQL context.
    """
    query = payload.get("message") or payload.get("query")
    if not query:
        raise HTTPException(status_code=400, detail="Query message is required")

    result = AICopilotService.chat(query, current_user, db)
    return result

@router.post("/tool")
def ai_execute_tool(
    payload: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Executes structured role-specific AI tools (Script Generator, Pitch Builder, ROI Audit, etc.).
    """
    tool_type = payload.get("tool_type") or payload.get("tool")
    parameters = payload.get("parameters") or {}
    if not tool_type:
        raise HTTPException(status_code=400, detail="tool_type is required")

    result = AICopilotService.execute_tool(tool_type, parameters, current_user, db)
    return result
