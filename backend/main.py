import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from database import init_db
from routes.auth import router as auth_router

load_dotenv()

STATIC_DIR = os.path.join(os.path.dirname(__file__), "..", "frontend", "out")


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(title="Prelegal API", lifespan=lifespan)
app.include_router(auth_router)

# Serve Next.js static export - only mounted when frontend is built
if os.path.isdir(STATIC_DIR):
    app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="static")
