var mediaQueries = `@media screen and (max-width: 600px) {
    .flex-element-old {
        width: 100% !important;
        margin-left: 0 !important;
    }
}`

var styles =`
body {
    background-color: #F7F7F7;
    margin: 0;
}

.gridColumnWrapper {
    margin: 0;
}

#content ,#header{
    text-align: left;
    font-size: 18px;
    max-width: 600px;
    width: 100%;
    margin: auto;
    background-color: #fff;
    padding-top : 21px;
}

.center {
    text-align: center;
}

#content h3,
#content p,{
  margin : 0 15px 0 15px;
}
#content .flex-container{
    
}

.flex-container {
    
}
.flex-element{
  width: calc((600px - 100%)*600);
  max-width: 100%;
  display: inline-block;
  vertical-align: top;
}

.flex-element-img {
    text-align: center;
    margin-left:15px;
}

.flex-element-text {
    min-width: 327px;
}

.flex-element-img {
  max-width: calc(100% - 30px);
  min-width: 250px;
}

.flex-element p {
    padding: 0;
    margin-left: 0!important;
    margin-right: 0!important;
}

#content .bouton {
    font-size: 17px;
    display: inline-block;
    padding: 5px 20px;
    border-radius: 50px;
    text-decoration: none;
    margin: 10px 0;
    background-color: #FFA000;
    color: #ffffff;
    font-weight: bold;
}


#content .img250 {
    margin-top: 6px;
    margin-bottom: 10px;
    width: 100%;
}
.img600{
  text-align : center;
}
#content .img600 img {
    max-width: 100%;
}

#content h2 {
    background-color: #B1D027;
    color: #fff;
    font-family: arial;
    font-size: 25px;
    font-style: italic;
    padding: 4px 15px;
}

#content h3 {
    font-size: 24px;
    font-family: georgia;
    font-style: italic;
    color: #ec0c80;
    margin-top: 27px;
    border-top: 1px solid #ae9e9e;
    padding-top: 15px;
    margin-bottom : 15px;
}

#content h3.firstH3 {
    border-top: 0;
    padding-top: 0;
    margin-top: 15px;
}

#content p {
    margin-top: 0;
}

#content p,
#content ol,
#content ul,
#content li {
    font-family: georgia;
    margin-bottom: 15px;
}

#content li {
    margin-bottom: 0px;
}

#content ol,
#content ul {
    padding-right: 15px;
}
#header{
    font-weight: bold;
    padding-top:0;
}
h1{
    background-color: #DCDBDB;
    font-style: italic;
    font-size: 22px;
    font-family: georgia;
    padding: 12px 15px;
}
#logo-container{
    min-width: 235px;
    text-align: center;
    padding-top: 20px;

}
#header-left{
    min-width: 360px;
}

#header-left p{
    margin-right: 15px!important;
    margin-left: 15px!important;
}
#footer{
    text-align: center;
    background-color: #F7F7F7;
    padding-top: 30px;
    margin-top: 40px;
    font-size: 12px;
}
.highlightedBlock{
  background-color : #ffd900;
  padding-top: 25px;
  padding-right: 25px;
  padding-bottom: 15px;
  padding-left: 25px;
  margin-bottom: 25px;
  margin-top: 25px;
}
`;
var currentTitle
var stylesObj
/**
 * Trasform CSS style above declare in "style" const to an object
 */
function processStyles() {
  stylesObj = {}
  // delete all EOL folowed by white spaces
  let stylesStr = styles.replaceAll(/\n\s*/g, "",)
  // delete all EOL
  stylesStr = stylesStr.replaceAll("\n", "",)
  
  //explode styles défintions into an array
  let styleArr = [...stylesStr.matchAll(/([^\{]*)\{([^\}]*)\}/g)]
  
  // convert styleArr to an object like 
  // {
  //     '#content_p': 'background-color : #fefefe',
  //     'h1' : 'color:#fff'
  // }
  for (let i in styleArr) {
      let names = styleArr[i][1].split(',')
      for (let n in names) {
        let name = normalizedStyleName(names[n])
        if (stylesObj[name]) {
          stylesObj[name] += styleArr[i][2]
        } else {
          
          stylesObj[name] = styleArr[i][2]
        }
      }
  }
  //console.log(stylesObj)
}

