# Polly App

A Nodejs based application that exploits Text-to-Speech service provided by Amazon Polly to perform the following transformations
* Convert text file (.txt format) to audio file (.mp3) and multiple text files simultaneously present in a folder to multiple audio files.
* Read the footer notes of a Microsoft PowerPoint Presentation file (.pptx extension), convert them into audios using Amazon Polly and insert the audio files into the corresponding slides in the deck

## Requirements

The only requirement of this application is the Node Package Manager. All other
dependencies (including the AWS SDK for Node.js) can be installed with:

    npm install

## Running the app
### Creating the Configuration file
    node pollycli createconfig SharedFolder
### Running the app in Command line GUI mode
    node GUI
### Running the app in Simple Command line 
    node pollycli [command]
#### Sample commands
* node pollycli --help
* node pollycli singletext --filename <filename of file placed under SharedFolder/texts/>
* node pollycli multitext
* node pollycli singlepptx --filename "<filename of file placed under SharedFolder/pptx/>"
* node pollycli createconfig --pathsharedconfig </path to shared folder>

### Demo
#### Running the Singlepptx command
    node pollycli singlepptx --filename "demo.pptx"
##### Description  
* The command takes as input the file "demo.pptx" placed under SharedFolder/pptx/
* The result is a new .pptx file "demo_new.pptx" placed in the same folder with the audio files generated from the footer notes

## Documentation
* Under the documentation folder you can find a complete documentation of the project
* In the appendix you can find useful tips to write PowerPoint footer notes suitable for Amazon Polly and to create a clean and professional video.

## License

This sample application is distributed under the
[Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0).

