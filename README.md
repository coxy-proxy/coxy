<p align="center">
  <img src="./apps/frontend/public/logo.png" width="128" height="128" />
  <span>Coxy</span>
</p>

The proxy that exposes your GitHub Copilot as an OpenAI-compatible API.


## Why?
- You have a lot of free quota on GitHub Copilot, you want to use it like OpenAI-compatible APIs.
- You want the computing power of GitHub Copilot beyond VS Code.
- You want to use modern models like gpt-4.1 free.
- You have multiple GitHub accounts and the free quota is just wasted.
- Host LLM locally and leave the computing remotely.

## Features

- Proxies requests to `https://api.githubcopilot.com`
  - Support endpoints: `/chat/completions`, `/models`
- User-friendly admin UI:
  - Log in with GitHub and generate tokens
  - Add tokens manually
  - Manage multiple tokens with ease
  - View chat message usage statistics
  - Simple chat bot for model evaluation
    - Client-side chat session history

## How to use
- Start the proxy server
  - Option 1: Use Docker
    ```bash
    docker run -p 3000:3000 ghcr.io/coxy-proxy/coxy:latest
    ```
  - Option 2: Use `pnpx`(recommended) or `npx`
    ```bash
    pnpx coxy
    ```
- Browse `http://localhost:3000` to generate the token by following the instructions.
  - Or add your own token manually.
- Set a default token.
- Your OpenAI-compatible API base URL is `http://localhost:3000/api`
  - You can test it like this: (no need authorization header since you've set a default token!)
  ```
  curl --request POST --url http://localhost:3000/api/chat/completions --header 'content-type: application/json' \
  --data '{
      "model": "gpt-4",
      "messages": [{"role": "user", "content": "Hi"}]
  }'
  ```
  - You still can set a token in the request header `authorization: Bearer <token>` and it will override the default token.
- (Optional) Use environment variable `PORT` for setting different port other than `3000`.

## Available environment variables
  - `PORT`: Port number to listen on (default: `3000`)
  - `LOG_LEVEL`: Log level (default: `info`)
  - `DATABASE_URL`: Database URL for Prisma (currently only supports sqlite). Should start with `file:`. (default: `file:../coxy.db`)
    - The relative path will be resolved to the absolute path at runtime.

## Advanced usage
- Dummy token `_` to make coxy use the default token.
    - In most cases, the default token just works without 'Authorization' header. But if your LLM client requires a non-empty API key, you can use the special dummy token `_` to make coxy use the default token.
- Provisioning: launch the CLI with `--provision` to force initialize the database schema via Prisma.
- Tips for using docker:
  - Mount the sqlite db file from host to persist the tokens and use .env file to set environment variables. Use `--provision` first time to initialize the database schema via Prisma, e.g.
    ```bash
    docker run -p 3000:3000 -v /path/to/sqlite.db:/app/coxy.db -v /path/to/.env:/app/.env ghcr.io/coxy-proxy/coxy:latest --provision
    ```

## Use cases
- Use with [LLM](https://llm.datasette.io/en/stable/other-models.html#openai-compatible-models) CLI locally.
- Chat with GitHub Copilot by [Open WebUI](https://docs.openwebui.com/getting-started/).
## Requirements

- Node.js 22 or higher 

## References
- https://www.npmjs.com/package/@github/copilot-language-server
- https://github.com/B00TK1D/copilot-api
- https://github.com/ericc-ch/copilot-api
- https://hub.docker.com/r/mouxan/copilot

> Licensed under the [MIT License](./LICENSE).
