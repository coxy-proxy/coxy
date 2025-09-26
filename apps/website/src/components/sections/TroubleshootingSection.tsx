// Card structure follows card.html reference for header/content slots and border rules
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/components/card';

export default function TroubleshootingSection() {
  return (
    <section id="troubleshooting" className="max-w-7xl mx-auto px-4 py-16 md:py-24">
      <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Troubleshooting</h2>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>GPT-5-mini 400 Error</CardTitle>
          </CardHeader>
          <CardContent>
            Make sure you have enabled "OpenAI GPT-5 mini" in your GitHub account Copilot settings. The URL is&nbsp;
            <code className="rounded bg-muted px-1 py-0.5 text-xs">https://github.com/settings/copilot/features</code>.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Fail to load API keys</CardTitle>
          </CardHeader>
          <CardContent>Ensure you have the SQLite DB file and have provisioned it correctly.</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Podman Localhost Issue</CardTitle>
          </CardHeader>
          <CardContent>
            If you cannot access via&nbsp;<code className="rounded bg-muted px-1 py-0.5 text-xs">localhost:3000</code>,
            try using&nbsp;
            <code className="rounded bg-muted px-1 py-0.5 text-xs">127.0.0.1:3000</code> instead.
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
