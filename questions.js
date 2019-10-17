const authQuestions = [
    {
        type: 'input',
        name: 'aws_pool_id',
        message: "Enter the AWS identity pool id:"
    },
    {
        type: 'input',
        name: 'dropbox_access_key',
        message: "Enter the Dropbox access key:"
    }
];

let synthesizeQuestions = [
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
    synthesizeQuestions[synthesizeQuestions.length-1].choices = choices;
    return synthesizeQuestions;
}

module.exports = {
    pollyQuestions : getPollyQuestions,
    authQuestions: authQuestions
}