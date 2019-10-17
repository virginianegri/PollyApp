const Fs = require('fs');
const inquirer = require('inquirer');
const uploadFile = require('./dropbox');
const { authenticate, getVoices, generateAudio } = require('./polly');
const { restartQuestion, authQuestions, pollyQuestions } = require('./questions');

let config = {
    aws_pool_id: '',
    dropbox_key: ''
}

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
                console.log(config);
                if (!config.hasOwnProperty('aws_pool_id') || !config.hasOwnProperty('dropbox_key')) {
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
    authenticate(config.aws_pool_id).then(() => {
        console.log('Authenticated!');
        startAudioProcess();
    }, err => {
        console.log(err);
        if (err.statusCode == 400) {
            console.log("AWS Auth Problem");
        }
    })

}, err => {
    //TODO: Ask Keys from user
    console.log("Keys don't exist!");
    console.log(err);
})

const startAudioProcess = () => {

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
                    uploadFile(config.dropbox_key, './' + filePath, '/' + answers['destination_folder'] + '/' + filePath)
                        .then(() => {
                            console.log("File saved!");
                            inquirer.prompt(restartQuestion).then(answers=>{
                                if(answers['confirm'] == true){
                                    startAudioProcess();
                                }
                            });
                        }, err => {
                            if (err.code == 401) {
                                //Authorization problem
                                console.log("Dropbox Auth Problem");
                            }
                        })
                }, err => {
                    console.log(err)
                })
            }, err => {
                console.log(err);
            })
        })
    })
}


const askCredentials = () => {
    return new Promise((resolve) => {
        inquirer.prompt(authQuestions).then(answers => {
            let data = Fs.readFileSync('./config.json');
            config = JSON.parse(data);

            config.aws_pool_id = 'us-east-1:7bed0a02-3ef1-473e-9b9f-b4860fd67f85';
            config.dropbox_key = 'jlIPA3BaeGwAAAAAAAAALhS9geBr8v32zVqVccWuQpa2tAZeb4HAhL7BFbw9TAR2';

            data = JSON.stringify(config);

            Fs.writeFileSync('./config.json', data);
            resolve();
        })
    })
}

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