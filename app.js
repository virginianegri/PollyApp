const Fs = require('fs');
const inquirer = require('inquirer');
const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');
const uploadFile = require('./dropbox');

const { authenticate, getVoices, generateAudio } = require('./polly');
const { authQuestions, pollyQuestions } = require('./questions');

let config = {
    aws_pool_id: '',
    dropbox_key: ''
}

const checkCredentials = () => {
    return new Promise((resolve) => {
        Fs.access('./config.json', Fs.F_OK, (err, data) => {
            if (err) {
                //File doesn't exist, create file
                config.aws_pool_id = 'us-east-1:7bed0a02-3ef1-473e-9b9f-b4860fd67f85';
                config.dropbox_key = 'jlIPA3BaeGwAAAAAAAAALhS9geBr8v32zVqVccWuQpa2tAZeb4HAhL7BFbw9TAR2';
                let data = JSON.stringify(config);
                Fs.writeFileSync('./config.json', data);
                resolve();
            }
            else {
                let data = Fs.readFileSync('./config.json');
                config = JSON.parse(data);
                
                // console.log("config.aws_pool_id", config);
                if (config.aws_pool_id == null || config.dropbox_key == null) {
                    //Ask Questions
                    reject();
                }
                else {
                    resolve();
                }
            }

        })
    })
}

// Initial prompt interface
clear();
console.log(
    chalk.blue(
        figlet.textSync('Text-to-Speech Interactive Command Line Tool', { horizontalLayout: 'default', font: 'digital' })
    )
, '\n');

checkCredentials().then(() => {

    authenticate(config.aws_pool_id).then(() => {
        console.info('Authenticated!', '\n');

        // Ask for the language for the speech synthesis 
        const question = [
            {
                type: 'list',
                name: 'language_id',
                message: "Choose a language for speech",
                choices: ["en-US", "es-ES", "es-MX", "es-US", "fr-CA", "fr-FR", "is-IS", "it-IT"]
            }
        ]

        // Launch the prompt interface 
        inquirer.prompt(question).then(answers => {
            
            getVoices(answers.language_id).then((allVoices) => {
                
                // Fill up voices for voice_id question
                let voices = [];
                allVoices.map(
                    v => voices.push(v.Id.concat(' (Gender: ', v.Gender , ' - Engines: ', v.SupportedEngines, ')'))
                );
                
                const questions = pollyQuestions(voices);
                
                inquirer.prompt(questions).then(answers => {
                    // console.log(JSON.stringify(answers, null, '\n'));

                    readFile(answers['text_path']).then((text) => {
                        let params = {
                            'Text': text,
                            'OutputFormat': 'mp3',
                            'VoiceId': answers['voice_id'].split(' (')[0]
                        }
                        
                        // Generate audio file
                        generateAudio(params, answers['file_name']).then((filePath) => {
                            // Upload to dropbox the audio file stored locally
                            // uploadFile(config.dropbox_key, './' + filePath, '/' + answers['destination_folder'] + '/' + filePath)

                            //TODO: Ask whether to remove local file or not
                        }, err => {
                            console.log(err)
                        })
                    }, err => {
                        console.log(err);
                    })
                })
            })

        });
    }, err => {
        console.log(err);
    })

}, err => {
    //TODO: Ask Keys from user
    console.log("Keys don't exist!");
    console.log(err);
})

/**
 * Get the content of a file
 * @param path A path to the input text to synthesize.
 * @resolve The file's content as string
 * @reject Error 'file not found'.
 */
const readFile = (path) => {
    return new Promise((resolve, reject) => {
        Fs.readFile(path, (err, data) => {
            if (err)
                reject('File Not Found\n');
            else
                resolve(data.toString());
        });
    })
}
