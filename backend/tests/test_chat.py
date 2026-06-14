import json
import pytest
from unittest.mock import patch, AsyncMock, MagicMock

SIGNUP_URL = "/api/auth/signup"
CHAT_URL = "/api/chat"
USER = {"email": "chat@example.com", "password": "secret123"}

EMPTY_FIELDS = {
    "purpose": None,
    "effectiveDate": None,
    "mndaTermType": None,
    "mndaTermYears": None,
    "confidentialityTermType": None,
    "confidentialityTermYears": None,
    "governingLaw": None,
    "jurisdiction": None,
    "modifications": None,
    "party1": None,
    "party2": None,
}


def make_llm_response(message: str, fields: dict) -> MagicMock:
    mock = MagicMock()
    mock.choices[0].message.content = json.dumps({"message": message, "fields": fields})
    return mock


@pytest.mark.asyncio
async def test_chat_returns_message_and_fields(client):
    signup = await client.post(SIGNUP_URL, json=USER)
    token = signup.json()["access_token"]

    llm_response = make_llm_response(
        "What is the purpose of this NDA?",
        EMPTY_FIELDS,
    )

    with patch("routes.chat.acompletion", new=AsyncMock(return_value=llm_response)):
        resp = await client.post(
            CHAT_URL,
            json={"messages": [{"role": "user", "content": "Hi, I need an NDA"}]},
            headers={"Authorization": f"Bearer {token}"},
        )

    assert resp.status_code == 200
    data = resp.json()
    assert "message" in data
    assert "fields" in data
    assert data["message"] == "What is the purpose of this NDA?"


@pytest.mark.asyncio
async def test_chat_extracts_fields_from_conversation(client):
    signup = await client.post(SIGNUP_URL, json=USER)
    token = signup.json()["access_token"]

    fields_with_data = {
        **EMPTY_FIELDS,
        "purpose": "Evaluating a potential partnership",
        "governingLaw": "Delaware",
        "jurisdiction": "New Castle, DE",
        "party1": {"printName": "Alice Smith", "title": "CEO", "company": "Acme Inc", "noticeAddress": "alice@acme.com"},
        "party2": None,
    }
    llm_response = make_llm_response("Got it! Who is the second party?", fields_with_data)

    with patch("routes.chat.acompletion", new=AsyncMock(return_value=llm_response)):
        resp = await client.post(
            CHAT_URL,
            json={
                "messages": [
                    {"role": "user", "content": "We're evaluating a partnership. Alice Smith CEO of Acme Inc. Delaware law."}
                ]
            },
            headers={"Authorization": f"Bearer {token}"},
        )

    assert resp.status_code == 200
    data = resp.json()
    assert data["fields"]["purpose"] == "Evaluating a potential partnership"
    assert data["fields"]["governingLaw"] == "Delaware"
    assert data["fields"]["party1"]["printName"] == "Alice Smith"


@pytest.mark.asyncio
async def test_chat_unauthenticated_returns_401(client):
    resp = await client.post(
        CHAT_URL,
        json={"messages": [{"role": "user", "content": "Hello"}]},
    )
    assert resp.status_code in (401, 403)


@pytest.mark.asyncio
async def test_chat_empty_messages_returns_200(client):
    signup = await client.post(SIGNUP_URL, json=USER)
    token = signup.json()["access_token"]

    llm_response = make_llm_response("Hello! How can I help you?", EMPTY_FIELDS)

    with patch("routes.chat.acompletion", new=AsyncMock(return_value=llm_response)):
        resp = await client.post(
            CHAT_URL,
            json={"messages": []},
            headers={"Authorization": f"Bearer {token}"},
        )

    assert resp.status_code == 200
