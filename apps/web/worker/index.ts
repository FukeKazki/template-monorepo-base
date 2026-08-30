export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api" || url.pathname.startsWith("/api/")) {
      const forwarded = new URL(request.url);
      forwarded.pathname = url.pathname.replace(/^\/api/, "") || "/";
      return env.API.fetch(new Request(forwarded, request));
    }
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
