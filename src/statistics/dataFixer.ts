import commander from 'commander';
import { anonymizeData } from './fixer-helpers/dataAnonymizer';
import { wildFix } from './fixer-helpers/wildFix';
import { gameIdFix } from './fixer-helpers/gameIdFix';

const fixData = () => {
  commander
    .command('anonymize <year> <event>')
    .description('Anonymize users and results')
    .action(async (year, event) => {
      await anonymizeData(year, event);
    });

  commander
    .command('gameid <year> <event>')
    .description('Fix game ids for users and results')
    .action(async (year, event) => {
      await gameIdFix(year, event);
    });

  commander
    .command('wild <year> <event> <datatype>')
    .description('Implement new fix logic')
    .action(async (year, event, datatype) => {
      await wildFix(year, event, datatype);
    });

  commander
    .command('feedback-format <year> <event>')
    .description('Format feedbacks')
    .action(async (year, event, datatype) => {
      await wildFix(year, event, datatype);
    });

  if (process.argv.length < 4) {
    commander.help();
  }

  commander.parse(process.argv);
};

fixData();