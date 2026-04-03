#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');
const readline = require('readline');

const green = '\x1b[32m';
const cyan = '\x1b[36m';
const yellow = '\x1b[33m';
const dim = '\x1b[2m';
const reset = '\x1b[0m';

const pkg = require('../package.json');

const banner = `
${green}  \u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2588\u2588\u2588\u2588\u2588\u2557
  \u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2554\u2550\u2550\u2550\u2550\u255d
  \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2551\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2551\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2551\u2588\u2588\u2588\u2588\u2588\u2557
  \u2588\u2588\u2554\u2550\u2550\u2550\u2588\u2588\u2551\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2551\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2551\u2588\u2588\u2554\u2550\u2550\u255d
  \u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255d\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2551\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2551\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557
  \u255a\u2550\u2550\u2550\u2550\u2550\u255d \u255a\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255d\u255a\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255d\u255a\u2550\u2550\u2550\u2550\u2550\u255d${reset}

  SEED ${dim}v${pkg.version}${reset}
  Structured Evaluation & Engineering Design
  for Qwen Code
`;

const args = process.argv.slice(2);
const hasGlobal = args.includes('--global') || args.includes('-g');
const hasLocal = args.includes('--local') || args.includes('-l');
const hasHelp = args.includes('--help') || args.includes('-h');

function parseConfigDirArg() {
  const configDirIndex = args.findIndex(arg => arg === '--config-dir' || arg === '-c');
  if (configDirIndex !== -1) {
    const nextArg = args[configDirIndex + 1];
    if (!nextArg || nextArg.startsWith('-')) {
      console.error(`  ${yellow}--config-dir requires a path argument${reset}`);
      process.exit(1);
    }
    return nextArg;
  }
  const configDirArg = args.find(arg => arg.startsWith('--config-dir=') || arg.startsWith('-c='));
  if (configDirArg) return configDirArg.split('=')[1];
  return null;
}

const explicitConfigDir = parseConfigDirArg();

function expandTilde(filePath) {
  if (filePath && filePath.startsWith('~/')) return path.join(os.homedir(), filePath.slice(2));
  return filePath;
}

/**
 * Recursively copy directory, replacing ~/.qwen/ paths in .md files
 * For global installs: pathPrefix = ~/.qwen/
 * For local installs: pathPrefix = ./.qwen/
 */
function copyDir(srcDir, destDir, pathPrefix, skipDirs = []) {
  fs.mkdirSync(destDir, { recursive: true });
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    if (skipDirs.includes(entry.name)) continue;
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath, pathPrefix, skipDirs);
    } else if (entry.name.endsWith('.md')) {
      let content = fs.readFileSync(srcPath, 'utf8');
      content = content.replace(/~\/\.qwen\//g, pathPrefix);
      fs.writeFileSync(destPath, content);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function countFiles(dir, ext) {
  let count = 0;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) count += countFiles(fullPath, ext);
    else if (!ext || entry.name.endsWith(ext)) count++;
  }
  return count;
}

console.log(banner);

if (hasHelp) {
  console.log(`  ${yellow}Usage:${reset} npx qwen-seed [options]

  ${yellow}Options:${reset}
    ${cyan}-g, --global${reset}              Install globally (to Qwen config directory)
    ${cyan}-l, --local${reset}               Install locally (to ./.qwen/ in current directory)
    ${cyan}-c, --config-dir <path>${reset}   Specify custom Qwen config directory
    ${cyan}-h, --help${reset}                Show this help message

  ${yellow}Examples:${reset}
    ${dim}# Install globally (recommended)${reset}
    npx qwen-seed --global

    ${dim}# Install to current project only${reset}
    npx qwen-seed --local

  ${yellow}What gets installed:${reset}
    ${cyan}commands/qwen-seed/${reset}
      seed.md              Entry point (routing + persona)
      tasks/               5 task files
      data/                15 type-specific data files
      templates/           5 PLANNING.md output templates
      checklists/          Planning quality gate
`);
  process.exit(0);
}

