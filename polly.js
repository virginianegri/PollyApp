const AWS = require('aws-sdk')
const Fs = require('fs');

// Set the region where your identity pool exists (us-east-1, eu-west-1)
AWS.config.region = 'us-east-1';

let Polly;

let languages = [];
let languageCodes = [];

/**
 * Authenticate using Amazon Cognito 
 * @param poolId 
 * @resolve Polly object
 * @reject Error 
 */
const authenticate = (config, poolId) => {
    console.log("Authenticating AWS...");

    return new Promise((resolve, reject) => {
        if (!config.hasOwnProperty('identityId')) {
            // There is no identity created for this user, create new identity
            // Configure the credentials provider to use your identity pool
            AWS.config.credentials = new AWS.CognitoIdentityCredentials({
                IdentityPoolId: poolId
                //IdentityPoolId: 'us-east-1:7bed0a02-3ef1-473e-9b9f-b4860fd67f85'
            });

            // Make the call to obtain credentials
            AWS.config.credentials.get((err) => {
                if (err)
                    reject(err.code);
                else {
                    // Credential retrieval successful, save identityId for future references
                    config.identityId = AWS.config.credentials.params.IdentityId;

                    instantiatePolly();

                    Fs.writeFile('./config.json', JSON.stringify(config), err => {
                        if (err)
                            reject(err);
                        else {
                            resolve();
                            // getLanguages().then((allLanguages) => {
                            //     // Fill in choices for languages
                            //     languages = allLanguages;
                            //     resolve();
                            // })
                        }
                    });
                }
            })
        }
        else {
            //There is an identity already created, refresh token if necessary
            AWS.config.credentials = new AWS.CognitoIdentityCredentials({
                IdentityId: config.identityId
                //IdentityPoolId: 'us-east-1:7bed0a02-3ef1-473e-9b9f-b4860fd67f85'
            });

            AWS.config.credentials.refresh(err => {
                if (err)
                    reject(err);
                else {
                    instantiatePolly();

                    resolve();
                    // getLanguages().then((allLanguages) => {
                    //     // Fill in choices for languages
                    //     languages = allLanguages;
                    //     resolve();
                    // })
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
 * Get available languages
 */
const getLanguages = () => {
    return new Promise((resolve, reject) => {
        Polly.describeVoices(function (err, data) {
            if (err)
                reject(err, err.stack); // an error occurred
            else
                resolve(data.Voices)
        })
    })
}

/*
 * Returns all language codes available on Polly platform 
 */
const getLanguageCodes = () => {
    // Fill in choices for languages
    languages.map(l => {
        if (languageCodes.indexOf(l.LanguageCode) == -1) {
            languageCodes.push(l.LanguageCode);
            //languageQuestion[0].choices.push(l.LanguageCode)
        }
    });

    return languageCodes;
}

/**
 * Get available voices for a given language code
 * @param languageCode Language code. 
 */
const getVoices = (languageCode) => {
    let voices = [];
    languages.map(l => {
        if (l.LanguageCode === languageCode)
            voices.push(l);
    });
    return voices;
}

/**
 * Synthesize speech request
 * @param params Polly parameters: Text, OutputFormat, VoiceId
 * @param fileName A name for the audio file to be generated.
 * @resolve file path of the local generated audio file 
 * @reject Error 
 */
const generateAudio = (params, fileName, audioPath) => {
    return new Promise((resolve, reject) => {
        Polly.synthesizeSpeech(params, (err, data) => {
            if (err) {
                reject(err.originalError.code);

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
    getLanguageCodes: getLanguageCodes,
    getVoices: getVoices,
    generateAudio: generateAudio
}