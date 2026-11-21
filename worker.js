const UPSTREAM = "https://puppy.instabizweb.com";

function isSnapshotAsset(pathname) {
  return (
    pathname === "/" ||
    pathname === "/index.html" ||
    pathname.startsWith("/_next/static/chunks/") ||
    pathname.startsWith("/media/") ||
    pathname.startsWith("/cursor/") ||
    pathname.startsWith("/cdn-cgi/")
  );
}

export default {
  async fetch(request, env) {
    const incomingUrl = new URL(request.url);

    if (isSnapshotAsset(incomingUrl.pathname)) {
      const localResponse = await env.ASSETS.fetch(request);
      if (localResponse.status !== 404) {
        return localResponse;
      }
    }

    const upstreamUrl = new URL(
      `${incomingUrl.pathname}${incomingUrl.search}`,
      UPSTREAM,
    );
    const headers = new Headers(request.headers);
    for (const name of [
      "authorization",
      "cookie",
      "cf-connecting-ip",
      "host",
      "x-forwarded-host",
      "x-real-ip",
    ]) {
      headers.delete(name);
    }

    if (headers.get("origin") === incomingUrl.origin) {
      headers.set("origin", UPSTREAM);
    }

    const upstreamRequest = new Request(upstreamUrl, {
      method: request.method,
      headers,
      body: ["GET", "HEAD"].includes(request.method) ? undefined : request.body,
      redirect: "follow",
    });

    try {
      const response = await fetch(upstreamRequest);
      const responseHeaders = new Headers(response.headers);
      responseHeaders.delete("set-cookie");
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      });
    } catch (error) {
      console.error("Upstream request failed:", error);
      return new Response("The website origin is temporarily unavailable.", {
        status: 502,
        headers: { "content-type": "text/plain; charset=utf-8" },
      });
    }
  },
};
