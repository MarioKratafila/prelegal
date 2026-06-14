# Prelegal Project

## Overview

This is a SaaS product to allow users to draft legal agreements based on templates in the templates directory.
The user can carry out AI chat in order to establish what document they want and how to fill in the fields.
The available documents are covered in the catalog.json file in the project root, included here:

@catalog.json

The catalog contains 12 document types. The V1 foundation is live with user authentication. AI chat for all 12 document types is implemented. Document history (save/load/delete drafts) is implemented. Document generation (PDF output) is not yet implemented.

## Development process

When instructed to build a feature:
1. Use your Atlassian tools to read the feature instructions from Jira
2. Develop the feature - do not skip any step from the feature-dev 7 step process
3. Thoroughly test the feature with unit tests and integration tests and fix any issues
4. Submit a PR using your github tools

## AI design

When writing code to make calls to LLMs, use your Cerebras skill to use LiteLLM via OpenRouter to the `openrouter/openai/gpt-oss-120b:free` model with Cerebras as the inference provider. You should use Structured Outputs so that you can interpret the results and populate fields in the legal document.

There is an OPENROUTER_API_KEY in the .env file in the project root.

## Technical design

The entire project should be packaged into a Docker container.  
The backend should be in backend/ and be a uv project, using FastAPI.  
The frontend should be in frontend/  
The database uses SQLite (aiosqlite + SQLAlchemy async), created fresh on container startup, with a `users` table for auth and a `documents` table for saving draft documents per user.  
The frontend is statically exported (`next export`) and served by FastAPI via `StaticFiles`.  
There should be scripts in scripts/ for:  
```bash
# Mac
scripts/start-mac.sh    # Start
scripts/stop-mac.sh     # Stop

# Linux
scripts/start-linux.sh
scripts/stop-linux.sh

# Windows
scripts/start-windows.ps1
scripts/stop-windows.ps1
```
Backend available at http://localhost:8000

## What's implemented (as of PL-7)

- **Backend**: FastAPI uv project (`backend/`), async SQLAlchemy + aiosqlite SQLite DB, JWT auth (python-jose + passlib/bcrypt), endpoints: `POST /api/auth/signup`, `POST /api/auth/login`, `GET /api/auth/me`
- **Frontend**: Next.js static export served by FastAPI; React AuthContext with localStorage JWT; login (`/login/`) and signup (`/signup/`) pages; home page redirects unauthenticated users to login
- **Infrastructure**: Multi-stage Dockerfile (node:20-slim builds frontend, python:3.12-slim runs backend), start/stop scripts for Mac/Linux/Windows
- **Tests**: 6 backend unit tests in `backend/tests/` covering signup, duplicate email, login, wrong password, me endpoint, unauthenticated access

## What's implemented (as of PL-8)

- **AI Chat backend**: `POST /api/chat` (auth-protected) in `backend/routes/chat.py`; calls LiteLLM `acompletion` via OpenRouter (Cerebras, `openrouter/openai/gpt-oss-120b:free`) with a `ChatResponse` structured output containing `message` and `NdaFields`
- **AI Chat frontend**: `frontend/src/components/ChatPanel.tsx` — bubble-layout chat UI with auto-scroll, loading state, and field merge logic; replaces the old `NdaForm` on the home page
- **API client**: `ChatMessage`, `NdaFieldsResponse`, `ChatResponse` types and `api.chat()` method added to `frontend/src/lib/api.ts`
- **Tests**: 4 backend unit tests in `backend/tests/test_chat.py` covering happy path, field extraction, unauthenticated access, and empty message list

## What's implemented (as of PL-9)

- **Multi-document chat backend**: `POST /api/chat` now accepts `doc_type: str | None` in the request; a `CATALOG` registry maps each of the 12 document filenames to a tailored system prompt; a generic system prompt is used when no `doc_type` is provided, prompting the AI to help the user choose from all supported types and gracefully declining unsupported document requests
- **Unified `DocumentFields` model**: Single Pydantic model in `backend/routes/chat.py` with all fields across all 12 document types (all optional); `ChatResponse` now includes `doc_type: str | None`
- **Generic chat frontend**: `ChatPanel.tsx` updated to accept `docType` / `onDocTypeChange` props; sends `doc_type` with each request; generic field-merge loop handles any document type; initial greeting message is now document-type-agnostic
- **Multi-document preview**: `page.tsx` tracks `docType` state and updates the header title dynamically; renders `NdaPreview` for Mutual NDA types, `GenericDocumentPreview` for all other document types
- **`GenericDocumentPreview` component**: New `frontend/src/components/GenericDocumentPreview.tsx`; displays collected fields as a formatted key-value list with human-readable labels; shows party1/party2 sections when populated
- **Updated API client**: `DocumentFieldsResponse` type covers all 12 document types; `api.chat()` accepts optional `docType` parameter
- **Tests**: 6 backend unit tests in `backend/tests/test_chat.py` covering generic prompt selection, NDA field extraction, CSA field extraction, unauthenticated access, generic vs. doc-specific system prompt routing

## What's implemented (as of PL-10)

- **Document history backend**: `Document` model added to `backend/models.py` (fields: `id`, `user_id` FK, `doc_type`, `title`, `fields_json`, `created_at`, `updated_at`); new router `backend/routes/documents.py` with `GET /api/documents`, `POST /api/documents`, `GET /api/documents/{id}`, `DELETE /api/documents/{id}` — all auth-protected and scoped to the requesting user
- **Document history frontend**: `DocumentHistory.tsx` sidebar (220px) shows saved drafts with relative timestamps, active highlight, and delete button; integrated into `page.tsx` to the left of the chat panel; "Save draft" button in the header saves current `doc_type` + `formData`; loading a history item remounts ChatPanel (via `key` prop) to reset chat state
- **Draft disclaimer**: Yellow banner at the bottom of the document preview area: "Draft only. This document is a draft for review purposes only. It is not legal advice and must be reviewed by a qualified attorney before use."
- **UI polish**: Login/signup pages updated with "Prelegal" brand dot + wordmark and improved taglines; header refined with tighter spacing and Save Draft button; history sidebar uses brand blue for active selection indicator
- **API client**: `DocumentResponse` type and `api.listDocuments()`, `api.saveDocument()`, `api.deleteDocument()` added to `frontend/src/lib/api.ts`
- **Tests**: 6 backend tests in `backend/tests/test_documents.py` covering empty list, save+list, get-by-id, delete, unauthenticated access (401), and cross-user access isolation (404)

## Color Scheme
- Accent Yellow: `#ecad0a`
- Blue Primary: `#209dd7`
- Purple Secondary: `#753991` (submit buttons)
- Dark Navy: `#032147` (headings)
- Gray Text: `#888888`