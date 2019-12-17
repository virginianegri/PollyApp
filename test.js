const { authenticate, generateAudio } = require('./libs/polly');
const { checkSharedConfig, accessFile, checkConfig } = require('./libs/manageConfig');
const { readFile } = require('./libs/readFile');

async function test() {
    // await authenticate({"shared_folder_path":"/Users/mohsinkhan/Repos/PollyApp2/SharedFolder","identityId":"us-east-1:473f3858-a7fa-487a-96d6-5f45108dab3b"},'us-east-1:7bed0a02-3ef1-473e-9b9f-b4860fd67f85').then((response)=>{
    // });
    
    // let pollyParams = {
    //     'Text': 'hello',
    //     'OutputFormat': 'mp3',
    //     'Engine': 'neural',
    //     'TextType': "ssml",
    //     'VoiceId': ''
    // }
    // await generateAudio({ Text: '<speak>\n    Which one is the tomato within the ingredients that I showed you?\n</speak>',
    // OutputFormat: 'mp3',
    // Engine: 'neural',
    // TextType: 'ssml',
    // VoiceId: 'Brian' },'text', '/Users/mohsinkhan/Repos/PollyApp2/SharedFolder/audios')

    // console.log(await accessFile('./config.json'))
    // console.log(await checkConfig('./config.json'))
    console.log(await readFile('./SharedFolder/texts/text.txt'))

}
test();