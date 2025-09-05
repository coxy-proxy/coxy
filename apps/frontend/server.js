#!/usr/bin/env node

require('dotenv').config();
const http = require('node:http');
const { parse } = require('node:url');
const next = require('next');

const port = parseInt(process.env.FRONTEND_PORT || '3010', 10);
const app = next({ dev: false, dir: __dirname });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  http
    .createServer((req, res) => {
      const parsedUrl = parse(req.url, true);
      handle(req, res, parsedUrl);
    })
    .listen(port);

  console.log(`> Frontend server listening at http://localhost:${port} as production`);
});
