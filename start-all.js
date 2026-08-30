const { spawn } = require('child_process');
const path = require('path');
const os = require('os');

// Color codes for ANSI terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  dim: '\x1b[2m'
};

// Detect local LAN IPv4 address
function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const localIp = getLocalIp();

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';
const nodeCmd = 'node';

const services = [
  {
    name: 'BACKEND',
    color: colors.cyan,
    cwd: path.join(__dirname, 'BACKEND'),
    cmd: nodeCmd,
    args: ['server.js'],
    port: 5000,
    desc: 'REST API & Swagger'
  },
  {
    name: 'ADMIN  ',
    color: colors.magenta,
    cwd: path.join(__dirname, 'FRONTEND', 'ADMIN'),
    cmd: npmCmd,
    args: ['start'],
    port: 3001,
    desc: 'React Admin Panel'
  },
  {
    name: 'WEBSITE',
    color: colors.green,
    cwd: path.join(__dirname, 'FRONTEND', 'WEBSITE'),
    cmd: npmCmd,
    args: ['run', 'dev'],
    port: 3002,
    desc: 'Customer Storefront'
  },
  {
    name: 'SELLER ',
    color: colors.yellow,
    cwd: path.join(__dirname, 'FRONTEND', 'SELLER'),
    cmd: npmCmd,
    args: ['run', 'dev'],
    port: 3003,
    desc: 'Seller Dashboard'
  }
];

console.log(`${colors.bright}${colors.blue}================================================================${colors.reset}`);
console.log(`${colors.bright}${colors.blue}       🛒 E-Commerce Full-Stack Platform Launcher 🛒            ${colors.reset}`);
console.log(`${colors.bright}${colors.blue}================================================================${colors.reset}`);
console.log(`${colors.bright}Active Network IP: ${colors.yellow}${localIp}${colors.reset}\n`);

console.log(`${colors.bright}Services & URLs:${colors.reset}`);
console.log(`  🔹 ${colors.cyan}Backend API${colors.reset}:       http://localhost:5000        (LAN: http://${localIp}:5000)`);
console.log(`  🔹 ${colors.cyan}Swagger API Docs${colors.reset}:  http://localhost:5000/api-docs`);
console.log(`  🔹 ${colors.magenta}Admin Dashboard${colors.reset}:  http://localhost:3001        (LAN: http://${localIp}:3001)`);
console.log(`  🔹 ${colors.green}Customer Website${colors.reset}: http://localhost:3002        (LAN: http://${localIp}:3002)`);
console.log(`  🔹 ${colors.yellow}Seller Dashboard${colors.reset}: http://localhost:3003        (LAN: http://${localIp}:3003)\n`);
console.log(`${colors.dim}Starting all services simultaneously... Press Ctrl+C to stop all.${colors.reset}`);
console.log(`${colors.bright}${colors.blue}----------------------------------------------------------------${colors.reset}\n`);

const children = [];

function pipeOutput(child, service) {
  const prefix = `${service.color}${colors.bright}[${service.name}]${colors.reset} `;

  child.stdout.on('data', (data) => {
    const lines = data.toString().split(/\r?\n/);
    lines.forEach((line) => {
      if (line.trim().length > 0) {
        console.log(`${prefix}${line}`);
      }
    });
  });

  child.stderr.on('data', (data) => {
    const lines = data.toString().split(/\r?\n/);
    lines.forEach((line) => {
      if (line.trim().length > 0) {
        console.error(`${prefix}${colors.red}${line}${colors.reset}`);
      }
    });
  });

  child.on('close', (code) => {
    if (code !== 0 && code !== null) {
      console.log(`${prefix}${colors.red}Process exited with code ${code}${colors.reset}`);
    }
  });
}

// Start all services
services.forEach((service) => {
  const child = spawn(service.cmd, service.args, {
    cwd: service.cwd,
    shell: true,
    env: { ...process.env, FORCE_COLOR: '1' }
  });

  children.push(child);
  pipeOutput(child, service);
});

// Graceful cleanup on exit
function shutdown() {
  console.log(`\n${colors.bright}${colors.yellow}Shutting down all services...${colors.reset}`);
  children.forEach((child) => {
    try {
      if (isWindows) {
        spawn('taskkill', ['/pid', child.pid, '/f', '/t']);
      } else {
        child.kill('SIGTERM');
      }
    } catch (e) {
      // Ignore errors during termination
    }
  });
  setTimeout(() => process.exit(0), 1000);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
