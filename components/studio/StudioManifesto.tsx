'use client';

export default function StudioManifesto() {
  return (
    <section className="studio-manifesto-section" aria-label="Hash Decode Studio Policies & Engineering Standards">
      <div className="wrap studio-manifesto-wrap">
        <div className="manifesto-white-card" data-reveal="up">
          <div className="manifesto-body">
            <p className="manifesto-simple-text">
              Every software platform, custom API, database schema, container configuration, and infrastructure script created by Hash Decode is the irrevocable, exclusive intellectual property of the client. Upon project milestone delivery, all git repositories, deployment pipelines, container registry artifacts, and cryptographic credentials are unconditionally transferred to your organization. Hash Decode retains zero licensing rights, claims zero recurring code royalties, and embeds zero hidden vendor lock-in mechanisms. Your technical team receives clean, fully typed codebases built to industry open-source standards that any qualified software engineer can audit, run, maintain, and expand without our involvement.
            </p>

            <p className="manifesto-simple-text">
              Defensive resilience is not treated as an afterthought or a last-minute pre-release checklist. Every system engineered at Hash Decode undergoes continuous threat modeling and offensive penetration testing across all layers of the stack. We audit against the full OWASP Top 10 web and API vulnerability vectors, including SQL/NoSQL injection, broken object-level authorization (BOLA), cross-site scripting (XSS), server-side request forgery (SSRF), insecure deserialization, and cryptographic key exposures. Independent security review engagements include authenticated testing, verified proof-of-concept exploits, actionable remediation blueprints, and a complimentary verification retest to confirm every discovered vulnerability has been permanently resolved.
            </p>

            <p className="manifesto-simple-text">
              Client privacy and commercial trust form the cornerstone of our studio practice. Prior to reviewing architectural schematics, accessing proprietary staging environments, or discussing confidential domain logic, Hash Decode executes strict bilateral Non-Disclosure Agreements. All client data, application source code, API keys, and business telemetry are handled exclusively within encrypted, multi-factor hardware-authenticated vaults on air-gapped, zero-trust infrastructure. We maintain zero-knowledge access hygiene and never disclose client identities, proprietary methodologies, or confidential performance metrics without explicit, written stakeholder consent.
            </p>

            <p className="manifesto-simple-text">
              We take personal accountability for every line of code we deliver into production. Every web application, cloud backend, and bespoke software platform shipped by our studio is backed by a 30-day dedicated post-launch engineering warranty. In the rare event that a defect, edge-case failure, or performance regression within the agreed delivery scope emerges, our lead systems engineers address and remediate it with priority response times at zero additional cost to your business. We maintain continuous telemetry, distributed error tracking, and automated synthetic health monitors to guarantee smooth commercial operations throughout your production release.
            </p>

            <p className="manifesto-simple-text">
              We deliberately avoid closed proprietary runtimes, monolithic cloud traps, and restrictive black-box platforms designed to extract high recurring fees. All systems developed at Hash Decode are architected on portable, open-standard cloud primitives, standardized OCI/Docker container images, typed TypeScript/Node.js or Python runtimes, and open-source relational or document databases (PostgreSQL, MongoDB Atlas). Your infrastructure is designed to run interchangeably across Cloudflare Workers, AWS, GCP, Azure, or private bare metal, granting your business permanent sovereign flexibility to scale compute or negotiate provider pricing as your operational needs evolve.
            </p>

            <p className="manifesto-simple-text">
              Hash Decode operates strictly as an independent engineering atelier. We do not employ account managers, junior ticket routers, or offshore outsourcing subcontractors. When you partner with Hash Decode, you collaborate directly with the senior systems architects, product designers, and penetration testers who design, code, and deploy your software. This direct line of communication eliminates lost context, prevents architectural drift, and ensures that complex technical requirements are executed with mathematical precision and uncompromising velocity.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
