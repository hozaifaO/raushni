import { z } from "zod";
import { ApiParseError, ApiResponseError, parseEmpty, parseJson } from "@/lib/validation/parseJson";
import { memberSchema } from "@/lib/validation/member";

type MockResponseInit = {
  status?: number;
  headers?: Record<string, string>;
};

/** Minimal Response stand-in for jsdom (no native Fetch Response). */
function mockResponse(body: string | null, init: MockResponseInit = {}): Response {
  const status = init.status ?? 200;
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 204 ? "No Content" : "OK",
    headers: new Headers(init.headers),
    json: async () => {
      if (body == null || body === "") {
        throw new SyntaxError("Unexpected end of JSON input");
      }
      return JSON.parse(body) as unknown;
    },
    text: async () => body ?? "",
  } as unknown as Response;
}

function jsonResponse(body: unknown, init: MockResponseInit = {}) {
  return mockResponse(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
    ...init,
  });
}

const validMember = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  full_name: "Aisha Khan",
  email: "aisha@example.org",
  phone: "+91 9876543210",
  role: "Volunteer",
  status: "active",
  joined_on: "2026-05-17",
  address: null,
  emergency_contact: null,
  notes: null,
  created_at: "2026-05-17T10:00:00Z",
  updated_at: "2026-05-17T10:00:00Z",
};

describe("parseJson", () => {
  it("parses a valid response body", async () => {
    const result = await parseJson(memberSchema, jsonResponse(validMember));
    expect(result.full_name).toBe("Aisha Khan");
  });

  it("throws ApiParseError on malformed shape", async () => {
    const response = jsonResponse({ id: "not-uuid", full_name: 123 });
    await expect(parseJson(memberSchema, response)).rejects.toBeInstanceOf(ApiParseError);
  });

  it("throws ApiParseError when body is not JSON", async () => {
    const response = mockResponse("not-json", {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
    await expect(parseJson(memberSchema, response)).rejects.toBeInstanceOf(ApiParseError);
  });

  it("throws ApiResponseError on non-ok responses", async () => {
    const response = jsonResponse({ detail: "Not found" }, { status: 404 });
    await expect(parseJson(memberSchema, response)).rejects.toMatchObject({
      name: "ApiResponseError",
      message: "Not found",
      status: 404,
    } satisfies Partial<ApiResponseError>);
  });

  it("parseEmpty accepts 204", async () => {
    const response = mockResponse(null, { status: 204 });
    await expect(parseEmpty(response)).resolves.toBeUndefined();
  });

  it("rejects unexpected fields that break the schema", async () => {
    const strict = z.object({ id: z.string().uuid() });
    await expect(parseJson(strict, jsonResponse({ id: "bad" }))).rejects.toThrow(
      /Invalid API response shape/,
    );
  });
});
