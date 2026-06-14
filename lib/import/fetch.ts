const USER_AGENT =
  "GirisimOnlineBot/1.0 (+https://girisimonline.com; startup news aggregator; short excerpts only)";

export async function politeFetch(
  url: string,
  options: {
    timeoutMs?: number;
    accept?: string;
  } = {},
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 10_000);

  try {
    const response = await fetch(url, {
      headers: {
        "user-agent": USER_AGENT,
        accept:
          options.accept ??
          "text/html,application/xhtml+xml,application/rss+xml,application/atom+xml;q=0.9,*/*;q=0.8",
      },
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} for ${url}`);
    }

    return response;
  } finally {
    clearTimeout(timeout);
  }
}

export function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
