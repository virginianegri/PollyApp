/**
 * How these xml strings work
 * - CONTENT_TYPE: needed by [Content_Types].xml in order to load the mp3 extension
 * - SLIDE_RELS: contains ids of the audio file and the speaker image.
 *               These ids are used in the actual slideY.xml file
 * - SLIDE_CONTENT1: add the audio in the slide, using the ids in SLIDE_RELS
 * - SLIDE_CONTENT2: add settings about duration of the audio. N.B.: the xml 
 *                  attribute 'spid="300"' points to the xml attribute 'p:cNvPr id="300"'
 *                  of SLIDE_CONTENT1. Their values MUST be the same
 */

const fs = require('fs')

const CONTENT_TYPE = '<Default Extension="mp3" ContentType="audio/mpeg"/>'

const SLIDE_RELS = '<Relationship Id="rId200" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/audio" Target="../media/mediaY.mp3"/> \
<Relationship Id="rId201" Type="http://schemas.microsoft.com/office/2007/relationships/media" Target="../media/mediaY.mp3"/> \
<Relationship Id="rId202" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/image400.png"/>'

const SLIDE_CONTENT1 = '<p:pic><p:nvPicPr><p:cNvPr id="300" name="Audio notes.mp3" descr="Audio notes.mp3"><a:hlinkClick r:id="" action="ppaction://media"/><a:extLst><a:ext uri="{FF2B5EF4-FFF2-40B4-BE49-F238E27FC236}"><a16:creationId xmlns:a16="http://schemas.microsoft.com/office/drawing/2014/main" id="{28DA9569-A4B7-3F4A-90DD-AD4AB8BC95F2}"/></a:ext></a:extLst></p:cNvPr><p:cNvPicPr><a:picLocks noChangeAspect="1"/></p:cNvPicPr><p:nvPr><a:audioFile r:link="rId200"/><p:extLst><p:ext uri="{DAA4B4D4-6D71-4841-9C94-3DE7FCFB9230}"><p14:media xmlns:p14="http://schemas.microsoft.com/office/powerpoint/2010/main" r:embed="rId201"/></p:ext></p:extLst></p:nvPr></p:nvPicPr><p:blipFill><a:blip r:embed="rId202"/><a:stretch><a:fillRect/></a:stretch></p:blipFill><p:spPr><a:xfrm><a:off x="-1000000" y="2165350"/><a:ext cx="812800" cy="812800"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr></p:pic>'
const SLIDE_CONTENT2 = '<p:timing><p:tnLst><p:par><p:cTn id="1" dur="indefinite" restart="never" nodeType="tmRoot"><p:childTnLst><p:seq concurrent="1" nextAc="seek"><p:cTn id="2" dur="indefinite" nodeType="mainSeq"><p:childTnLst><p:par><p:cTn id="3" fill="hold"><p:stCondLst><p:cond delay="indefinite"/></p:stCondLst><p:childTnLst><p:par><p:cTn id="4" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst><p:par><p:cTn id="5" presetID="1" presetClass="mediacall" presetSubtype="0" fill="hold" nodeType="clickEffect"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst><p:cmd type="call" cmd="playFrom(0.0)"><p:cBhvr><p:cTn id="6" dur="198974" fill="hold"/><p:tgtEl><p:spTgt spid="300"/></p:tgtEl></p:cBhvr></p:cmd></p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn><p:prevCondLst><p:cond evt="onPrev" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:prevCondLst><p:nextCondLst><p:cond evt="onNext" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:nextCondLst></p:seq><p:audio><p:cMediaNode vol="80000"><p:cTn id="7" fill="hold" display="0"><p:stCondLst><p:cond delay="indefinite"/></p:stCondLst><p:endCondLst><p:cond evt="onStopAudio" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:endCondLst></p:cTn><p:tgtEl><p:spTgt spid="300"/></p:tgtEl></p:cMediaNode></p:audio></p:childTnLst></p:cTn></p:par></p:tnLst></p:timing>'

async function addAudioToSlides(pptxFolderPath) {
    return new Promise(async (resolve, reject) => {
        // 1. Check the content_types xml file
        let contentTypesPath = `${pptxFolderPath}/[Content_types].xml`
        let xmlContent = fs.readFileSync(contentTypesPath, { encoding: 'utf8' })
        if (!xmlContent.includes(CONTENT_TYPE)) {
            let insertion_index = xmlContent.indexOf('<Default')
            let newXmlContent = xmlContent.slice(0, insertion_index) + CONTENT_TYPE + xmlContent.slice(insertion_index)
            fs.writeFileSync(contentTypesPath, newXmlContent)
        }
        
        // 2. Work on /ppt/slides/_rels/ folder
        let slides_rels = fs.readdirSync(`${pptxFolderPath}/ppt/slides/_rels/`)
        for (let file of slides_rels) {
            let slide_number = file.match(/\d+/).toString()
            let newRelsContent = SLIDE_RELS.replace(/mediaY/g, 'media'+slide_number)
            let filePath = `${pptxFolderPath}/ppt/slides/_rels/${file}`
            
            let xmlContent = fs.readFileSync(filePath, { encoding: 'utf8' })
            let insertion_index = xmlContent.indexOf('</Relationships>')
            let newXmlContent = xmlContent.slice(0, insertion_index) + newRelsContent + xmlContent.slice(insertion_index)
            
            fs.writeFileSync(filePath, newXmlContent)
            console.log(`Rels succeded: ${slide_number}`)
        }

        // 3. Work on /ppt/slides/ folder
        let slides = fs.readdirSync(`${pptxFolderPath}/ppt/slides/`)
        for (let file of slides) {
            if (file.includes('.xml')) {
                let filePath = `${pptxFolderPath}/ppt/slides/${file}`
                let xmlContent = fs.readFileSync(filePath, { encoding: 'utf8' })
                
                // If there is already an audio file, we want to get rid of old rIds.
                // We want to use our own rIds of SLIDE_RELS
                if (xmlContent.includes('<a:audioFile')) {
                    let audioTag = xmlContent.indexOf('<a:audioFile')
                    let openTag = xmlContent.lastIndexOf('<p:pic>', audioTag)
                    let closeTag = xmlContent.indexOf('</p:pic>', openTag)
                    xmlContent = xmlContent.slice(0, openTag) + xmlContent.slice(closeTag+8)
                    
                    let timingOpenTag = xmlContent.indexOf('<p:timing>')
                    let timingCloseTag = xmlContent.indexOf('</p:timing>', timingOpenTag)
                    xmlContent = xmlContent.slice(0, timingOpenTag) + xmlContent.slice(timingCloseTag+11)
                }
                
                let insertion_index1 = xmlContent.indexOf('</p:spTree>')
                let insertion_index2 = xmlContent.indexOf('</p:sld>')
                var newXmlContent = xmlContent.slice(0, insertion_index1)
                                + SLIDE_CONTENT1
                                + xmlContent.slice(insertion_index1, insertion_index2)
                                + SLIDE_CONTENT2
                                + xmlContent.slice(insertion_index2)

                fs.writeFileSync(filePath, newXmlContent)
                console.log('Slide succeded: ' + file)
            }
        }

        // 4. Add speaker icon into /ppt/media/ folder
        src = `${pptxFolderPath}/../../../libs/image400.png`
        dest = `${pptxFolderPath}/ppt/media/image400.png`
        fs.copyFileSync(src, dest)

        return resolve(0)
    })
}

module.exports = { addAudioToSlides }