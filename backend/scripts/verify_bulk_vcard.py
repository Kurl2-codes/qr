import requests
import json
import os

BASE_URL = "http://localhost:8001/api"
CSV_PATH = "../dummy_qr_contacts.csv"

def test_bulk_vcard():
    print("Testing Bulk vCard API...")
    
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

    # 2. Upload CSV
    print(f"\n2. Uploading CSV from {CSV_PATH}...")
    if not os.path.exists(CSV_PATH):
        # Try from current directory
        CSV_PATH_ALT = "dummy_qr_contacts.csv"
        if os.path.exists(CSV_PATH_ALT):
            csv_file_path = CSV_PATH_ALT
        else:
            print(f"Error: CSV file not found at {CSV_PATH} or {CSV_PATH_ALT}")
            return
    else:
        csv_file_path = CSV_PATH

    try:
        with open(csv_file_path, "rb") as f:
            files = {"file": (os.path.basename(csv_file_path), f, "text/csv")}
            res = requests.post(f"{BASE_URL}/qr/bulk-vcard", headers=headers, files=files)
            
        print(f"Response Status Code: {res.status_code}")
        if res.status_code != 200:
            print(f"Bulk Import failed: {res.text}")
            return
            
        data = res.json()
        print("Bulk Import Response:")
        print(json.dumps(data, indent=2))
        
        if data.get("success"):
            print(f"\nSUCCESS: Bulk imported {data.get('count')} records.")
        else:
            print(f"\nFAILED: {data.get('message')}")
            
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    test_bulk_vcard()