/**
 * normalize definition name chain
 * #header p.classname => #header_p.classname
 * 
 * @param {string} name 
 * @returns string
 */
function normalizedStyleName(name) {
  return name.trim().replaceAll(' ','_')
}

/**
 * return the styles corresponding to the definition name embeded in html style prop
 * can get multiple string arguments
 * 
 * @param {string[]} name 
 * @returns string
 */
function getStyles() {
  return `style="${getRawStyles(...arguments)}"`
}

/**
 * return the styles corresponding to the definition name 
 * can get multiple string arguments
 * 
 * @param {string[]} name 
 * @returns string
 */
function getRawStyles() {
  if (!stylesObj) {
    processStyles()
  }
  
  let styles = ''
  for (let n in arguments) {
      styles += stylesObj[normalizedStyleName(arguments[n])]
  }
  return styles
}

/**
 * Convert the google doc to html
 * 
 * @returns string
 */
function ConvertGoogleDocToCleanHtml() {
  var body = DocumentApp.getActiveDocument().getBody();
  var numChildren = body.getNumChildren();
  var output = [];
  var listCounters = {};

  // Walk through all the child elements of the body.

  var contentStartId = getContentFirstChildId()
  
  for (var i = contentStartId; i < numChildren; i++) {
    var child = body.getChild(i);
    output.push(processItem(child, listCounters,));
  }

  var dateString = documentProperties.getProperty('date')
  var date = new Date(documentProperties.getProperty('date'));
  var dateOptions = {  year: 'numeric', month: 'long', day: 'numeric' }
  
  //TODO do not include styles in head in final email
  /*
  saved styles in head
  <style>
    ${mediaQueries}
    ${styles}
  </style>

  */
  var html = `<!DOCTYPE html> 
              <html>
              <head>
                <meta charset="utf-8">
                <title>${getCampaignSubject()}</title>
                <meta name="viewport" content="width=device-width,initiale-scale=1.0,user-scalable=no">
              </head>
              
                <body ${getStyles('body')}>
                  
                  
                    
                    <div class="flex-container" id="header" ${getStyles('#header','#content .flex-container','.flex-container')}>
                      <div id="header-left" class="flex-element" ${getStyles('#header-left','.flex-element')}>
                          <h1 ${getStyles('h1')}>Lettre d'information de Dieulefit</h1>
                          <p ${getStyles('#header-left_p')}>n°${getCampaignNumber()} - ${date.toLocaleDateString('fr-FR', dateOptions)}<br/>
                          <a href="//www.mairie-dieulefit.fr/">https://www.mairie-dieulefit.fr/</a></p>
                      </div>
                      <div id="logo-container" class="flex-element" ${getStyles("#logo-container",".flex-element")}>
                          <img src="https://img.mailinblue.com/5899350/images/content_library/original/6426f218849cd96ad040ed48.jpg" alt="logo Dieulefit">
                      </div>
                    </div>
                    <div id="content" ${getStyles('#content')}>`;
                    
                    html += output.join('\r');
                    html += `
                    <div id="footer" ${getStyles('#footer')}>
                        <p><strong>Maire de Dieulefit</strong><br/>
                        1 rue justin jouve, 26220, Dieulefit</p>
                        <p>Cet email a été envoyé à {{ contact.EMAIL }}</p>
                        <p>Vous l'avez reçu car vous êtes inscrit à notre newsletter.</p>
                        <p><a href="{{ mirror }} ">Afficher dans le navigateur</a> - <a href="{{ unsubscribe }}">Se désinscrire</a></p>
                    </div>
                    </div>    
                </body>
              </html>`;
  //Logger.log(output)
  return html;
}

