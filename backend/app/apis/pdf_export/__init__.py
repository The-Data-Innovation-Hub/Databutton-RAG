from fastapi import APIRouter, HTTPException, Response
from pydantic import BaseModel
from typing import List, Optional
import databutton as db
from datetime import datetime
import io
from weasyprint import HTML
from app.auth import AuthorizedUser

router = APIRouter()

class ChatMessage(BaseModel):
    role: str
    content: str
    sources: Optional[list] = None

class PDFExportRequest(BaseModel):
    conversation: List[ChatMessage]
    title: Optional[str] = "MediVault AI Consultation"
    include_timestamp: Optional[bool] = True

@router.post("/export-pdf")
async def export_conversation_as_pdf(request: PDFExportRequest, user: AuthorizedUser):
    try:
        # Generate timestamp if requested
        timestamp = ""
        if request.include_timestamp:
            timestamp = f"Generated on {datetime.now().strftime('%B %d, %Y at %H:%M')} UTC"

        # Create HTML content
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>{request.title}</title>
            <style>
                body {{ 
                    font-family: Arial, sans-serif; 
                    margin: 30px; 
                    color: #333;
                    line-height: 1.6;
                }}
                .header {{ 
                    background-color: #f5f9ff; 
                    padding: 15px; 
                    border-left: 4px solid #4285f4; 
                    margin-bottom: 20px; 
                }}
                .header h1 {{ 
                    margin: 0; 
                    color: #4285f4; 
                    font-size: 24px;
                }}
                .timestamp {{ 
                    color: #666; 
                    font-size: 14px;
                    margin-top: 5px;
                }}
                .chat-container {{ 
                    max-width: 800px; 
                    margin: 0 auto; 
                }}
                .message {{ 
                    margin-bottom: 20px; 
                    border-radius: 10px; 
                    padding: 15px; 
                }}
                .user {{ 
                    background-color: #E8F0FE; 
                    border-radius: 12px 12px 2px 12px;
                }}
                .assistant {{ 
                    background-color: #FFFFFF; 
                    border-left: 6px solid #0F9D58; 
                    border-radius: 12px 12px 12px 2px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                }}
                .role-label {{ 
                    font-weight: bold; 
                    text-transform: capitalize; 
                    margin-bottom: 8px; 
                    color: #555;
                }}
                .sources {{ 
                    margin-top: 20px; 
                    border-top: 1px solid #eee; 
                    padding-top: 15px;
                }}
                .sources h4 {{ 
                    margin-bottom: 10px; 
                }}
                .source-item {{ 
                    margin-bottom: 12px; 
                    border-left: 3px solid #ddd; 
                    padding-left: 10px;
                }}
                .source-title {{ 
                    font-weight: bold; 
                    margin-bottom: 5px;
                }}
                .source-excerpt {{ 
                    font-size: 14px; 
                    color: #555;
                }}
                .footer {{ 
                    margin-top: 40px; 
                    font-size: 12px; 
                    color: #777; 
                    text-align: center;
                    border-top: 1px solid #eee;
                    padding-top: 15px;
                }}
                .confidence-indicator {{
                    display: inline-block;
                    background-color: #0F9D58; /* Default to green */
                    color: white;
                    padding: 3px 8px;
                    border-radius: 12px;
                    font-size: 12px;
                    margin-bottom: 10px;
                }}
                /* Color based on confidence level */
                .confidence-high {{ background-color: #0F9D58; }}
                .confidence-moderate {{ background-color: #F4B400; }}
                .confidence-low, .confidence-insufficient {{ background-color: #DB4437; }}
            </style>
        </head>
        <body>
            <div class="chat-container">
                <div class="header">
                    <h1>{request.title}</h1>
                    {f'<div class="timestamp">{timestamp}</div>' if timestamp else ''}
                </div>
        """

        # Add each message
        for message in request.conversation:
            # Skip the welcome message
            if message.role == "assistant" and "Welcome to MediVault AI!" in message.content and len(request.conversation) > 1:
                continue
                
            # Determine confidence level for styling
            confidence_class = ""
            confidence_html = ""
            if message.role == "assistant":
                confidence_level = None
                if "[HIGH CONFIDENCE]" in message.content[:100]:
                    confidence_level = "HIGH CONFIDENCE"
                    confidence_class = "confidence-high"
                elif "[MODERATE CONFIDENCE]" in message.content[:100]:
                    confidence_level = "MODERATE CONFIDENCE"
                    confidence_class = "confidence-moderate"
                elif "[LOW CONFIDENCE]" in message.content[:100]:
                    confidence_level = "LOW CONFIDENCE"
                    confidence_class = "confidence-low"
                elif "[INSUFFICIENT DATA]" in message.content[:100]:
                    confidence_level = "INSUFFICIENT DATA"
                    confidence_class = "confidence-insufficient"
                
                if confidence_level:
                    confidence_html = f'<div class="confidence-indicator {confidence_class}">{confidence_level}</div>'
                    # Remove the confidence indicator from the content
                    message.content = message.content.replace(f"[{confidence_level}] ", "").strip()
            
            # Extract structured content if available
            content = message.content
            if message.role == "assistant" and "## Response:" in content:
                # Extract just the response section
                import re
                response_match = re.search(r'## Response:\s*([\s\S]*?)(?=## Ranking:|$)', content)
                if response_match and response_match.group(1):
                    content = response_match.group(1).strip()
            
            # Format content - replace newlines with <br> for HTML
            formatted_content = content.replace("\n\n", "<br><br>").replace("\n", "<br>")
            
            # Add the message to HTML
            html_content += f"""
                <div class="message {message.role}">
                    <div class="role-label">{message.role}:</div>
                    {confidence_html}
                    <div>{formatted_content}</div>
            """
            
            # Add sources for assistant messages if available
            if message.role == "assistant" and message.sources and len(message.sources) > 0:
                html_content += f"""
                    <div class="sources">
                        <h4>Sources ({len(message.sources)}):</h4>
                """
                
                for source in message.sources:
                    title = source.get('document_name') or source.get('url_title') or "Source"
                    excerpt = source.get('excerpt') or "No excerpt available"
                    source_type = source.get('source_type', 'document')
                    source_type_label = "Document" if source_type == "document" else "Website"
                    
                    html_content += f"""
                        <div class="source-item">
                            <div class="source-title">{title} ({source_type_label})</div>
                            <div class="source-excerpt">{excerpt}</div>
                        </div>
                    """
                    
                html_content += "</div>\n"
            
            html_content += "</div>\n"

        # Add footer
        html_content += f"""
                <div class="footer">
                    This document was generated from a conversation with MediVault AI.
                </div>
            </div>
        </body>
        </html>
        """

        # Generate PDF from HTML
        pdf_buffer = io.BytesIO()
        HTML(string=html_content).write_pdf(pdf_buffer)
        pdf_buffer.seek(0)

        # Return PDF as response with appropriate headers
        filename = f"MediVault_Consultation_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        return Response(
            content=pdf_buffer.getvalue(),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )

    except Exception as e:
        import traceback
        print(f"Error in PDF export: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}") from e
