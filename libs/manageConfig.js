const Fs = require('fs');

/**
 * Check if a file exists with the given path
 * @param path A path to the file.
 * @resolve File exists.
 * @reject Error 'file not found'.
 */
async function accessFile(path) {
    return new Promise((resolve, reject) => {
        Fs.access(path, Fs.F_OK, (err) => {
            if (err) {
                console.log(('\n File not found! ' + path + ' \n'));
                reject(err);
            }
            else
                data = Fs.readFileSync(path);
                config = JSON.parse(data);
                resolve(config);
        });
    })
}

/**
 * Checks if there is a shared config present with the path
 * @param sharedPath path to the shared folder
 */
async function checkSharedConfig(sharedPath) {
    return new Promise((resolve,reject) => {
        const path = sharedPath + '/sharedConfig.json';
        Fs.readFile(path, (err, data) => {
            if (err) {
                reject(err);
            }
            else {
                sharedConfig = JSON.parse(data.toString());
                resolve(sharedConfig);
            }
        });
    })
}
/**
 * Checks the local config file and reads the config
 */
async function checkConfig(path) {
    return new Promise((resolve,reject) => {
        accessFile(path).then((config)=>{
            const sharedPath = config.shared_folder_path;
            checkSharedConfig(sharedPath).then((sharedConfig)=>{
                const finalConfig = {config: config, sharedConfig: sharedConfig}
                resolve(finalConfig);
            })
            .catch((err)=>{
                reject(err);
            })
        })
        .catch((err)=>{
            reject(err);
        });
    });
}

module.exports = {
    checkSharedConfig,
    accessFile,
    checkConfig
}