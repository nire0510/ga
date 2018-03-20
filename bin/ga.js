#!/usr/bin/env node

const program = require('commander');
const actions = require('../src/actions');
const pkg = require('../package.json');

program
  .version(pkg.version, '-v, --version')
  .usage('[options] <question>')
  .option('-c, --copy', 'Copy answer to clipboard')
  .option('-s, --say', 'Say the answer out loud')
  .option('-S, --no-spinner', 'Do not show spinner')
  .on('--help', actions.check)
  .action(actions.ask)
  .parse(process.argv);

if (!program.args.length) {
  program.help();
}
