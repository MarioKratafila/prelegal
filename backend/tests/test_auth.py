import pytest

SIGNUP_URL = "/api/auth/signup"
LOGIN_URL = "/api/auth/login"
ME_URL = "/api/auth/me"

USER = {"email": "test@example.com", "password": "secret123"}


@pytest.mark.asyncio
async def test_signup_returns_token(client):
    resp = await client.post(SIGNUP_URL, json=USER)
    assert resp.status_code == 201
    data = resp.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_signup_duplicate_email_returns_409(client):
    await client.post(SIGNUP_URL, json=USER)
    resp = await client.post(SIGNUP_URL, json=USER)
    assert resp.status_code == 409


@pytest.mark.asyncio
async def test_login_returns_token(client):
    await client.post(SIGNUP_URL, json=USER)
    resp = await client.post(LOGIN_URL, json=USER)
    assert resp.status_code == 200
    assert "access_token" in resp.json()


@pytest.mark.asyncio
async def test_login_wrong_password_returns_401(client):
    await client.post(SIGNUP_URL, json=USER)
    resp = await client.post(LOGIN_URL, json={"email": USER["email"], "password": "wrong"})
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_me_returns_current_user(client):
    signup_resp = await client.post(SIGNUP_URL, json=USER)
    token = signup_resp.json()["access_token"]
    resp = await client.get(ME_URL, headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    assert resp.json()["email"] == USER["email"]


@pytest.mark.asyncio
async def test_me_unauthenticated_returns_401(client):
    resp = await client.get(ME_URL)
    assert resp.status_code in (401, 403)
