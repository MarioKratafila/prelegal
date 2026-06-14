from typing import Literal
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from litellm import acompletion
from auth import get_current_user
from models import User

router = APIRouter(prefix="/api/chat", tags=["chat"])

MODEL = "openrouter/openai/gpt-oss-120b"
EXTRA_BODY = {"provider": {"order": ["cerebras"]}}

# Supported document catalog: filename -> {name, fields description}
CATALOG = {
    "Mutual-NDA.md": {
        "name": "Mutual Non-Disclosure Agreement",
        "fields_desc": [
            "purpose: Why the two parties are sharing confidential information",
            "effectiveDate: Agreement start date (ISO YYYY-MM-DD)",
            "mndaTermType: 'expires' (fixed duration) or 'until-terminated'",
            "mndaTermYears: Number of years if mndaTermType is 'expires'",
            "confidentialityTermType: 'years' or 'perpetuity'",
            "confidentialityTermYears: Number of years if confidentialityTermType is 'years'",
            "governingLaw: US state name",
            "jurisdiction: City/county and state (e.g. 'New Castle, DE')",
            "modifications: Any modifications to standard terms (optional, often null)",
            "party1 and party2: printName, title, company, noticeAddress",
        ],
    },
    "Mutual-NDA-coverpage.md": {
        "name": "Mutual NDA Cover Page",
        "fields_desc": [
            "purpose: Why the two parties are sharing confidential information",
            "effectiveDate: Agreement start date (ISO YYYY-MM-DD)",
            "mndaTermType: 'expires' (fixed duration) or 'until-terminated'",
            "mndaTermYears: Number of years if mndaTermType is 'expires'",
            "confidentialityTermType: 'years' or 'perpetuity'",
            "confidentialityTermYears: Number of years if confidentialityTermType is 'years'",
            "governingLaw: US state name",
            "jurisdiction: City/county and state",
            "modifications: Any modifications to standard terms (optional)",
            "party1 and party2: printName, title, company, noticeAddress",
        ],
    },
    "CSA.md": {
        "name": "Cloud Service Agreement",
        "fields_desc": [
            "cloudServiceName: Name of the cloud service/product",
            "effectiveDate: Agreement start date (ISO YYYY-MM-DD)",
            "subscriptionPeriodMonths: Subscription duration in months",
            "fees: Fee amount and structure (e.g. '$500/month')",
            "paymentProcess: 'invoice' or 'auto'",
            "governingLaw: US state name",
            "jurisdiction: City/county and state",
            "party1 (Provider) and party2 (Customer): printName, title, company, noticeAddress",
        ],
    },
    "design-partner-agreement.md": {
        "name": "Design Partner Agreement",
        "fields_desc": [
            "programDescription: Description of the design partner program and product",
            "effectiveDate: Agreement start date (ISO YYYY-MM-DD)",
            "termMonths: Duration of the agreement in months",
            "fees: Fee amount if any (often null for design partner programs)",
            "governingLaw: US state name",
            "jurisdiction: City/county and state",
            "party1 (Provider) and party2 (Partner): printName, title, company, noticeAddress",
        ],
    },
    "sla.md": {
        "name": "Service Level Agreement",
        "fields_desc": [
            "cloudServiceName: Name of the cloud service this SLA covers",
            "uptimePercentage: Target uptime percentage (e.g. '99.9%')",
            "responseTimeCriticalHours: Response time for critical issues in hours",
            "responseTimeHighHours: Response time for high-priority issues in hours",
            "responseTimeMediumHours: Response time for medium-priority issues in hours",
            "serviceCreditPercentage: Service credit percentage for downtime violations",
            "governingLaw: US state name",
            "party1 (Provider) and party2 (Customer): printName, title, company, noticeAddress",
        ],
    },
    "psa.md": {
        "name": "Professional Services Agreement",
        "fields_desc": [
            "servicesDescription: Description of the professional services to be provided",
            "deliverables: List of deliverables",
            "effectiveDate: Agreement start date (ISO YYYY-MM-DD)",
            "fees: Fee amount and payment structure",
            "paymentProcess: Payment terms (e.g. 'Net 30', 'milestone-based')",
            "governingLaw: US state name",
            "jurisdiction: City/county and state",
            "party1 (Provider/Consultant) and party2 (Customer/Client): printName, title, company, noticeAddress",
        ],
    },
    "DPA.md": {
        "name": "Data Processing Agreement",
        "fields_desc": [
            "dataTypes: Types of personal data being processed",
            "processingPurpose: Purpose of the data processing",
            "effectiveDate: Agreement start date (ISO YYYY-MM-DD)",
            "governingLaw: US state name",
            "jurisdiction: City/county and state",
            "party1 (Controller/Customer) and party2 (Processor/Provider): printName, title, company, noticeAddress",
        ],
    },
    "Software-License-Agreement.md": {
        "name": "Software License Agreement",
        "fields_desc": [
            "softwareName: Name of the software being licensed",
            "licenseType: 'perpetual' or 'subscription'",
            "effectiveDate: Agreement start date (ISO YYYY-MM-DD)",
            "fees: License fee amount",
            "termMonths: Term in months (for subscription licenses)",
            "governingLaw: US state name",
            "jurisdiction: City/county and state",
            "party1 (Licensor) and party2 (Licensee): printName, title, company, noticeAddress",
        ],
    },
    "Partnership-Agreement.md": {
        "name": "Partnership Agreement",
        "fields_desc": [
            "partnershipPurpose: Purpose and scope of the partnership",
            "revenueSharePercent: Revenue sharing percentage or arrangement",
            "effectiveDate: Agreement start date (ISO YYYY-MM-DD)",
            "termMonths: Duration of the partnership in months",
            "governingLaw: US state name",
            "jurisdiction: City/county and state",
            "party1 (Company 1) and party2 (Company 2): printName, title, company, noticeAddress",
        ],
    },
    "Pilot-Agreement.md": {
        "name": "Pilot Agreement",
        "fields_desc": [
            "pilotScope: Description of what is being piloted/evaluated",
            "pilotDurationDays: Duration of the pilot in days",
            "successCriteria: Criteria for evaluating pilot success",
            "fees: Pilot fee if any (often null for free pilots)",
            "effectiveDate: Pilot start date (ISO YYYY-MM-DD)",
            "governingLaw: US state name",
            "jurisdiction: City/county and state",
            "party1 (Provider) and party2 (Customer): printName, title, company, noticeAddress",
        ],
    },
    "BAA.md": {
        "name": "Business Associate Agreement",
        "fields_desc": [
            "phiTypes: Types of protected health information (PHI) involved",
            "processingPurpose: Purpose for which the business associate processes PHI",
            "effectiveDate: Agreement start date (ISO YYYY-MM-DD)",
            "governingLaw: US state name",
            "jurisdiction: City/county and state",
            "party1 (Covered Entity) and party2 (Business Associate): printName, title, company, noticeAddress",
        ],
    },
    "AI-Addendum.md": {
        "name": "AI Addendum",
        "fields_desc": [
            "aiServiceDescription: Description of the AI/ML service or model",
            "inputOutputOwnership: Who owns the inputs and outputs (e.g. 'Customer owns all inputs and outputs')",
            "effectiveDate: Addendum effective date (ISO YYYY-MM-DD)",
            "governingLaw: US state name",
            "jurisdiction: City/county and state",
            "party1 (Provider) and party2 (Customer): printName, title, company, noticeAddress",
        ],
    },
}

