from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from pydantic import BaseModel
from typing import List, Optional
import uuid
import datetime
import re
from app.auth import AuthorizedUser
import httpx
import databutton as db
import mimetypes

router = APIRouter(prefix="/documents")

def sanitize_storage_key(key: str) -> str:
    """Sanitize storage key to only allow alphanumeric and ._- symbols"""
    # Remove slashes first
    key = key.replace("/", "")
    # Then filter other characters
    return re.sub(r'[^a-zA-Z0-9._-]', '', key)

# Models
class FileMetadata(BaseModel):
    name: str
    size: int
    type: str
    url: str
    path: str

class DocumentUploadRequest(BaseModel):
    file: FileMetadata
    category: Optional[str] = None

class DocumentResponse(BaseModel):
    id: str
    filename: str
    content_type: str
    size: int
    upload_date: str
    user_id: str
    category: Optional[str] = None
    indexed: Optional[bool] = None
    chunk_count: Optional[int] = None
    
    class Config:
        # Ensure dict representation doesn't filter out False values
        json_encoders = {
            bool: lambda v: v
        }
        # Ensure the indexed field is explicitly included in response
        # even when it's False or None
        schema_extra = {
            "example": {
                "indexed": False
            }
        }

class DocumentsListResponse(BaseModel):
    documents: List[DocumentResponse]

class UpdateDocumentRequest(BaseModel):
    category: Optional[str] = None

# Endpoints
@router.post("", response_model=DocumentResponse)
async def upload_document(
    user: AuthorizedUser, 
    file: UploadFile = File(...),
    category: Optional[str] = Form(None)
):
    """Upload a document with its content and metadata"""
    # Check if the file extension is allowed
    file_name = file.filename
    file_parts = file_name.split('.')
    file_ext = file_parts[-1].lower() if len(file_parts) > 1 else ""
    
    allowed_extensions = ["pdf", "doc", "docx", "txt", "md"]
    if file_ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail=f"File extension .{file_ext} not allowed. Allowed extensions: {', '.join(['.' + ext for ext in allowed_extensions])}")
    
    # Generate unique ID for the document
    doc_id = str(uuid.uuid4())
    
    # Read the file content
    file_content = await file.read()
    
    # Determine content type
    content_type = file.content_type
    if not content_type:
        content_type = mimetypes.guess_type(file_name)[0] or "application/octet-stream"
    
    # Store file in binary storage
    file_key = sanitize_storage_key(f"documents/{user.sub}/{doc_id}")
    db.storage.binary.put(file_key, file_content)
    
    # Store metadata in JSON storage
    now = datetime.datetime.now().isoformat()
    metadata = {
        "id": doc_id,
        "filename": file_name,
        "content_type": content_type,
        "size": len(file_content),
        "upload_date": now,
        "user_id": user.sub,
        "category": category,
        "indexed": False
    }
    
    # Get existing metadata or create new list
    meta_key = sanitize_storage_key(f"documents_meta/{user.sub}")
    try:
        all_docs = db.storage.json.get(meta_key)
    except FileNotFoundError:
        all_docs = {"documents": []}
    
    # Add new document metadata
    all_docs["documents"].append(metadata)
    db.storage.json.put(meta_key, all_docs)
    
    # Directly index the document without making HTTP requests
    try:
        # Import the indexing function to call directly
        from app.apis.embeddings import index_document as index_doc_func
        
        # Start the background task to index the document
        async def background_index():
            try:
                # Call the indexing function directly using the user dependency
                result = await index_doc_func(document_id=doc_id, user=user)
                print(f"Document {doc_id} indexed successfully")
            except Exception as e:
                print(f"Error in background indexing for document {doc_id}: {str(e)}")
                # Update document metadata to show indexing failed
                try:
                    meta_key = sanitize_storage_key(f"documents_meta/{user.sub}")
                    doc_meta = db.storage.json.get(meta_key)
                    for i, doc in enumerate(doc_meta["documents"]):
                        if doc["id"] == doc_id:
                            doc_meta["documents"][i]["indexed"] = None
                            db.storage.json.put(meta_key, doc_meta)
                            break
                except Exception as update_err:
                    print(f"Failed to update document metadata: {str(update_err)}")
        
        # Start the background task without awaiting it
        import asyncio
        asyncio.create_task(background_index())
    except Exception as e:
        print(f"Failed to trigger document indexing: {str(e)}")
    
    return DocumentResponse(**metadata)

