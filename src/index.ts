import { Command } from 'commander';
const program = new Command();

program
  .version('0.0.1')
  .description('Turk-Ani-CLI, a CLI tool for Turkish anime info')
  .option('-a, --anime <name>', 'Fetch information about an anime');

program.parse(process.argv);

const options = program.opts();
if (options.anime) {
  console.log(`Fetching info for anime: ${options.anime}`);
}
