/*

Data structure for stored document properties 

documentProperty {
  campaignNumber : String, // counts the number of campaigns sent. For display purposes
  capainId : String, // brevo campaign id
  campaignConf : JSON, // brevo campaign configuration
  date : String, // campaign sending date "YYY-MM-DD"
  campaignFolderId : String, // Gdrive campaign archive folder id
  imagesCampaignFolderId : String, // Gdrive image's campaign archive folder id
  buttons : string[], // list of buttons url
  images : [
    {
      id : String,
      url : String
    }
  ], // list of objects representing inserted images
}

some const are private and not displayed here

const campainSenderName ;
const campainSenderEmail ;
const testCampaignToEmail ;
const mairieApiKey ;
const mairieApiUrl ;
const brevoApiKey ;
*/


// list of default buttons url. Buttons that remains over campaigns
const defaltButtonsUrls = [
  "https://www.dieulefit-tourisme.com/votre-sejour/agenda/tout-lagenda/",
  "https://www.ccdb26.fr/actualites/"
];
// url of public storage for images displayed in html's campaigns
const defaultAssetsFolderPath = 'https://mairie-dieulefit.fr/images/stories/contributeurs/actualites/a_la_une/2023/';
// GDocs folder and files
const archivedCampaignsFolderId = "1xd2xA-2wIfRgFT03TO1QHXMFTr3PQM8G"; // archives's folder for 2023 campains
const fileAndFolderIdsEcxcludedFromArchiving = [
  DocumentApp.getActiveDocument().getId(),
  "1SfOEQED15_4t1upUk-ztXymMf6t7dP0hNw8uNBqm000",
  "11lt-KGJtXpZaPUbYRVTJ3-tzUjvW48fL",
  "1z91QeLl9o0V8v5_DiJ_zwtZLCqOIoHDU",
  "1senW3ubfg3BxH10UHtT9pMUlMQj2teTZ",
  "1X4M3xyZ9usuD_sZGN2KOlZoSiC_HwQfPULpQpSHddR8"
]
const documentProperties = PropertiesService.getDocumentProperties();


// option for brevo API requests
var brevoRequestOptions = {
    'method' : 'POST',
    'muteHttpExceptions': false ,
    'contentType': 'application/json',
    'headers' : {
      'accept': 'application/json',
      'api-key': '',
      'content-type': 'application/json'
    },
    'payload' : ''
}

// default Brevo campaign configuration
var defaultCampaignConf = {
      "sender": {
        'name': '', //campainSenderName
        "email": '', //campainSenderEmail
      },
      "inlineImageActivation": false,
      "sendAtBestTime": false,
      "abTesting": false,
      "ipWarmupEnable": false,
      'mirrorActive' : true,
      "name": "",
      "htmlContent": "",
      "subject": "",
      "toField": '', //testCampaignToEmail
    };


// initialisation
function onOpen() {
  //checkCampaignStatus()
  if(Session.getEffectiveUser().getEmail() == "mancini.christophe@gmail.com"){
    DocumentApp.getUi()
    .createMenu('Newsletter mairie')
    .addItem('Creer une nouvelle campagne', 'menuCreateCampaign')
    .addSubMenu(DocumentApp.getUi().createMenu('Configuration')
      .addItem('Vérifier de statut de la campagne', 'menuCheckCampaignStatus')
      .addItem('Afficher l\'id de la campagne', 'menuDisplayCampaignId')
      .addSeparator()
      .addItem('Afficher le numéro de la campagne', 'menuDisplayCampaignNumber')
      .addItem('Modifier le numéro de la campagne', 'menuPromptSetCampaignNumber')
      .addSeparator()
      .addItem('Afficher le nom de la campagne', 'menuDisplayCampaignName')
      .addSeparator()
      .addItem('modifier la date d\'envoie de la campagne','menuPromptSetCampaignDate')
    )
    .addItem('Envoyer un test avec Brevo', 'menuSendTestWithBrevo')
    .addItem('Envoyer le HTML par mail','sendHtmlByEmail')
    .addItem('Archiver la newsletter', 'archiver')
    .addSeparator()
    .addItem('Envoyer le mail à la plénière', 'sendForContributions')
    .addItem('Envoyer le mail en correction', 'sendForCorrection')
    .addSeparator()
    .addItem('Inserer un bouton', 'menuAddButton')
    .addItem('Inserer une image en ligne', 'menuAddinlineImage')
    .addItem('Inserer une image positionnée', 'menuAddPositionedImage')
    .addItem('test selection image', 'showDialog')
    
    .addToUi();
  }
  
}

