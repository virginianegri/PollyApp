const { readFile } = require('./readFile');
const { getPollyParams } = require('./getPollyParams');
const { generateAudio } = require('./polly');

/**
 * generateAllAudios make use of generateAudio function to generate audio for all files provided.
 * @param files[] array of file names
 * @param filePath base path
 * @param finalConfig containing json of configuration required.
 * @resolve Success Message
 * @reject Error 
 * @Sample generateAllAudios([ 'text.txt', 'text2.txt'], '<base>/PollyApp2/SharedFolder/texts', json);
 * @Json { config: 
   { shared_folder_path: '/Users/<path>',
     identityId: '' },
  sharedConfig: 
   { aws_pool_id: '',
     text_folder: 'texts',
     pptx_folder: 'pptx',
     audio_folder: 'audios',
     default_voice: 'Brian',
     extra_voice_character: '#',
     polly_params: 
      { Text: '',
        OutputFormat: 'mp3',
        Engine: 'neural',
        TextType: 'ssml',
        VoiceId: '' } } }
 */

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