function getContentFirstChildId() {
  var body = DocumentApp.getActiveDocument().getBody();
  var numChildren = body.getNumChildren()

  for (var i = 0; i < numChildren; i++) {
    var child = body.getChild(i);
    if (child.getHeading() == DocumentApp.ParagraphHeading.HEADING1) {
      return i + 1
    }
  }
}

/**
 * return html for styled button
 * @param {Paragraph} item 
 * @returns 
 */
function processButton(item) {
  return `<p class="center" ${getStyles('.center')}>
            <a href="${item.getLinkUrl()}" class="bouton" ${getStyles('#content .bouton')}>${item.getText()}</a>
          </p>`;
}

var positionedImage = false
/**
 * Generate html for the positioned image
 * @param {Paragraph} item 
 * @returns string
 */
function processPositionedImages(item) {
  if (!item && !positionedImage) return '';
  
  if (!item && positionedImage) {
    positionedImage = false
    return `</div></div>`
  }
  var html = ''
  if (item && positionedImage) {
    html = `</div></div>`
  }
  
  positionedImage = true
  var image = item.getPositionedImages()[0];

  var imageData = getPositionImage(image.getId());
  if(!imageData){
    console.log(item.getText())
    throw(new Error("L'image positionné n'a pas de données : '"+currentTitle+"'"))
    
  }

  html += `<div class="flex-container" ${getStyles('.flex-container','#content .flex-container')}>
                <div class="flex-element flex-element-img" ${getStyles('.flex-element', '.flex-element-img')}>
                  <img class="img250" src="${imageData.url}" ${getStyles('#content .img250')}>
                </div>
                <div class="flex-element flex-element-text" ${getStyles('.flex-element', '.flex-element-text')}>`
  return html
}

/**
 * Check if paragraph has positioned image
 * @param {Paragraph} item 
 * @returns boolean
 */
function hasPositionedImage(item) {
  if (item.getPositionedImages && item.getPositionedImages().length > 0) {
    return true
  }
  return false
}

/**
 * Check if passed item is INLINE_IMAGE
 * @param {*} item 
 * @returns boolean
 */
function isInlineImage(item) {
  return (item.getType() == DocumentApp.ElementType.INLINE_IMAGE)
}

/**
 * return html for inline Image
 * @param {InlineImage} item 
 * @returns 
 */
function processInlineImage(item) {
  return `<div class="img600"><img ${getStyles('#content .img600 img')} src="${item.getAltDescription()}"/></div>`
}

// if the processed item is the first heading3 after a heading2
var firstH3 = false;
/**
 * return html opening and closing tags based on element heading style
 * @param {Paragraph} item 
 * @returns 
 */
function processHeading(item) {
  let prefix = ''
  let suffix = ''
      
  switch (item.getHeading()) {
    case DocumentApp.ParagraphHeading.HEADING6: 
      prefix = "<h6>", suffix = "</h6>"; break;  
    case DocumentApp.ParagraphHeading.HEADING5: 
      prefix = "<h5>", suffix = "</h5>"; break;
    case DocumentApp.ParagraphHeading.HEADING4:
      prefix = "<h4>", suffix = "</h4>"; break;
    case DocumentApp.ParagraphHeading.HEADING3:
      currentTitle = item.getText()
      prefix = processPositionedImages()
      if(firstH3){
        prefix += `<h3 class="firstH3" ${getStyles('#content h3','#content h3.firstH3')}>`;
        firstH3 = false;
      }else{
        prefix += `<h3 ${getStyles('#content h3')}>`;
      }
      suffix = "</h3>"; 
      break;
    case DocumentApp.ParagraphHeading.HEADING2:
      prefix = `<h2 ${getStyles('#content h2')}>`, suffix = "</h2>"; 
      firstH3 = true;
      break;
    case DocumentApp.ParagraphHeading.HEADING1:
      prefix = `<h1 ${getStyles('h1')}>`, suffix = "</h1>"; break;
    default: 
      var alignment = item.getAlignment()
      if(alignment){
        alignment = alignment.toString().toLowerCase()
      }
      var styles = getRawStyles('#content p')
      styles = alignment ? styles+'text-align:'+alignment+';' : styles
      prefix = `<p style="${styles}">`, suffix = "</p>";
  }
  
  return [prefix, suffix]
}

