from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from utils.groq_utils import get_ai_response

router = APIRouter()

class ChatRequest(BaseModel):
    pdf_text: str = ""
    user_question: str

class SimpleChatRequest(BaseModel):
    user_question: str

@router.post("/chat")
async def chat_with_pdf(request: ChatRequest):
    """
    Chat with AI using PDF context
    """
    try:
        if not request.user_question.strip():
            raise HTTPException(status_code=400, detail="User question cannot be empty")
        
        # Get AI response with PDF context
        ai_response = await get_ai_response(
            user_question=request.user_question,
            pdf_text=request.pdf_text
        )
        
        return {
            "success": True,
            "response": ai_response,
            "has_pdf_context": bool(request.pdf_text.strip())
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating AI response: {str(e)}")

@router.post("/chat/simple")
async def simple_chat(request: SimpleChatRequest):
    """
    Simple chat without PDF context
    """
    try:
        if not request.user_question.strip():
            raise HTTPException(status_code=400, detail="User question cannot be empty")
        
        # Get AI response without PDF context
        ai_response = await get_ai_response(
            user_question=request.user_question,
            pdf_text=""
        )
        
        return {
            "success": True,
            "response": ai_response,
            "has_pdf_context": False
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating AI response: {str(e)}")