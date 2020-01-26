/**
 * A very simple utility function that generate pollyParams for AWS Polly service call
 * @param textToSpeech, @param sharedConfig
 * @resolve pollyParams
 * @sample  getPollyParams('I want this text converted!', Json)
 * @Json { aws_pool_id: '',
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

function getPollyParams (textToSpeech, sharedConfig) {
    const pollyParams = sharedConfig.polly_params;
    pollyParams.VoiceId = sharedConfig.default_voice;
    pollyParams.Text = textToSpeech;
    return pollyParams;
}

module.exports = {
    getPollyParams
}