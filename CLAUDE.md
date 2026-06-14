# Prelegal Project

## Overview

This is a SaaS product to allow users to draft legal agreements based on templates in the templates directory.
The user can carry out AI chat in order to establish what document they want and how to fill in the fields.
The available documents are covered in the catalog.json file in the project root, included here:

@catalog.json

The catalog contains 12 document types. The V1 foundation is live with user authentication. AI chat for all 12 document types is implemented. Document generation is not yet implemented.

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
The database uses SQLite (aiosqlite + SQLAlchemy async), created fresh on container startup, with a `users` table for sign up and sign in.  
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

## Color Scheme
- Accent Yellow: `#ecad0a`
- Blue Primary: `#209dd7`
- Purple Secondary: `#753991` (submit buttons)
- Dark Navy: `#032147` (headings)
- Gray Text: `#888888`