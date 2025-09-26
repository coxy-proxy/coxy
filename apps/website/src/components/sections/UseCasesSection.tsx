import { Card } from '@/shared/ui/components/card';

export default function UseCasesSection() {
  return (
    <section id="use-cases" className="max-w-7xl mx-auto px-4 py-16 md:py-24">
      <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Use Cases</h2>
      <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="space-y-2">
          <h3 className="text-xl md:text-2xl font-semibold">Local LLMs</h3>
          <p className="text-foreground/80">Integrate Coxy with your local LLM setup for powerful, remote computing.</p>
        </Card>
        <Card className="space-y-2">
          <h3 className="text-xl md:text-2xl font-semibold">Open WebUI</h3>
          <p className="text-foreground/80">Chat with GitHub Copilot using the user-friendly Open WebUI interface.</p>
        </Card>
        <Card className="space-y-2">
          <h3 className="text-xl md:text-2xl font-semibold">LLM CLI</h3>
          <p className="text-foreground/80">
            Use Coxy with LLM CLI to interact with the models directly from your command line.
          </p>
        </Card>
      </div>
    </section>
  );
}
