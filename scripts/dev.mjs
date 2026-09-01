import { spawn } from 'child_process';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  magenta: '\x1b[35m',
};

console.log(`${colors.bright}${colors.green}
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║   🚀 TUMA Cloud — Multi-Cluster Development Launcher              ║
║                                                                   ║
║   • API Backend:     http://localhost:3001                        ║
║   • Dashboard Admin: http://localhost:5173                        ║
║   • Site Vitrine:    http://localhost:3002                        ║
║   • Mailpit Inbox:   http://localhost:8025                        ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
${colors.reset}`);

const apps = [
  { name: 'API [3001]', cwd: 'apps/api', cmd: 'node', args: ['dist/main.js'], color: colors.cyan },
  { name: 'DASHBOARD [5173]', cwd: 'apps/dashboard', cmd: 'npm', args: ['run', 'dev'], color: colors.green },
  { name: 'WEB [3002]', cwd: 'apps/web', cmd: 'npm', args: ['run', 'dev'], color: colors.magenta },
];

apps.forEach((app) => {
  const child = spawn(app.cmd, app.args, {
    cwd: app.cwd,
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true,
  });

  child.stdout.on('data', (data) => {
    process.stdout.write(`${app.color}[${app.name}]${colors.reset} ${data}`);
  });

  child.stderr.on('data', (data) => {
    process.stderr.write(`${app.color}[${app.name} ERR]${colors.reset} ${data}`);
  });

  child.on('close', (code) => {
    console.log(`${app.color}[${app.name}] Exited with code ${code}${colors.reset}`);
  });
});
