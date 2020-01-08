const { getPollyParams } = require('./getPollyParams');
const { generateAudio } = require('./polly');

async function processPPTXAudioHelper (notes, finalConfig, fileName, relPath) {
    return new Promise((resolve)=>{
        promiseArray = [];
        for(i in notes){
            let pollyParams = getPollyParams(`<speak>${notes[i][1]}</speak>`, finalConfig.sharedConfig)
            // console.log(notes[i][0],notes[i][1], pollyParams)
            promiseArray.push(generateAudio(pollyParams, `media${notes[i][0]}`, `${relPath}${fileName}/ppt/media/`));
    
        };
        Promise.all(promiseArray).then((response)=>{
            // console.log(response);
            resolve(response);
        })
    });  
}

module.exports = {
    processPPTXAudioHelper
}