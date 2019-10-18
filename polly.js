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
const authenticate = (poolId) => {
    console.log("Authenticating...");
    
    // Configure the credentials provider to use your identity pool
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: poolId
        //IdentityPoolId: 'us-east-1:7bed0a02-3ef1-473e-9b9f-b4860fd67f85'
    });
    
    return new Promise((resolve, reject) => {
        // Make the call to obtain credentials
        AWS.config.credentials.get((err) => {
            if (err) 
                reject(err);
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


/**
 * Get available voices for a given language code
 * @param languageId Language code. 
 * @resolve A list of voices with their properties.
 * @reject Error 
 */
const getVoices = (languageId) => {
    var voiceParams = {
        LanguageCode: languageId
    };

    return new Promise((resolve, reject) => {
        Polly.describeVoices(voiceParams, function (err, data) {
            if (err)
                reject(err, err.stack); // an error occurred
            else
                resolve(data.Voices)
        })
    })
}

/**
 * Synthesize speech request
 * @param params Polly parameters: Text, OutputFormat, VoiceId
 * @param fileName A name for the audio file to be generated.
 * @resolve file path of the local generated audio file 
 * @reject Error 
 */
const generateAudio = (params, fileName) => {
    return new Promise((resolve, reject) => {
        Polly.synthesizeSpeech(params, (err, data) => {
            if (err) {
                reject(err.code);
                
            } else if (data) {
                if (data.AudioStream instanceof Buffer) {
                    // path to store audio file
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