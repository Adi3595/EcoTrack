import pytesseract
from PIL import Image
from workers.celery_app import celery_app
import io
import os
import json
from openai import OpenAI

@celery_app.task(name="workers.tasks.process_receipt_ocr")
def process_receipt_ocr(image_bytes: bytes, user_id: str):
    try:
        # Load image
        image = Image.open(io.BytesIO(image_bytes))
        
        # Perform OCR
        text = pytesseract.image_to_string(image)
        
        # AI Verification of OCR Text
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            return {"status": "error", "detail": "Groq API key missing"}
            
        client = OpenAI(api_key=api_key, base_url="https://api.groq.com/openai/v1")
        
        prompt = f"""
        The following text was extracted via OCR from an image uploaded by a user as a 'receipt' or 'utility bill'.
        Read the text and determine if it is reasonably a valid receipt, bill, or ticket. If it is random garbage, empty, or unrelated text, reject it.
        Return ONLY a JSON object: {{"verified": true/false, "category": "ELECTRICITY" or "TRANSPORT" or "SHOPPING" or "UNKNOWN"}}
        
        OCR Text:
        {text[:1000]}
        """
        
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_tokens=100
        )
        
        raw_output = response.choices[0].message.content
        if raw_output.startswith("```json"):
            raw_output = raw_output[7:-3]
        elif raw_output.startswith("```"):
            raw_output = raw_output[3:-3]
            
        data = json.loads(raw_output.strip())
        
        if not data.get("verified", False):
            return {"status": "error", "detail": "The uploaded image was rejected because the text does not resemble a valid receipt or bill."}
            
        category = data.get("category", "UNKNOWN")
        
        return {"status": "success", "category": category, "extracted_text": text[:200]}
    except Exception as e:
        return {"status": "error", "detail": str(e)}
