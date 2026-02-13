import pytest
from app.utils.auth import create_access_token, verify_token
from datetime import timedelta

def test_create_and_verify_token():
    data = {"sub": "user-123"}
    token = create_access_token(data)
    assert token is not None

    payload = verify_token(token)
    assert payload is not None
    assert payload["sub"] == "user-123"

def test_expired_token():
    data = {"sub": "user-123"}
    # Create a token that expires in the past
    token = create_access_token(data, expires_delta=timedelta(seconds=-1))
    payload = verify_token(token)
    assert payload is None

def test_invalid_token():
    payload = verify_token("invalid.token.here")
    assert payload is None
