const rimraf = require("rimraf");

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