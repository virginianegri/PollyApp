function getPollyParams (textToSpeech, sharedConfig) {
    const pollyParams = sharedConfig.polly_params;
    pollyParams.VoiceId = sharedConfig.default_voice;
    pollyParams.Text = textToSpeech;
    return pollyParams;
}

module.exports = {
    getPollyParams
}