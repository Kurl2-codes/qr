import requests
import json
import time

BASE_URL = "http://localhost:8001"
API_URL = f"{BASE_URL}/api"
PROXY_URL = f"{BASE_URL}/q/"

def test_full_flow():
    print("Testing Full System Flow...")
    session = requests.Session()

    # 1. Login
    print("\n1. Logging in...")
    login_data = {"username": "admin", "password": "password"}
    res = session.post(f"{API_URL}/token", data=login_data)
    if res.status_code != 200:
        print(f"Login failed: {res.text}")
        return
    token = res.json()["accessToken"]
    print("Login successful. Token received.")
    
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Create QR
    print("\n2. Creating QR...")
    payload = {"target_url": "https://example.com", "is_active": True}
    res = requests.post(f"{API_URL}/qr", json=payload, headers=headers)
    if res.status_code != 200:
        print(f"Create failed: {res.text}")
        return
    qr = res.json()
    qr_id = qr["id"]
    proxy_url = qr["proxyUrl"]
    print(f"Created QR: ID={qr_id}, Proxy={proxy_url}, Clicks={qr['clicks']}")

    # 3. Test Redirect & Logging
    print("\n3. Testing Redirect & Click Logging...")
    # Simulate a click (redirect)
    # Note: Requests follows redirects by default, so we check history
    res = requests.get(f"{BASE_URL}/q/{qr_id}")
    print(f"Redirect status: {res.status_code} (Final URL: {res.url})")
    
    # Check clicks count via API
    res = requests.get(f"{API_URL}/qr", headers=headers)
    qrs = res.json()
    my_qr = next((q for q in qrs if q["id"] == qr_id), None)
    if my_qr:
        print(f"Updated Clicks: {my_qr['clicks']}")
        if my_qr['clicks'] > 0:
            print("SUCCESS: Clicks incremented.")
        else:
            print("FAILURE: Clicks did not increment.")
    else:
        print("FAILURE: Could not find QR in list.")

    # 4. Delete QR
    print(f"\n4. Deleting QR {qr_id}...")
    res = requests.delete(f"{API_URL}/qr/{qr_id}", headers=headers)
    print(f"Delete status: {res.status_code}")

if __name__ == "__main__":
    test_full_flow()
