const configQuestions = [
    {
        type: 'input',
        name: 'shared_folder_path',
        message: 'Enter the shared folder path'
    }
];

const audioQuestions = [
    {
        type: 'list',
        name: 'generate_choice',
        message: 'Select the type of audio generation',
        choices: ['Single','All'],
        default: 'Single'
    }
];

const restartQuestion = [
    {
        type: 'confirm',
        name: 'confirm_restart',
        message: 'Would you like to create more audio files?',
        default: false
    }
]

let synthesizeQuestions = [
    {
        type: 'input',
        name: 'file_name',
        message: "Enter the name of the text file"
    },
    {
        type: 'list',
        name: 'voice_id',
        message: "Choose a voice for speech",
        choices: []
    }
];

const getPollyQuestions = (choices) => {
    synthesizeQuestions[synthesizeQuestions.length - 1].choices = choices;
    return synthesizeQuestions;
}

module.exports = {
    pollyQuestions: getPollyQuestions,
    configQuestions: configQuestions,
    restartQuestion: restartQuestion,
    audioQuestions: audioQuestions
}