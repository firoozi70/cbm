export interface Env {
  ASSETS: {
    fetch: (request: Request) => Promise<Response>;
  };
  ENVIRONMENT?: string;
}

// Country code to locale mapping for edge geo-routing
const COUNTRY_LOCALE_MAP: Record<string, string> = {
  // Persian
  IR: "fa",
  AF: "fa",
  // Arabic
  AE: "ar",
  SA: "ar",
  QA: "ar",
  KW: "ar",
  OM: "ar",
  BH: "ar",
  EG: "ar",
  IQ: "ar",
  JO: "ar",
  LB: "ar",
  LY: "ar",
  MA: "ar",
  DZ: "ar",
  TN: "ar",
  SD: "ar",
  YE: "ar",
  SY: "ar",
  // Chinese
  CN: "zh",
  TW: "zh",
  HK: "zh",
  MO: "zh",
  // Russian
  RU: "ru",
  BY: "ru",
  KZ: "ru",
  KG: "ru",
  UZ: "ru",
  TJ: "ru",
  AM: "ru",
  // Spanish
  ES: "es",
  MX: "es",
  AR: "es",
  CO: "es",
  CL: "es",
  PE: "es",
  VE: "es",
  EC: "es",
  GT: "es",
  CU: "es",
  BO: "es",
  DO: "es",
  HN: "es",
  PY: "es",
  SV: "es",
  NI: "es",
  CR: "es",
  PA: "es",
  UY: "es",
  // Turkish
  TR: "tr",
  AZ: "tr",
  // German
  DE: "de",
  AT: "de",
  CH: "de",
  // French
  FR: "fr",
  BE: "fr",
  SN: "fr",
  CI: "fr",
  CM: "fr",
  CD: "fr",
  MG: "fr",
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Extract Cloudflare Edge Geo Telemetry
    const cf = (request as unknown as { cf?: Record<string, unknown> }).cf || {};
    const country = String(cf.country || "US");
    const city = String(cf.city || "Unknown");
    const continent = String(cf.continent || "NA");

    // Language resolution at the edge
    let detectedLocale = "en";
    if (COUNTRY_LOCALE_MAP[country]) {
      detectedLocale = COUNTRY_LOCALE_MAP[country];
    } else {
      const acceptLang = request.headers.get("accept-language") || "";
      if (acceptLang.startsWith("fa")) detectedLocale = "fa";
      else if (acceptLang.startsWith("ar")) detectedLocale = "ar";
      else if (acceptLang.startsWith("zh")) detectedLocale = "zh";
      else if (acceptLang.startsWith("ru")) detectedLocale = "ru";
      else if (acceptLang.startsWith("es")) detectedLocale = "es";
      else if (acceptLang.startsWith("tr")) detectedLocale = "tr";
      else if (acceptLang.startsWith("de")) detectedLocale = "de";
      else if (acceptLang.startsWith("fr")) detectedLocale = "fr";
      else detectedLocale = "en";
    }

    // Serve static asset from the Cloudflare Workers Assets binding
    let response: Response;
    try {
      response = await env.ASSETS.fetch(request);
      // Fallback for 404 on SPA / dynamic query
      if (response.status === 404 && !url.pathname.includes(".")) {
        const rootReq = new Request(new URL("/", url.origin).toString(), request);
        response = await env.ASSETS.fetch(rootReq);
      }
    } catch {
      response = new Response("Not Found", { status: 404 });
    }

    // Clone headers to inject enterprise security and edge geo headers
    const newHeaders = new Headers(response.headers);

    // Strict Security Headers
    newHeaders.set(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'self';"
    );
    newHeaders.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
    newHeaders.set("X-Content-Type-Options", "nosniff");
    newHeaders.set("X-Frame-Options", "SAMEORIGIN");
    newHeaders.set("Referrer-Policy", "strict-origin-when-cross-origin");
    newHeaders.set(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=(), payment=()"
    );

    // Geo Telemetry Headers
    newHeaders.set("X-Geo-Country", country);
    newHeaders.set("X-Geo-City", city);
    newHeaders.set("X-Geo-Continent", continent);
    newHeaders.set("X-Detected-Locale", detectedLocale);

    // Cache control for static assets vs HTML
    if (
      url.pathname.startsWith("/_next/static/") ||
      url.pathname.endsWith(".woff2") ||
      url.pathname.endsWith(".png") ||
      url.pathname.endsWith(".svg")
    ) {
      newHeaders.set("Cache-Control", "public, max-age=31536000, immutable");
    } else {
      newHeaders.set("Cache-Control", "public, max-age=3600, must-revalidate");
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  },
};
