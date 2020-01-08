const { readFile } = require('./readFile');
const { getPollyParams } = require('./getPollyParams');
const { generateAudio } = require('./polly');

async function generateAllAudios (files,filePath, finalConfig) {
    for (const file of files) {
        const fileName = file.split('.')[0];
        const text = await readFile(filePath+ '/' + file);
        let pollyParams = getPollyParams(text, finalConfig.sharedConfig);

        await generateAudio(pollyParams, fileName,`${finalConfig.config.shared_folder_path}/${finalConfig.sharedConfig.audio_folder}`)
    }
    return 'Audios Generated successfully!'
}

module.exports = {
    generateAllAudios
}