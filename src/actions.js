const rp = require('request-promise');
const cheerio = require('cheerio');
const clipboardy = require('clipboardy');
const cp = require('child_process');
const dictionary = require('./dictionary.json');
const juice = require('juice');
const open = require('open');
const pkg = require('../package.json');
const say = require('say');
const Spinner = require('cli-spinner').Spinner;
require('colors');

const spinner = new Spinner();

module.exports = {
  ask(...args) {
    const program = args[args.length - 1];
    const question = args.slice(0, args.length - 1).join(' ');
    const options = {
      uri: `https://www.google.com/search?q=${encodeURIComponent(question)}&ie=UTF-8&hl=en&gl=en`,
      encoding: 'utf8',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.186 Safari/537.36',
      },
      transform: body => cheerio.load(body),
    };

    // show spinner:
    if (program.spinner) {
      spinner.setSpinnerString(Math.round(Math.random() * Spinner.spinners.length));
      spinner.start();
    }

    // request:
    rp(options)
      .then(($) => {
        const $$ = cheerio.load(juice($.html()));

        return [
          $('#ires .vk_bk.vk_ans').first().text(),
          $('#tw-target-text').first().text(),
          $('#ires #NotFQb input').val() && `${$('#ires #NotFQb input').val()} ${$('#ires #NotFQb select').val()}`,
          $('#ires [data-symbol]').data('symbol') && `${$('#ires [data-symbol]').data('symbol')} ${$('#ires [data-value]').data('value')}`,
          $$('#ires div')
            .filter((index, elm) => elm.attribs.style.match(/font-size: (3\dpx|2\dpx|xx?-large)/))
            .first()
            .text(),
          // dictionary.NO_ANSWER[Math.round(Math.random() * dictionary.NO_ANSWER.length)],
        ];
      })
      .then(answers => answers.filter(a => a && ['People also ask', 'undefined', question].every(option => a !== option && question.toLowerCase().indexOf(a.toLowerCase()) === -1)))
      .then((answers) => {
        // hide spinner:
        if (program.spinner) {
          spinner.stop(true);
        }

        if (answers.length) {
          const answer = answers[0].trim();

          // show answer:
          console.log(answer.bold);
          // say it:
          if (program.say) {
            say.speak(answer);
          }
          // copy to clipboard:
          if (program.copy) {
            clipboardy.writeSync(answer);
          }
        }
        else {
          console.log(dictionary.MISC.google);
          open(`https://www.google.co.il/search?q=${encodeURIComponent(question)}`);
        }
      })
      .catch(() => {
        if (program.spinner) {
          spinner.stop(true);
        }
        console.error(dictionary.ERROR[Math.round(Math.random() * dictionary.ERROR.length)]);
      });
  },

  check() {
    process.stdout.write(`\n${dictionary.MISC.checking}`);
    const latestVersion = cp.execSync(`npm show ${pkg.name} version`);

    // new version available:
    if (`${latestVersion}`.indexOf(pkg.version) !== 0) {
      console.log(dictionary.MISC.newer.green);
      console.log(dictionary.MISC.upgrade, dictionary.MISC.command.bold);
    }
    // up-to-date:
    else {
      console.log(dictionary.MISC.uptodate, pkg.version.white.bold);
    }
  },
};
