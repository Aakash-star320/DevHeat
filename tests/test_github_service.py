import pytest
import httpx
from unittest.mock import AsyncMock, patch, MagicMock
from app.services.github_service import get_user_repositories

@pytest.mark.asyncio
async def test_get_user_repositories():
    mock_repos = [
        {
            "name": "repo1",
            "full_name": "user/repo1",
            "html_url": "https://github.com/user/repo1",
            "description": "desc1",
            "language": "Python",
            "stargazers_count": 10,
            "updated_at": "2023-01-01T00:00:00Z"
        }
    ]

    with patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        mock_response = MagicMock(spec=httpx.Response)
        mock_response.status_code = 200
        mock_response.json.return_value = mock_repos
        mock_get.return_value = mock_response

        repos = await get_user_repositories("fake-token")

        assert len(repos) == 1
        assert repos[0]["name"] == "repo1"
        assert repos[0]["full_name"] == "user/repo1"
        assert repos[0]["html_url"] == "https://github.com/user/repo1"
