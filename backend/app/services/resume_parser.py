import io
from typing import Tuple
from fastapi import UploadFile, HTTPException
from pypdf import PdfReader
from docx import Document
from app.config import settings

def extract_text_from_file(file: UploadFile, contents: bytes) -> str:
    """
    Extracts plain text from PDF and DOCX files.
    Enforces format validation and error reporting.
    """
    filename = file.filename or ""
    lower_filename = filename.lower()
    
    # 1. Validate file extension
    has_valid_ext = any(lower_filename.endswith(ext) for ext in settings.ALLOWED_EXTENSIONS)
    if not has_valid_ext:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{filename}'. Only PDF (.pdf) and Word (.docx) resumes are supported."
        )

    # 2. Check file size
    size_mb = len(contents) / (1024 * 1024)
    if size_mb > settings.MAX_RESUME_SIZE_MB:
        raise HTTPException(
            status_code=400,
            detail=f"File exceeds maximum allowed size of {settings.MAX_RESUME_SIZE_MB}MB (uploaded size: {size_mb:.1f}MB)."
        )

    extracted_text = ""
    try:
        if lower_filename.endswith(".pdf"):
            reader = PdfReader(io.BytesIO(contents))
            pages_text = []
            for i, page in enumerate(reader.pages):
                text = page.extract_text()
                if text:
                    pages_text.append(text)
            extracted_text = "\n".join(pages_text).strip()
            
            if not extracted_text:
                raise HTTPException(
                    status_code=422,
                    detail="The uploaded PDF appears to be empty or contains scanned images without extractable text (OCR required)."
                )

        elif lower_filename.endswith(".docx"):
            doc = Document(io.BytesIO(contents))
            paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
            extracted_text = "\n".join(paragraphs).strip()
            
            if not extracted_text:
                raise HTTPException(
                    status_code=422,
                    detail="The uploaded DOCX file does not contain any readable text."
                )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=422,
            detail=f"Failed to process document: {str(e)}. Please check if file is corrupted."
        )

    return extracted_text
