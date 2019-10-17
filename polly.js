const AWS = require('aws-sdk')
const Fs = require('fs');

AWS.config.region = 'us-east-1';

let Polly;

const authenticate = (poolId) => {
    console.log("Authenticating...");

    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: poolId
        //IdentityPoolId: 'us-east-1:7bed0a02-3ef1-473e-9b9f-b4860fd67f85'
    });

    return new Promise((resolve, reject) => {
        AWS.config.credentials.get((err) => {
            if (err) reject(err);
            else {
                Polly = new AWS.Polly({
                    signatureVersion: 'v4',
                    region: 'us-east-1',
                });
                resolve();
            }
        })
    })
}

var voiceParams = {
    LanguageCode: "en-US"
};

const getVoices = () => {
    return new Promise((resolve, reject) => {
        Polly.describeVoices(voiceParams, function (err, data) {
            if (err)
                reject(err, err.stack); // an error occurred
            else
                resolve(data.Voices)
        })
    })
}

const generateAudio = (params, fileName) => {
    return new Promise((resolve, reject) => {
        Polly.synthesizeSpeech(params, (err, data) => {
            if (err) {
                reject(err.code)
            } else if (data) {
                if (data.AudioStream instanceof Buffer) {
                    const filePath = fileName + '.mp3';
                    Fs.writeFile('./' + filePath, data.AudioStream, function (err) {
                        if (err)
                            reject(err)
                        else
                            resolve(filePath)
                    })
                }
            }
        })
    })
}

module.exports = {
    authenticate: authenticate,
    getVoices: getVoices,
    generateAudio: generateAudio
}