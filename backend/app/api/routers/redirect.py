from fastapi import APIRouter, Header, BackgroundTasks, HTTPException, Response
from fastapi.responses import RedirectResponse
from typing import Optional
from app.core.database import qr_collection
from app.services import analytics_service
from app.core.config import settings

router = APIRouter()

@router.get("/{qr_id}")
async def redirect_qr(
    qr_id: str, 
    background_tasks: BackgroundTasks, 
    user_agent: Optional[str] = Header(None)
):
    """Handle the proxy redirection logic, logging analytics and returning target content."""
    qr = await qr_collection.find_one({"_id": qr_id})
    if not qr:
        raise HTTPException(status_code=404, detail="QR Code not found")
    
    if not qr.get("is_active"):
        raise HTTPException(status_code=403, detail="QR Code is inactive")
    
    # Async Logging
    background_tasks.add_task(analytics_service.log_click, qr_id, user_agent, qr.get("source", "General"))
    
    if qr.get("qr_type") == "vcard" and qr.get("vcard_data"):
        v = qr["vcard_data"]
        vcard_lines = [
            "BEGIN:VCARD",
            "VERSION:3.0",
            f"N:{v.get('last_name') or ''};{v.get('first_name') or ''};;;",
            f"FN:{v.get('first_name') or ''} {v.get('last_name') or ''}".strip(),
            f"ORG:{v.get('organization') or ''}",
            f"TITLE:{v.get('job_title') or ''}",
            f"TEL;TYPE=WORK,VOICE:{v.get('phone') or ''}",
            f"EMAIL;TYPE=PREF,INTERNET:{v.get('email') or ''}"
        ]
        
        # Add main website if present (backward compatibility)
        if v.get('website'):
            vcard_lines.append(f"URL:{v.get('website')}")
            
        # Add additional websites
        websites = v.get('websites') or []
        for site in websites:
            url = site.get('url')
            label = site.get('label')
            if url:
                if label:
                    vcard_lines.append(f"URL;type={label}:{url}")
                else:
                    vcard_lines.append(f"URL:{url}")

        vcard_lines.append("END:VCARD")
        vcard_content = "\n".join(vcard_lines)
        return Response(
            content=vcard_content, 
            media_type="text/vcard", 
            headers={"Content-Disposition": f'attachment; filename="{v.get("first_name", "contact")}.vcf"'}
        )

    target_url = qr["target_url"]
    
    # Replace backend URL with frontend URL if applicable
    if target_url.startswith(settings.PROXY_BASE_URL):
        target_url = target_url.replace(settings.PROXY_BASE_URL, f"{settings.FRONTEND_URL}/")
        
    return RedirectResponse(url=target_url)
