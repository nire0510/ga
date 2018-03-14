#!/usr/bin/env node

const rp = require('request-promise');
const cheerio = require('cheerio');
const dictionary = require('./dictionary.json');
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
    .then($ => [
      $('.vk_bk.vk_ans').first().text(),
      $('._XWk').first().text(),
      $('#_Cif input').val() && `${$('#_Cif input').val()} ${$('#_Cif select').val()}`,
      $('#cwos').text(),
      dictionary.NO_ANSWER[Math.round(Math.random() * dictionary.NO_ANSWER.length)],
      // secondary: `${$('.vk_gy.vk_sh').first().text()}`,
    ])
    .then((answers) => {
      spinner.stop(true);
      console.log(answers.find(a => Boolean(a)).trim());
    })
    .catch(() => {
      spinner.stop(true);
      console.error(dictionary.ERROR[Math.round(Math.random() * dictionary.ERROR.length)]);
    });
}
else {
  console.log(dictionary.NO_QUESTION[Math.round(Math.random() * dictionary.NO_QUESTION.length)]);
}
