var mediaQueries = `@media screen and (max-width: 600px) {
    .flex-element {
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

#content {
    text-align: left;
    font-size: 18px;
    max-width: 600px;
    width: 100%;
    margin: auto;
    background-color: #fff;
}

.center {
    text-align: center;
}

#content h3,
#content p,
#content .flex-container{
    margin-left : 15px;
    margin-right : 15px;
}

.flex-container {
    display: flex;
    flex-wrap: wrap;
}

.flex-element-img {
    text-align: center;
}

.flex-element-text {
    width: 301px;
    margin-left: 15px
}

.flex-element-img {
    width: 250px;
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

#content .img600 {}

#content .img600 img {
    width: 100%;
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
    margin-bottom: 15px
}

#content li {
    margin-bottom: 0px
}

#content ol,
#content ul {
    padding-right: 15px
}
#header{
    font-weight: bold;
    margin: 0!important;
}
h1{
    background-color: #DCDBDB;
    font-style: italic;
    font-size: 22px;
    font-family: georgia;
    padding: 12px 15px;
}
#logo-container{
    width: 32%;
    text-align: center;
    padding-top: 20px;

}
#header-left{
    width: 68%;
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
`;

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
 * return the style corresponding to the definition name
 * can get multiple string arguments
 * 
 * @param {string} name 
 * @returns string
 */
