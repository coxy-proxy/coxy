#!/usr/bin/env node

require('dotenv').config();

require('./provision.js').maybeProvision();

require('../apps/frontend/server.js');
require('../dist/apps/backend/main.js');
require('../dist/apps/gateway/main.js');
