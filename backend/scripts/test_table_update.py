import requests
import json
import time

BASE_URL = "http://localhost:8001/api"

def test_add_update():
    # 1. Login
    print("Logging in...")
    res = requests.post(f"{BASE_URL}/token", data={"username": "admin", "password": "password"})
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Get current Analytics
    print("Fetching initial Analytics...")
    res = requests.get(f"{BASE_URL}/analytics/overview", headers=headers)
    initial_data = res.json()
    print(f"Initial Total QRs: {initial_data.get('total_qrs')}")
    print(f"Initial Table Count: {len(initial_data.get('top_qrs'))}")

    # 3. Add New QR
    print("Adding new QR code...")
    new_qr = {
        "target_url": "https://test-auto-update.com",
        "is_active": True,
        "category": "Test"
    }
    res = requests.post(f"{BASE_URL}/qr", json=new_qr, headers=headers)
    print(f"Add status: {res.status_code}")
    
    # 4. Wait for polling/update (simulate user wait)
    print("Waiting 2 seconds...")
    time.sleep(2)

    # 5. Get Analytics again
    print("Fetching updated Analytics...")
    res = requests.get(f"{BASE_URL}/analytics/overview", headers=headers)
    updated_data = res.json()
    print(f"Updated Total QRs: {updated_data.get('total_qrs')}")
    print(f"Updated Table Count: {len(updated_data.get('top_qrs'))}")
    
    # Check if new QR is in table
    found = False
    for qr in updated_data.get('top_qrs'):
        if qr['target_url'] == "https://test-auto-update.com":
            found = True
            break
    
    print(f"New QR found in table? {found}")

if __name__ == "__main__":
    test_add_update()
