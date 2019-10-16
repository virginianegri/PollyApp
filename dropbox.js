const dropboxV2Api = require('dropbox-v2-api');
const fs = require('fs');

module.exports = uploadFile = (token, pathToFile, pathToUpload) => {
  //console.log(pathToFile);
  //console.log(pathToUpload);
  // create session ref:
  const dropbox = dropboxV2Api.authenticate({
    token: token
  });

  dropbox({
    resource: 'files/upload',
    parameters: {
      path: pathToUpload,
      mode: "overwrite"
    },
    readStream: fs.createReadStream(pathToFile)
  }, (err, result, response) => {
    //upload completed
    console.log(result);
  });
}


