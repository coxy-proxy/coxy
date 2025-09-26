export default function GetStartedSection() {
  return (
    <section id="get-started" className="max-w-7xl mx-auto px-4 py-16 md:py-24">
      <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Getting Started</h2>
      <div className="space-y-10 text-foreground/90">
        <div>
          <h3 className="text-2xl font-semibold mb-3">1. Installation</h3>
          <p className="mb-2">Option 1: Use Docker</p>
          <pre className="rounded-xl border bg-card p-4 overflow-x-auto">
            <code className="text-sm font-mono">docker run -p 3000:3000 ghcr.io/coxy-proxy/coxy:latest</code>
          </pre>
          <p className="mt-4 mb-2">Option 2: Use pnpx (recommended) or npx</p>
          <pre className="rounded-xl border bg-card p-4 overflow-x-auto">
            <code className="text-sm font-mono">pnpx coxy</code>
          </pre>
        </div>
        <div>
          <h3 className="text-2xl font-semibold mb-3">2. Setup</h3>
          <p>
            Browse <code className="rounded bg-muted px-1 py-0.5 text-xs">http://localhost:3000</code> to generate or
            add tokens manually. Set a default token from the admin UI.
          </p>
        </div>
        <div>
          <h3 className="text-2xl font-semibold mb-3">3. Quick Test Example</h3>
          <p className="mb-2">
            Your OpenAI-compatible API base URL is{' '}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">http://localhost:3000/api</code>. Test it with curl:
          </p>
          <pre className="rounded-xl border bg-card p-4 overflow-x-auto">
            <code className="text-sm font-mono">{`curl --request POST --url http://localhost:3000/api/chat/completions --header 'content-type: application/json' --data '{"model": "gpt-4","messages": [{"role": "user", "content": "Hi"}]}'`}</code>
          </pre>
        </div>
      </div>
    </section>
  );
}
