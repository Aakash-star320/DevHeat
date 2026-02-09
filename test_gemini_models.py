
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)

models_to_test = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-flash-latest"]

for model_name in models_to_test:
    print(f"\n--- Testing model: {model_name} ---")
    try:
        model = genai.GenerativeModel(model_name)
        response = model.generate_content("Hello, reply with 'OK' if you see this.")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error for {model_name}: {e}")
