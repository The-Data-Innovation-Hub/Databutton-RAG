from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from typing import List, Optional
import databutton as db
import re
from app.auth import AuthorizedUser
from datetime import datetime

router = APIRouter()

class EmailRequest(BaseModel):
    recipient_email: EmailStr
    subject: str
    content: str
    include_timestamp: bool = True

class EmailResponse(BaseModel):
    success: bool
    message: str

@router.post("/send-chat-summary")
def send_chat_summary(request: EmailRequest, user: AuthorizedUser) -> EmailResponse:
    try:
        # Sanitize content (simple HTML sanitization)
        content = sanitize_html(request.content)
        
        # Add timestamp if requested
        if request.include_timestamp:
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            content += f"\n\n<p><em>Generated on {timestamp}</em></p>"
        
        # Add footer
        content += "\n\n<p><em>This email was sent from MediVault AI, a knowledge repository for healthcare professionals.</em></p>"
        
        # Send email
        db.notify.email(
            to=request.recipient_email,
            subject=request.subject,
            content_html=content,
            content_text=html_to_text(content)
        )
        
        return EmailResponse(
            success=True,
            message="Email sent successfully"
        )
    except Exception as e:
        print(f"Error sending email: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")

# Utility functions
def sanitize_html(content: str) -> str:
    """Simple sanitization to remove potentially harmful scripts"""
    # Remove script tags and their content
    content = re.sub(r'<script\b[^<]*(?:(?!</script>)<[^<]*)*</script>', '', content)
    # Remove onclick handlers and similar
    content = re.sub(r'\bon\w+\s*=\s*"[^"]*"', '', content)
    return content

def html_to_text(html: str) -> str:
    """Convert HTML to plain text (very basic)"""
    # Replace some common HTML elements with plain text equivalents
    text = html
    text = re.sub(r'<br\s*/?>', '\n', text)
    text = re.sub(r'<p\b[^>]*>', '\n\n', text)
    text = re.sub(r'</p>', '', text)
    text = re.sub(r'<h\d\b[^>]*>', '\n\n', text)
    text = re.sub(r'</h\d>', '\n', text)
    text = re.sub(r'<li\b[^>]*>', '\n * ', text)
    text = re.sub(r'</li>', '', text)
    text = re.sub(r'<ul\b[^>]*>', '\n', text)
    text = re.sub(r'</ul>', '\n', text)
    text = re.sub(r'<ol\b[^>]*>', '\n', text)
    text = re.sub(r'</ol>', '\n', text)
    
    # Remove all other HTML tags
    text = re.sub(r'<[^>]*>', '', text)
    
    # Handle special characters
    text = text.replace('&nbsp;', ' ')
    text = text.replace('&amp;', '&')
    text = text.replace('&lt;', '<')
    text = text.replace('&gt;', '>')
    text = text.replace('&quot;', '"')
    
    # Remove excessive newlines
    text = re.sub(r'\n\s*\n\s*\n', '\n\n', text)
    
    return text.strip()
