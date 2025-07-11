from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from utils.pdf_utils import extract_pdf_text
import os

router = APIRouter()

# Maximum file size: 10MB
MAX_FILE_SIZE = 10 * 1024 * 1024

@router.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    """
    Upload a PDF file and extract its text content.
    
    Args:
        file: PDF file (max 10MB)
        
    Returns:
        JSON with extracted text or error message
    """
    try:
        # Validate file type
        if not file.content_type == "application/pdf":
            raise HTTPException(
                status_code=400, 
                detail="Invalid file type. Only PDF files are allowed."
            )
        
        # Read file content
        file_content = await file.read()
        
        # Check file size
        if len(file_content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413,
                detail=f"File too large. Maximum size allowed is {MAX_FILE_SIZE // (1024*1024)}MB."
            )
        
        # Extract text from PDF
        extracted_text = extract_pdf_text(file_content)
        
        if not extracted_text.strip():
            raise HTTPException(
                status_code=400,
                detail="No text could be extracted from the PDF. The file might be corrupted or contain only images."
            )
        
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "filename": file.filename,
                "file_size": len(file_content),
                "text_length": len(extracted_text),
                "extracted_text": extracted_text
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing PDF: {str(e)}"
        )