import { z } from "zod";

export class ApiResponseError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(message: string, status: number, body: unknown = null) {
    super(message);
    this.name = "ApiResponseError";
    this.status = status;
    this.body = body;
  }
}

export class ApiParseError extends Error {
  readonly issues: z.ZodIssue[];

  constructor(message: string, issues: z.ZodIssue[] = []) {
    super(message);
    this.name = "ApiParseError";
    this.issues = issues;
  }
}

type ParseJsonOptions = {
  fallbackMessage?: string;
};

function detailFromBody(body: unknown, fallbackMessage: string): string {
  if (
    body &&
    typeof body === "object" &&
    "detail" in body &&
    typeof (body as { detail: unknown }).detail === "string"
  ) {
    return (body as { detail: string }).detail;
  }
  return fallbackMessage;
}

/**
 * Parse a fetch Response with a Zod schema.
 * Replaces `response.json() as Promise<T>` on BFF API clients.
 */
export async function parseJson<Schema extends z.ZodTypeAny>(
  schema: Schema,
  response: Response,
  options: ParseJsonOptions = {},
): Promise<z.infer<Schema>> {
  const fallbackMessage = options.fallbackMessage ?? "Request failed";

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new ApiResponseError(detailFromBody(body, fallbackMessage), response.status, body);
  }

  if (response.status === 204) {
    const parsed = schema.safeParse(undefined);
    if (!parsed.success) {
      throw new ApiParseError("Expected empty response", parsed.error.issues);
    }
    return parsed.data;
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new ApiParseError("Response body is not valid JSON");
  }

  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    throw new ApiParseError("Invalid API response shape", parsed.error.issues);
  }
  return parsed.data;
}

/** Convenience for DELETE / 204 endpoints. */
export async function parseEmpty(
  response: Response,
  options: ParseJsonOptions = {},
): Promise<void> {
  await parseJson(z.undefined(), response, options);
}
