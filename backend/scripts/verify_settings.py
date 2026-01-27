import requests

BASE_URL = "http://localhost:8001/api"

def run_verification():
    print("--- Verifying Password Update ---")
    
    # 1. Login with default password
    token = login("admin", "password")
    if not token:
        print("[FAIL] Initial login failed")
        return
    print("[PASS] Initial login successful")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # 2. Update Password to "newpassword"
    try:
        resp = requests.put(
            f"{BASE_URL}/users/me/password",
            json={"current_password": "password", "new_password": "newpassword"},
            headers=headers
        )
        resp.raise_for_status()
        print("[PASS] Password update request successful")
    except Exception as e:
        print(f"[FAIL] Password update failed: {e}")
        return

    # 3. Verify Login with "newpassword"
    new_token = login("admin", "newpassword")
    if new_token:
        print("[PASS] Login with new password successful")
    else:
        print("[FAIL] Login with new password failed")
        
    # 4. Revert Password to "password"
    try:
        # Need to use new_token
        revert_headers = {"Authorization": f"Bearer {new_token}"}
        resp = requests.put(
            f"{BASE_URL}/users/me/password",
            json={"current_password": "newpassword", "new_password": "password"},
            headers=revert_headers
        )
        resp.raise_for_status()
        print("[PASS] Password reverted successfully")
    except Exception as e:
        print(f"[FAIL] Password revert failed: {e}")

    # 5. Verify Login with "password"
    final_token = login("admin", "password")
    if final_token:
        print("[PASS] Final login verification successful")
    else:
        print("[FAIL] Final login verification failed")

def login(username, password):
    try:
        resp = requests.post(f"{BASE_URL}/token", data={"username": username, "password": password})
        if resp.status_code == 200:
            return resp.json()["access_token"]
        return None
    except:
        return None

if __name__ == "__main__":
    run_verification()
