"""Stub document-generator service — health only until PDF rendering is implemented.

See STUB.md and backend app.services.pdf_service.
"""

from datetime import datetime

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Raushni Document Service (stub)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {
        "service": "document-generator",
        "status": "stub",
        "message": "Not production. Implement generate routes or use PdfService in the API.",
    }


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "document-generator",
        "mode": "stub",
        "timestamp": datetime.now().isoformat(),
    }


@app.post("/generate/{kind}")
async def generate_stub(kind: str):
    raise HTTPException(
        status_code=501,
        detail=(
            f"PDF generate for {kind!r} is not implemented. "
            "Use browser print today, or implement PdfService / this route."
        ),
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
