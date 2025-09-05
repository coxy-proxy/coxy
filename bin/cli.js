#!/usr/bin/env node

require('dotenv').config();

require('../dist/apps/backend/main.js');
require('../apps/frontend/server.js');
require('../dist/apps/gateway/main.js');