/**
 * return html opening and closing tags of a list item element
 * @param {ListItem} item 
 * @returns 
 */
function processList(item,listCounters) {
  let prefix = '';
  let suffix = '';
  var listItem = item;
    var gt = listItem.getGlyphType();
    var key = listItem.getListId() + '.' + listItem.getNestingLevel();
    var counter = listCounters[key] || 0;

    // First list item
    if ( counter == 0 ) {
      // Bullet list (<ul>):
      if (gt === DocumentApp.GlyphType.BULLET
          || gt === DocumentApp.GlyphType.HOLLOW_BULLET
          || gt === DocumentApp.GlyphType.SQUARE_BULLET) {
        prefix = `<ul ${getStyles('#content ul')}>`;

        }
      else {
        // Ordered list (<ol>):
        prefix = `<ol ${getStyles('#content ol')}>`;
      }
    }
    prefix += `<li ${getStyles('#content li')}>`;
    suffix = "</li>";
    

    if (item.isAtDocumentEnd() || (item.getNextSibling() && (item.getNextSibling().getType() != DocumentApp.ElementType.LIST_ITEM))) {
      if (gt === DocumentApp.GlyphType.BULLET
          || gt === DocumentApp.GlyphType.HOLLOW_BULLET
          || gt === DocumentApp.GlyphType.SQUARE_BULLET) {
        suffix += "</ul>";
      }
      else {
        // Ordered list (<ol>):
        suffix += "</ol>";
      }

    }

  counter++;
  listCounters[key] = counter;
  return [prefix, suffix]
}

var highlightedBlock = false
function processHighlightedBlock() {
  if (!highlightedBlock) {
    highlightedBlock = true
    return `<div class="highlightedBlock" ${getStyles('.highlightedBlock')}>`
  } else {
    highlightedBlock = false
  }return `</div>`
}

/**
 * Convert each Gdoc item to HTML
 * 
 * @param {*} item 
 * @returns string
 */
function processItem(item, listCounters) {
  var output = [];
  var prefix = "", suffix = "";
  
  // process buttons
  if (isButton(item)) return processButton(item)
  
  // process inline images
  if (isInlineImage(item)) return processInlineImage(item)
  
  // process positioned images
  if(hasPositionedImage(item)) output.push(processPositionedImages(item))

  // ElementType.HORIZONTAL_RULE can be use tu mark the end of text aside of positioned image
  // or to delimit the start and end of highlighted block
  if (item.getType() == DocumentApp.ElementType.HORIZONTAL_RULE) {
    // closing tags for positioned image on paragraph
    return processPositionedImages() || processHighlightedBlock()
  }
  
  // process paragraph elements
  if (item.getType() == DocumentApp.ElementType.PARAGRAPH) {
    if (item.getNumChildren() == 0) return ""; // ignore empty paragraph
    if (item.getChild(0).getType() != DocumentApp.ElementType.HORIZONTAL_RULE) {
        [prefix, suffix] = processHeading(item)
    }
  }
  
  // process List elements
  if (item.getType() === DocumentApp.ElementType.LIST_ITEM) {
    [prefix, suffix] = processList(item,listCounters)
  }

  output.push(prefix);

  // Process Texts elements
  if (item.getType() == DocumentApp.ElementType.TEXT) {
    output.push(processText(item));
  }

  // process children elements
  if (item.getNumChildren) {
    var numChildren = item.getNumChildren();

    // Walk through all the child elements of the current item.
    for (var i = 0; i < numChildren; i++) {
      var child = item.getChild(i);
      output.push(processItem(child, listCounters));
    }
  }

  output.push(suffix);

  return output.join('');
}

