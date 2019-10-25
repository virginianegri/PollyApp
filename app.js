const Fs = require('fs');
const inquirer = require('inquirer');
const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');

const { authenticate, generateAudio } = require('./polly');
const { restartQuestion, configQuestions, pollyQuestions, audioQuestions } = require('./questions');

// Config settings
let config = {
    shared_folder_path: ""
}

let sharedConfig = {
    aws_pool_id: ""
};

let pollyParams = {
    'Text': '',
    'OutputFormat': 'mp3',
    'Engine': 'neural',
    'TextType': "ssml",
    'VoiceId': ''
}

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
                console.log(error('\n File not found! ' + path + ' \n'));
                reject(err);
            }
            else
                resolve();
        });
    })
}

/*
 * Start the flow of the application 
 */
const startApp = () => {
    checkConfig().then(() => {
        authenticate(config, sharedConfig.aws_pool_id).then(() => {
            console.info('Authenticated!', '\n');
            config.sharedPath = config.shared_folder_path;
            config.sharedFilePath = config.sharedPath + '/' + sharedConfig.text_folder;
            config.audioPath = config.sharedPath + '/' + sharedConfig.audio_folder;
            inquirer.prompt(audioQuestions).then((answers) => {
                if (answers['generate_choice'] == 'Single') {
                    //Generate single audio file
                    displayQuestions();
                }
                else {
                    //Generate all audio files
                    //Set the default voice id for audio generation
                    pollyParams.VoiceId = sharedConfig.voice_ids[0];

                    //Read all file names in the text directory
                    const fileNames = Fs.readdirSync(config.sharedFilePath);
                    //console.log(fileNames);

                    generateAllAudios(fileNames);
                }
            })
        }, err => {
            console.info('Authentication error: ', err);
        })
    });
}

/**
 * Generates audio for all of the text files present in text folder
 * @param files an array of file names 
 */
const generateAllAudios = async (files) => {
    for (const file of files) {
        const fileName = file.split('.')[0];
        const text = await readFile(config.sharedFilePath + '/' + file);

        pollyParams.Text = text;
        pollyParams.VoiceId = sharedConfig.voice_ids[0];

        await generateAudio(pollyParams, fileName, config.audioPath).then(() => {
            console.log(success('Audio Generated: ' + fileName + '.mp3 \n'));
        }, err => {
            console.log(error(err.message + ' on file ' + file));
        });
    }

    console.log("All files done!");

    inquirer.prompt(restartQuestion).then(answers => {
        if (answers['confirm_restart'] == true) {
            displayQuestions();
        }
    });
}

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
        config.filePath = config.sharedFilePath + '/' + answers['file_name'] + '.txt';

        readFile(config.filePath).then((text) => {
            pollyParams.Text = text;
            pollyParams.VoiceId = answers['voice_id'];

            generateAudio(pollyParams, answers['file_name'], config.audioPath).then(() => {
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

//Start the application
startApp();