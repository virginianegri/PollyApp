const AWS = require('aws-sdk')
const Fs = require('fs');

// Create an Polly client
const Polly = new AWS.Polly({
    signatureVersion: 'v4',
    region: 'us-east-1'
})

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
                    Fs.writeFile("./" + filePath, data.AudioStream, function (err) {
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
    getVoices: getVoices,
    generateAudio: generateAudio
}