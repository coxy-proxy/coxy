// Card structure follows card.html reference for header/content slots and border rules
import { Card, CardDescription, CardHeader, CardTitle } from '@/shared/ui/components/card';

export default function TroubleshootingSection() {
  return (
    <section id="troubleshooting" className="max-w-7xl mx-auto px-4 py-16 md:py-24">
      <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Troubleshooting</h2>
      <div className="space-y-6">
        <Card>
          <CardHeader className="border-b">
            <CardTitle>GPT-5-mini 400 Error</CardTitle>
            <CardDescription>
              Make sure you have enabled "OpenAI GPT-5 mini" in your GitHub account Copilot settings. The URL is
              <code className="rounded bg-muted px-1 py-0.5 text-xs">https://github.com/settings/copilot/features</code>
              .
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Fail to load API keys</CardTitle>
            <CardDescription>Ensure you have the SQLite DB file and have provisioned it correctly.</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Podman Localhost Issue</CardTitle>
            <CardDescription>
              If you cannot access via <code className="rounded bg-muted px-1 py-0.5 text-xs">localhost:3000</code>, try
              using
              <code className="rounded bg-muted px-1 py-0.5 text-xs">127.0.0.1:3000</code> instead.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </section>
  );
}
