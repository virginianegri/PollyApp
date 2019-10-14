const Fs = require('fs')
const inquirer = require('inquirer');
const uploadFile = require('./sample');
const { getVoices, generateAudio } = require('./polly');
const { pollyQuestions } = require('./questions');

/*
var questions = [
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

getVoices().then((allVoices) => {
    let voices = [];
    allVoices.map(v => voices.push(v.Id));

    const questions = pollyQuestions(voices);

    inquirer.prompt(questions).then(answers => {
        console.log(answers);
        console.log(JSON.stringify(answers, null, ' '));

        readFile(answers['text_path']).then((text) => {

            let params = {
                'Text': text,
                'OutputFormat': 'mp3',
                'VoiceId': answers['voice_id']
            }

            generateAudio(params, answers['file_name']).then((filePath) => {
                uploadFile('jlIPA3BaeGwAAAAAAAAALhS9geBr8v32zVqVccWuQpa2tAZeb4HAhL7BFbw9TAR2', "./" + filePath, '/' + answers['destination_folder'] + '/' + filePath)
            }, err => {
                console.log(err)
            })
        }, err => {
            console.log(err);
        })
    })
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

/*
inquirer.prompt(questions).then(answers => {
    console.log(JSON.stringify(answers, null, ' '));

})
*/


// AWS.config.getCredentials(function (err) {
//     if (err) console.log(err.stack);
//     // credentials not loaded
//     else {
//         console.log("Access key:", AWS.config.credentials.accessKeyId);
//         console.log("Secret access key:", AWS.config.credentials.secretAccessKey);
//     }
// });