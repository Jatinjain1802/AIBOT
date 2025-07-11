import os
from groq import Groq
import openai
from typing import Optional

# Initialize clients
groq_client = None
openai_client = None

def initialize_clients():
    """Initialize AI clients"""
    global groq_client, openai_client
    
    # Initialize Groq client
    groq_api_key = os.getenv("GROQ_API_KEY")
    if groq_api_key:
        groq_client = Groq(api_key=groq_api_key)
    
    # Initialize OpenAI client (fallback)
    openai_api_key = os.getenv("OPENAI_API_KEY")
    if openai_api_key:
        openai.api_key = openai_api_key
        openai_client = openai

# Initialize clients on import
initialize_clients()

async def get_ai_response(user_question: str, pdf_text: str = "") -> str:
    """
    Get AI response using Groq (primary) or OpenAI (fallback)
    """
    try:
        # Create prompt
        if pdf_text.strip():
            prompt = f"""You are an AI assistant helping users understand and analyze documents. 

Document Content:
{pdf_text[:4000]}  # Limit context to avoid token limits

User Question: {user_question}

Please provide a helpful and accurate response based on the document content. If the question cannot be answered from the document, please say so clearly."""
        else:
            prompt = f"""You are a helpful AI assistant. Please answer the following question:

{user_question}"""
        
        # Try Groq first (faster and often free)
        if groq_client:
            try:
                response = groq_client.chat.completions.create(
                    model="llama-3.1-8b-instant",  # Fast and efficient model
                    messages=[
                        {"role": "system", "content": "You are a helpful AI assistant."},
                        {"role": "user", "content": prompt}
                    ],
                    max_tokens=1000,
                    temperature=0.7
                )
                return response.choices[0].message.content
            except Exception as e:
                print(f"Groq API error: {e}")
                # Fall back to OpenAI
        
        # Fallback to OpenAI
        if openai_client:
            try:
                response = openai_client.ChatCompletion.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": "You are a helpful AI assistant."},
                        {"role": "user", "content": prompt}
                    ],
                    max_tokens=1000,
                    temperature=0.7
                )
                return response.choices[0].message.content
            except Exception as e:
                print(f"OpenAI API error: {e}")
        
        # If both fail
        return "I apologize, but I'm currently unable to process your request. Please check your API configuration and try again."
        
    except Exception as e:
        raise Exception(f"Error generating AI response: {str(e)}")