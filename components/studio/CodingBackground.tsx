'use client';
import { useEffect, useRef } from 'react';

const codeStreams = [
  [
    '// Hash Decode Core Systems',
    'import { verifySignature, createKeypair } from "@/crypto";',
    'import { ZeroTrustBoundary, ShieldEngine } from "@studio/core";',
    '',
    'export async function auditSurface(target: TargetDomain) {',
    '  const handshake = await tls.connect(target.port, target.host);',
    '  const cipherSuite = handshake.getCipher();',
    '  if (!cipherSuite.isResilient) {',
    '    throw new SecurityVulnerability("WEAK_CIPHER_SUITE");',
    '  }',
    '  const boundary = new ZeroTrustBoundary({',
    '    strictOrigin: true,',
    '    sessionIsolation: true,',
    '    rateLimit: 120, // req/min',
    '    replayAttackProtection: "STRICT_NONCE",',
    '  });',
    '  return boundary.verifyTokens(handshake.rawHeaders);',
    '}',
    '',
    '// Automated Penetration Pipeline',
    'export const pipeline = new ShieldEngine({',
    '  engine: "hybrid-probe",',
    '  autoMitigate: true,',
    '  alertChannel: "ops-emergency",',
    '});',
  ],
  [
    '// 3D Eva Autonomous Agent Runtime',
    'interface AgentRuntimeConfig {',
    '  model: "eva-autonomous-agent";',
    '  vision: { resolution: "4K", eyes: "grok-animated" };',
    '  telemetry: { heartbeat: 60, status: "autonomous" };',
    '  securityLevel: 0xDEADBEEF;',
    '}',
    '',
    'class EvaNeuralLoop {',
    '  private saccadeTimer = 0;',
    '  private nextBlink = 3.2;',
    '  private currentPupil = { x: 0, y: 0 };',
    '',
    '  public update(delta: number, gaze: Vector3) {',
    '    this.saccadeTimer += delta;',
    '    if (this.saccadeTimer > this.nextBlink) {',
    '      this.triggerOrganicBlink();',
    '      this.nextBlink = 2.5 + Math.random() * 3.0;',
    '    }',
    '    this.lookToward(gaze.x * 0.15, gaze.y * 0.12);',
    '    return this.renderOledVisor();',
    '  }',
    '}',
  ],
  [
    '// High-Throughput Edge Pipeline',
    'export async function handleStream(req: Request) {',
    '  const auth = req.headers.get("authorization");',
    '  const verified = await verifyOwnerSession(auth);',
    '  if (!verified.allowed) return Response.json({ status: 401 });',
    '',
    '  const transformStream = new TransformStream({',
    '    transform(chunk, controller) {',
    '      const encrypted = sealChunk(chunk, verified.key);',
    '      controller.enqueue(encrypted);',
    '    }',
    '  });',
    '  return new Response(req.body?.pipeThrough(transformStream), {',
    '    headers: {',
    '      "X-Content-Type-Options": "nosniff",',
    '      "Content-Security-Policy": "default-src \'self\'",',
    '      "Cache-Control": "private, no-cache, no-store",',
    '    }',
    '  });',
    '}',
  ],
  [
    '// MongoDB Atlas Distributed Sync',
    'export async function syncInquiryOrder(order: StudioOrder) {',
    '  const db = await getMongoDb();',
    '  const session = db.client.startSession();',
    '  try {',
    '    await session.withTransaction(async () => {',
    '      await db.collection("orders").updateOne(',
    '        { orderId: order.id },',
    '        { $set: { ...order, updatedAt: new Date() } },',
    '        { upsert: true, session }',
    '      );',
    '      await emitTelemetryEvent("order_synced", order.id);',
    '    });',
    '  } finally {',
    '    await session.endSession();',
    '  }',
    '}',
  ],
];

export default function CodingBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const el = containerRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight;
        // Parallax scroll factor based on element position relative to viewport
        const progress = (vh - rect.top) / (vh + rect.height);
        const yOffset = (progress - 0.5) * 160;

        const cols = el.querySelectorAll<HTMLElement>('.code-stream-col');
        cols.forEach((col, i) => {
          const speed = (i % 2 === 0 ? 1 : -1) * (0.8 + (i * 0.3));
          col.style.transform = `translate3d(0, ${yOffset * speed}px, 0)`;
        });
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="coding-bg-canvas" ref={containerRef} aria-hidden="true">
      <div className="code-stream-grid">
        {codeStreams.map((stream, colIdx) => (
          <div className={`code-stream-col col-${colIdx}`} key={colIdx}>
            {/* Double the lines for seamless vertical flow */}
            {[...stream, ...stream].map((line, lineIdx) => {
              const isComment = line.trim().startsWith('//');
              const isKeyword = /^(export|import|const|let|class|interface|private|public|return|if|throw|new|async|await)\b/.test(line.trim());
              return (
                <div
                  key={lineIdx}
                  className={`code-line ${isComment ? 'is-comment' : ''} ${isKeyword ? 'is-keyword' : ''}`}
                >
                  <span className="line-num">{String((lineIdx % stream.length) + 1).padStart(2, '0')}</span>
                  <span className="line-text">{line || ' '}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="coding-bg-vignette" />
    </div>
  );
}
