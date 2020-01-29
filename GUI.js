const inquirer = require('inquirer');
const Fs = require('fs');
const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');

const { checkConfig } = require('./libs/manageConfig');
const { authenticate, generateAudio } = require('./libs/polly');
const { readFile } = require('./libs/readFile');
const { getPollyParams } = require('./libs/getPollyParams');
const { generateAllAudios } = require('./libs/generateAllAudios');

const { processPPTXFile } = require('./libs/processPPTXFile');

const { restartQuestion, pollyQuestion, pollyExtQuestion, audioQuestions, typeQuestions, configQuestions } = require('./libs/questions'); 

const questionMap = {
    typeQuestion: 'Text',
    audioQuestions: 'Single',
    pollyQuestion: 'text',
    pollyExtQuestion: 'txt'
}

// Chalk styles
const error = chalk.bold.red;
const success = chalk.bold.green;
const info = chalk.bold.yellow;

/**
 * startApp is GUI controller for PollyApp2. It is called recursively for each itteration
 */
async function startApp() {
    // Initial prompt interface
    clear();
    console.log(
        chalk.green.bold(
            figlet.textSync('Text-to-Speech Command-Line Tool',
            {
                horizontalLayout: 'default',
                font: 'digital'
            })), '\n');

    let finalConfig = null;
    
    // If configuration is not present create config.json
    try {
        finalConfig = await checkConfig('./config.json');
    }
    catch(error) {
        let config = await inquirer.prompt(configQuestions);

        let data = JSON.stringify(config);
        Fs.writeFileSync('./config.json', data);

        finalConfig = await checkConfig('./config.json');
    }

    await authenticate(finalConfig.config, finalConfig.sharedConfig.aws_pool_id);

    questionMap.typeQuestion = await inquirer.prompt(typeQuestions);
    questionMap.audioQuestion = await inquirer.prompt(audioQuestions);

    if(questionMap.typeQuestion.generate_choice == 'Text' && questionMap.audioQuestion.generate_choice == 'Single') {
        // Single file specific questions
        questionMap.pollyQuestion = await inquirer.prompt(pollyQuestion);
        questionMap.pollyExtQuestion = await inquirer.prompt(pollyExtQuestion);

        let filePath = `${finalConfig.config.shared_folder_path}/${finalConfig.sharedConfig.text_folder}/${questionMap.pollyQuestion.file_name}.${questionMap.pollyExtQuestion.file_ext}`
        let textToSpeech = await readFile(filePath);
        let pollyParams = getPollyParams(textToSpeech, finalConfig.sharedConfig);

        await generateAudio(pollyParams, 
            questionMap.pollyQuestion.file_name, 
            `${finalConfig.config.shared_folder_path}/${finalConfig.sharedConfig.audio_folder}`)
    }
    else if(questionMap.typeQuestion.generate_choice == 'Text' && questionMap.audioQuestion.generate_choice == 'All') {
            let filePath = `${finalConfig.config.shared_folder_path}/${finalConfig.sharedConfig.text_folder}`;
            const fileNames = Fs.readdirSync(filePath);
            await generateAllAudios(fileNames, filePath, finalConfig);
    }

    else if(questionMap.typeQuestion.generate_choice == 'Power Point Presentation' && questionMap.audioQuestion.generate_choice == 'Single') {
        // Single file specific questions
        questionMap.pollyQuestion = await inquirer.prompt(pollyQuestion);
        questionMap.pollyExtQuestion = await inquirer.prompt(pollyExtQuestion);

        await processPPTXFile(`${questionMap.pollyQuestion.file_name}.${questionMap.pollyExtQuestion.file_ext}`);
    }

    let restart =  await inquirer.prompt(restartQuestion);
    if(restart.confirm_restart)
        startApp();
}
startApp()