"""Profile RAG indexing and retrieval for the AI Career Coach."""
import asyncio
import re
import uuid
from dataclasses import dataclass
from typing import Any, Dict, Iterable, List

from google import genai as google_genai
from google.genai import types as genai_types
from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance,
    FieldCondition,
    Filter,
    FilterSelector,
    MatchValue,
    PayloadSchemaType,
    PointStruct,
    VectorParams,
)

from app.config import GEMINI_API_KEY, QDRANT_API_KEY, QDRANT_COLLECTION_NAME, QDRANT_URL, logger


EMBEDDING_MODEL = "gemini-embedding-001"
EMBEDDING_DIMENSIONS = 768
CHUNK_SIZE = 1200
CHUNK_OVERLAP = 160
EMBEDDING_BATCH_SIZE = 16
MAX_RETRIEVED_CHUNKS = 6

ACKNOWLEDGEMENT_MESSAGES = {
    "ok", "okay", "ok thanks", "thanks", "thank you", "thankyou", "thx", "ty",
    "great", "cool", "nice", "got it", "understood", "sounds good", "perfect",
    "hi", "hello", "hey", "good morning", "good evening",
}


@dataclass(frozen=True)
class KnowledgeChunk:
    text: str
    source_type: str
    source_name: str
    source_url: str = ""


def rag_is_configured() -> bool:
    return bool(GEMINI_API_KEY and QDRANT_URL and QDRANT_API_KEY)


def should_retrieve_profile_context(message: str) -> bool:
    """Skip only obvious acknowledgements and greetings; retrieve for real questions."""
    normalised = re.sub(r"[^a-z0-9 ]+", " ", (message or "").lower())
    normalised = re.sub(r"\s+", " ", normalised).strip()
    return bool(normalised) and normalised not in ACKNOWLEDGEMENT_MESSAGES


def _normalise_text(value: Any) -> str:
    if not isinstance(value, str):
        return ""
    return re.sub(r"\n{3,}", "\n\n", value.replace("\r\n", "\n").replace("\r", "\n")).strip()


