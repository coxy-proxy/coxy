// Card structure follows card.html reference for header/content slots and border rules
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/components/card';

export default function ResourcesSection() {
  return (
    <section id="resources" className="max-w-7xl mx-auto px-4 py-16 md:py-24">
      <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Resources</h2>
      <div className="space-y-6">
        <Card>
          <CardHeader className="border-b">
            <CardTitle>References</CardTitle>
            <CardDescription>Useful links to related projects and packages</CardDescription>
          </CardHeader>
          <CardContent className="py-6">
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
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="border-b">
            <CardTitle>GitHub Repository</CardTitle>
            <CardDescription>Explore the code and contribute to the project</CardDescription>
          </CardHeader>
          <CardContent className="py-6">
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
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