function install(isGlobal) {
  const src = path.join(__dirname, '..');
  const configDir = expandTilde(explicitConfigDir) || expandTilde(process.env.QWEN_CONFIG_DIR);
  const globalDir = configDir || path.join(os.homedir(), '.qwen');
  const qwenDir = isGlobal ? globalDir : path.join(process.cwd(), '.qwen');
  const seedDest = path.join(qwenDir, 'commands', 'qwen-seed');

  // Path prefix for @-reference replacement in .md files
  const pathPrefix = isGlobal ? '~/.qwen/' : './.qwen/';

  const locationLabel = isGlobal
    ? seedDest.replace(os.homedir(), '~')
    : seedDest.replace(process.cwd(), '.');

  if (fs.existsSync(seedDest)) {
    console.log(`  ${yellow}Existing installation found at ${locationLabel}${reset}`);
    console.log(`  Updating...`);
    fs.rmSync(seedDest, { recursive: true, force: true });
  }

  console.log(`  Installing to ${cyan}${locationLabel}${reset}\n`);

  fs.mkdirSync(seedDest, { recursive: true });

  // Copy seed.md with path replacement
  let seedContent = fs.readFileSync(path.join(src, 'seed.md'), 'utf8');
  seedContent = seedContent.replace(/~\/\.qwen\//g, pathPrefix);
  fs.writeFileSync(path.join(seedDest, 'seed.md'), seedContent);
  console.log(`  ${green}+${reset} seed.md ${dim}(entry point)${reset}`);

  // Copy tasks with path replacement
  const tasksSrc = path.join(src, 'tasks');
  const tasksDest = path.join(seedDest, 'tasks');
  copyDir(tasksSrc, tasksDest, pathPrefix);
  console.log(`  ${green}+${reset} tasks/ ${dim}(${countFiles(tasksSrc, '.md')} task files)${reset}`);

  // Copy data with path replacement
  const dataSrc = path.join(src, 'data');
  const dataDest = path.join(seedDest, 'data');
  copyDir(dataSrc, dataDest, pathPrefix);
  const typeCount = fs.readdirSync(dataSrc, { withFileTypes: true }).filter(e => e.isDirectory()).length;
  console.log(`  ${green}+${reset} data/ ${dim}(${typeCount} types, ${countFiles(dataSrc, '.md')} files)${reset}`);

  // Copy templates with path replacement
  const templatesSrc = path.join(src, 'templates');
  const templatesDest = path.join(seedDest, 'templates');
  copyDir(templatesSrc, templatesDest, pathPrefix);
  console.log(`  ${green}+${reset} templates/ ${dim}(${countFiles(templatesSrc, '.md')} templates)${reset}`);

  // Copy checklists with path replacement
  const checklistsSrc = path.join(src, 'checklists');
  const checklistsDest = path.join(seedDest, 'checklists');
  copyDir(checklistsSrc, checklistsDest, pathPrefix);
  console.log(`  ${green}+${reset} checklists/ ${dim}(planning quality gate)${reset}`);

  console.log(`
  ${green}Done!${reset} Open Qwen Code and type ${cyan}/seed${reset} to start.
`);
}

function promptLocation() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  const configDir = expandTilde(explicitConfigDir) || expandTilde(process.env.QWEN_CONFIG_DIR);
  const globalPath = configDir || path.join(os.homedir(), '.qwen');
  const globalLabel = globalPath.replace(os.homedir(), '~');

  console.log(`  ${yellow}Where would you like to install?${reset}

  ${cyan}1${reset}) Global ${dim}(${globalLabel})${reset} - available in all projects
  ${cyan}2${reset}) Local  ${dim}(./.qwen)${reset} - this project only
`);

  rl.question(`  Choice ${dim}[1]${reset}: `, (answer) => {
    rl.close();
    const choice = answer.trim() || '1';
    install(choice !== '2');
  });
}

if (hasGlobal && hasLocal) {
  console.error(`  ${yellow}Cannot specify both --global and --local${reset}`);
  process.exit(1);
} else if (explicitConfigDir && hasLocal) {
  console.error(`  ${yellow}Cannot use --config-dir with --local${reset}`);
  process.exit(1);
} else if (hasGlobal) {
  install(true);
} else if (hasLocal) {
  install(false);
} else {
  promptLocation();
}
