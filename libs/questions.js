const configQuestions = [
    {
        type: 'input',
        name: 'shared_folder_path',
        message: 'Enter the shared folder path'
    }
];
const typeQuestions = [
    {
        type: 'list',
        name: 'generate_choice',
        message: 'Select the type of file',
        choices: ['Text','Power Point Presentation'],
        default: 'Text'
    }  
]
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

const synthesizeQuestion = [
    {
        type: 'input',
        name: 'file_name',
        message: "Enter the name of the file"
    }
];
const synthesizeExtQuestion = [
    {
        type: 'input',
        name: 'file_ext',
        message: "Enter the extention of the file"
    }
];
const synthesizePPTXQuestion = [
    {
        type: 'input',
        name: 'file_name',
        message: "Enter the name of the pptx file"
    }
];

module.exports = {
    pollyQuestion: synthesizeQuestion,
    pollyExtQuestion: synthesizeExtQuestion,
    pollyPPTXQuestion: synthesizePPTXQuestion,
    configQuestions: configQuestions,
    restartQuestion: restartQuestion,
    audioQuestions: audioQuestions,
    typeQuestions: typeQuestions
}