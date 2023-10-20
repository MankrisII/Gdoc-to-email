function archiver() {
   var archivedDoc = archiveNewsletterDoc()
  updatePreviousNewsletterLink(archivedDoc)
  archiveLinkedFiles()
  archiveOnMairieWebSite()
  clearGoogleDoc()

  var response = DocumentApp.getUi().alert('Voulez vous créer une nouvelle campagne ?', DocumentApp.getUi().ButtonSet.YES_NO);
  if (response == DocumentApp.getUi().Button.YES) {
    menuCreateCampaign()
  }
}

function archiveNewsletterDoc() {
  //copy et archivage du document
  var destinationFolder = DriveApp.getFolderById(documentProperties.getProperty('campaignFolderId'))
  var currentFile = DriveApp.getFileById(DocumentApp.getActiveDocument().getId())
  var fileName = "n°" + getCampaignNumber() + " - " + getCampaignDate() + " - newsletter"
  var archivedFile = currentFile.makeCopy(fileName, destinationFolder)
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

function archiveLinkedFiles() {
  var currentFile = DriveApp.getFileById(DocumentApp.getActiveDocument().getId())
  var currentFolder = currentFile.getParents().next()
  var destyFolder = DriveApp.getFolderById(documentProperties.getProperty('imagesCampaignFolderId'))
  
  var files = currentFolder.getFiles()

  while (files.hasNext()) {
    var file = files.next()
    if (!fileAndFolderIdsEcxcludedFromArchiving.includes(file.getId())) {
      file.moveTo(destyFolder)
    }
  }

  var folders = currentFolder.getFolders()
  while (folders.hasNext()) {
    var folder = folders.next()
    if (!fileAndFolderIdsEcxcludedFromArchiving.includes(folder.getId())) {
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
      num : getCampaignNumber().toString(),
      apiKey: mairieApiKey,
    }
  }
  var resp = UrlFetchApp.fetch(mairieApiUrl, options)
  Logger.log(resp.getContentText())
}

function clearGoogleDoc(){
  var body = DocumentApp.getActiveDocument().getBody();
  var currentChildId = getContentFirstChildId()
  var child = body.getChild(currentChildId)
  
  while (child.getHeading() != DocumentApp.ParagraphHeading.HEADING3 || child.getText() != "À venir" ) {
    var t = child.getText()
    
    if (child.getHeading() == DocumentApp.ParagraphHeading.HEADING2) {
      currentChildId ++
      var p = body.insertParagraph(currentChildId,"Titre")
      p.setHeading(DocumentApp.ParagraphHeading.HEADING3)
      currentChildId ++
      p = body.insertParagraph(currentChildId, "Description")
      currentChildId ++
      child = body.getChild(currentChildId)
      continue
    }

    if(isDefaultButton(child)){
      currentChildId ++
      child = body.getChild(currentChildId)
      continue
    }

    child.removeFromParent()
    child = body.getChild(currentChildId)
  }
}
