import requests
import json

BASE_URL = "http://localhost:8001/api"

def test_analytics():
    print("Testing Analytics API...")
    
    # 1. Login
    print("\n1. Logging in...")
    try:
        res = requests.post(f"{BASE_URL}/token", data={"username": "admin", "password": "password"})
        if res.status_code != 200:
            print(f"Login failed: {res.text}")
            return
        token = res.json()["accessToken"]
        print("Login successful.")
    except Exception as e:
        print(f"Connection failed: {e}")
        return

    headers = {"Authorization": f"Bearer {token}"}

    # 2. Get Analytics Overview
    print("\n2. Fetching Analytics Overview...")
    try:
        res = requests.get(f"{BASE_URL}/analytics/overview", headers=headers)
        if res.status_code != 200:
            print(f"Analytics request failed: {res.text}")
            return
        
        data = res.json()
        print(json.dumps(data, indent=2))
        
        # Validation
        val_errors = []
        if "totalQrs" not in data: val_errors.append("Missing totalQrs")
        if "activeLinks" not in data: val_errors.append("Missing activeLinks")
        
        if val_errors:
            print(f"Validation FAILED: {val_errors}")
        else:
            print(f"Validation PASSED. Total QRs: {data['totalQrs']}, Active: {data['activeLinks']}")
            
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    test_analytics()
