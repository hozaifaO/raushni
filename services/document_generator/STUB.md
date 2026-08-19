# STUB — not production

Standalone PDF/document microservice placeholder. Production documents today are
HTML + browser print via the FastAPI app / frontend generators.

Wire this service only when you need server-side PDF bytes (email attachments,
archival). Application code should call `app.services.pdf_service.PdfService`
first; that stub can later HTTP to this service or render in-process (reportlab).

Planned routes (not implemented):
  POST /generate/member-card
  POST /generate/donation-receipt
  POST /generate/appointment-letter
  POST /generate/certificate

Do not deploy until authenticated and implemented.
