import pytesseract
from PIL import Image
from workers.celery_app import celery_app
import io

@celery_app.task(name="workers.tasks.process_receipt_ocr")
def process_receipt_ocr(image_bytes: bytes, user_id: str):
    try:
        # Load image
        image = Image.open(io.BytesIO(image_bytes))
        
        # Perform OCR
        text = pytesseract.image_to_string(image)
        
        # Here we would normally use NLP/LLM to extract total cost or carbon emission details
        # For MVP, we will just return the raw text or a mock parsed result
        # e.g., if 'electricity' is found, categorize it.
        category = "UNKNOWN"
        if "electricity" in text.lower() or "kwh" in text.lower():
            category = "ELECTRICITY"
        elif "fuel" in text.lower() or "gas" in text.lower():
            category = "TRANSPORT"
            
        # We can then save this to the DB.
        # This represents the completion of the background job.
        
        return {"status": "success", "category": category, "extracted_text": text}
    except Exception as e:
        return {"status": "error", "detail": str(e)}
