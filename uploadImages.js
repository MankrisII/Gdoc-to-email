/*
function doSomething(text){
  //DocumentApp.getUi().alert(text)
  var cursor = DocumentApp.getActiveDocument().getCursor();
  //DocumentApp.getUi().alert(cursor)
  if (cursor) {
    // Attempt to insert text at the cursor position. If the insertion returns null, the cursor's
    // containing element doesn't allow insertions, so show the user an error message.
    var element = cursor.getElement()
    var file = DriveApp.getFileById(text)
    //DocumentApp.getUi().alert(file)
    //DocumentApp.getUi().alert(file.getBlob())
    element.addPositionedImage(file.getBlob())
  }
}

function showDialog() {
// teste de selection de fichier depuis google drive
// ne focntionne pas car on ne peut pas utiliser des fichiers images sur googledrive pour les afficher dans du html
  var campaignFolder =  DriveApp.getFolderById(documentProperties.getProperty('campaignFolderId'))
  var campaignImageFolder = DriveApp.getFolderById(documentProperties.getProperty('imagesCampaignFolderId'));

  var images = campaignImageFolder.getFiles()
  //itération sur les fichier our faire une liste clickable
  var imageListe = []
  while (images.hasNext()) {
    var image = images.next();
    Logger.log(image.getName());
    imageListe.push({
      name : image.getName(), 
      id : image.getId(), 
      url : image.getUrl()
      })
  }
  var html = `<script>
              </script><ul>`
  imageListe.forEach(im => {
    html += `<li><a id="${im.id}" onClick="google.script.run.doSomething('${im.id}');" href="#" data-url="${im.url}">${im.name}</a></li>`
  })
  html += '</ul>';
  var htmlOutput = HtmlService.createHtmlOutput(html)
      .setWidth(400)
      .setHeight(300);
  DocumentApp.getUi() // Or DocumentApp or SlidesApp or FormApp.
      .showModalDialog(htmlOutput, 'Liste des images');
}*/