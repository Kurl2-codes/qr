import requests
import json
import time

BASE_URL = "http://localhost:8001/api"
PROXY_BASE = "http://localhost:8001/q"

def generate_data():
    # 1. Login
    print("Logging in...")
    try:
        res = requests.post(f"{BASE_URL}/token", data={"username": "admin", "password": "password"})
        token = res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
    except Exception as e:
        print(f"Login failed: {e}")
        return

    # 2. Add New QR for testing
    print("Adding new QR code...")
    new_qr = {
        "target_url": "https://example.com/ua-test",
        "is_active": True,
        "category": "UA Test"
    }
    res = requests.post(f"{BASE_URL}/qr", json=new_qr, headers=headers)
    qr_id = res.json().get("_id") or res.json().get("id")
    proxy_url = f"{PROXY_BASE}/{qr_id}"
    print(f"Created QR: {proxy_url}")
    
    # 3. Click with different UAs
    uas = [
        "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)",
        "Mozilla/5.0 (Linux; Android 10; SM-A205U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.88 Mobile Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.51 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.3 Safari/605.1.15",
        "PostmanRuntime/7.29.0"
    ]
    
    print("Simulating clicks...")
    for ua in uas:
        print(f"Clicking with UA: {ua[:30]}...")
        requests.get(proxy_url, headers={"User-Agent": ua})
        time.sleep(0.5)

    print("Done. Check Analytics.")

if __name__ == "__main__":
    generate_data()
