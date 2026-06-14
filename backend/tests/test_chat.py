import json
import pytest
from unittest.mock import patch, AsyncMock, MagicMock

SIGNUP_URL = "/api/auth/signup"
CHAT_URL = "/api/chat"
USER = {"email": "chat@example.com", "password": "secret123"}

EMPTY_FIELDS = {
    "effectiveDate": None,
    "governingLaw": None,
    "jurisdiction": None,
    "party1": None,
    "party2": None,
    "purpose": None,
    "mndaTermType": None,
    "mndaTermYears": None,
    "confidentialityTermType": None,
    "confidentialityTermYears": None,
    "modifications": None,
    "cloudServiceName": None,
    "subscriptionPeriodMonths": None,
    "fees": None,
    "paymentProcess": None,
    "termMonths": None,
    "uptimePercentage": None,
    "responseTimeCriticalHours": None,
    "responseTimeHighHours": None,
    "responseTimeMediumHours": None,
    "serviceCreditPercentage": None,
    "servicesDescription": None,
    "deliverables": None,
    "dataTypes": None,
    "processingPurpose": None,
    "phiTypes": None,
    "softwareName": None,
    "licenseType": None,
    "partnershipPurpose": None,
    "revenueSharePercent": None,
    "pilotScope": None,
    "pilotDurationDays": None,
    "successCriteria": None,
    "programDescription": None,
    "aiServiceDescription": None,
    "inputOutputOwnership": None,
}


def make_llm_response(message: str, fields: dict, doc_type: str | None = None) -> MagicMock:
    mock = MagicMock()
    mock.choices[0].message.content = json.dumps(
        {"message": message, "doc_type": doc_type, "fields": fields}
    )
    return mock


@pytest.mark.asyncio
async def test_chat_returns_message_and_fields(client):
    signup = await client.post(SIGNUP_URL, json=USER)
    token = signup.json()["access_token"]

    llm_response = make_llm_response(
        "Which type of legal document do you need?",
        EMPTY_FIELDS,
    )

    with patch("routes.chat.acompletion", new=AsyncMock(return_value=llm_response)):
        resp = await client.post(
            CHAT_URL,
            json={"messages": [{"role": "user", "content": "Hi, I need a legal document"}]},
            headers={"Authorization": f"Bearer {token}"},
        )

    assert resp.status_code == 200
    data = resp.json()
    assert "message" in data
    assert "fields" in data
    assert "doc_type" in data
    assert data["message"] == "Which type of legal document do you need?"


@pytest.mark.asyncio
async def test_chat_with_nda_doc_type_extracts_fields(client):
    signup = await client.post(SIGNUP_URL, json=USER)
    token = signup.json()["access_token"]

    fields_with_data = {
        **EMPTY_FIELDS,
        "purpose": "Evaluating a potential partnership",
        "governingLaw": "Delaware",
        "jurisdiction": "New Castle, DE",
        "party1": {
            "printName": "Alice Smith",
            "title": "CEO",
            "company": "Acme Inc",
            "noticeAddress": "alice@acme.com",
        },
    }
    llm_response = make_llm_response(
        "Got it! Who is the second party?",
        fields_with_data,
        doc_type="Mutual-NDA.md",
    )

    with patch("routes.chat.acompletion", new=AsyncMock(return_value=llm_response)):
        resp = await client.post(
            CHAT_URL,
            json={
                "messages": [
                    {
                        "role": "user",
                        "content": "We're evaluating a partnership. Alice Smith CEO of Acme Inc. Delaware law.",
                    }
                ],
                "doc_type": "Mutual-NDA.md",
            },
            headers={"Authorization": f"Bearer {token}"},
        )

    assert resp.status_code == 200
    data = resp.json()
    assert data["doc_type"] == "Mutual-NDA.md"
    assert data["fields"]["purpose"] == "Evaluating a potential partnership"
    assert data["fields"]["governingLaw"] == "Delaware"
    assert data["fields"]["party1"]["printName"] == "Alice Smith"


@pytest.mark.asyncio
async def test_chat_with_csa_doc_type(client):
    signup = await client.post(SIGNUP_URL, json=USER)
    token = signup.json()["access_token"]

    fields_with_data = {
        **EMPTY_FIELDS,
        "cloudServiceName": "Acme Cloud Platform",
        "subscriptionPeriodMonths": 12,
        "fees": "$1000/month",
        "governingLaw": "California",
    }
    llm_response = make_llm_response(
        "Great! Who are the Provider and Customer parties?",
        fields_with_data,
        doc_type="CSA.md",
    )

    with patch("routes.chat.acompletion", new=AsyncMock(return_value=llm_response)):
        resp = await client.post(
            CHAT_URL,
            json={
                "messages": [
                    {
                        "role": "user",
                        "content": "I need a CSA for Acme Cloud Platform, 12 month subscription, $1000/month, California law.",
                    }
                ],
                "doc_type": "CSA.md",
            },
            headers={"Authorization": f"Bearer {token}"},
        )

    assert resp.status_code == 200
    data = resp.json()
    assert data["doc_type"] == "CSA.md"
    assert data["fields"]["cloudServiceName"] == "Acme Cloud Platform"
    assert data["fields"]["subscriptionPeriodMonths"] == 12
    assert data["fields"]["fees"] == "$1000/month"


@pytest.mark.asyncio
async def test_chat_unauthenticated_returns_401(client):
    resp = await client.post(
        CHAT_URL,
        json={"messages": [{"role": "user", "content": "Hello"}]},
    )
    assert resp.status_code in (401, 403)


@pytest.mark.asyncio
async def test_chat_no_doc_type_uses_generic_prompt(client):
    signup = await client.post(SIGNUP_URL, json=USER)
    token = signup.json()["access_token"]

    llm_response = make_llm_response("Hello! Which document do you need?", EMPTY_FIELDS)

    with patch("routes.chat.acompletion", new=AsyncMock(return_value=llm_response)) as mock_llm:
        resp = await client.post(
            CHAT_URL,
            json={"messages": []},
            headers={"Authorization": f"Bearer {token}"},
        )

    assert resp.status_code == 200
    # Verify the generic system prompt was used (no specific doc type)
    call_args = mock_llm.call_args
    messages = call_args.kwargs["messages"]
    system_msg = messages[0]["content"]
    assert "Supported document types" in system_msg


@pytest.mark.asyncio
async def test_chat_doc_type_selects_specific_prompt(client):
    signup = await client.post(SIGNUP_URL, json=USER)
    token = signup.json()["access_token"]

    llm_response = make_llm_response("Let's create your NDA!", EMPTY_FIELDS, "Mutual-NDA.md")

    with patch("routes.chat.acompletion", new=AsyncMock(return_value=llm_response)) as mock_llm:
        resp = await client.post(
            CHAT_URL,
            json={"messages": [], "doc_type": "Mutual-NDA.md"},
            headers={"Authorization": f"Bearer {token}"},
        )

    assert resp.status_code == 200
    call_args = mock_llm.call_args
    messages = call_args.kwargs["messages"]
    system_msg = messages[0]["content"]
    assert "Mutual Non-Disclosure Agreement" in system_msg
    assert "Supported document types" not in system_msg
