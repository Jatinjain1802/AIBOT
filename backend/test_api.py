#!/usr/bin/env python3
"""
Quick test script to verify your backend is working properly.
Run this after setting up your API keys.
"""

import requests
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

BASE_URL = "http://localhost:8000"

def test_health():
    """Test if the server is running"""
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            print("✅ Server is running!")
            return True
        else:
            print(f"❌ Server health check failed: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to server. Make sure it's running on port 8000")
        return False

def test_simple_chat():
    """Test the simple chat endpoint"""
    try:
        response = requests.post(
            f"{BASE_URL}/api/chat/simple",
            json={"user_question": "Hello, can you help me?"},
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Chat API is working!")
            print(f"AI Response: {data.get('response', 'No response')}")
            print(f"Model Used: {data.get('model_used', 'Unknown')}")
            return True
        else:
            print(f"❌ Chat API failed: {response.status_code}")
            print(f"Error: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Chat test failed: {str(e)}")
        return False

def test_api_keys():
    """Check if API keys are configured"""
    groq_key = os.getenv("GROQ_API_KEY")
    openai_key = os.getenv("OPENAI_API_KEY")
    
    if groq_key and groq_key != "your_groq_api_key_here":
        print("✅ Groq API key is configured")
    else:
        print("❌ Groq API key is missing or not configured")
        print("   Please add your Groq API key to the .env file")
    
    if openai_key and openai_key != "your_openai_api_key_here":
        print("✅ OpenAI API key is configured")
    else:
        print("⚠️  OpenAI API key is not configured (optional fallback)")

def main():
    print("🧪 Testing AIBOT Backend...")
    print("=" * 50)
    
    # Test API keys
    print("\n1. Checking API Keys:")
    test_api_keys()
    
    # Test server health
    print("\n2. Testing Server Health:")
    if not test_health():
        print("\n❌ Server is not running. Please start it with: python main.py")
        return
    
    # Test chat functionality
    print("\n3. Testing Chat API:")
    test_simple_chat()
    
    print("\n" + "=" * 50)
    print("🎉 Backend testing complete!")
    print("\nIf all tests passed, your backend is ready to use with your React Native app!")

if __name__ == "__main__":
    main()