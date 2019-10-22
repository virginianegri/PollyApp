const Fs = require('fs');
const inquirer = require('inquirer');
const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');
const uploadFile = require('./dropbox');

const { authenticate, getLanguageCodes, getVoices, generateAudio } = require('./polly');
const { languageQuestion, restartQuestion, authQuestions, pollyQuestions } = require('./questions');

// Config settings
let config = {
    aws_pool_id: '', // aws pool access key
    dropbox_key: '', // dropbox access key
    language_id: ''
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
* Set the access keys aws_pool_id and dropbox_key
*/
const checkCredentials = () => {
    return new Promise((resolve) => {
        Fs.access('./config.json', Fs.F_OK, (err, data) => {
            if (err) {
                //File doesn't exist, create file
                askCredentials().then(() => {
                    resolve();
                })
            }
            else {
                let data = Fs.readFileSync('./config.json');
                config = JSON.parse(data);

                // console.log("config.aws_pool_id", config);
                if (config.aws_pool_id == null || config.dropbox_key == null) {
                    askCredentials().then(() => {
                        resolve();
                    })
                }
                else {
                    resolve();
                }
            }

        })
    })
}

checkCredentials().then(() => {
    authenticate(config, config.aws_pool_id).then(() => {
        console.info('Authenticated!', '\n');
        startAudioProcess();
    }, err => {
        console.info('Authentication error: ', err);
        reject(console.log(error('\n File not found!. \n')));
    })
});


/**
* Allow user to set the access keys aws_pool_id and dropbox_key 
*/
const askCredentials = () => {
    return new Promise((resolve) => {
        inquirer.prompt(authQuestions).then(answers => {

            config.aws_pool_id = answers['aws_pool_id'];
            config.dropbox_key = answers['dropbox_access_key'];

            data = JSON.stringify(config);

            Fs.writeFileSync('./config.json', data);
            resolve();
        })
    })
}


/**
* Start the audio generation process
* Structured to be called from different parts of the application.
*/
const startAudioProcess = () => {
    // Fill in choices in language question
    const allLanguages = getLanguageCodes();
    allLanguages.map(l => {
        languageQuestion[0].choices.push(l);
    });

    // Set last chosen language as default 
    languageQuestion[0].default = config.language_id;

    // Set language and launch polly quetions
    inquirer.prompt(languageQuestion).then(answers => {
        config.language_id = answers['language_id'];
        displayQuestions();
    });
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
                reject(err);
            }
            else
                resolve(data.toString());
        });
    })
}

/**
 * Set polly params for speech synthesis
 */
const displayQuestions = () => {
    // Get all voices with given languageCode
    let allVoices = getVoices(config.language_id);

    // Fill in choices for voices
    let voices = [];
    allVoices.map(
        v => voices.push(v.Id.concat(' (Gender: ', v.Gender, ' - Engines: ', v.SupportedEngines, ')'))
    );

    const questions = pollyQuestions(voices);

    // Launch the prompt interface 
    inquirer.prompt(questions).then(answers => {
        readFile(answers['text_path']).then((text) => {
            let params = {
                'Text': text,
                'OutputFormat': 'mp3',
                'VoiceId': answers['voice_id'].split(' (')[0]
            }

            console.log(info('\n Generating Audio \n'));
            generateAudio(params, answers['file_name']).then((filePath) => {
                console.log(success('\n Audio Generated! \n'));
                uploadFile(config.dropbox_key, './' + filePath, '/' + answers['destination_folder'] + '/' + filePath)
                    .then(() => {
                        console.log(success('\n File saved! \n'));

                        console.log(success('\n -------------------------------------------------------------- \n'));
                        inquirer.prompt(restartQuestion).then(answers => {
                            if (answers['confirm_restart'] == true) {
                                startAudioProcess();
                            }
                        });

                    }, err => {
                        if (err.code == 401) {
                            //Authorization problem
                            console.log(error('\n Dropbox auth problem. \n'));
                        }
                    })
            }, err => {
                console.log(err)
            })
        }, () => {
            inquirer.prompt(restartQuestion).then(answers => {
                if (answers['confirm_restart'] == true) {
                    startAudioProcess();
                }
            });
        })
    })
}