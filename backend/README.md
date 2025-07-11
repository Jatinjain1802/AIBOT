# AIBOT FastAPI Backend

A complete, efficient FastAPI backend for the AIBOT mobile app with PDF upload and AI chat capabilities.

## 🚀 Features

- **PDF Upload & Text Extraction** using PyMuPDF
- **AI Chat** with Groq API (LLaMA 3.1) and OpenAI fallback
- **CORS enabled** for React Native frontend
- **Optimized for minimal compute** usage
- **Clean, modular architecture**
- **Comprehensive error handling**

## 📁 Project Structure

```
backend/
├── main.py                 # FastAPI app entry point
├── routers/
│   ├── __init__.py
│   ├── upload.py          # PDF upload endpoint
│   └── chat.py            # AI chat endpoint
├── utils/
│   ├── __init__.py
│   ├── pdf_utils.py       # PDF text extraction
│   └── groq_utils.py      # AI API integration
├── requirements.txt       # Python dependencies
├── .env.example          # Environment variables template
└── README.md             # This file
```

## 🛠️ Setup Instructions

### 1. Clone and Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your API keys
nano .env
```

Required environment variables:
```env
GROQ_API_KEY=your_groq_api_key_here
OPENAI_API_KEY=your_openai_api_key_here  # Optional fallback
PORT=8000
```

### 3. Get API Keys

**Groq API (Primary):**
1. Visit [Groq Console](https://console.groq.com/)
2. Sign up/login and create an API key
3. Add to `.env` file

**OpenAI API (Fallback):**
1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Create an API key
3. Add to `.env` file

### 4. Run the Server

```bash
# Development mode with auto-reload
python main.py

# Or using uvicorn directly
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at: `http://localhost:8000`

## 📚 API Endpoints

### 1. Upload PDF
```http
POST /api/upload
Content-Type: multipart/form-data

Body: PDF file (max 10MB)
```

**Response:**
```json
{
  "success": true,
  "filename": "document.pdf",
  "file_size": 1024000,
  "text_length": 5000,
  "extracted_text": "PDF content here..."
}
```

### 2. Chat with AI
```http
POST /api/chat
Content-Type: application/json

{
  "pdf_text": "extracted PDF content",
  "user_question": "What is this document about?"
}
```

**Response:**
```json
{
  "response": "This document appears to be about...",
  "model_used": "Groq (llama-3.1-70b-versatile)",
  "success": true
}
```

### 3. Simple Chat (No PDF)
```http
POST /api/chat/simple
Content-Type: application/json

{
  "user_question": "Hello, how are you?"
}
```

## 🔧 React Native Integration

### Install HTTP client in your React Native app:
```bash
npm install axios
```

### Example usage:
```javascript
// Upload PDF
const uploadPDF = async (fileUri) => {
  const formData = new FormData();
  formData.append('file', {
    uri: fileUri,
    type: 'application/pdf',
    name: 'document.pdf',
  });

  const response = await fetch('http://your-server:8000/api/upload', {
    method: 'POST',
    body: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.json();
};

// Chat with AI
const chatWithAI = async (pdfText, question) => {
  const response = await fetch('http://your-server:8000/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      pdf_text: pdfText,
      user_question: question,
    }),
  });

  return response.json();
};
```

## 🚀 Deployment

### Local Development
```bash
python main.py
```

### Production (using Gunicorn)
```bash
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Docker (Optional)
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["python", "main.py"]
```

## 🔍 Testing

### Test endpoints using curl:

```bash
# Health check
curl http://localhost:8000/health

# Upload PDF
curl -X POST -F "file=@test.pdf" http://localhost:8000/api/upload

# Chat
curl -X POST -H "Content-Type: application/json" \
  -d '{"pdf_text":"test content","user_question":"What is this about?"}' \
  http://localhost:8000/api/chat
```

## 📊 Performance Optimization

- **Minimal dependencies** for faster startup
- **Async/await** for non-blocking operations
- **Text truncation** to avoid token limits
- **Efficient PDF processing** with PyMuPDF
- **Connection pooling** with httpx

## 🛡️ Security Features

- **File size limits** (10MB max)
- **File type validation** (PDF only)
- **Input sanitization**
- **Error handling** without exposing internals
- **CORS configuration** for frontend access

## 🐛 Troubleshooting

### Common Issues:

1. **"No API keys configured"**
   - Ensure `.env` file exists with valid API keys

2. **"File too large"**
   - PDF files must be under 10MB

3. **"Invalid file type"**
   - Only PDF files are accepted

4. **CORS errors**
   - Check CORS configuration in `main.py`

### Logs:
The application logs important events. Check console output for debugging information.

## 📝 License

This project is part of the AIBOT mobile application.