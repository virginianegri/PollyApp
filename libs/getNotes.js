const path = require('path');
const fs = require('fs');
const convert = require('xml-js');

/**
 * getNotes takes a path to folder containing xmls and then parses each file for extrating lecture notes
 * @param folderPath
 * @resolve Promise json object of all text
 * @reject Error
 * @sample  getNotes('path/to/xmls')
 */

async function getNotes(folderPath) {
    return new Promise((resolve, reject) => {
        let texts=[];

        //TODO: Need to absolute path from Driver funcation.
        fs.readdir(folderPath, function (err, files) {
            //handling error
            if (err) {
                console.log('Unable to scan directory: ' + err);
                reject(err);
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

                        // After fetching the xml file content look for node name _text and parse to get lecture notes of a slide
                        text = result.match(/"_text": [#A-Za-z ,."]*/g).toString().replace(/,"_text": [A-Za-z ,."] */g,'').replace(/"_text":[A-Za-z ,.] */g,'').replace(/"*/g,'');
                        let slide_number=file.match(/\d+/).toString();

                    
                        texts.push([slide_number,text]);
                    }
                }
                catch(e) {
                    // console.log(temp_path, e.message);
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