/**
 * Process Gdoc text elements
 * @param {Text} item 
 * @returns 
 */
function processText(item) {
  let output = []
  var text = item.getText();
  let processed = '';
  var indices = item.getTextAttributeIndices();

  // text element does not have parts with différents styles
  if (indices.length <= 1) {
    processed = text

    processed = formatTextUrl(processed)
    processed = formatLinkUrl(processed, item.getLinkUrl())
    processed = formatBold(processed, item.isBold())
    processed = formatItalic(processed, item.isItalic())
    processed = formatUnderline(processed, item.isUnderline())
    processed = formatColor(processed, item.getForegroundColor())
    processed = processed.replaceAll("\r","<br/>")

    output.push(processed)
  }
  // text element has parts with differents styles
  else {
    //Logger.log("type = "+item.getType());
    //Logger.log("text = "+text);
    for (var i=0; i < indices.length; i ++) {
      var partAtts = item.getAttributes(indices[i]);
      var startPos = indices[i];
      var endPos = i+1 < indices.length ? indices[i+1]: text.length;
      var partText = text.substring(startPos, endPos);
      partText = partText.replaceAll("\r","<br/>")      
     
      // TODO - superscript
      // // If someone has written [xxx] and made this whole text some special font, like superscript
      // // then treat it as a reference and make it superscript.
      // // Unfortunately in Google Docs, there's no way to detect superscript
      // if (partText.indexOf('[')==0 && partText[partText.length-1] == ']') {
      //   output.push('<sup>' + partText + '</sup>');
      // }
      
      processed = partText
      processed = formatTextUrl(processed)
      processed = formatLinkUrl(processed, item.getLinkUrl(startPos))
      processed = formatBold(processed, partAtts.BOLD)
      processed = formatItalic(processed, partAtts.ITALIC)
      processed = formatUnderline(processed, partAtts.UNDERLINE)
      processed = formatColor(processed, partAtts.FOREGROUND_COLOR)

      output.push(processed)
    }
  }
  return output.join('')
}

function formatTextUrl(text) {
  if (text.trim().match(/^https?:\/\//)) {
    return `<a href="${text}" rel="nofollow">${text}</a>`;
  }
  return text
}

function formatLinkUrl(text, url) {
   return url ? `<a href="${url}" rel="nofollow">${text}</a>` : text;
}

function formatBold(text, isBold) {
    return isBold ? `<strong>${text}</strong>` : text
}

function formatItalic(text, isItalic){
    return isItalic ? `<i>${text}</i>` : text
}
function formatUnderline(text, isUnderline){
    return isUnderline ? `<u>${text}</u>` : text
}

function formatColor(text, color) {
  return color ? `<span style="color:${color};">${text}</span>` : text
}

/*
function processImage(item, images, output)
{
  images = images || [];
  var blob = item.getBlob();
  //Logger.log("processImages")
  var contentType = blob.getContentType();
  var extension = "";
  if (/\/png$/.test(contentType)) {
    extension = ".png";
  } else if (/\/gif$/.test(contentType)) {
    extension = ".gif";
  } else if (/\/jpe?g$/.test(contentType)) {
    extension = ".jpg";
  } else {
    throw "Unsupported image type: "+contentType;
  }
  var imagePrefix = "Image_";
  var imageCounter = images.length;
  var name = imagePrefix + imageCounter + extension;
  imageCounter++;
  output.push('<img src="cid:'+name+'" />');
  images.push( {
    "blob": blob,
    "type": contentType,
    "name": name});
}*/

