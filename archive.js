function archiver() {
   var archivedDoc = archiveNewsletterDoc()
  updatePreviousNewsletterLink(archivedDoc)
  archivelinkedFiles()
  archiveOnMairieWebSite()
  clearGoogleDoc()

  return;
  /*TODO*/

  // Create new campain ?
  var response = DocumentApp.getUi().alert('Voulez vous créer une nouvelle campagne ?', DocumentApp.getUi().ButtonSet.YES_NO);
  if (response == DocumentApp.getUi().Button.YES) {
    menuCreateCampaign()
  }
}

function archiveNewsletterDoc() {
  //copy et archivage du document
  var destinationFolder = DriveApp.getFolderById(documentProperties.getProperty('campaignFolderId'))
  var currentFile = DriveApp.getFileById(DocumentApp.getActiveDocument().getId())
  var archivedFile = currentFile.makeCopy(documentProperties.getProperty('date') + " - newsletter", destinationFolder)
  return archivedFile
}

function updatePreviousNewsletterLink(file) {
  //file = DriveApp.getFileById("13kOCoEiPu9423Rdr1zxsiN-yg56Hf1S-aqJnY7Crai0")
  var date = documentProperties.getProperty('date')
  //date = '2023-07-25'
  var range = DocumentApp.getActiveDocument().getBody().findText('Précédente newsletter : [0-9]{4}\-[0-9]{2}\-[0-9]{2}')
  var element = range.getElement()
  var indices = element.getTextAttributeIndices()

  Logger.log(indices)
  Logger.log(element)
  Logger.log(element.getType())
  Logger.log(element.getText())

  var startPosLink
  var endPosLink

  for (var i = 0; i < indices.length; i++) {
    if (!startPosLink) {
      if (element.getLinkUrl(indices[i])) { startPosLink = indices[i] }
    } else if (i < indices.length - 1) {
      if (!element.getLinkUrl(indices[i])) { endPosLink = indices[i] - 1 }
    } else {
      endPosLink = element.getText().length - 1
    }
  }
  if (!endPosLink) endPosLink = element.getText().length - 1

  var linkUrl = file.getUrl()
  element.replaceText('[0-9]{4}\-[0-9]{2}\-[0-9]{2}', date)
  element.setLinkUrl(startPosLink, endPosLink, linkUrl)

}

function archivelinkedFiles() {
  var currentFolder = DriveApp.getFolderById(nextCampaignfolderId)
  Logger.log('currentfolder name = ' + currentFolder.getName())
  var destyFolder = DriveApp.getFolderById(documentProperties.getProperty('imagesCampaignFolderId'))
  Logger.log('destyFolder name = ' + destyFolder.getName())

  var files = currentFolder.getFiles()

  while (files.hasNext()) {
    var file = files.next()
    Logger.log('file id : ' + file.getId())
    Logger.log('file name : ' + file.getName())
    if (file.getId() != DocumentApp.getActiveDocument().getId()
     && file.getId() != nextCampainFileId) {
      Logger.log('move file')
      file.moveTo(destyFolder)
    }

  }
  var folders = currentFolder.getFolders()
  while (folders.hasNext()) {
    var folder = folders.next()

    Logger.log('folder id : ' + file.getId())
    Logger.log('folder name : ' + file.getName())

    if (folder.getId() != nextCampaignImageFolder) { // ne pas archiver le dossier des fichiers pour les prochaines newsletter
      Logger.log('move folder')
      folder.moveTo(destyFolder)
    }
  }
}

function archiveOnMairieWebSite() {
  // envoie des donnée pour archivage du html sur le site de la mairie

  var date = new Date(documentProperties.getProperty('date'));
  var dateOptions = { year: 'numeric', month: 'long', day: 'numeric' }

  var options = {
    'method': 'post',
    'muteHttpExceptions': true,
    'payload': {
      html: ConvertGoogleDocToCleanHtml(),
      title: `n°${getCampaignNumber()} - ${date.toLocaleDateString('fr-FR', dateOptions)}`,
      date: documentProperties.getProperty('date'),
      apiKey: mairieApiKey,
    }
  }
  var resp = UrlFetchApp.fetch(mairieApiUrl, options)
  Logger.log(resp.getContentText())
}

function clearGoogleDoc(){
  var body = DocumentApp.getActiveDocument().getBody();
  var numChildren = body.getNumChildren();
  var childsToRemoveIds = []
  var headinOneId = 0

  // Walk through all the child elements of the body.
  var start = false;
  //Logger.log("DocumentApp.ParagraphHeading.HEADING1 = "+DocumentApp.ParagraphHeading.HEADING1)
  for (var i = 0; i < numChildren; i++) {
    
    var child = body.getChild(i);
    //Logger.log("child.getHeading() = "+child.getHeading())
    //Logger.log("child.getHeading() != DocumentApp.ParagraphHeading.HEADING1 = "+(child.getHeading() != DocumentApp.ParagraphHeading.HEADING1))
    
    //Logger.log('child.getType() = '+child.getType())
    if(!start && child.getHeading() != DocumentApp.ParagraphHeading.HEADING1) {
      continue;
    }else if(!start){
      start = true;
      headinOneId = i
      //Logger.log('start = true')
      continue;
    };
    //Logger.log(child.getText())
    if(child.getHeading() != DocumentApp.ParagraphHeading.HEADING2){
      if(child.getHeading() == DocumentApp.ParagraphHeading.HEADING3 && (child.getText() == "À venir" )){
        //Logger.log('fin')  
        break;
      }
      if (isDefaultButton(child)) {
        break;
      }
      childsToRemoveIds.push(i)
      //child.removeFromParent();
      //Logger.log('remove child ')
    }
  }

  // remove text
  if(childsToRemoveIds.length > 0){
    childsToRemoveIds.reverse()
    childsToRemoveIds.forEach(e => {
      var child = body.getChild(e)
      //Logger.log("to remove : "+child.getText())
      child.removeFromParent()
    })
  }

  // add default text
  addDefaultContent(headinOneId)
}

function addDefaultContent(index = 29){
  var body = DocumentApp.getActiveDocument().getBody();
    
  // ajouter un texte par defaut aux 3 sections
  for(var i = 0; i < 3; i++){
    index += 2
    var p = body.insertParagraph(index,"Titre")
    p.setHeading(DocumentApp.ParagraphHeading.HEADING3)
    index += 1
    p = body.insertParagraph(index,"Description")
  }

}