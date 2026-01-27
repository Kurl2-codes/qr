import time
import requests

PROXO_URL = "http://localhost:8001/q/3328f545"

print("Waiting 10 seconds...")
time.sleep(10)
print(f"Clicking {PROXO_URL}...")
try:
    res = requests.get(PROXO_URL)
    print(f"Status: {res.status_code}")
except Exception as e:
    print(f"Error: {e}")
