#!/usr/bin/env node

const argv = require('yargs')
  .scriptName("pollycli")
  .usage('$0 <cmd> [args]')
  .command('convert [filepath]', 'welcome to pollycli', (yargs) => {
    yargs.positional('filepath', {
      type: 'string',
      describe: 'Path to the file that you want to convert!'
    })
  }, function (argv) {
    console.log('From callback', argv);
  })
  .command('convert2 [filepath2]', 'welcome to pollycli', (yargs) => {
    yargs.positional('filepath2', {
      type: 'string',
      describe: 'Path to the file that you want to convert!'
    })
  }, function (argv) {
    console.log('From callback', argv);
    // console.log('hello', argv.name, 'welcome to yargs!')
  })
  .help()
  .argv

console.log('From require: ', argv);
