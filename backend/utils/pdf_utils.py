import fitz  # PyMuPDF
import re
from io import BytesIO

def extract_text_from_pdf(pdf_content: bytes) -> str:
    """
    Extract text from PDF content using PyMuPDF
    """
    try:
        # Open PDF from bytes
        pdf_document = fitz.open(stream=pdf_content, filetype="pdf")
        
        extracted_text = ""
        
        # Extract text from each page
        for page_num in range(pdf_document.page_count):
            page = pdf_document[page_num]
            text = page.get_text()
            extracted_text += text + "\n"
        
        pdf_document.close()
        
        # Clean and normalize text
        cleaned_text = clean_extracted_text(extracted_text)
        
        return cleaned_text
        
    except Exception as e:
        raise Exception(f"Failed to extract text from PDF: {str(e)}")

def clean_extracted_text(text: str) -> str:
    """
    Clean and normalize extracted text
    """
    # Remove excessive whitespace
    text = re.sub(r'\s+', ' ', text)
    
    # Remove special characters that might cause issues
    text = re.sub(r'[^\w\s\.\,\!\?\;\:\-\(\)\[\]\{\}\"\'\/\@\#\$\%\&\*\+\=\<\>\|\~\`]', '', text)
    
    # Normalize line breaks
    text = text.replace('\n', ' ').replace('\r', ' ')
    
    # Remove extra spaces
    text = ' '.join(text.split())
    
    return text.strip()