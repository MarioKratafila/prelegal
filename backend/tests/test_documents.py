import pytest

SIGNUP_URL = "/api/auth/signup"
DOCS_URL = "/api/documents"
USER = {"email": "docs@example.com", "password": "secret123"}


async def _signup_and_token(client) -> str:
    res = await client.post(SIGNUP_URL, json=USER)
    return res.json()["access_token"]


@pytest.mark.asyncio
async def test_list_documents_empty(client):
    token = await _signup_and_token(client)
    res = await client.get(DOCS_URL, headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    assert res.json() == []


@pytest.mark.asyncio
async def test_save_and_list_document(client):
    token = await _signup_and_token(client)
    headers = {"Authorization": f"Bearer {token}"}
    payload = {"doc_type": "Mutual-NDA.md", "fields": {"effectiveDate": "2025-01-01", "governingLaw": "Delaware"}}

    save_res = await client.post(DOCS_URL, json=payload, headers=headers)
    assert save_res.status_code == 200
    saved = save_res.json()
    assert saved["doc_type"] == "Mutual-NDA.md"
    assert saved["title"] == "Mutual NDA"
    assert saved["fields"]["effectiveDate"] == "2025-01-01"
    assert "id" in saved

    list_res = await client.get(DOCS_URL, headers=headers)
    assert list_res.status_code == 200
    docs = list_res.json()
    assert len(docs) == 1
    assert docs[0]["id"] == saved["id"]


@pytest.mark.asyncio
async def test_get_document_by_id(client):
    token = await _signup_and_token(client)
    headers = {"Authorization": f"Bearer {token}"}
    payload = {"doc_type": "CSA.md", "fields": {"cloudServiceName": "MyApp"}}

    save_res = await client.post(DOCS_URL, json=payload, headers=headers)
    doc_id = save_res.json()["id"]

    get_res = await client.get(f"{DOCS_URL}/{doc_id}", headers=headers)
    assert get_res.status_code == 200
    assert get_res.json()["fields"]["cloudServiceName"] == "MyApp"


@pytest.mark.asyncio
async def test_delete_document(client):
    token = await _signup_and_token(client)
    headers = {"Authorization": f"Bearer {token}"}
    payload = {"doc_type": "DPA.md", "fields": {}}

    save_res = await client.post(DOCS_URL, json=payload, headers=headers)
    doc_id = save_res.json()["id"]

    del_res = await client.delete(f"{DOCS_URL}/{doc_id}", headers=headers)
    assert del_res.status_code == 204

    list_res = await client.get(DOCS_URL, headers=headers)
    assert list_res.json() == []


@pytest.mark.asyncio
async def test_unauthenticated_access_denied(client):
    res = await client.get(DOCS_URL)
    assert res.status_code in (401, 403)


@pytest.mark.asyncio
async def test_cannot_access_other_users_document(client):
    # User A saves a document
    user_a_token = (await client.post(SIGNUP_URL, json={"email": "a@example.com", "password": "pass"})).json()["access_token"]
    save_res = await client.post(DOCS_URL, json={"doc_type": "BAA.md", "fields": {}}, headers={"Authorization": f"Bearer {user_a_token}"})
    doc_id = save_res.json()["id"]

    # User B tries to access it
    user_b_token = (await client.post(SIGNUP_URL, json={"email": "b@example.com", "password": "pass"})).json()["access_token"]
    get_res = await client.get(f"{DOCS_URL}/{doc_id}", headers={"Authorization": f"Bearer {user_b_token}"})
    assert get_res.status_code == 404
