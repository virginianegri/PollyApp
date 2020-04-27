const fs = require('fs');

const { unzip, zipMulti } = require('./compress');
const { removeDir } = require('./removeDir')

const  { addAudioToSlides } = require('./addAudioToSlides');

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
 * 4. Add audio metadata to xml slides
 * 5. Extract notes from extracted zip file
 * 6. Call processPPTXAudioHelper (Which converts text to audio and place at output path)
 * 7. zip the content of folder back
 * 8. convert zip to pptx
 * 9. delete content of folder after new zip is created (This is done with explicit delay to prevent deletion of content before zipping process)
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
    
    await addAudioToSlides(`${relPath}${fileName}`)
    
    let notes = await getNotes(`${relPath}${fileName}/ppt/notesSlides/`);
    await processPPTXAudioHelper(notes, finalConfig, fileName, relPath);

    await zipMulti([`${relPath}${fileName}/_rels/`,`${relPath}${fileName}/[Content_Types].xml`,`${relPath}${fileName}/docProps/`,`${relPath}${fileName}/ppt/`], `${relPath}${fileName}_new.zip`);
    await delay(5000);
    
    fs.renameSync(`${relPath}${fileName}.zip`, `${relPath}${fileName}.${fileExt}`);
    fs.renameSync(`${relPath}${fileName}_new.zip`, `${relPath}${fileName}_new.${fileExt}`);
    await removeDir(`${relPath}${fileName}`);
}

module.exports = {
    processPPTXFile
}