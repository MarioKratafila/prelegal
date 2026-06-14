import json
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from auth import get_current_user
from database import get_db
from models import Document, User

router = APIRouter(prefix="/api/documents", tags=["documents"])

DOC_NAMES: dict[str, str] = {
    "Mutual-NDA.md": "Mutual NDA",
    "Mutual-NDA-coverpage.md": "Mutual NDA Cover Page",
    "CSA.md": "Cloud Service Agreement",
    "design-partner-agreement.md": "Design Partner Agreement",
    "sla.md": "Service Level Agreement",
    "psa.md": "Professional Services Agreement",
    "DPA.md": "Data Processing Agreement",
    "Software-License-Agreement.md": "Software License Agreement",
    "Partnership-Agreement.md": "Partnership Agreement",
    "Pilot-Agreement.md": "Pilot Agreement",
    "BAA.md": "Business Associate Agreement",
    "AI-Addendum.md": "AI Addendum",
}


class SaveDocumentRequest(BaseModel):
    doc_type: str
    fields: dict


class DocumentResponse(BaseModel):
    id: int
    doc_type: str
    title: str
    fields: dict
    created_at: datetime
    updated_at: datetime


@router.get("", response_model=list[DocumentResponse])
async def list_documents(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Document)
        .where(Document.user_id == current_user.id)
        .order_by(Document.updated_at.desc())
    )
    docs = result.scalars().all()
    return [
        DocumentResponse(
            id=d.id,
            doc_type=d.doc_type,
            title=d.title,
            fields=json.loads(d.fields_json),
            created_at=d.created_at,
            updated_at=d.updated_at,
        )
        for d in docs
    ]


@router.post("", response_model=DocumentResponse)
async def save_document(
    body: SaveDocumentRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    title = DOC_NAMES.get(body.doc_type, body.doc_type)
    doc = Document(
        user_id=current_user.id,
        doc_type=body.doc_type,
        title=title,
        fields_json=json.dumps(body.fields),
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)
    return DocumentResponse(
        id=doc.id,
        doc_type=doc.doc_type,
        title=doc.title,
        fields=json.loads(doc.fields_json),
        created_at=doc.created_at,
        updated_at=doc.updated_at,
    )


@router.get("/{doc_id}", response_model=DocumentResponse)
async def get_document(
    doc_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Document).where(Document.id == doc_id, Document.user_id == current_user.id)
    )
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return DocumentResponse(
        id=doc.id,
        doc_type=doc.doc_type,
        title=doc.title,
        fields=json.loads(doc.fields_json),
        created_at=doc.created_at,
        updated_at=doc.updated_at,
    )


@router.delete("/{doc_id}", status_code=204)
async def delete_document(
    doc_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Document).where(Document.id == doc_id, Document.user_id == current_user.id)
    )
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    await db.delete(doc)
    await db.commit()
