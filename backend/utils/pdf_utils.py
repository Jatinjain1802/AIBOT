import fitz  # PyMuPDF
import io
from typing import str

def extract_pdf_text(pdf_content: bytes) -> str:
    """
    Extract text from PDF file content using PyMuPDF.
    
    Args:
        pdf_content: PDF file content as bytes
        
    Returns:
        Extracted text as string
        
    Raises:
        Exception: If PDF processing fails
    """
    try:
        # Create a PDF document from bytes
        pdf_stream = io.BytesIO(pdf_content)
        pdf_document = fitz.open(stream=pdf_stream, filetype="pdf")
        
        extracted_text = ""
        
        # Extract text from each page
        for page_num in range(pdf_document.page_count):
            page = pdf_document[page_num]
            page_text = page.get_text()
            extracted_text += page_text + "\n"
        
        # Close the document
        pdf_document.close()
        
        # Clean up the text
        cleaned_text = clean_extracted_text(extracted_text)
        
        return cleaned_text
        
    except Exception as e:
        raise Exception(f"Failed to extract text from PDF: {str(e)}")

def clean_extracted_text(text: str) -> str:
    """
    Clean and normalize extracted text.
    
    Args:
        text: Raw extracted text
        
    Returns:
        Cleaned text
    """
    if not text:
        return ""
    
    # Remove excessive whitespace and normalize line breaks
    lines = text.split('\n')
    cleaned_lines = []
    
    for line in lines:
        line = line.strip()
        if line:  # Skip empty lines
            cleaned_lines.append(line)
    
    # Join lines with single spaces, but preserve paragraph breaks
    cleaned_text = ' '.join(cleaned_lines)
    
    # Remove excessive spaces
    while '  ' in cleaned_text:
        cleaned_text = cleaned_text.replace('  ', ' ')
    
    return cleaned_text.strip()

def validate_pdf_content(pdf_content: bytes) -> bool:
    """
    Validate if the content is a valid PDF.
    
    Args:
        pdf_content: PDF file content as bytes
        
    Returns:
        True if valid PDF, False otherwise
    """
    try:
        pdf_stream = io.BytesIO(pdf_content)
        pdf_document = fitz.open(stream=pdf_stream, filetype="pdf")
        page_count = pdf_document.page_count
        pdf_document.close()
        return page_count > 0
    except:
        return False