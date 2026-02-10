import requests
import json

# Test the refine endpoint
url = "http://localhost:8000/portfolio/aakash-singh-7dc735/refine"
payload = {
    "instruction": "make it more concise",
    "sections": ["all"]
}

response = requests.post(url, json=payload)
print(f"Status Code: {response.status_code}")
print(f"Response: {response.text}")
