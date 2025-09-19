const { spawnSync } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');

const args = process.argv.slice(2);
const shouldProvision = args.includes('--provision');

function ensureSqliteDir(fileUrl) {
  const filePath = fileUrl.replace(/^file:/, '');
  const absPath = path.isAbsolute(filePath) ? filePath : path.join(__dirname, filePath);
  const dir = path.dirname(absPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return absPath;
}

function runPrismaDbPush() {
  const schema = path.join(__dirname, '..', 'prisma', 'schema.prisma');
  const prismaBin = path.join(
    __dirname,
    '..',
    'node_modules',
    '.bin',
    process.platform === 'win32' ? 'prisma.cmd' : 'prisma',
  );

  const result = spawnSync(prismaBin, ['db', 'push', `--schema=${schema}`], { stdio: 'inherit' });
  if (result.status !== 0) {
    console.error('[coxy] Failed to provision database via "prisma db push"');
    process.exit(result.status || 1);
  }
}

function maybeProvision() {
  if (!shouldProvision) {
    return;
  }
  let dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    dbUrl = 'file:../coxy.db';
    process.env.DATABASE_URL = dbUrl;
    console.log(`[coxy] DATABASE_URL missing. Defaulting to ${dbUrl}`);
  }

  if (dbUrl.startsWith('file:')) {
    const absPath = ensureSqliteDir(dbUrl);
    console.log(`[coxy] sqlite path resolved to ${absPath}`);
  }

  console.log('[coxy] Ensuring database schema via "prisma db push"...');
  runPrismaDbPush();
}

module.exports = { maybeProvision };
