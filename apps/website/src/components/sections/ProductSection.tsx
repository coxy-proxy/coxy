export default function ProductSection() {
  return (
    <section id="product" className="max-w-7xl mx-auto px-4 py-16 md:py-24">
      <div className="grid md:grid-cols-2 gap-12">
        <div className="space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">Why Coxy?</h2>
          <div className="space-y-4 text-foreground/80">
            <p>You have a lot of free quota on GitHub Copilot, you want to use it like OpenAI-compatible APIs.</p>
            <p>You want the computing power of GitHub Copilot beyond VS Code.</p>
            <p>You want to use modern models like gpt-4.1 free.</p>
            <p>You have multiple GitHub accounts and the free quota is just wasted.</p>
            <p>Host LLM locally and leave the computing remotely.</p>
          </div>
        </div>
        <div className="space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">Features</h2>
          <div className="space-y-4 text-foreground/80">
            <p>
              <strong>Proxy API Endpoints:</strong> Supports <code className="text-sm">/chat/completions</code> and{' '}
              <code className="text-sm">/models</code> endpoints.
            </p>
            <p>
              <strong>User-Friendly Admin UI:</strong> Easily log in with GitHub to generate and manage tokens, view
              usage statistics, and evaluate models with a built-in chatbot.
            </p>
            <p>
              <strong>Broad Compatibility:</strong> Works seamlessly with OpenAI clients, LLM CLI, and Open WebUI.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
