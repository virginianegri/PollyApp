const Fs = require('fs')
const inquirer = require('inquirer');
const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');
const uploadFile = require('./dropbox');

const { authenticate, getVoices, generateAudio } = require('./polly');
const { pollyQuestions } = require('./questions');

/* var questions = [
    {
        type: 'input',
        name: 'first_name',
        message: "What's your name?",
        default: () => {
            return 'Ali';
        }
    },
    {
        type: 'input',
        name: 'aws_access_key_id',
        message: "Enter your aws secret key id",
    },
    {
        type: 'input',
        name: 'aws_secret_access_key',
        message: "Enter your aws secret access key",
    },
    {
        type: 'input',
        name: 'dropbox_token',
        message: "Enter your dropbox token",
    }
];
*/
clear();

console.log(
    chalk.blue(
        figlet.textSync('Text-to-Speech Interactive Command Line Tool', 
            { horizontalLayout: 'default', font: 'digital' })
    )
, '\n');




// authenticate 
authenticate().then(() => {
    console.info('Authenticated!', '\n');

    inquirer
        .prompt([
            {
                type: 'list',
                name: 'language_id',
                message: "Choose a language for speech",
                choices: ["en-US", "es-ES", "es-MX", "es-US", "fr-CA", "fr-FR", "is-IS", "it-IT"]
            }
        ])
        .then(answers => {
            getVoices(answers.language_id).then((allVoices) => {
                let voices = [];
                allVoices.map(
                    v => voices.push(v.Id.concat(' (Gender: ', v.Gender , ' - Engines: ', v.SupportedEngines, ')'))
                );
                
                const questions = pollyQuestions(voices);
                
                inquirer.prompt(questions).then(answers => {
                    console.log(JSON.stringify(answers, null, '\n'));
                    
                    readFile(answers['text_path']).then((text) => {
                        let params = {
                            'Text': text,
                            'OutputFormat': 'mp3',
                            'VoiceId': answers['voice_id'].split(' (')[0]
                        }
                        
                        generateAudio(params, answers['file_name']).then((filePath) => {
                            // uploadFile('jlIPA3BaeGwAAAAAAAAALhS9geBr8v32zVqVccWuQpa2tAZeb4HAhL7BFbw9TAR2', "./" + filePath, '/' + answers['destination_folder'] + '/' + filePath)
                        }, err => {
                            console.log(err)
                        })
                    }, err => {
                        console.log(err);
                    })
                })
            })

        });
},err => {
    console.log(err);
})



const readFile = (path) => {
    return new Promise((resolve, reject) => {
        Fs.readFile(path, (err, data) => {
            if (err)
            reject('File Not Found');
            else
            resolve(data.toString());
        });
    })
}


// AWS.config.getCredentials(function (err) {
//     if (err) console.log(err.stack);
//     // credentials not loaded
//     else {
//         console.log("Access key:", AWS.config.credentials.accessKeyId);
//         console.log("Secret access key:", AWS.config.credentials.secretAccessKey);
//     }
// });
