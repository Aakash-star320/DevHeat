import re
import uuid


def generate_portfolio_slug(name: str) -> str:
    """
    Generate a URL-safe portfolio slug from a name.
    
    Rules:
    1. Convert to lowercase
    2. Replace all non-alphanumeric characters with hyphens
    3. Remove leading/trailing hyphens
    4. Append 6 random hexadecimal characters from uuid4
    
    Args:
        name: User's name to slugify
        
    Returns:
        URL-safe slug in format: {slugified-name}-{random}
        
    Example:
        >>> generate_portfolio_slug("Aakash Singh")
        'aakash-singh-29fa2b'
    """
    # Convert to lowercase
    slug = name.lower()
    
    # Replace all non-alphanumeric characters with hyphens
    slug = re.sub(r'[^a-z0-9]+', '-', slug)
    
    # Remove leading and trailing hyphens
    slug = slug.strip('-')
    
    # Generate 6 random hexadecimal characters
    random_suffix = uuid.uuid4().hex[:6]
    
    # Combine slug with random suffix
    return f"{slug}-{random_suffix}"
