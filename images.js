/*
  
  When converting to html, the script need the online url of the image
  theses functions provides images management

*/

/**
 * user action to add positioned image
 */
function menuAddPositionedImage() {
  addImage(true)
}


/**
 * use action to add inline image
 */
function menuAddinlineImage(){
  addImage(false)
}

/**
 * Insert an image in the Gdoc from an url of an online image
 * The image to insert in the campaign have to be host online first
 * Then, pass the url to the prompt
 * The script donwload image to inset it in the doc
 * For positionned images, the url and the image element id are stored has an object in document property 'images' array 
 * to be retreve when convert to html
 * 
 * @param {boolean} isPositionedImage // complete url or the name of the image. If only the name is provided, the default url path 'onlineImageFolder' is used
 */
function addImage(isPositionedImage = true) {
  
  var cursor = DocumentApp.getActiveDocument().getCursor();
  if (!cursor) return DocumentApp.getUi().alert('Cannot find a cursor.');
  
  var element = cursor.getElement()
  if(!(element.getType() == DocumentApp.ElementType.PARAGRAPH &&
    element.getHeading() == DocumentApp.ParagraphHeading.NORMAL)) // check that image is not insert in heading 
    return DocumentApp.getUi().alert('Cannot insert image here.');
        
  // ask for image url
  var imageUrlPrompt = DocumentApp.getUi().prompt('Insérer une image',defaultAssetsFolderPath,DocumentApp.getUi().ButtonSet.OK_CANCEL);

  if (imageUrlPrompt.getSelectedButton() == DocumentApp.getUi().Button.OK) {
    // Fetches the specified image URL.  
    // Adds the image to the document, anchored to the first paragraph.
    
    // is the complete url or just the image name is provided ?
    var url = formatAssetsUrl(imageUrlPrompt.getResponseText())
    /*if(!imageUrlPrompt.getResponseText().match(/^https?:\/\//)){
      url = defaultAssetsFolderPath+imageUrlPrompt.getResponseText()
    }else{
      url = imageUrlPrompt.getResponseText()
    }*/
    
    // download the image
    var imageBlob = UrlFetchApp.fetch(url)
    var image

    if(isPositionedImage){
      image = element.addPositionedImage(imageBlob);
      
      // positioned images must be 250px width
      resizeImage(image, 250) 
      
      // store image data for html conversion
      var docImages = getDocImages();
      var imgData = {id : image.getId(), url : url}
      docImages.push(imgData)
      setDocImages(docImages)

    }else{
      image = cursor.insertInlineImage(imageBlob)
      // inline images must be 600px width
      resizeImage(image, 600)
      
      // store image data for html conversion
      image.setAltDescription(url)
    }
  }
}

/**
 * resize image
 * 
 * @param {InlineImage | PositionedImage} image 
 * @param {number} finalWidth 
 */
function resizeImage(image, finalWidth){

  var ratio = (finalWidth * 100) / image.getWidth()
  var finalHeight = (ratio * image.getHeight()) / 100;

  image.setWidth(finalWidth)
  image.setHeight(finalHeight)
}

/**
 * return the array of object representing images add to the doc
 * @returns {array}
 */
function getDocImages(){
  var docImages;
  if(documentProperties.getProperty('images') != null){
    Logger.log("images = "+documentProperties.getProperty('images'));
    docImages = JSON.parse(documentProperties.getProperty('images'))
  }else{
    docImages = [];
    documentProperties.setProperty('images',JSON.stringify(docImages))
    //docImages = documentProperties.getProperty('images') != "" ? JSON.parse(documentProperties.getProperty('images'))  : [];
  }
  //Logger.log(JSON.stringify(docImages))
  return docImages;  
}

/**
 * save array of images to document properties
 * @param {array} images 
 */
function setDocImages(images){
  documentProperties.setProperty('images',JSON.stringify(images))
}

/**
 * delete document property 'images'
 */
function clearDocImages(){
  documentProperties.deleteProperty('images')
}

/**
 * get the image data based on image id
 *  
 * @param {string} id the id of the image tu return
 * @returns {PositionedImage | InlineImage}
 */
function getPositionImage(id){
  var images = getDocImages()
  for(var i in images){
    if(images[i].id == id){
      return images[i]
    }
  }
}

/**
 * unused
 * 
 * @param {string} id the id of the image to delete
 * @returns 
 */
function deleteImage(id = "kix.3wcoe19j525s"){
  var images = getDocImages()
  for(var i in images){
    if(images[i].id == id){
      images.splice(i,1)
      setDocImages(images)
      return images;
    }
  }
}