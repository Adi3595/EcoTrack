from fastapi import APIRouter, Depends, UploadFile, File
from models.user import User
from api import deps
from workers.tasks import process_receipt_ocr

router = APIRouter()

@router.post("/scan-receipt")
async def scan_receipt(
    file: UploadFile = File(...),
    current_user: User = Depends(deps.get_current_user),
):
    contents = await file.read()
    # Queue background task
    task = process_receipt_ocr.delay(contents, str(current_user.id))
    return {"message": "Receipt uploaded successfully, processing in background", "task_id": task.id}
