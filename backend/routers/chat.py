from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from utils.groq_utils import get_ai_response
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

class ChatRequest(BaseModel):
    pdf_text: str = Field(..., description="Extracted PDF text content")
    user_question: str = Field(..., min_length=1, max_length=1000, description="User's question")

class ChatResponse(BaseModel):
    response: str
    model_used: str
    success: bool

@router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(request: ChatRequest):
    """
    Chat with AI using PDF context and user question.
    
    Args:
        request: ChatRequest containing pdf_text and user_question
        
    Returns:
        AI response with model information
    """
    try:
        # Validate input
        if not request.user_question.strip():
            raise HTTPException(
                status_code=400,
                detail="User question cannot be empty."
            )
        
        # Truncate PDF text if too long (to avoid token limits)
        max_pdf_length = 15000  # Adjust based on model limits
        pdf_text = request.pdf_text[:max_pdf_length] if len(request.pdf_text) > max_pdf_length else request.pdf_text
        
        logger.info(f"Processing chat request with PDF text length: {len(pdf_text)}")
        
        # Get AI response
        ai_response, model_used = await get_ai_response(pdf_text, request.user_question)
        
        return ChatResponse(
            response=ai_response,
            model_used=model_used,
            success=True
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error generating AI response: {str(e)}"
        )

@router.post("/chat/simple")
async def simple_chat(request: dict):
    """
    Simplified chat endpoint for basic questions without PDF context.
    """
    try:
        user_question = request.get("user_question", "")
        if not user_question.strip():
            raise HTTPException(status_code=400, detail="User question is required.")
        
        ai_response, model_used = await get_ai_response("", user_question)
        
        return JSONResponse(
            status_code=200,
            content={
                "response": ai_response,
                "model_used": model_used,
                "success": True
            }
        )
        
    except Exception as e:
        logger.error(f"Error in simple chat: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))