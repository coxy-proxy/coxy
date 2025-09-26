import { Card } from '@/shared/ui/components/card';

export default function TroubleshootingSection() {
  return (
    <section id="troubleshooting" className="max-w-7xl mx-auto px-4 py-16 md:py-24">
      <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Troubleshooting</h2>
      <div className="space-y-6">
        <Card className="space-y-2">
          <h3 className="text-xl md:text-2xl font-semibold">GPT-5-mini 400 Error</h3>
          <p>
            Make sure you have enabled "OpenAI GPT-5 mini" in your GitHub account Copilot settings. The URL is
            <code className="rounded bg-muted px-1 py-0.5 text-xs">https://github.com/settings/copilot/features</code>.
          </p>
        </Card>
        <Card className="space-y-2">
          <h3 className="text-xl md:text-2xl font-semibold">Fail to load API keys</h3>
          <p>Ensure you have the SQLite DB file and have provisioned it correctly.</p>
        </Card>
        <Card className="space-y-2">
          <h3 className="text-xl md:text-2xl font-semibold">Podman Localhost Issue</h3>
          <p>
            If you cannot access via <code className="rounded bg-muted px-1 py-0.5 text-xs">localhost:3000</code>, try
            using
            <code className="rounded bg-muted px-1 py-0.5 text-xs">127.0.0.1:3000</code> instead.
          </p>
        </Card>
      </div>
    </section>
  );
}
