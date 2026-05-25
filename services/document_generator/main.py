from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

from telemetry import configure_telemetry

app = FastAPI(title="Raushni Document Service")
configure_telemetry(app)

# Configure CORS
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
        "service": "Raushni Document Generator",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "document-generator",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/generate-test")
async def generate_test():
    return {
        "message": "Document generation service is ready",
        "endpoints": [
            "/generate/member-card",
            "/generate/donation-receipt",
            "/generate/appointment-letter",
            "/generate/certificate"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
