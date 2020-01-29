#!/usr/bin/env node
const Fs = require('fs');

const { checkConfig } = require('./libs/manageConfig');
const { authenticate, generateAudio } = require('./libs/polly');
const { readFile } = require('./libs/readFile');
const { getPollyParams } = require('./libs/getPollyParams');
const { generateAllAudios } = require('./libs/generateAllAudios');

const { processPPTXFile } = require('./libs/processPPTXFile');

const argv = require('yargs')
  .scriptName("pollycli")
  .usage('$0 <cmd> [args]')
  .command('singletext [filename]', 'welcome to pollycli', (yargs) => {
    yargs.positional('filename', {
      type: 'string',
      describe: 'name of the file that you want to convert!'
    })
  }, function (argv) {
  })
  .command('singlepptx [filename]', 'welcome to pollycli', (yargs) => {
    yargs.positional('filename', {
      type: 'string',
      describe: 'name of the file that you want to convert!'
    })
  }, function (argv) {
  })
  .command('createconfig [pathsharedconfig]', 'welcome to pollycli', (yargs) => {
    yargs.positional('pathsharedconfig', {
      type: 'string',
      describe: 'path of shared config folder!'
    })
  }, function (argv) {
  })
  .command('multitext', 'welcome to pollycli', function (argv) {
  })
  .help()
  .argv

/**
 * cli_init is the CLI handler for PollyApp2
 */
async function cli_init(args) {
  // console.log('From require: ', args);
  if (args._[0] == 'createconfig') {
    let config = {}
    config.shared_folder_path = args.pathsharedconfig

    let data = JSON.stringify(config);
    Fs.writeFileSync('./config.json', data);
  }
  else {
    try {
      let finalConfig = await checkConfig('./config.json');

      await authenticate(finalConfig.config, finalConfig.sharedConfig.aws_pool_id);
      // console.log(args._[0]);

      if (args._[0] == 'singletext') {
          let filePath = `${finalConfig.config.shared_folder_path}/${finalConfig.sharedConfig.text_folder}/${args.filename}.txt`
          let textToSpeech = await readFile(filePath);
          let pollyParams = getPollyParams(textToSpeech, finalConfig.sharedConfig);

          await generateAudio(pollyParams, args.filename, `${finalConfig.config.shared_folder_path}/${finalConfig.sharedConfig.audio_folder}`)

      } else if (args._[0] == 'multitext') {
          let filePath = `${finalConfig.config.shared_folder_path}/${finalConfig.sharedConfig.text_folder}`;
          const fileNames = Fs.readdirSync(filePath);
          await generateAllAudios(fileNames, filePath, finalConfig);
      } else if (args._[0] == 'singlepptx') {
          await processPPTXFile(`${args.filename}.pptx`);
      } else {
          console.log('Please give a correct command! Refer to --help for right commands!');
      }
    }
    catch(error) {
      console.log('Please use createconfig command to create config');
    }
  }
}

cli_init(argv);
