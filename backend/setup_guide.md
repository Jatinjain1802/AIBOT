# 🚀 AIBOT Backend Setup Guide

## Step 1: Get Your API Keys

### 🔑 Groq API Key (Primary - FREE & FAST)
1. Go to [https://console.groq.com/](https://console.groq.com/)
2. Sign up with your email (it's free!)
3. Click "API Keys" in the left sidebar
4. Click "Create API Key"
5. Copy the key (starts with `gsk_`)

### 🔑 OpenAI API Key (Fallback - Optional)
1. Go to [https://platform.openai.com/](https://platform.openai.com/)
2. Sign up and add payment method
3. Go to "API Keys" section
4. Create new secret key
5. Copy the key (starts with `sk-`)

## Step 2: Setup Backend

### Windows:
```cmd
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

### Mac/Linux:
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Step 3: Add Your API Keys

1. Open the `backend/.env` file
2. Replace `your_groq_api_key_here` with your actual Groq API key
3. Replace `your_openai_api_key_here` with your OpenAI key (optional)

Example:
```env
GROQ_API_KEY=gsk_abc123xyz789...
OPENAI_API_KEY=sk-abc123xyz789...
```

## Step 4: Run the Server

```bash
python main.py
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

## Step 5: Test the API

Open your browser and go to:
- http://localhost:8000 (should show welcome message)
- http://localhost:8000/docs (interactive API documentation)

## 🔧 Troubleshooting

### "ModuleNotFoundError"
```bash
pip install -r requirements.txt
```

### "No API keys configured"
- Check your `.env` file has the correct API keys
- Make sure there are no spaces around the `=` sign

### "Port already in use"
Change the port in `.env`:
```env
PORT=8001
```

### "CORS errors"
The backend is already configured for React Native. If you have issues, check the `ALLOWED_ORIGINS` in `.env`.

## 📱 Connect to React Native

In your React Native app, use this base URL:
- **Local development**: `http://localhost:8000`
- **Android emulator**: `http://10.0.2.2:8000`
- **iOS simulator**: `http://localhost:8000`

Example API call:
```javascript
const response = await fetch('http://localhost:8000/api/chat/simple', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    user_question: 'Hello, how are you?'
  }),
});
```

## 🎉 You're Ready!

Your backend should now be running and ready to handle:
- PDF uploads
- AI chat conversations
- File management

Need help? Check the logs in your terminal for error messages!