import "server-only";

import { UPSTREAM_TIMEOUT_MS } from "./config";
import type { UpstreamFailureKind } from "./types";

export class UpstreamError extends Error {
  constructor(
    message: string,
    public readonly kind: UpstreamFailureKind,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "UpstreamError";
  }
}

type UpstreamOptions = {
  revalidate: number;
  accept?: "json" | "html";
};

function classify(error: unknown): UpstreamError {
  if (error instanceof UpstreamError) return error;
  if (error instanceof DOMException && error.name === "TimeoutError") {
    return new UpstreamError("ChiBox timed out", "timeout");
  }
  return new UpstreamError(
    error instanceof Error ? error.message : "ChiBox could not be reached",
    "network",
  );
}

function canRetry(error: UpstreamError) {
  return (
    error.kind === "timeout" ||
    error.kind === "network" ||
    error.kind === "server"
  );
}

async function oneAttempt<T>(
  url: string,
  { revalidate, accept = "json" }: UpstreamOptions,
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(url, {
      headers: {
        accept:
          accept === "json"
            ? "application/json"
            : "text/html,application/xhtml+xml",
        "user-agent": "Chippix/1.0 (+catalog mirror)",
      },
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
      next: { revalidate },
    });
  } catch (error) {
    throw classify(error);
  }

  if (!response.ok) {
    throw new UpstreamError(
      `ChiBox returned ${response.status}`,
      response.status >= 500 ? "server" : "client",
      response.status,
    );
  }

  try {
    return (accept === "json"
      ? await response.json()
      : await response.text()) as T;
  } catch {
    throw new UpstreamError("ChiBox returned an invalid response", "invalid");
  }
}

export async function fetchUpstream<T>(
  url: string,
  options: UpstreamOptions,
): Promise<T> {
  try {
    return await oneAttempt<T>(url, options);
  } catch (firstError) {
    const failure = classify(firstError);
    if (!canRetry(failure)) throw failure;
    await new Promise((resolve) => setTimeout(resolve, 250));
    try {
      return await oneAttempt<T>(url, options);
    } catch (secondError) {
      const finalFailure = classify(secondError);
      console.error(
        `[Chippix] Upstream ${finalFailure.kind} failure after retry for ${new URL(url).pathname}${finalFailure.status ? ` (${finalFailure.status})` : ""}`,
      );
      throw finalFailure;
    }
  }
}
