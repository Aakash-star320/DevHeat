from fastapi import APIRouter, UploadFile, File, HTTPException
from app.models.responses import ResumeResponse, ErrorResponse
from app.utils.validators import check_file_validity, FileValidationError
from app.utils.file_parser import extract_text
from app.config import logger

router = APIRouter(prefix="/upload", tags=["Resume"])


@router.post(
    "/resume",
    response_model=ResumeResponse,
    responses={
        400: {"model": ErrorResponse, "description": "Invalid file"},
        500: {"model": ErrorResponse, "description": "Processing error"}
    },
    summary="Upload Resume",
    description="Extracts full text content from resume PDF or DOCX file without section parsing"
)
async def upload_resume(file: UploadFile = File(...)) -> ResumeResponse:
    """
    Processes resume upload and extracts raw text.
    
    - **file**: PDF or DOCX file containing resume
    
    Returns the complete extracted text without any section splitting.
    """
    try:
        # Read file content
        file_content = await file.read()
        file_size = len(file_content)
        
        logger.info(f"Processing resume file: {file.filename} ({file_size} bytes)")
        
        # Validate file
        try:
            check_file_validity(
                filename=file.filename,
                content_type=file.content_type,
                file_size=file_size
            )
        except FileValidationError as e:
            logger.warning(f"Validation failed for {file.filename}: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e))
        
        # Extract text
        try:
            extracted_text = extract_text(file_content, file.filename)
            logger.info(f"Extracted {len(extracted_text)} characters from resume")
        except Exception as e:
            logger.error(f"Text extraction failed: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to extract text from file: {str(e)}"
            )
        
        if not extracted_text:
            logger.warning(f"No text extracted from {file.filename}")
            raise HTTPException(
                status_code=400,
                detail="No text could be extracted from the file. Ensure it's a text-based PDF or valid DOCX."
            )
        
        return ResumeResponse(resume_text=extracted_text)
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error processing resume: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"An unexpected error occurred: {str(e)}"
        )
