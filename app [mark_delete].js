const Fs = require('fs');
const inquirer = require('inquirer');
const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');
const { authenticate, generateAudio } = require('./libs/polly');
const { restartQuestion, configQuestions, pollyQuestion, pollyPPTXQuestion, audioQuestions, typeQuestions } = require('./libs/questions'); 

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


/**
 * Checks the local config file and reads the config
 */
const checkConfig = () => {
    return new Promise((resolve) => {
        accessFile('./config.json').then(() => {
            let data = Fs.readFileSync('./config.json');
            config = JSON.parse(data);

            const sharedPath = config.shared_folder_path;
            console.log('access shared_path: ',sharedPath);

            checkSharedConfig(sharedPath).then(() => {
                resolve();
            }, err => {
                console.log(err);
            })
        }, err => {
            //File doesn't exist, create file
            askConfig().then(() => {
                const sharedPath = config.shared_folder_path;
                console.log('ask shared_path: ',sharedPath);
                checkSharedConfig(sharedPath).then(() => {
                    resolve();
                });
            })
        })
    })
}

/**
 * Checks if there is a shared config present with the path
 * @param sharedPath path to the shared folder
 */
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
                console.log('share:',sharedConfig)
                resolve();
            }
        });
    })
}

/*
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
            config.shareTextFilePath = config.sharedPath + '/' + sharedConfig.text_folder;
            config.sharePptxFilePath = config.sharedPath + '/' + sharedConfig.pptx_folder;
            config.audioPath = config.sharedPath + '/' + sharedConfig.audio_folder;
            console.log(config)
            startQuestion();
        }, err => {
            console.info('Authentication error: ', err);
        })
    });
}
/**
 * Asks the user if they want to convert single file or all files to audio 
 */
const startQuestion = () => {
    inquirer.prompt(typeQuestions).then((answers) => {
        if (answers['generate_choice'] == 'Text') {
            //Generate single audio file
            textAudio();
        }
        else {
            pptxAudio();
        }
    })
}
const pptxAudio = () => {
    inquirer.prompt(audioQuestions).then((answers) => {
        if (answers['generate_choice'] == 'Single') {
            //Generate single audio file
            displayQuestionsPPTX();
        }
        else {
            //Generate all audio files
            //Set the default voice id for audio generation
            pollyParams.VoiceId = sharedConfig.default_voice;

            //Read all file names in the text directory
            const fileNames = Fs.readdirSync(config.shareTextFilePath);

            generateAllAudios(fileNames);
        }
    })
}
const textAudio = () => {
    inquirer.prompt(audioQuestions).then((answers) => {
        if (answers['generate_choice'] == 'Single') {
            //Generate single audio file
            displayQuestions();
        }
        else {
            //Generate all audio files
            //Set the default voice id for audio generation
            pollyParams.VoiceId = sharedConfig.default_voice;

            //Read all file names in the text directory
            const fileNames = Fs.readdirSync(config.shareTextFilePath);

            generateAllAudios(fileNames);
        }
    })
}


/**
 * Generates audio for all of the text files present in text folder
 * @param files an array of file names 
 */
const generateAllAudios = async (files) => {
    for (const file of files) {
        const fileName = file.split('.')[0];
        const text = await readFile(config.shareTextFilePath + '/' + file);

        setupPolly(text);

        await generateAudio(pollyParams, fileName, config.audioPath).then(() => {
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

/**
 * Checks if the text has a voice parameter in the beginning
 * Sets up Polly accordingly
 * @param text text that is read from the file
 */
const setupPolly = (text) => {
    const includesVoice = text.includes(sharedConfig.extra_voice_character);
    if (includesVoice == true) {
        const splitText = text.split(sharedConfig.extra_voice_character);
        pollyParams.VoiceId = splitText[1];
        pollyParams.Text = splitText[2];
    } else {
        pollyParams.Text = text;
        pollyParams.VoiceId = sharedConfig.default_voice;
    }
}

/**
 * Set polly params for speech synthesis
 */
const displayQuestions = () => {

    // Launch the prompt interface 
    inquirer.prompt(pollyQuestion).then(answers => {
        config.filePath = config.shareTextFilePath + '/' + answers['file_name'] + '.txt';
        console.log(config.filePath)

        readFile(config.filePath).then((text) => {
            setupPolly(text);
            console.log(pollyParams, answers['file_name'], config.audioPath)
            generateAudio(pollyParams, answers['file_name'], config.audioPath).then(() => {
                console.log(success('\n Audio Generated! \n'));
                inquirer.prompt(restartQuestion).then(answers => {
                    if (answers['confirm_restart'] == true) {
                        startQuestion();
                    }
                });
            }, err => {
                console.info('Audio generation error: ', err);
            })
        }, () => {
            inquirer.prompt(restartQuestion).then(answers => {
                if (answers['confirm_restart'] == true) {
                    startQuestion();
                }
            });
        })
    })
}

/**
 * Set polly params for speech synthesis
 */
const displayQuestionsPPTX = () => {

    // Launch the prompt interface 
    inquirer.prompt(pollyPPTXQuestion).then(answers => {
        config.filePath = config.sharePptxFilePath + '/' + answers['file_name'] + '.pptx';
        console.log(config.filePath)

        readFile(config.filePath).then((text) => {
            setupPolly(text);

            generateAudio(pollyParams, answers['file_name'], config.audioPath).then(() => {
                console.log(success('\n Audio Generated! \n'));
                inquirer.prompt(restartQuestion).then(answers => {
                    if (answers['confirm_restart'] == true) {
                        startQuestion();
                    }
                });
            }, err => {
                console.info('Audio generation error: ', err);
            })
        }, () => {
            inquirer.prompt(restartQuestion).then(answers => {
                if (answers['confirm_restart'] == true) {
                    startQuestion();
                }
            });
        })
    })
}

//Start the application
startApp();