def _split_text(text: str) -> List[str]:
    """Split source text at paragraph/word boundaries with a small overlap."""
    text = _normalise_text(text)
    if not text:
        return []
    if len(text) <= CHUNK_SIZE:
        return [text]

    chunks: List[str] = []
    start = 0
    while start < len(text):
        end = min(len(text), start + CHUNK_SIZE)
        if end < len(text):
            boundary = max(text.rfind("\n\n", start + CHUNK_SIZE // 2, end), text.rfind(" ", start + CHUNK_SIZE // 2, end))
            if boundary > start:
                end = boundary
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        if end >= len(text):
            break
        start = max(end - CHUNK_OVERLAP, start + 1)
    return chunks


def _linkedin_text(linkedin_data: Any) -> str:
    if not isinstance(linkedin_data, dict):
        return ""
    labels = {
        "summary": "Summary",
        "experience_raw": "Experience",
        "education_raw": "Education",
        "skills_raw": "Skills",
    }
    parts = [f"{label}: {value.strip()}" for key, label in labels.items() if isinstance((value := linkedin_data.get(key)), str) and value.strip()]
    return "\n\n".join(parts)


def build_portfolio_knowledge_chunks(portfolio: Any) -> List[KnowledgeChunk]:
    """Create evidence chunks only from the sources selected for a portfolio."""
    chunks: List[KnowledgeChunk] = []

    for text in _split_text(getattr(portfolio, "resume_text", "")):
        chunks.append(KnowledgeChunk(text=text, source_type="resume", source_name="Resume"))

    for text in _split_text(_linkedin_text(getattr(portfolio, "linkedin_data", None))):
        chunks.append(KnowledgeChunk(text=text, source_type="linkedin", source_name="LinkedIn profile"))

    github_data = getattr(portfolio, "github_data", None)
    if isinstance(github_data, list):
        for repository in github_data:
            if not isinstance(repository, dict):
                continue
            name = _normalise_text(repository.get("name")) or "GitHub project"
            description = _normalise_text(repository.get("description"))
            language = _normalise_text(repository.get("primary_language") or repository.get("language"))
            readme = _normalise_text(repository.get("readme_text"))
            introduction = " | ".join(part for part in [
                f"Project: {name}",
                f"Description: {description}" if description else "",
                f"Primary language: {language}" if language else "",
            ] if part)
            source_text = f"{introduction}\n\n{readme}" if readme else introduction
            for text in _split_text(source_text):
                chunks.append(KnowledgeChunk(
                    text=text,
                    source_type="github_readme",
                    source_name=name,
                    source_url=_normalise_text(repository.get("github_url") or repository.get("html_url")),
                ))
    return chunks


def _embed_texts_sync(texts: List[str], task_type: str) -> List[List[float]]:
    client = google_genai.Client(api_key=GEMINI_API_KEY)
    response = client.models.embed_content(
        model=EMBEDDING_MODEL,
        contents=texts,
        config=genai_types.EmbedContentConfig(
            task_type=task_type,
            output_dimensionality=EMBEDDING_DIMENSIONS,
        ),
    )
    vectors = [list(embedding.values) for embedding in (response.embeddings or [])]
    if len(vectors) != len(texts):
        raise RuntimeError("Gemini returned an unexpected number of embeddings")
    return vectors


async def _embed_texts(texts: List[str], task_type: str) -> List[List[float]]:
    vectors: List[List[float]] = []
    for start in range(0, len(texts), EMBEDDING_BATCH_SIZE):
        batch = texts[start:start + EMBEDDING_BATCH_SIZE]
        vectors.extend(await asyncio.to_thread(_embed_texts_sync, batch, task_type))
    return vectors


def _qdrant_client() -> QdrantClient:
    return QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY, timeout=20)


def _ensure_payload_indexes(client: QdrantClient) -> None:
    """Create the filter indexes required for secure user/portfolio-scoped operations."""
    payload_schema = client.get_collection(QDRANT_COLLECTION_NAME).payload_schema or {}
    for field_name in ("user_id", "portfolio_id"):
        if field_name not in payload_schema:
            client.create_payload_index(
                collection_name=QDRANT_COLLECTION_NAME,
                field_name=field_name,
                field_schema=PayloadSchemaType.KEYWORD,
            )


def _ensure_collection_and_upsert(points: List[PointStruct]) -> None:
    client = _qdrant_client()
    if not client.collection_exists(QDRANT_COLLECTION_NAME):
        client.create_collection(
            collection_name=QDRANT_COLLECTION_NAME,
            vectors_config=VectorParams(size=EMBEDDING_DIMENSIONS, distance=Distance.COSINE),
        )
    _ensure_payload_indexes(client)
    client.upsert(collection_name=QDRANT_COLLECTION_NAME, points=points, wait=True)


async def index_portfolio_knowledge(user_id: str, portfolio: Any) -> int:
    """Embed and persist the selected portfolio sources after initial creation."""
    if not rag_is_configured():
        logger.warning("RAG index skipped because Qdrant or Gemini configuration is missing")
        return 0

    chunks = build_portfolio_knowledge_chunks(portfolio)
    if not chunks:
        logger.info("RAG index skipped because portfolio %s has no indexable sources", portfolio.id)
        return 0

    vectors = await _embed_texts([chunk.text for chunk in chunks], "RETRIEVAL_DOCUMENT")
    points = [
        PointStruct(
            id=str(uuid.uuid5(uuid.NAMESPACE_URL, f"smartfolio:{user_id}:{portfolio.id}:{index}:{chunk.source_type}:{chunk.source_name}")),
            vector=vector,
            payload={
                "user_id": user_id,
                "portfolio_id": portfolio.id,
                "source_type": chunk.source_type,
                "source_name": chunk.source_name,
                "source_url": chunk.source_url,
                "text": chunk.text,
            },
        )
        for index, (chunk, vector) in enumerate(zip(chunks, vectors))
    ]
    await asyncio.to_thread(_ensure_collection_and_upsert, points)
    logger.info("Indexed %s Career Coach knowledge chunks for portfolio %s", len(points), portfolio.id)
    return len(points)


def _delete_portfolio_points_sync(user_id: str, portfolio_id: str) -> None:
    client = _qdrant_client()
    if not client.collection_exists(QDRANT_COLLECTION_NAME):
        return
    _ensure_payload_indexes(client)
    client.delete(
        collection_name=QDRANT_COLLECTION_NAME,
        points_selector=FilterSelector(filter=Filter(must=[
            FieldCondition(key="user_id", match=MatchValue(value=user_id)),
            FieldCondition(key="portfolio_id", match=MatchValue(value=portfolio_id)),
        ])),
        wait=True,
    )


async def delete_portfolio_knowledge(user_id: str, portfolio_id: str) -> None:
    """Remove only this portfolio's derived RAG points before its source data is deleted."""
    if not rag_is_configured():
        raise RuntimeError("Qdrant is not configured, so portfolio knowledge cannot be safely deleted")
    await asyncio.to_thread(_delete_portfolio_points_sync, user_id, portfolio_id)
    logger.info("Deleted Career Coach knowledge chunks for portfolio %s", portfolio_id)


def _query_points_sync(user_id: str, vector: List[float]) -> List[Any]:
    client = _qdrant_client()
    response = client.query_points(
        collection_name=QDRANT_COLLECTION_NAME,
        query=vector,
        query_filter=Filter(must=[FieldCondition(key="user_id", match=MatchValue(value=user_id))]),
        limit=MAX_RETRIEVED_CHUNKS * 3,
        with_payload=True,
        with_vectors=False,
    )
    return response.points


def _diverse_matches(points: Iterable[Any]) -> List[Dict[str, Any]]:
    matches: List[Dict[str, Any]] = []
    source_counts: Dict[str, int] = {}
    seen_text: set[str] = set()
    for point in points:
        payload = point.payload or {}
        text = _normalise_text(payload.get("text"))
        source_name = _normalise_text(payload.get("source_name")) or "Profile source"
        source_key = f"{payload.get('source_type', '')}:{source_name}"
        if not text or text in seen_text or source_counts.get(source_key, 0) >= 2:
            continue
        matches.append({
            "text": text,
            "source_type": payload.get("source_type", "profile"),
            "source_name": source_name,
            "source_url": _normalise_text(payload.get("source_url")),
            "score": round(float(point.score), 3),
        })
        seen_text.add(text)
        source_counts[source_key] = source_counts.get(source_key, 0) + 1
        if len(matches) >= MAX_RETRIEVED_CHUNKS:
            break
    return matches


async def retrieve_profile_evidence(user_id: str, user_message: str) -> List[Dict[str, Any]]:
    """Return only the most relevant evidence for a Career Coach question."""
    if not rag_is_configured() or not should_retrieve_profile_context(user_message):
        return []
    try:
        vector = (await _embed_texts([user_message], "RETRIEVAL_QUERY"))[0]
        points = await asyncio.to_thread(_query_points_sync, user_id, vector)
        return _diverse_matches(points)
    except Exception as error:
        logger.warning("Career Coach RAG retrieval failed; continuing without it: %s", error)
        return []


def format_profile_evidence(matches: List[Dict[str, Any]]) -> str:
    if not matches:
        return "No retrieved profile evidence was needed or available for this message."
    entries = []
    for match in matches:
        source_type = match["source_type"]
        label = "Resume" if source_type == "resume" else "LinkedIn profile" if source_type == "linkedin" else f"GitHub README: {match['source_name']}"
        entries.append(f"[{label}]\n{match['text']}")
    return "\n\n".join(entries)
