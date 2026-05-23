const API_BASE_URL =
  process.env.NEXT_PUBLIC_PYTHON_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000";

export function documentQrUrl(data: string) {
  return `${API_BASE_URL}/api/v1/documents/qr.svg?data=${encodeURIComponent(data)}`;
}

export function documentVerificationValue(type: string, id: string) {
  return `raushni:${type}:${id}`;
}
