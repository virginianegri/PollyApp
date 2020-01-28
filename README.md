# Polly App

A Nodejs based application that exploits Text-to-Speech service provided by Amazon Polly to perform the following transformations
* Convert text file (.txt format) to audio file (.mp3) and multiple text files simultaneously present in a folder to multiple audio files.
* In addition to that the main functionality is to read the footer notes in the Microsoft PowerPoint Presentation (.pptx format), converting them to audios using Amazon Polly and then inserting those audios in the corresponding slides in the deck.

## Requirements

The only requirement of this application is the Node Package Manager. All other
dependencies (including the AWS SDK for Node.js) can be installed with:

    npm install

## Running the app
### Running the app in Command line GUI mode
    node GUI
### Running the app in Simple Command line 
    node pollycli [command]
#### Sample commands
* node pollycli --help
* node pollycli singletext --filename <filename of file placed under SharedFolder/texts/>
* node pollycli multitext
* node pollycli singlepptx --filename "<filename of file placed under SharedFolder/pptx/>"

## License

This sample application is distributed under the
[Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0).

