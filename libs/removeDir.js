const rimraf = require("rimraf");

/**
 * Remove directory
 * @param path A path to the input text to synthesize.
 * @resolve The file's content as string
 * @reject Error 'file not found'.
 */
async function removeDir (path) {
    return new Promise((resolve, reject)=>{
        rimraf(path,(err,data)=>{
            if(err)
                reject(err);
            else
                resolve(data);
        })
    });
}

module.exports = {
    removeDir
}