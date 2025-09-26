import { Button } from '@/shared/ui/components/button';

export default function HeroSection() {
  return (
    <section
      id="home"
      className="max-w-7xl mx-auto px-4 py-16 md:py-24 min-h-[80vh] flex items-center justify-center text-center"
    >
      <div className="space-y-6">
        <img src="/header-dark.png" alt="Coxy Logo" className="mx-auto h-20 w-auto" />
        <h1 className="text-3xl md:text-4xl font-extrabold">GitHub Copilot as OpenAI-compatible APIs</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Coxy is a lightweight proxy that lets you use your free GitHub Copilot quota with any OpenAI-compatible
          client, freeing the power of modern LLMs from your VS Code editor.
        </p>
        <img src="/coxy-demo.gif" alt="Coxy demo" className="mx-auto mt-8 rounded-xl shadow-lg max-w-full h-auto" />
        <div className="pt-4">
          <Button asChild>
            <a href="#get-started">Get Started</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
