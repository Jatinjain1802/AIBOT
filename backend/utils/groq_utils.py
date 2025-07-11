import os
import httpx
import asyncio
from typing import Tuple
import logging

logger = logging.getLogger(__name__)

# API Configuration
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
GROQ_BASE_URL = "https://api.groq.com/openai/v1/chat/completions"
OPENAI_BASE_URL = "https://api.openai.com/v1/chat/completions"

# Model Configuration
GROQ_MODEL = "llama-3.1-70b-versatile"  # Fast and efficient
OPENAI_MODEL = "gpt-3.5-turbo"  # Fallback model
REQUEST_TIMEOUT = 30  # seconds

async def get_ai_response(pdf_text: str, user_question: str) -> Tuple[str, str]:
    """
    Get AI response using Groq API with OpenAI fallback.
    
    Args:
        pdf_text: Extracted PDF text content
        user_question: User's question
        
    Returns:
        Tuple of (response_text, model_used)
    """
    
    # Create system prompt
    system_prompt = create_system_prompt(pdf_text)
    
    # Try Groq first
    if GROQ_API_KEY:
        try:
            response = await call_groq_api(system_prompt, user_question)
            return response, f"Groq ({GROQ_MODEL})"
        except Exception as e:
            logger.warning(f"Groq API failed: {str(e)}, falling back to OpenAI")
    
    # Fallback to OpenAI
    if OPENAI_API_KEY:
        try:
            response = await call_openai_api(system_prompt, user_question)
            return response, f"OpenAI ({OPENAI_MODEL})"
        except Exception as e:
            logger.error(f"OpenAI API also failed: {str(e)}")
            raise Exception("Both Groq and OpenAI APIs are unavailable")
    
    raise Exception("No API keys configured. Please set GROQ_API_KEY or OPENAI_API_KEY")

def create_system_prompt(pdf_text: str) -> str:
    """Create system prompt based on whether PDF text is available."""
    
    if pdf_text.strip():
        return f"""You are AIBOT, an intelligent assistant specialized in analyzing documents and answering questions.

DOCUMENT CONTENT:
{pdf_text}

Instructions:
- Answer questions based on the provided document content
- If the answer isn't in the document, clearly state that
- Provide accurate, helpful, and concise responses
- Use specific quotes or references from the document when relevant
- If asked about topics not in the document, provide general knowledge but clarify the source
"""
    else:
        return """You are AIBOT, a helpful AI assistant. Provide accurate, helpful, and concise responses to user questions. Be friendly and professional in your interactions."""

async def call_groq_api(system_prompt: str, user_question: str) -> str:
    """Call Groq API for AI response."""
    
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": GROQ_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_question}
        ],
        "temperature": 0.7,
        "max_tokens": 1000,
        "stream": False
    }
    
    async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT) as client:
        response = await client.post(GROQ_BASE_URL, headers=headers, json=payload)
        response.raise_for_status()
        
        data = response.json()
        return data["choices"][0]["message"]["content"]

async def call_openai_api(system_prompt: str, user_question: str) -> str:
    """Call OpenAI API for AI response."""
    
    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": OPENAI_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_question}
        ],
        "temperature": 0.7,
        "max_tokens": 1000
    }
    
    async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT) as client:
        response = await client.post(OPENAI_BASE_URL, headers=headers, json=payload)
        response.raise_for_status()
        
        data = response.json()
        return data["choices"][0]["message"]["content"]

async def test_api_connection() -> dict:
    """Test API connections and return status."""
    
    status = {
        "groq": {"available": False, "error": None},
        "openai": {"available": False, "error": None}
    }
    
    # Test Groq
    if GROQ_API_KEY:
        try:
            await call_groq_api("You are a test assistant.", "Say 'Hello from Groq!'")
            status["groq"]["available"] = True
        except Exception as e:
            status["groq"]["error"] = str(e)
    
    # Test OpenAI
    if OPENAI_API_KEY:
        try:
            await call_openai_api("You are a test assistant.", "Say 'Hello from OpenAI!'")
            status["openai"]["available"] = True
        except Exception as e:
            status["openai"]["error"] = str(e)
    
    return status