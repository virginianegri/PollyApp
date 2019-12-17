const fs = require('fs');
const { unzip, zipMulti } = require('./libs/compress');
const  { getNotes } = require('./libs/getNotes');
const { authenticate, generateAudio } = require('./libs/polly');

const relPath = './SharedFolder/pptx/';

async function processPPTXFile(fileName, config, poolId) {

    await authenticate(config, poolId);

    let fileNameSplit = fileName.split('.')
    fileName = fileNameSplit[0];
    let fileExt = fileNameSplit[1];

    fs.renameSync(`${relPath}${fileName}.${fileExt}`, `${relPath}${fileName}.zip`);

    await unzip(`${relPath}${fileName}.zip`, `${relPath}${fileName}`)
    console.log(await getNotes(`${relPath}${fileName}/ppt/notesSlides/`));
    await zipMulti([`${relPath}${fileName}/_rels/`,`${relPath}${fileName}/[Content_Types].xml`,`${relPath}${fileName}/docProps/`,`${relPath}${fileName}/ppt/`], `${relPath}${fileName}_new.zip`);

    fs.renameSync(`${relPath}${fileName}.zip`, `${relPath}${fileName}.${fileExt}`);
    fs.renameSync(`${relPath}${fileName}_new.zip`, `${relPath}${fileName}_new.${fileExt}`);
}

let config = { shared_folder_path: '/Users/mohsinkhan/Repos/PollyApp2/SharedFolder', identityId: 'us-east-1:473f3858-a7fa-487a-96d6-5f45108dab3b' }
let poolId = 'us-east-1:7bed0a02-3ef1-473e-9b9f-b4860fd67f85'
processPPTXFile('demo.pptx', )