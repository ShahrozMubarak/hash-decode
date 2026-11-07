import {homeRequest,stampHtml} from './home-cache';
import handler from "vinext/server/fetch-handler";
import { runWithConnectorBinding } from "../lib/connector-context";
import type { ConnectorBinding } from "../lib/connector-contract.mjs";

const worker = {
  async fetch(request: Request, env: Cloudflare.Env, ctx: ExecutionContext<{ CONNECTORS?: ConnectorBinding }>) {
    let binding = ctx.props?.CONNECTORS;
    // Local preview emulates the same request-scoped capability. This branch and
    // the auxiliary service binding are absent from production builds.
    if (import.meta.env.DEV && !binding && env.CONNECTORS) {
      const preview = env.CONNECTORS;
      const expiresAt = Date.now() + 60_000;
      binding = {
        async getContext() {
          if (Date.now() >= expiresAt) return { status: "request_context_expired" };
          return preview.getContext?.() ?? { status: "binding_unavailable" };
        },
        async invoke(connectorId, actionName, args) {
          if (Date.now() >= expiresAt) {
            return { status: "request_context_expired", message: "This request has expired. Please try again." };
          }
          return preview.invoke(connectorId, actionName, args);
        },
      };
    }
    const bindings = env as unknown as Record<string,string>;
    const turnstile = bindings.TURNSTILE_SECRET && bindings.TURNSTILE_SITE_KEY ? ' https://challenges.cloudflare.com' : '';
    const newNonce=()=>btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(18))));
    const nonce=newNonce();
    const policyFor=(nonce:string)=> [ "default-src 'self'", "script-src 'self' 'nonce-"+nonce+"'"+turnstile,
      "style-src 'self' 'unsafe-inline'", "img-src 'self' https: data:", "font-src 'self'",
      "connect-src 'self'"+turnstile, "frame-src "+(turnstile.trim()||"'none'"),
      "frame-ancestors 'none'", "object-src 'none'", "base-uri 'none'", "form-action 'self'" ].join('; ');
    const policy=policyFor(nonce);
    const url=new URL(request.url);
    const cacheHome=!import.meta.env.DEV && Boolean(bindings.SITE_ORIGIN) && homeRequest(request);
    const storedKey=new Request(new URL('/__studio-html/'+import.meta.env.VITE_STUDIO_RELEASE,url.origin));
    const store=cacheHome ? (caches as CacheStorage & {default:Cache}).default : null;
    const forwarded=cacheHome?new Request(url.origin+'/',{headers:{Accept:'text/html'}}):new Request(request);
    const renderNonce=cacheHome?newNonce():nonce;
    forwarded.headers.delete('Content-Security-Policy-Report-Only');
    forwarded.headers.set('Content-Security-Policy',policyFor(renderNonce));
    let original=store?await store.match(storedKey).catch(()=>undefined):undefined;
    let sourceNonce=original?.headers.get('X-Studio-Template-Nonce')||renderNonce;
    if(!original){
      original=await runWithConnectorBinding(binding, () => handler.fetch(forwarded, env, ctx));
      if(!original)return new Response("Page temporarily unavailable.",{status:503});
      sourceNonce=renderNonce;
      if(store&&original.ok&&original.headers.get('Content-Type')?.includes('text/html')&&!original.headers.has('Set-Cookie')){
        const stored=new Response(original.clone().body,original);
        stored.headers.set('Cache-Control','public, max-age=300');
        stored.headers.set('X-Studio-Template-Nonce',sourceNonce);
        stored.headers.delete('Vary');
        ctx.waitUntil(store.put(storedKey,stored).catch(()=>undefined));
      }
    }
    if(cacheHome&&original.headers.get('Content-Type')?.includes('text/html'))original=stampHtml(original,sourceNonce,nonce);
    const response = new Response(original.body, original);
    response.headers.delete("X-Studio-Template-Nonce");
    response.headers.delete("ETag");
    const path = new URL(request.url).pathname;
    response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    if (new URL(request.url).protocol === "https:") response.headers.set("Strict-Transport-Security", "max-age=31536000");
    if (path.startsWith("/admin") || path.startsWith("/api/")) {
      response.headers.set("Cache-Control", "private, no-store");
      response.headers.set("X-Robots-Tag", "noindex, nofollow");
    }
    if (response.headers.get("Content-Type")?.includes("text/html") && !import.meta.env.DEV) {
      response.headers.set("Content-Security-Policy", policy);
      response.headers.set("Cache-Control","private, no-store");
    }
    return response;
  },
};

export default worker;
