from typing import Optional, List

from fastapi import APIRouter, Depends
from sqlmodel import Session

from oasst_backend.api import deps
from oasst_backend.models import ApiClient
from oasst_backend.prompt_repository import PromptRepository

router = APIRouter()


@router.get("/", response_model=list)
def list_categories(
        api_client_id: Optional[str] = None,
        api_client: ApiClient = Depends(deps.get_api_client),
        frontend_user: deps.FrontendUserId = Depends(deps.get_frontend_user_id),
        db: Session = Depends(deps.get_db)
    ) -> List[str]:
    pr = PromptRepository(db, api_client, auth_method=frontend_user.auth_method, username=frontend_user.username)
    return pr.fetch_categories()
