const Fs = require('fs');
/**
 * Get the content of a file
 * @param path A path to the input text to synthesize.
 * @resolve The file's content as string
 * @reject Error 'file not found'.
 */
async function readFile (path) {
    return new Promise((resolve, reject) => {
        Fs.readFile(path, (err, data) => {
            if (err) {
                console.log(error('\n File not found! \n'));
                console.log(error('Path: ' + path));
                reject(err);
            }
            else
                resolve(data.toString());
        });
    })
}

module.exports = {
    readFile
}