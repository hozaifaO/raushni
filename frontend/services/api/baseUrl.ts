export function getApiBaseUrl() {
  if (typeof window !== "undefined") {
    return "";
  }
  return process.env.NEXT_PUBLIC_PYTHON_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
}
