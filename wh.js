#!/usr/bin/env node

const rp = require('request-promise');
const cheerio = require('cheerio');
const dictionary = require('./dictionary.json');
const juice = require('juice');
const Spinner = require('cli-spinner').Spinner;

const spinner = new Spinner();
spinner.setSpinnerString(Math.round(Math.random() * Spinner.spinners.length));
const question = process.argv.length > 2 &&
  process.argv.slice(2)
    .join(' ')
    .trim();

if (question) {
  spinner.start();
  const options = {
    uri: `https://www.google.com/search?q=${encodeURIComponent(question)}&ie=UTF-8&hl=en&gl=en`,
    encoding: 'utf8',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.186 Safari/537.36',
    },
    transform: body => cheerio.load(body),
  };

  rp(options)
    // .then($ => [
    //   $('#ires .vk_bk.vk_ans').first().text(),
    //   $('#ires ._XWk').first().text(),
    //   $('#ires #_Cif input').val() && `${$('#_Cif input').val()} ${$('#_Cif select').val()}`,
    //   $('#ires ._H1m').first().text(),
    //   $('#ires #cwos').first().text(),
    //   $('#ires ._FOc').first().text(),
    //   $('#ires #tw-target .tw-data-text').first().text(),
    //   $('#ires ._Jig').first().text() && $('._Jig').first().text().substr(0, $('._Jig').first().text().indexOf('.') + 1),
    //   $('#ires ._p1q').first().text(),
    //   dictionary.NO_ANSWER[Math.round(Math.random() * dictionary.NO_ANSWER.length)],
    // ])
    .then(($) => {
      const $$ = cheerio.load(juice($.html()));

      return [
        $('#ires .vk_bk.vk_ans').first().text(),
        $('#ires #NotFQb input').val() && `${$('#ires #NotFQb input').val()} ${$('#ires #NotFQb select').val()}`,
        $$('#ires div')
          .filter((index, elm) => elm.attribs.style.match(/font-size: (3\dpx|2\dpx|xx-large)/))
          .first()
          .text(),
        dictionary.NO_ANSWER[Math.round(Math.random() * dictionary.NO_ANSWER.length)],
      ];
    })
    .then(answers => answers.filter(a => a && a !== 'People also ask'))
    .then((answer) => {
      spinner.stop(true);
      console.log(answer[0]);
    })
    .catch(() => {
      spinner.stop(true);
      console.error(dictionary.ERROR[Math.round(Math.random() * dictionary.ERROR.length)]);
    });
}
else {
  console.log(dictionary.NO_QUESTION[Math.round(Math.random() * dictionary.NO_QUESTION.length)]);
}
