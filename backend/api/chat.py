from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List
import os
from openai import AsyncOpenAI
from api.deps import get_current_user
from models.user import User

router = APIRouter()

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]

@router.post("/message")
async def chat_message(request: ChatRequest, current_user: User = Depends(get_current_user)):
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="Groq API key not configured")
    
    # Use OpenAI SDK but point it to Groq's API
    client = AsyncOpenAI(
        api_key=api_key,
        base_url="https://api.groq.com/openai/v1"
    )
    
    try:
        # Prepend system prompt
        system_msg = {
            "role": "system",
            "content": f"You are the EcoTrack Assistant, an expert sustainability coach. The user's name is {current_user.full_name}. Keep responses concise, helpful, and focused on reducing carbon footprints."
        }
        
        def map_role(r):
            return "assistant" if r == "bot" else r

        messages_to_send = [system_msg] + [
            {"role": map_role(m.role), "content": m.content} for m in request.messages
        ]
        
        response = await client.chat.completions.create(
            model="llama-3.1-8b-instant", # Updated to a currently supported Groq model
            messages=messages_to_send,
            max_tokens=300,
            temperature=0.7
        )
        
        ai_message = response.choices[0].message.content
        return {"role": "bot", "content": ai_message}
        
    except Exception as e:
        print("OpenAI Error:", e)
        raise HTTPException(status_code=500, detail=f"OpenAI Error: {str(e)}")
