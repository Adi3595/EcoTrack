import os
import base64
import json
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from models.user import User
from models.shopping import ShoppingProduct, ShoppingAnalysis
from api.deps import get_current_user, get_db
from openai import AsyncOpenAI
import uuid

router = APIRouter()

@router.post("/upload")
async def analyze_product(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="Groq API key not configured")
    
    client = AsyncOpenAI(
        api_key=api_key,
        base_url="https://api.groq.com/openai/v1"
    )

    contents = await file.read()
    base64_image = base64.b64encode(contents).decode("utf-8")
    mime_type = file.content_type or "image/jpeg"

    try:
        # Prompt Groq Vision to analyze the product
        response = await client.chat.completions.create(
            model="llama-3.2-11b-vision-preview",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text", 
                            "text": """Analyze this product image for environmental impact. 
If the image does not contain a product, food item, or recognizable shopping item (e.g., if it is a blank wall, a person, or completely unrelated), you MUST set "eco_rating" to "INVALID".
You must return ONLY a valid JSON object matching this structure, with no markdown formatting:
{
  "name": "Product Name",
  "category": "Category",
  "eco_rating": "A/B/C/D/F",
  "carbon_footprint_kg": 2.5,
  "manufacturing_impact": 1.2,
  "packaging_impact": 0.5,
  "transport_impact": 0.8,
  "insights": ["Insight 1", "Insight 2"],
  "alternatives": [
    {"name": "Alternative 1", "desc": "Why it's better"}
  ]
}"""
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:{mime_type};base64,{base64_image}",
                            },
                        },
                    ],
                }
            ],
            temperature=0.2,
            max_tokens=1024
        )
        
        raw_output = response.choices[0].message.content
        # Remove any markdown code block wrapper if present
        if raw_output.startswith("```json"):
            raw_output = raw_output[7:-3]
        elif raw_output.startswith("```"):
            raw_output = raw_output[3:-3]
            
        data = json.loads(raw_output.strip())
        
        if data.get("eco_rating") == "INVALID":
            raise HTTPException(status_code=400, detail="The uploaded image does not appear to be a recognizable product or shopping item.")

        # Save to database
        product = ShoppingProduct(
            user_id=current_user.id,
            name=data.get("name", "Unknown Product"),
            category=data.get("category", "Unknown"),
            carbon_footprint=data.get("carbon_footprint_kg", 0.0),
            eco_rating=data.get("eco_rating", "C"),
            image_url=f"local_upload_{uuid.uuid4().hex}" # In a real app, upload to S3
        )
        db.add(product)
        db.commit()
        db.refresh(product)

        analysis = ShoppingAnalysis(
            product_id=product.id,
            manufacturing_impact=data.get("manufacturing_impact", 0.0),
            packaging_impact=data.get("packaging_impact", 0.0),
            transport_impact=data.get("transport_impact", 0.0),
            alternatives_json=data.get("alternatives", []),
            insights_json=data.get("insights", [])
        )
        db.add(analysis)
        db.commit()

        return {
            "status": "success",
            "product": {
                "id": product.id,
                "name": product.name,
                "category": product.category,
                "carbon_footprint": product.carbon_footprint,
                "eco_rating": product.eco_rating
            },
            "analysis": {
                "manufacturing_impact": analysis.manufacturing_impact,
                "packaging_impact": analysis.packaging_impact,
                "transport_impact": analysis.transport_impact,
                "insights": analysis.insights_json,
                "alternatives": analysis.alternatives_json
            }
        }
        
    except Exception as e:
        print("Groq Vision Error:", e)
        # Fallback to dummy data if vision fails or limit reached
        dummy_data = {
            "name": "Plastic Water Bottle",
            "category": "Beverage",
            "carbon_footprint_kg": 0.5,
            "eco_rating": "D",
            "manufacturing_impact": 0.3,
            "packaging_impact": 0.1,
            "transport_impact": 0.1,
            "insights": ["Single-use plastic takes 400 years to decompose.", "High manufacturing emissions compared to reusables."],
            "alternatives": [
                {"name": "Reusable Steel Bottle", "desc": "Reduces 35% carbon impact over 1 year."}
            ]
        }
        
        product = ShoppingProduct(user_id=current_user.id, name=dummy_data["name"], category=dummy_data["category"], carbon_footprint=dummy_data["carbon_footprint_kg"], eco_rating=dummy_data["eco_rating"])
        db.add(product)
        db.commit()
        db.refresh(product)
        analysis = ShoppingAnalysis(product_id=product.id, manufacturing_impact=dummy_data["manufacturing_impact"], packaging_impact=dummy_data["packaging_impact"], transport_impact=dummy_data["transport_impact"], alternatives_json=dummy_data["alternatives"], insights_json=dummy_data["insights"])
        db.add(analysis)
        db.commit()
        return {"status": "success", "product": {"id": product.id, "name": product.name, "category": product.category, "carbon_footprint": product.carbon_footprint, "eco_rating": product.eco_rating}, "analysis": {"manufacturing_impact": analysis.manufacturing_impact, "packaging_impact": analysis.packaging_impact, "transport_impact": analysis.transport_impact, "insights": analysis.insights_json, "alternatives": analysis.alternatives_json}, "note": "Used fallback data due to AI error."}

@router.get("/history")
def get_shopping_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    products = db.query(ShoppingProduct).filter(ShoppingProduct.user_id == current_user.id).order_by(ShoppingProduct.timestamp.desc()).all()
    results = []
    for p in products:
        results.append({
            "id": p.id,
            "name": p.name,
            "eco_rating": p.eco_rating,
            "carbon_footprint": p.carbon_footprint,
            "timestamp": p.timestamp
        })
    return results

@router.get("/analytics")
def get_shopping_analytics(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    products = db.query(ShoppingProduct).filter(ShoppingProduct.user_id == current_user.id).all()
    total_emissions = sum(p.carbon_footprint for p in products)
    categories = {}
    for p in products:
        categories[p.category] = categories.get(p.category, 0) + p.carbon_footprint
        
    return {
        "total_emissions": total_emissions,
        "total_items": len(products),
        "emissions_by_category": categories
    }