function getStyles() {
  if (!stylesObj) {
    processStyles()
  }
  
  let styles = ''
  for (let n in arguments) {
      styles += stylesObj[normalizedStyleName(arguments[n])]
  }
  return `style="${styles}"`
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

  // ignore first part of the Gdoc containing user instructions to feel the Gdoc
  var start = false;
  
  for (var i = 0; i < numChildren; i++) {
    var child = body.getChild(i);
    //Logger.log("child.getHeading() = "+child.getHeading())
    //Logger.log("child.getHeading() != DocumentApp.ParagraphHeading.HEADING1 = "+(child.getHeading() != DocumentApp.ParagraphHeading.HEADING1))
    
    //Logger.log('child.getType() = '+child.getType())
    // does not start the conversion until it reaches the starting point defined by the paragraph DocumentApp.ParagraphHeading.HEADING1
    if(!start && child.getHeading() != DocumentApp.ParagraphHeading.HEADING1) {
      continue;
    }else if(!start){
      start = true;
      //Logger.log('start = true')
      continue;
    };
    output.push(processItem(child, listCounters,));
  }

  var dateString = documentProperties.getProperty('date')
  var date = new Date(documentProperties.getProperty('date'));
  var dateOptions = {  year: 'numeric', month: 'long', day: 'numeric' }
  
  var html = `<!DOCTYPE html> 
              <html>
              <head>
                <meta charset="utf-8">
                <title>${getCampaignSubject()}</title>
              </head>
              <style>
                  ${mediaQueries}
                  ${styles}
                  </style>
                <body ${getStyles('body')}>
                  
                  
                    <div id="content" ${getStyles('#content')}>
                    <div class="flex-container" id="header" ${getStyles('#header','#content .flex-container','.flex-container')}>
                      <div id="header-left" class="flex-element" ${getStyles('#header-left')}>
                          <h1 ${getStyles('h1')}>Lettre d'information de Dieulefit</h1>
                          <p ${getStyles('#header-left_p')}>n°${getCampaignNumber()} - ${date.toLocaleDateString('fr-FR', dateOptions)}<br/>
                          <a href="//www.mairie-dieulefit.fr/">https://www.mairie-dieulefit.fr/</a></p>
                      </div>
                      <div id="logo-container" class="flex-element" ${getStyles("#logo-container",".flex-element")}>
                          <img src="https://img.mailinblue.com/5899350/images/content_library/original/6426f218849cd96ad040ed48.jpg" alt="logo Dieulefit">
                      </div>
                    </div>`;
                    
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

/**
 * Convert each Gdoc item to HTML
 * 
 * @param {*} item 
 * @returns string
 */
function processItem(item, listCounters) {
  /*
  Logger.log('item.getType() = '+item.getType())
  if(item.hasOwnProperty("getText")){
    Logger.log('item.getText() = '+item.getText())
  }
  */
  
  var output = [];
  var prefix = "", suffix = "";
  
  
  //Logger.log('type = '+item.getType())
  
  // process positioned images
  var positionedImage = false
  
  if(typeof item.getPositionedImages != "undefined" && item.getPositionedImages().length >0){
    positionedImage = true;
    //Logger.log(item.getText())
    var image = item.getPositionedImages()[0];
    var docImages = getDocImages();
    //Logger.log("image.getId() = "+image.getId())

    var imageData = getPositionImage(image.getId());
    //Logger.log(JSON.stringify(imageData))
    output.push(`<div class="flex-container" ${getStyles('.flex-container','#content .flex-container')}>
                  <div class="flex-element flex-element-img" ${getStyles('.flex-element', '.flex-element-img')}>
                    <img class="img250" src="${imageData.url}" ${getStyles('#content .img250')}>
                  </div>
                  <div class="flex-element flex-element-text" ${getStyles('.flex-element', '.flex-element-text')}>`);
    //Logger.log("url = "+imageData.url)
  }

  // process buttons
  //Logger.log('item.hasOwnProperty(getLinkUrl) = '+item.hasOwnProperty('getLinkUrl'))
  let itemIsButton = false;
  if(item.hasOwnProperty('getLinkUrl') && item.getLinkUrl() && isButton(item.getLinkUrl())){
    //Logger.log('linkUrl = '+item.getLinkUrl())
    itemIsButton = true;
    let itemType = item.getType().toString()
    let itemText = item.getText()
    let url = item.getLinkUrl()
    return `<p class="center" ${getStyles('.center')}>
              <a href="${item.getLinkUrl()}" class="bouton" ${getStyles('#content .bouton')}>${item.getText()}</a>
            </p>`;
  }

  // process paragraph elements
  else if (item.getType() == DocumentApp.ElementType.PARAGRAPH) {
    
    switch (item.getHeading()) {
       
      case DocumentApp.ParagraphHeading.HEADING6: 
        prefix = "<h6>", suffix = "</h6>"; break;
      case DocumentApp.ParagraphHeading.HEADING5: 
        prefix = "<h5>", suffix = "</h5>"; break;
      case DocumentApp.ParagraphHeading.HEADING4:
        prefix = "<h4>", suffix = "</h4>"; break;
      case DocumentApp.ParagraphHeading.HEADING3:
        if(firstH3){
          prefix = `<h3 class="firstH3" ${getStyles('#content h3','#content h3.firstH3')}>`;
          firstH3 = false;
        }else{
          prefix = `<h3 ${getStyles('#content h3')}>`;
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
        prefix = `<p ${getStyles('#content p')}>`, suffix = "</p>";
    }

    if (item.getNumChildren() == 0) return "";

  }else if (item.getType() == DocumentApp.ElementType.INLINE_IMAGE){
    output.push(`<div class="img600"><img ${getStyles('#content .img600 img')} src="${item.getAltDescription()}"/></div>`)
    //processImage(item, images, output);
  }else if (item.getType() === DocumentApp.ElementType.LIST_ITEM) {
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
  }

  output.push(prefix);

  

  // Process Texts éléments
  if (item.getType() == DocumentApp.ElementType.TEXT) {
    processText(item, output);
  }
  else {
    if (item.getNumChildren) {
      var numChildren = item.getNumChildren();

      // Walk through all the child elements of the doc.
      for (var i = 0; i < numChildren; i++) {
        var child = item.getChild(i);
        output.push(processItem(child, listCounters));
      }
    }
  }


  output.push(suffix);
  if(item.getType() == DocumentApp.ElementType.HORIZONTAL_RULE){
    output.push(`</div>
                </div>`)
  }
  return output.join('');
}


function processText(item, output) {
  var text = item.getText();
  if(text == "ici"){
    var stop = true;
  }
  //text = text.replace("\r","</br>")
  var indices = item.getTextAttributeIndices();


  if (indices.length <= 1) {
    // Assuming that a whole para fully italic is a quote
    if(item.isBold()) {
      output.push('<strong>' + text + '</strong>');
    }
    /*else if(item.isItalic()) {
      output.push('<blockquote>' + text + '</blockquote>');
    }*/
    else if (text.trim().indexOf('http://') == 0) {
      output.push('<a href="' + text + '" rel="nofollow">' + text + '</a>');
    }
    else if (text.trim().indexOf('https://') == 0) {
      output.push('<a href="' + text + '" rel="nofollow">' + text + '</a>');
    }
    else {
      output.push(text);
    }
  }
  else {
    //Logger.log("type = "+item.getType());
    //Logger.log("text = "+text);
    for (var i=0; i < indices.length; i ++) {
      var partAtts = item.getAttributes(indices[i]);
      var startPos = indices[i];
      var endPos = i+1 < indices.length ? indices[i+1]: text.length;
      var partText = text.substring(startPos, endPos);
      var linkUrl = item.getLinkUrl(startPos) ? item.getLinkUrl(startPos) : null

      partText = partText.replace("\r","<br>")
      //Logger.log("partText = "+partText)
      //Logger.log("partText2 = "+partText2)


      if (partAtts.ITALIC) {
        output.push('<i>');
      }
      if (partAtts.BOLD) {
        output.push('<strong>');
      }
      if (partAtts.UNDERLINE) {
        output.push('<u>');
      }

      // If someone has written [xxx] and made this whole text some special font, like superscript
      // then treat it as a reference and make it superscript.
      // Unfortunately in Google Docs, there's no way to detect superscript
      if (partText.indexOf('[')==0 && partText[partText.length-1] == ']') {
        output.push('<sup>' + partText + '</sup>');
      }
      else if (partText.trim().indexOf('http://') == 0) {
        output.push('<a href="' + partText + '" rel="nofollow">' + partText + '</a>');
      }
      else if (partText.trim().indexOf('https://') == 0) {
        output.push('<a href="' + partText + '" rel="nofollow">' + partText + '</a>');
      }
      else if(linkUrl){
        output.push('<a href="' + linkUrl + '" rel="nofollow">' + partText + '</a>');
      }
      else {
        output.push(partText);
      }
      

      if (partAtts.ITALIC) {
        output.push('</i>');
      }
      if (partAtts.BOLD) {
        output.push('</strong>');
      }
      if (partAtts.UNDERLINE) {
        output.push('</u>');
      }

      if (partText.indexOf('\r')){
        //output.push('</br>');
      }

    }
  }
}


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
}

