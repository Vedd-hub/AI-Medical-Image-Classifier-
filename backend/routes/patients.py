from fastapi import APIRouter

from database.db import get_conn

router = APIRouter(tags=["patients"])


@router.get("/patients")
def list_patients() -> list[dict]:
    with get_conn() as c:
        return [dict(r) for r in c.execute("SELECT * FROM patients ORDER BY id")]
