const fs = require('fs');

const { unzip, zipMulti } = require('./compress');
const { removeDir } = require('./removeDir')

const  { getNotes } = require('./getNotes');
const { processPPTXAudioHelper } = require('./processPPTXAudioHelper')

const { checkConfig } = require('./manageConfig');
const { authenticate } = require('./polly');

const relPath = './SharedFolder/pptx/';

const delay = (duration) =>
  new Promise(resolve => setTimeout(resolve, duration));

/**
 * processPPTX take a fileName and perform following operations: 
 * 1. Convert pptx to zip
 * 2. Extract zip
 * 3. Fetch config and authenticate AWS Polly
 * 4. Extract notes from extracted zip file
 * 5. Call processPPTXAudioHelper (Which converts text to audio and place at output path)
 * 6. zip the content of folder back
 * 7. convert zip to pptx
 * 8. delete content of folder after new zip is created (This is done with explicit delay to prevent deletion of content before zipping process)
 * @param fileName
 * @resolve Polly object
 * @reject Error 
 * @sample processPPTXFile('demo 3.pptx');
 */

async function processPPTXFile(fileName) {
    let fileNameSplit = fileName.split('.')
    fileName = fileNameSplit[0];
    let fileExt = fileNameSplit[1];

    fs.renameSync(`${relPath}${fileName}.${fileExt}`, `${relPath}${fileName}.zip`);
    await unzip(`${relPath}${fileName}.zip`, `${relPath}${fileName}`)

    let finalConfig = await checkConfig('./config.json');
    await authenticate(finalConfig.config, finalConfig.sharedConfig.aws_pool_id);

    let notes = await getNotes(`${relPath}${fileName}/ppt/notesSlides/`);
    await processPPTXAudioHelper(notes, finalConfig, fileName, relPath);

    await zipMulti([`${relPath}${fileName}/_rels/`,`${relPath}${fileName}/[Content_Types].xml`,`${relPath}${fileName}/docProps/`,`${relPath}${fileName}/ppt/`], `${relPath}${fileName}_new.zip`);
    fs.renameSync(`${relPath}${fileName}.zip`, `${relPath}${fileName}.${fileExt}`);
    fs.renameSync(`${relPath}${fileName}_new.zip`, `${relPath}${fileName}_new.${fileExt}`);

    await delay(5000);
    await removeDir(`${relPath}${fileName}`);
}

module.exports = {
    processPPTXFile
}