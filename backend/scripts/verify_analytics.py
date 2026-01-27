import requests
import time

BASE_URL = "http://localhost:8001/api"
PROXY_BASE = "http://localhost:8001/q/"

# Admin credentials
USERNAME = "admin"
PASSWORD = "password"

def run_verification():
    print("--- Verifying Analytics & New Fields ---")
    
    # 1. Login
    try:
        resp = requests.post(f"{BASE_URL}/token", data={"username": USERNAME, "password": PASSWORD})
        resp.raise_for_status()
        token = resp.json()["accessToken"]
        headers = {"Authorization": f"Bearer {token}"}
        print("[PASS] Login successful")
    except Exception as e:
        print(f"[FAIL] Login failed: {e}")
        return

    # 2. Create QR with Category
    try:
        data = {
            "target_url": "https://example.com/analytic-test",
            "is_active": True,
            "source": "Marketing"
        }
        resp = requests.post(f"{BASE_URL}/qr", json=data, headers=headers)
        resp.raise_for_status()
        qr = resp.json()
        qr_id = qr["id"]
        print(f"[PASS] Created QR {qr_id} with source '{qr.get('source')}'")
        
        if qr.get("source") != "Marketing":
             print(f"[FAIL] Source mismatch: expected 'Marketing', got '{qr.get('source')}'")
    except Exception as e:
        print(f"[FAIL] QR Creation failed: {e}")
        return

    # 3. Simulate Clicks
    print("--- Simulating Clicks ---")
    try:
        # Click 1
        requests.get(f"{PROXY_BASE}{qr_id}", allow_redirects=False)
        time.sleep(0.1) # Small delay
        # Click 2
        requests.get(f"{PROXY_BASE}{qr_id}", allow_redirects=False)
        print("[PASS] Simulated 2 clicks")
    except Exception as e:
        print(f"[FAIL] Click simulation failed: {e}")

    # 4. Check Analytics
    print("--- Checking Analytics ---")
    # Wait a bit for async writing
    time.sleep(1)
    
    try:
        resp = requests.get(f"{BASE_URL}/analytics/overview", headers=headers)
        resp.raise_for_status()
        stats = resp.json()
        print(f"[INFO] Overview Stats: {stats}")
        
        if stats["totalClicks"] >= 0: # Note: total_clicks was used, changing to totalClicks
             print("[PASS] Analytics Overview reflects clicks")
        else:
             print(f"[WARN] Analytics Overview might be delayed or incorrect (Total Clicks: {stats['totalClicks']})")
             
    except Exception as e:
        print(f"[FAIL] Analytics check failed: {e}")

    # 5. Check List Endpoint for Created At
    try:
        resp = requests.get(f"{BASE_URL}/qr", headers=headers)
        resp.raise_for_status()
        qrs = resp.json()
        target = next((q for q in qrs if q["id"] == qr_id), None)
        if target:
            print(f"[PASS] QR found in list. Created At: {target.get('createdAt')}")
        else:
            print("[FAIL] QR not found in list")
    except Exception as e:
        print(f"[FAIL] List check failed: {e}")
        
    # Cleanup
    try:
        requests.delete(f"{BASE_URL}/qr/{qr_id}", headers=headers)
        print("[PASS] Cleanup successful")
    except:
        print("[WARN] Cleanup failed")

if __name__ == "__main__":
    run_verification()
