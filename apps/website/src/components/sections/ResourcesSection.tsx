import { Card } from '@/shared/ui/components/card';

export default function ResourcesSection() {
  return (
    <section id="resources" className="max-w-7xl mx-auto px-4 py-16 md:py-24">
      <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Resources</h2>
      <div className="space-y-6">
        <Card className="space-y-2">
          <h3 className="text-xl md:text-2xl font-semibold">References</h3>
          <ul className="list-disc list-inside space-y-1 text-foreground/90">
            <li>
              <a
                href="https://www.npmjs.com/package/@github/copilot-language-server"
                className="underline text-primary hover:opacity-90"
                target="_blank"
                rel="noreferrer noopener"
              >
                @github/copilot-language-server
              </a>
            </li>
            <li>
              <a
                href="https://github.com/B00TK1D/copilot-api"
                className="underline text-primary hover:opacity-90"
                target="_blank"
                rel="noreferrer noopener"
              >
                B00TK1D/copilot-api
              </a>
            </li>
            <li>
              <a
                href="https://hub.docker.com/r/mouxan/copilot"
                className="underline text-primary hover:opacity-90"
                target="_blank"
                rel="noreferrer noopener"
              >
                mouxan/copilot Docker Hub
              </a>
            </li>
          </ul>
        </Card>
        <Card className="space-y-2">
          <h3 className="text-xl md:text-2xl font-semibold">GitHub Repository</h3>
          <p>
            Explore the full source code and contribute on our official
            <a
              href="https://github.com/coxy-proxy/coxy"
              className="underline text-primary hover:opacity-90"
              target="_blank"
              rel="noreferrer noopener"
            >
              {' '}
              GitHub repository
            </a>
            .
          </p>
        </Card>
      </div>
    </section>
  );
}
