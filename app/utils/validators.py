import os
from typing import Tuple
from fastapi import UploadFile
from app.config import ALLOWED_EXTENSIONS, ALLOWED_MIME_TYPES, MAX_FILE_SIZE


class FileValidationError(Exception):
    """Raised when file validation fails"""
    pass


def validate_file_type(filename: str, content_type: str) -> Tuple[bool, str]:
    """
    Validates file extension and MIME type.
    
    Args:
        filename: Name of the uploaded file
        content_type: MIME type from the request header
    
    Returns:
        Tuple of (is_valid, error_message)
    """
    # Check extension first
    file_ext = os.path.splitext(filename)[1].lower()
    
    if file_ext not in ALLOWED_EXTENSIONS:
        if file_ext == ".doc":
            return False, "Legacy .doc format is not supported. Please convert to .docx or PDF."
        return False, f"File type not allowed. Accepted formats: {', '.join(ALLOWED_EXTENSIONS)}"
    
    # Validate MIME type matches extension
    if content_type not in ALLOWED_MIME_TYPES:
        return False, f"Invalid content type: {content_type}. Expected PDF or DOCX."
    
    # Cross-check extension and MIME type alignment
    if file_ext == ".pdf" and "pdf" not in content_type:
        return False, "File extension and content type mismatch."
    
    if file_ext == ".docx" and "wordprocessingml" not in content_type:
        return False, "File extension and content type mismatch."
    
    return True, ""


def validate_file_size(file_size: int) -> Tuple[bool, str]:
    """
    Checks if file size is within allowed limit.
    
    Args:
        file_size: Size of file in bytes
    
    Returns:
        Tuple of (is_valid, error_message)
    """
    if file_size > MAX_FILE_SIZE:
        max_mb = MAX_FILE_SIZE / (1024 * 1024)
        actual_mb = file_size / (1024 * 1024)
        return False, f"File too large ({actual_mb:.2f}MB). Maximum allowed: {max_mb}MB"
    
    if file_size == 0:
        return False, "Empty file uploaded."
    
    return True, ""


def check_file_validity(filename: str, content_type: str, file_size: int) -> None:
    """
    Performs all validation checks and raises exception if any fail.

    Args:
        filename: Name of the uploaded file
        content_type: MIME type from request
        file_size: Size in bytes

    Raises:
        FileValidationError: If validation fails
    """
    # Size check
    is_valid, error_msg = validate_file_size(file_size)
    if not is_valid:
        raise FileValidationError(error_msg)

    # Type check
    is_valid, error_msg = validate_file_type(filename, content_type)
    if not is_valid:
        raise FileValidationError(error_msg)


def validate_file(file: UploadFile) -> None:
    """
    Validates an uploaded file (convenience wrapper for UploadFile objects).

    Args:
        file: FastAPI UploadFile object

    Raises:
        FileValidationError: If validation fails
    """
    # Get file size by seeking to end
    file.file.seek(0, 2)  # Seek to end
    file_size = file.file.tell()
    file.file.seek(0)  # Reset to beginning

    # Validate using existing function
    check_file_validity(file.filename, file.content_type, file_size)
