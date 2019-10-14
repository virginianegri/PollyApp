let questions2 = [
    {
        type: 'input',
        name: 'text_path',
        message: "Enter the path to the text file"
    },
    {
        type: 'input',
        name: 'file_name',
        message: "Enter name of the audio file to be created",
        default: () => {
            return 'audioFile';
        }
    },
    {
        type: 'input',
        name: 'destination_folder',
        message: "Enter name of the folder you want to put the audio file",
        default: () => {
            return '/dropbox/';
        }
    },
    {
        type: 'list',
        name: 'voice_id',
        message: "Choose a voice for speech",
        choices: []
    }
];

const getPollyQuestions = (choices) => {
    questions2[questions2.length-1].choices = choices;
    return questions2;
}

module.exports = {
    pollyQuestions : getPollyQuestions,
}