//requiring path and fs modules
const path = require('path');
const fs = require('fs');
var convert = require('xml-js');
let texts=[];
let folder_path='demo/ppt/notesSlides/';
//joining path of directory 
const directoryPath = path.join(__dirname, folder_path);
//passsing directoryPath and callback function
fs.readdir(directoryPath, function (err, files) {
    //handling error

    if (err) {
        return console.log('Unable to scan directory: ' + err);
    } 
    //listing all files using forEach
    var count=0;
    files.forEach(function (file) {
        // Do whatever you want to do with the file
        //console.log(file); 
        try{
            if(file.includes("notesSlide"))
        {
            //console.log("hi");
            name=file.toString();
            temp_path=folder_path+file;

            var xml = require('fs').readFileSync(temp_path, 'utf8');
            var result = convert.xml2json(xml, {compact: true, spaces: 4});
            obj = JSON.parse(result);
            text=obj['p:notes']['p:cSld']['p:spTree']['p:sp'][0]['p:txBody']['a:p'][0]['a:r']['a:t']._text;
            let slide_number=file.match(/\d+/).toString();
            texts.push([slide_number,text]);
            //console.log();
            
            
            //count++;
        }
        }
        
        
        
        catch(e)
        {;}


        
    });
    console.log(texts);
});