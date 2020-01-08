const AWS = require('aws-sdk')
const Fs = require('fs');

// Set the region where your identity pool exists (us-east-1, eu-west-1)
AWS.config.region = 'us-east-1';

let Polly;

/**
 * Authenticate using Amazon Cognito 
 * @param poolId 
 * @resolve Polly object
 * @reject Error 
 */
async function authenticate (config, poolId) {
    console.log("Authenticating AWS...");
    return new Promise((resolve, reject) => {
        if (!config.hasOwnProperty('identityId')) {
            // There is no identity created for this user, create new identity
            // Configure the credentials provider to use your identity pool
            AWS.config.credentials = new AWS.CognitoIdentityCredentials({
                IdentityPoolId: poolId
            });

            // Make the call to obtain credentials
            AWS.config.credentials.get((err) => {
                if (err) {
                    if (err.hasOwnProperty('originalError')) {
                        reject(err.originalError.code);
                    }
                    else {
                        reject(err.message);
                    }

                }
                else {
                    // Credential retrieval successful, save identityId for future references
                    config.identityId = AWS.config.credentials.params.IdentityId;

                    instantiatePolly();

                    Fs.writeFile('./config.json', JSON.stringify(config), err => {
                        if (err)
                            reject(err);
                        else {
                            resolve();
                        }
                    });
                }
            })
        }
        else {
            //There is an identity already created, refresh token if necessary
            AWS.config.credentials = new AWS.CognitoIdentityCredentials({
                IdentityId: config.identityId
            });

            AWS.config.credentials.refresh(err => {
                if (err) {
                    if (err.hasOwnProperty('originalError')) {
                        reject(err.originalError.code);
                    }
                    else {
                        reject(err.message);
                    }
                }
                else {
                    instantiatePolly();
                    resolve();
                }
            });
        }
    })
}

/*
 * Instantiates Polly object with default values 
 */
const instantiatePolly = () => {
    Polly = new AWS.Polly({
        signatureVersion: 'v4',
        region: 'us-east-1',
    });
}

/**
 * Synthesize speech request
 * @param params Polly parameters: Text, OutputFormat, VoiceId
 * @param fileName A name for the audio file to be generated.
 * @resolve file path of the local generated audio file 
 * @reject Error 
 */
async function generateAudio (params, fileName, audioPath) {
    return new Promise((resolve, reject) => {
        console.log('\nGenerating Audio');
        Polly.synthesizeSpeech(params, (err, data) => {
            if (err) {
                if (err.hasOwnProperty('originalError')) {
                    reject(err.originalError.code);
                }
                else {
                    reject(err);
                }
            } else if (data) {
                if (data.AudioStream instanceof Buffer) {
                    // path to store audio file
                    const filePath = audioPath + '/' + fileName + '.mp3';
                    Fs.writeFile(filePath, data.AudioStream, (err) => {
                        if (err)
                            reject('Folder not found: ' + audioPath);
                        else
                            resolve(filePath);
                    })
                }
            }
        })
    })
}

async function generateAudio (params, fileName, audioPath) {
    return new Promise((resolve, reject) => {
        console.log('\nGenerating Audio');
        Polly.synthesizeSpeech(params, (err, data) => {
            if (err) {
                if (err.hasOwnProperty('originalError')) {
                    reject(err.originalError.code);
                }
                else {
                    reject(err);
                }
            } else if (data) {
                if (data.AudioStream instanceof Buffer) {
                    // path to store audio file
                    const filePath = audioPath + '/' + fileName + '.mp3';
                    Fs.writeFile(filePath, data.AudioStream, (err) => {
                        if (err)
                            reject('Folder not found: ' + audioPath);
                        else
                            resolve(filePath);
                    })
                }
            }
        })
    })
}


module.exports = {
    authenticate: authenticate,
    generateAudio: generateAudio
}