import sys
import os
sys.path.append(os.path.join(os.getcwd(), 'backend'))
from app.schemas.qr_code import QRCodeCreate
from pydantic import ValidationError

def test_validation():
    print("--- Testing Pydantic Validation ---")
    
    # Payload simulating Frontend "formData" (camelCase)
    payload = {
        "name": "Test QR",
        "targetUrl": "https://google.com",
        "isActive": True,
        "source": "General",
        "qrType": "url",
        "vcardData": {},  # THIS IS THE SUSPECTED ISSUE
        "logoImage": ""
    }
    
    print(f"Input Payload: {payload}")
    
    try:
        # Pydantic should map aliases (targetUrl -> target_url) if configured correctly
        qr = QRCodeCreate(**payload)
        print("\nSUCCESS! Parsed Model:")
        print(qr.model_dump())
        print(f"target_url value: {qr.target_url}")
        
    except ValidationError as e:
        print("\nVALIDATION FAILED:")
        print(e)
    except Exception as e:
        print(f"\nUNEXPECTED ERROR: {e}")

if __name__ == "__main__":
    test_validation()
