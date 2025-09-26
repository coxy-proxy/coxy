// Card structure follows card.html reference for header/content slots and border rules
import { Card, CardDescription, CardHeader, CardTitle } from '@/shared/ui/components/card';

export default function UseCasesSection() {
  return (
    <section id="use-cases" className="max-w-7xl mx-auto px-4 py-16 md:py-24">
      <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Use Cases</h2>
      <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Local LLMs</CardTitle>
            <CardDescription>Integrate Coxy with your local LLM setup for powerful, remote computing.</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Open WebUI</CardTitle>
            <CardDescription>Chat with GitHub Copilot using the user-friendly Open WebUI interface.</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>LLM CLI</CardTitle>
            <CardDescription>
              Use Coxy with LLM CLI to interact with the models directly from your command line.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </section>
  );
}