_CATALOG_LIST = "\n".join(f"- {v['name']} (type: {k})" for k, v in CATALOG.items())

GENERIC_SYSTEM_PROMPT = f"""You are a legal document assistant. You help users create legal agreements.

Supported document types:
{_CATALOG_LIST}

Ask the user which type of document they need, or identify it from their message. If they ask for a document NOT in the list above (e.g. employment contract, lease, will), explain that it is not currently supported and suggest the closest match from the list above.

Once the document type is determined, set doc_type to the type identifier (e.g. "Mutual-NDA.md") and begin collecting the required information for that document.

Always respond with a JSON object:
1. "message": your conversational reply
2. "doc_type": the document type identifier once known, or null if not yet determined
3. "fields": any information already gathered (null for unknown fields)"""


def _make_doc_prompt(doc_type: str) -> str:
    config = CATALOG[doc_type]
    fields_str = "\n".join(f"- {f}" for f in config["fields_desc"])
    return f"""You are a legal document assistant helping a user complete a {config['name']}.

Have a natural, friendly conversation to gather these fields:
{fields_str}

Ask naturally — you can cover multiple fields at once and follow up on partial answers. When all required fields are collected, confirm the document is ready for review.

Always respond with a JSON object:
1. "message": your conversational reply
2. "doc_type": "{doc_type}"
3. "fields": all information gathered so far (null for unknown fields)"""


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    doc_type: str | None = None


class PartyFields(BaseModel):
    printName: str | None = None
    title: str | None = None
    company: str | None = None
    noticeAddress: str | None = None


class DocumentFields(BaseModel):
    # Common across most document types
    effectiveDate: str | None = None
    governingLaw: str | None = None
    jurisdiction: str | None = None
    party1: PartyFields | None = None
    party2: PartyFields | None = None

    # NDA / NDA Cover Page
    purpose: str | None = None
    mndaTermType: Literal["expires", "until-terminated"] | None = None
    mndaTermYears: int | None = None
    confidentialityTermType: Literal["years", "perpetuity"] | None = None
    confidentialityTermYears: int | None = None
    modifications: str | None = None

    # CSA / SLA / Pilot
    cloudServiceName: str | None = None
    subscriptionPeriodMonths: int | None = None
    fees: str | None = None
    paymentProcess: str | None = None

    # SLA
    uptimePercentage: str | None = None
    responseTimeCriticalHours: str | None = None
    responseTimeHighHours: str | None = None
    responseTimeMediumHours: str | None = None
    serviceCreditPercentage: str | None = None

    # PSA
    servicesDescription: str | None = None
    deliverables: str | None = None

    # DPA / BAA
    dataTypes: str | None = None
    processingPurpose: str | None = None
    phiTypes: str | None = None

    # Software License
    softwareName: str | None = None
    licenseType: str | None = None

    # Partnership
    partnershipPurpose: str | None = None
    revenueSharePercent: str | None = None

    # Pilot
    pilotScope: str | None = None
    pilotDurationDays: int | None = None
    successCriteria: str | None = None

    # Design Partner
    programDescription: str | None = None

    # AI Addendum
    aiServiceDescription: str | None = None
    inputOutputOwnership: str | None = None

    # Shared term field (Design Partner, Software, Partnership)
    termMonths: int | None = None


class ChatResponse(BaseModel):
    message: str
    doc_type: str | None = None
    fields: DocumentFields


@router.post("", response_model=ChatResponse)
async def chat(body: ChatRequest, current_user: User = Depends(get_current_user)):
    if body.doc_type and body.doc_type in CATALOG:
        system_prompt = _make_doc_prompt(body.doc_type)
    else:
        system_prompt = GENERIC_SYSTEM_PROMPT

    messages = [{"role": "system", "content": system_prompt}]
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
