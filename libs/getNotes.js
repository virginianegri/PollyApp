const path = require('path');
const fs = require('fs');
const convert = require('xml-js');

/**
 * Synthesize speech request
 * @param folderPath Polly parameters: Text, OutputFormat, VoiceId
 * @resolve Promise json object of all text
 * @reject Error
 * @sample  getNotes('path/to/xmls')
 */

function getNotes(folderPath) {
    //passsing directoryPath and callback function
    return new Promise((resolve, reject) => {
        let texts=[];

        //joining path of directory 
        const directoryPath = path.join(__dirname, folderPath);
        fs.readdir(directoryPath, function (err, files) {
            //handling error
            if (err) {
                console.log('Unable to scan directory: ' + err);
                reject(e);
            }
            //listing all files using forEach
            var count=0;
            files.forEach(function (file) {
                // Do whatever you want to do with the file
                try {
                    if(file.includes("notesSlide")) {       
                        name=file.toString();
                        temp_path=folderPath+file;
    
                        var xml = require('fs').readFileSync(temp_path, 'utf8');
                        var result = convert.xml2json(xml, {compact: true, spaces: 4});
                        obj = JSON.parse(result);
                        text=obj['p:notes']['p:cSld']['p:spTree']['p:sp'][0]['p:txBody']['a:p'][0]['a:r']['a:t']._text;
                        let slide_number=file.match(/\d+/).toString();
                        texts.push([slide_number,text]);
                    }
                }
                catch(e) {
                    console.log(e.message);
                    return;
                }
            });
            resolve(texts);
        });
    }); 
}

module.exports = {
    getNotes
}




