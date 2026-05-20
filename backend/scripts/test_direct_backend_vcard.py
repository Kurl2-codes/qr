import requests
import json
import os
import sys

# Configure UTF-8 encoding for Windows console to handle emojis/special chars
try:
    sys.stdout.reconfigure(encoding='utf-8')
except AttributeError:
    pass

BASE_URL = "http://localhost:8001/api"
BACKEND_REDIRECT_BASE = "http://localhost:8001/q"

def test_direct_backend_redirection():
    print("======================================================================")
    print("   TESTING DIRECT BACKEND SCAN REDIRECTION (BYPASSING FRONTEND)       ")
    print("======================================================================\n")

    # 1. Login to get access token
    print("Step 1: Logging in...")
    try:
        res = requests.post(f"{BASE_URL}/token", data={"username": "admin", "password": "password"})
        if res.status_code != 200:
            print(f"[ERROR] Login failed: {res.text}")
            return
        token = res.json()["accessToken"]
        print("[OK] Login successful.\n")
    except Exception as e:
        print(f"[ERROR] Connection to backend failed: {e}")
        print("Make sure your backend is running at http://localhost:8001")
        return

    headers = {"Authorization": f"Bearer {token}"}

    # 2. Fetch existing campaigns
    print("Step 2: Fetching QR Code campaigns...")
    try:
        res = requests.get(f"{BASE_URL}/qr/", headers=headers)
        if res.status_code != 200:
            print(f"[ERROR] Failed to fetch campaigns: {res.text}")
            return
        
        qrs = res.json()
        vcard_qrs = [qr for qr in qrs if qr.get("qrType") == "vcard"]
        
        if not vcard_qrs:
            print("[ERROR] No vCard campaigns found in the database.")
            print("Please import your CSV or generate a vCard campaign first via the dashboard.")
            return
            
        # Select the first vCard campaign
        target_qr = vcard_qrs[0]
        qr_id = target_qr["id"]
        contact_name = f"{target_qr['vcardData'].get('firstName', '')} {target_qr['vcardData'].get('lastName', '')}".strip()
        print(f"[OK] Found vCard campaign: '{target_qr['name']}' for contact '{contact_name}' (ID: {qr_id})\n")
        
    except Exception as e:
        print(f"[ERROR] Failed to query database/API: {e}")
        return

    # 3. Simulate direct backend scan request
    direct_backend_url = f"{BACKEND_REDIRECT_BASE}/{qr_id}"
    print(f"Step 3: Simulating scan directly pointing to backend...")
    print(f"-> Direct URL: {direct_backend_url}")
    
    try:
        # Fetching directly from the backend redirect route (no API token needed, public scan!)
        res = requests.get(direct_backend_url)
        print(f"Status Code: {res.status_code}")
        print(f"Content Type: {res.headers.get('Content-Type')}")
        
        if res.status_code == 200 and "text/vcard" in res.headers.get("Content-Type", ""):
            print("[SUCCESS] Backend directly returned the VCF payload!")
            
            # Save downloaded contact card locally
            vcf_filename = f"downloaded_{qr_id}.vcf"
            with open(vcf_filename, "w", encoding="utf-8") as f:
                f.write(res.text)
            print(f"[SAVED] Saved contact file to: {os.path.abspath(vcf_filename)}")
            
            # Print a snippet of the vCard data
            print("\nvCard Payload Snippet:")
            print("----------------------------------------")
            lines = res.text.split("\n")
            for line in lines[:8]:
                print(f"  {line.strip()}")
            print("  ...")
            print("----------------------------------------\n")
        else:
            print(f"[ERROR] Redirection failed. Status: {res.status_code}, Response: {res.text}")
            return
            
    except Exception as e:
        print(f"[ERROR] Redirect request failed: {e}")
        return

    # 4. Generate a scannable QR Code image pointing directly to the backend
    print("Step 4: Generating scannable QR Code image pointing straight to backend...")
    qr_image_filename = "direct_backend_qr.png"
    # Using public QR server API to generate a high quality QR code without local dependencies
    api_url = f"https://api.qrserver.com/v1/create-qr-code/?size=300x300&data={direct_backend_url}"
    
    try:
        img_res = requests.get(api_url)
        if img_res.status_code == 200:
            with open(qr_image_filename, "wb") as f:
                f.write(img_res.content)
            print(f"[SUCCESS] Scannable QR Code image created!")
            print(f"[SAVED] Saved to: {os.path.abspath(qr_image_filename)}")
            print("\n======================================================================")
            print("   HOW TO TEST SCANNING DIRECTLY:")
            print("======================================================================")
            print(f"1. Open the image file 'direct_backend_qr.png' in your project root.")
            print("2. Scan it with your phone camera.")
            print("3. Your phone will directly prompt you to download/add the contact card!")
            print("   (It bypasses the localhost:5173 frontend landing page completely!)")
            print("======================================================================\n")
        else:
            print("[ERROR] Failed to generate QR Code image using online API.")
    except Exception as e:
        print(f"[ERROR] QR generation failed: {e}")

if __name__ == "__main__":
    test_direct_backend_redirection()
