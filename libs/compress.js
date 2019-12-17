const path = require('path');
const fs = require('fs');
const pump = require('pump');
const compressing = require('compressing');

/**
 * unzip file using compress
 * @param sourcePath @param destinationPath
 * @resolve Null
 * @reject Error 
 * @Sample unzip('/path/to/archive.zip', '/Extract/Path');
 */

async function unzip(sourcePath, destinationPath) {
    await compressing.zip.uncompress(sourcePath, destinationPath);
    // .then(result =>{
    //     resolve(result);
    // })
    // .catch(handleError => {
    //     reject(new Error(handleError.toString()));
    // });
}

/**
 * zip entire folder using compress notice: folder would be part of the extract.
 * @param sourcePath @param destinationPath
 * @resolve Null
 * @reject Error 
 * @Sample zipFolder('/path/to/folder', 'path/destincation/archive.zip');
 */
async function zipFolder (sourcePath, destinationPath) {
    await compressing.zip.compressDir(sourcePath, destinationPath)
    // .then(result =>{
    //     return result;
    // })
    // .catch(handleError => {
    //     throw new Error(handleError.toString());
    // });
}

/**
 * zip multi files and folders
 * @param sourcePath[] @param destinationPath
 * @resolve Null
 * @reject Error 
 * @Sample zipMulti(['/path/to/folder','./path/to/file'],'path/destincation/archive.zip');
 */
async function zipMulti (sourcePaths, destinationPath) {
    const zipStream = new compressing.zip.Stream();
    
    sourcePaths.forEach(path => {
        zipStream.addEntry(path); 
    })  

    const destStream = fs.createWriteStream(destinationPath);
    pump(zipStream, destStream,  function(err) {
        console.log('pipe finished', err)
    });
}

module.exports = {
    unzip,
    zipMulti,
    zipFolder
}