const Fs = require('fs');
const inquirer = require('inquirer');
const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');

const { authenticate, generateAudio } = require('./polly');
const {restartQuestion, configQuestions, pollyQuestions, audioQuestions } = require('./questions');

// Config settings
let config = {
    shared_folder_path: ""
}

let sharedConfig = {
    aws_pool_id: ""
};

// Chalk styles
const error = chalk.bold.red;
const success = chalk.bold.green;
const info = chalk.bold.yellow;

// Initial prompt interface
clear();
console.log(
    chalk.green.bold(
        figlet.textSync('Text-to-Speech Command-Line Tool',
            {
                horizontalLayout: 'default',
                font: 'digital'
            })), '\n');


const checkConfig = () => {
    return new Promise((resolve) => {
        accessFile('./config.json').then(() => {
            let data = Fs.readFileSync('./config.json');
            config = JSON.parse(data);

            const sharedPath = config.shared_folder_path;

            checkSharedConfig(sharedPath).then(() => {
                resolve();
            }, err => {
                console.log(err);
            })
        }, err => {
            //File doesn't exist, create file
            askConfig().then(() => {
                const sharedPath = config.shared_folder_path;

                checkSharedConfig(sharedPath).then(() => {
                    resolve();
                });
            })
        })
    })
}

const checkSharedConfig = (sharedPath) => {
    const path = sharedPath + '/sharedConfig.json';

    return new Promise((resolve) => {
        Fs.readFile(path, (err, data) => {
            if (err) {
                Fs.unlinkSync('./config.json');
                error("Path is malformed!");
                startApp();
            }
            else {
                sharedConfig = JSON.parse(data.toString());
                resolve();
            }
        });
    })
}

/**
* Allow user to set the access keys aws_pool_id and dropbox_key 
*/
const askConfig = () => {
    return new Promise((resolve) => {
        inquirer.prompt(configQuestions).then(answers => {
            config.shared_folder_path = answers['shared_folder_path'];

            data = JSON.stringify(config);

            Fs.writeFileSync('./config.json', data);
            resolve();
        })
    })
}

/**
 * Get the content of a file
 * @param path A path to the input text to synthesize.
 * @resolve The file's content as string
 * @reject Error 'file not found'.
 */
const readFile = (path) => {
    return new Promise((resolve, reject) => {
        Fs.readFile(path, (err, data) => {
            if (err) {
                console.log(error('\n File not found! \n'));
                console.log(error('Path: ' + path));
                reject(err);
            }
            else
                resolve(data.toString());
        });
    })
}

/**
 * Check if a file exists with the given path
 * @param path A path to the file.
 * @resolve File exists.
 * @reject Error 'file not found'.
 */
const accessFile = (path) => {
    return new Promise((resolve, reject) => {
        Fs.access(path, Fs.F_OK, (err) => {
            if (err) {
                console.log(error('\n File not found! \n'));
                reject(err);
            }
            else
                resolve();
        });
    })
}

const startApp = () => {
    checkConfig().then(() => {
        authenticate(config, sharedConfig.aws_pool_id).then(() => {
            console.info('Authenticated!', '\n');
            inquirer.prompt(audioQuestions).then((answers)=>{
                if(answers['generate_choice'] == 'Single'){
                    displayQuestions();
                }
                else{
                    //Generate all audio files
                }
            })
        }, err => {
            console.info('Authentication error: ', err.originalError.code);
        })
    });
}

startApp();

/**
 * Set polly params for speech synthesis
 */
const displayQuestions = () => {
    
    // Get all voices from shared config file
    let allVoices = sharedConfig.voice_ids;

    // Fill in choices for voices
    let voices = [];
    allVoices.map(v => voices.push(v));

    const questions = pollyQuestions(voices);

    // Launch the prompt interface 
    inquirer.prompt(questions).then(answers => {

        const sharedPath = config.shared_folder_path;
        const filePath = sharedPath + '/' + sharedConfig.text_folder + '/' + answers['file_name'] + '.txt';
        const audioPath = sharedPath + '/' + sharedConfig.audio_folder;

        readFile(filePath).then((text) => {
            let params = {
                'Text': text,
                'OutputFormat': 'mp3',
                'VoiceId': answers['voice_id']
            }

            console.log(info('\n Generating Audio \n'));
            generateAudio(params, answers['file_name'], audioPath).then(() => {
                console.log(success('\n Audio Generated! \n'));
                inquirer.prompt(restartQuestion).then(answers => {
                    if (answers['confirm_restart'] == true) {
                        displayQuestions();
                    }
                });
            }, err => {
                console.info('Audio generation error: ', err);
            })
        }, () => {
            inquirer.prompt(restartQuestion).then(answers => {
                if (answers['confirm_restart'] == true) {
                    displayQuestions();
                }
            });
        })
    })
}