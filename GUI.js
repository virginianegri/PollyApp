const inquirer = require('inquirer');
const rimraf = require('rimraf');
const Fs = require('fs');
const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');

const { checkConfig } = require('./libs/manageConfig');
const { authenticate, generateAudio } = require('./libs/polly');
const { readFile } = require('./libs/readFile');
// const { removeDir } = require('./libs/removeDir')
const { getPollyParams } = require('./libs/getPollyParams');

const { processPPTXFile } = require('./libs/processPPTXFile');

const { restartQuestion, pollyQuestion, pollyExtQuestion, audioQuestions, typeQuestions } = require('./libs/questions'); 

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

const generateAllAudios = async (files,filePath) => {
    for (const file of files) {
        const fileName = file.split('.')[0];
        const text = await readFile(filePath+ '/' + file);
        console.log("inside generateAllAudios")
        // setupPolly(text);
        // let textToSpeech = await readFile(filePath);
        let finalConfig = await checkConfig('./config.json');
        let pollyParams = getPollyParams(text, finalConfig.sharedConfig);

        await generateAudio(pollyParams, fileName,`${finalConfig.config.shared_folder_path}/${finalConfig.sharedConfig.audio_folder}`).then(() => {
            console.log(success('Audio Generated: ' + fileName + '.mp3 \n'));
        }, err => {
            console.log(error(err.message + ' on file ' + file));
        });
    }

    console.log("All files done!");

    inquirer.prompt(restartQuestion).then(answers => {
        if (answers['confirm_restart'] == true) {
            startQuestion();
        }
    });
}
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
    
    let finalConfig = await checkConfig('./config.json');
    // console.log(finalConfig);
    await authenticate(finalConfig.config, finalConfig.sharedConfig.aws_pool_id);

    questionMap.typeQuestion = await inquirer.prompt(typeQuestions);
    questionMap.audioQuestion = await inquirer.prompt(audioQuestions);
    // questionMap.pollyQuestion = await inquirer.prompt(pollyQuestion);
    // questionMap.pollyExtQuestion = await inquirer.prompt(pollyExtQuestion);
    console.log(questionMap);

    if(questionMap.typeQuestion.generate_choice == 'Text' && questionMap.audioQuestion.generate_choice == 'Single') {
        questionMap.pollyQuestion = await inquirer.prompt(pollyQuestion);
        questionMap.pollyExtQuestion = await inquirer.prompt(pollyExtQuestion);
        let filePath = `${finalConfig.config.shared_folder_path}/${finalConfig.sharedConfig.text_folder}/${questionMap.pollyQuestion.file_name}.${questionMap.pollyExtQuestion.file_ext}`
        let textToSpeech = await readFile(filePath);
        let pollyParams = getPollyParams(textToSpeech, finalConfig.sharedConfig);
        console.log(pollyParams);
        await generateAudio(pollyParams, 
            questionMap.pollyQuestion.file_name, 
            `${finalConfig.config.shared_folder_path}/${finalConfig.sharedConfig.audio_folder}`)
    }
    else if(questionMap.typeQuestion.generate_choice == 'Text' && questionMap.audioQuestion.generate_choice == 'All') {
            let filePath = `${finalConfig.config.shared_folder_path}/${finalConfig.sharedConfig.text_folder}`;
            const fileNames = Fs.readdirSync(filePath);
            console.log("file names"+fileNames)
            generateAllAudios(fileNames,filePath);
        
    }

    else if(questionMap.typeQuestion.generate_choice == 'Power Point Presentation' && questionMap.audioQuestion.generate_choice == 'Single') {
        questionMap.pollyQuestion = await inquirer.prompt(pollyQuestion);
        questionMap.pollyExtQuestion = await inquirer.prompt(pollyExtQuestion);
        await processPPTXFile(`${questionMap.pollyQuestion.file_name}.${questionMap.pollyExtQuestion.file_ext}`);
        // await delay(5000);
        // await removeDir(`${finalConfig.config.shared_folder_path}/${finalConfig.sharedConfig.pptx_folder}/${questionMap.pollyQuestion.file_name}/`);
    }

    let restart =  await inquirer.prompt(restartQuestion);
    if(restart.confirm_restart)
        startApp();
}
startApp()