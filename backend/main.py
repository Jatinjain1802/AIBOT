from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import upload, chat
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(
    title="AIBOT Backend API",
    description="AI-powered chatbot backend with PDF upload and chat capabilities",
    version="1.0.0"
)

# Configure CORS for React Native frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(upload.router, prefix="/api", tags=["upload"])
app.include_router(chat.router, prefix="/api", tags=["chat"])

@app.get("/")
async def root():
    return {
        "message": "AIBOT Backend API is running!",
        "version": "1.0.0",
        "endpoints": {
            "upload": "/api/upload",
            "chat": "/api/chat",
            "docs": "/docs"
        }
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "AIBOT Backend"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)