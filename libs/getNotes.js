const path = require('path');
const fs = require('fs');

const Entities = require('html-entities').AllHtmlEntities;
const entities = new Entities();

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
            files.forEach(function (file) {
                // Do whatever you want to do with the file
                try {
                    if(file.includes("notesSlide")) {       
                        name=file.toString();
                        temp_path=folderPath+file;
    
                        let xmlContent = require('fs').readFileSync(temp_path, 'utf8');
                        
                        // Extract slide notes from xml using <a:t> tags
                        let openTextTag = xmlContent.indexOf('<a:t>')
                        let closeTextTag = 0
                        let endTextTag = xmlContent.indexOf('</p:txBody>')
                        let text = ''
                        while (openTextTag < endTextTag && openTextTag != -1) {
                            closeTextTag = xmlContent.indexOf('</a:t>', openTextTag)
                            text += entities.decode(xmlContent.slice(openTextTag+5, closeTextTag))
                            openTextTag = xmlContent.indexOf('<a:t>', closeTextTag)
                        }
                        // Add <speak> tag for Polly
                        text = '<speak>' + text + '</speak>'
                        
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