// send an email to contributors to give the link of the Gdocs et the dead line
function sendForContributions(){
  var campaignSendingDate = new Date(documentProperties.getProperty('date'))
  var deadLineToContribute = new Date(campaignSendingDate.getTime() - 87000000)
  var dateOptions = {  year: 'numeric', month: 'long', day: 'numeric' }
  
  var content = `Bonjour,

Voici le fichier de la newsletter du ${campaignSendingDate.toLocaleDateString('fr-FR', dateOptions)} prochain :
${DocumentApp.getActiveDocument().getUrl()}

Vous avez jusqu’au ${deadLineToContribute.toLocaleDateString('fr-FR', dateOptions)} midi pour remplir vos infos et événements.

Merci,`;
Logger.log(content)
  MailApp.sendEmail({
     //to: Session.getActiveUser().getEmail(),
     to : contributorsEmailsList,
     subject: `Prochaine newsletter du ${campaignSendingDate.toLocaleDateString('fr-FR', dateOptions)}`,
     body: content,
   });
}

// send an email to corretors to correct spelling
function sendForCorrection(){
  var campaignSendingDate = new Date(documentProperties.getProperty('date'))
  var deadLineToContribute = new Date(campaignSendingDate.getTime() - 87000000)
  var dateOptions = {  year: 'numeric', month: 'long', day: 'numeric' }
  
  var content = `Bonjour,

Voici le fichier de la newsletter pour relecture :
${DocumentApp.getActiveDocument().getUrl()}

Merci,`;
Logger.log(content)
  MailApp.sendEmail({
     //to: Session.getActiveUser().getEmail(),
     to : corretorsEmailsList,
     subject: `Prochaine newsletter du ${campaignSendingDate.toLocaleDateString('fr-FR', dateOptions)}`,
     body: content,
   });
}

function getUserEmail(){
  
  var userEmail = Session.getEffectiveUser().getEmail();
  Logger.log(userEmail)
}

// clear campaign folders properties
function clearCampainFoldersIds(){
  documentProperties.deleteProperty('campaignFolderId')
   documentProperties.deleteProperty('imagesCampaignFolderId')
}

// update the title of the GDocs
function updateDocTitle(){
  //var numChildren = DocumentApp.getActiveDocument().getBody().getNumChildren()
  //for(var i = 0; i < numChildren; i++){}
  var range = DocumentApp.getActiveDocument().getBody().findText("Newsletter n°[0-9]* du [0-9]{1,2} .+ [0-9]{4}") // e.g. Newsletter n°22 du 21 septembre 2023
  var element = range.getElement().getParent()
  if(element.getHeading() != DocumentApp.ParagraphHeading.HEADING1)return
  //Logger.log(element.getText())
  //Logger.log(element.getType())
  element.clear()
  var date = new Date(documentProperties.getProperty('date'))
  var num = getCampaignNumber()
  var dateOptions = {  year: 'numeric', month: 'long', day: 'numeric' }
  var newTitle = `Newsletter n°${num} du ${date.toLocaleDateString('fr-FR', dateOptions)}`
  element.appendText(newTitle)
  element.setHeading(DocumentApp.ParagraphHeading.HEADING1)
  element.setAlignment(DocumentApp.HorizontalAlignment.CENTER)
  return
}

// send the doc converted to html by email
function sendHtmlByEmail(){
  var html = ConvertGoogleDocToCleanHtml();
  emailHtml(html);
}

function emailHtml(html, images) {
  var attachments = [];
 
  var name = DocumentApp.getActiveDocument().getName()+".html";
  attachments.push({"fileName":name, "mimeType": "text/html", "content": html});
  MailApp.sendEmail({
     to: Session.getActiveUser().getEmail(),
     subject: name,
     htmlBody: html,
     attachments: attachments
   });
}

function formatAssetsUrl(url) {
  if(!url.match(/^https?:\/\//)){
    return defaultAssetsFolderPath+url
  }
  return url
}