@router.get("", response_model=DocumentsListResponse)
async def list_documents(user: AuthorizedUser, category: Optional[str] = None):
    """List all documents uploaded by the user"""
    meta_key = sanitize_storage_key(f"documents_meta/{user.sub}")
    
    try:
        all_docs = db.storage.json.get(meta_key)
        
        # Debug log metadata
        if all_docs and "documents" in all_docs and len(all_docs["documents"]) > 0:
            print(f"[DEBUG] Document list - found {len(all_docs['documents'])} documents")
            for i, doc in enumerate(all_docs["documents"]):
                indexed_value = doc.get("indexed", "NOT PRESENT")
                indexed_type = type(indexed_value).__name__ if indexed_value != "NOT PRESENT" else "N/A"
                print(f"[DEBUG] Document {i}: id={doc.get('id')}, indexed={indexed_value} (type: {indexed_type})")
    except FileNotFoundError:
        return DocumentsListResponse(documents=[])
    
    # Filter by category if specified
    if category:
        filtered_docs = [doc for doc in all_docs["documents"] if doc.get("category") == category]
        return DocumentsListResponse(documents=filtered_docs)
    
    return DocumentsListResponse(documents=all_docs["documents"])

@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(document_id: str, user: AuthorizedUser):
    """Get a specific document's metadata"""
    meta_key = sanitize_storage_key(f"documents_meta/{user.sub}")
    
    try:
        all_docs = db.storage.json.get(meta_key)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Find the document
    for doc in all_docs["documents"]:
        if doc["id"] == document_id:
            return DocumentResponse(**doc)
    
    raise HTTPException(status_code=404, detail="Document not found")

@router.get("/{document_id}/content")
async def get_document_content(document_id: str, user: AuthorizedUser):
    """Get a specific document's content"""
    meta_key = sanitize_storage_key(f"documents_meta/{user.sub}")
    
    try:
        all_docs = db.storage.json.get(meta_key)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Find the document
    doc_meta = None
    for doc in all_docs["documents"]:
        if doc["id"] == document_id:
            doc_meta = doc
            break
    
    if not doc_meta:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Get document content
    file_key = sanitize_storage_key(f"documents/{user.sub}/{document_id}")
    try:
        content = db.storage.binary.get(file_key)
        from fastapi.responses import Response
        return Response(
            content=content,
            media_type=doc_meta["content_type"],
            headers={
                "Content-Disposition": f"attachment; filename=\"{doc_meta['filename']}\""
            }
        )
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Document content not found")

@router.put("/{document_id}", response_model=DocumentResponse)
async def update_document(document_id: str, data: UpdateDocumentRequest, user: AuthorizedUser):
    """Update a document's metadata"""
    meta_key = sanitize_storage_key(f"documents_meta/{user.sub}")
    
    try:
        all_docs = db.storage.json.get(meta_key)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Find and update the document
    for i, doc in enumerate(all_docs["documents"]):
        if doc["id"] == document_id:
            # Update fields
            if data.category is not None:
                all_docs["documents"][i]["category"] = data.category
            
            # Save updated metadata
            db.storage.json.put(meta_key, all_docs)
            return DocumentResponse(**all_docs["documents"][i])
    
    raise HTTPException(status_code=404, detail="Document not found")

@router.delete("/{document_id}", status_code=204)
async def delete_document(document_id: str, user: AuthorizedUser):
    """Delete a document and its content"""
    meta_key = sanitize_storage_key(f"documents_meta/{user.sub}")
    
    try:
        all_docs = db.storage.json.get(meta_key)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Find the document
    doc_to_delete = None
    for i, doc in enumerate(all_docs["documents"]):
        if doc["id"] == document_id:
            doc_to_delete = doc
            all_docs["documents"].pop(i)
            break
    
    if not doc_to_delete:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Delete file content
    file_key = sanitize_storage_key(f"documents/{user.sub}/{document_id}")
    try:
        # Since db.storage.binary doesn't have a direct delete method,
        # we just overwrite with empty bytes
        db.storage.binary.put(file_key, b"")
    except Exception as e:
        # Log but continue since we still want to delete the metadata
        print(f"Error deleting document content: {e}")
    
    # Update metadata
    db.storage.json.put(meta_key, all_docs)
    
    return None

@router.get("/categories/list", response_model=List[str])
async def list_categories(user: AuthorizedUser):
    """List all categories used by the user"""
    meta_key = sanitize_storage_key(f"documents_meta/{user.sub}")
    
    try:
        all_docs = db.storage.json.get(meta_key)
    except FileNotFoundError:
        return []
    
    # Extract unique categories
    categories = set()
    for doc in all_docs["documents"]:
        if doc.get("category"):
            categories.add(doc["category"])
    
    return list(categories)
