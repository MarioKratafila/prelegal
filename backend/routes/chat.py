import os
from typing import Literal
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from litellm import acompletion
from auth import get_current_user
from models import User

router = APIRouter(prefix="/api/chat", tags=["chat"])

MODEL = "openrouter/openai/gpt-oss-120b"
EXTRA_BODY = {"provider": {"order": ["cerebras"]}}

SYSTEM_PROMPT = """You are a legal document assistant helping a user complete a Mutual Non-Disclosure Agreement (MNDA).

Have a natural, friendly conversation to gather these fields:
- purpose: Why are the two parties sharing confidential information?
- effectiveDate: When does the agreement start? (ISO format YYYY-MM-DD; use today if the user says "today")
- mndaTermType: "expires" (fixed duration) or "until-terminated" (ongoing until ended)
- mndaTermYears: Number of years if mndaTermType is "expires" (integer)
- confidentialityTermType: "years" (limited duration) or "perpetuity" (forever)
- confidentialityTermYears: Number of years if confidentialityTermType is "years" (integer)
- governingLaw: US state name governing the agreement (e.g. "Delaware")
- jurisdiction: City/county and state for legal proceedings (e.g. "New Castle, DE")
- modifications: Any modifications to standard terms (optional, often null)
- party1: printName, title, company, noticeAddress (email or postal) for the first party
- party2: printName, title, company, noticeAddress for the second party

Ask naturally — you can ask about multiple things at once and follow up on partial answers.
When you have all fields, confirm the document is ready for review.

Always respond with a JSON object containing:
1. "message": your conversational reply to the user
2. "fields": all NDA fields you have extracted so far (use null for fields not yet known)"""


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]


class PartyFields(BaseModel):
    printName: str | None = None
    title: str | None = None
    company: str | None = None
    noticeAddress: str | None = None


class NdaFields(BaseModel):
    purpose: str | None = None
    effectiveDate: str | None = None
    mndaTermType: Literal["expires", "until-terminated"] | None = None
    mndaTermYears: int | None = None
    confidentialityTermType: Literal["years", "perpetuity"] | None = None
    confidentialityTermYears: int | None = None
    governingLaw: str | None = None
    jurisdiction: str | None = None
    modifications: str | None = None
    party1: PartyFields | None = None
    party2: PartyFields | None = None


class ChatResponse(BaseModel):
    message: str
    fields: NdaFields


@router.post("", response_model=ChatResponse)
async def chat(body: ChatRequest, current_user: User = Depends(get_current_user)):
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    messages += [{"role": m.role, "content": m.content} for m in body.messages]

    response = await acompletion(
        model=MODEL,
        messages=messages,
        response_format=ChatResponse,
        reasoning_effort="low",
        extra_body=EXTRA_BODY,
    )
    result = response.choices[0].message.content
    return ChatResponse.model_validate_json(result)
