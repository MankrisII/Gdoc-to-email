
/*
  All the methods and props related to the campaign and Brevo API
*/

/**
 * Create new campaign trigered by user action in menu.
 * 
 * getUi() calls are getted out of createCampaign() for debuging purpose
 * since getUi().arlet() and getUi().prompt() can't be called in App Script IDE
 */
function menuCreateCampaign() {
  var date = menuPromptSetCampaignDate()
  let id = createCampaign(date)
  DocumentApp.getUi().alert('La campagne a bien été crée.\n Id de la campagne : '+id)
}

/**
 * create new campaign
 * 
 * @param {boolean} clearData clear or not the document properties
 * @param {string} date the sending date of the new campaign 'YYY-MM-DD' 
 * @returns {string} new campaign id
 */

function createCampaign(date ='2023-09-01') {

  clearButtons()
  clearCampaignConfiguration()
  clearDocImages()
  clearCampainFoldersIds()
  documentProperties.deleteProperty('campaignFolderId')
  documentProperties.deleteProperty('imagesCampaignFolderId')
  
  let num = Number(getCampaignNumber())
  num++
  documentProperties.setProperty('campaignNumber',num)
  documentProperties.setProperty('date', date)
  updateCampaignName()
  updateCampaignSubject()
  updateDocTitle()
  createCampaignFolders()

  // Logger.log("confg seted")

  // request Brevo API to create a new campaign
  var options = getBrevoRequestOptions();
  options.method = 'POST';
  
  let response = UrlFetchApp.fetch('https://api.brevo.com/v3/emailCampaigns', options)

  // Logger.log('headers = '+JSON.stringify(response.getAllHeaders()))
  // Logger.log('response texte = '+response.getContentText())
  // Logger.log('response code = '+response.getResponseCode())
  
  let resContent = JSON.parse(response.getContentText())
  setCampaignId(resContent.id.toString())
  //documentProperties.setProperty('campaignId',resContent.id)
  // Logger.log('id = '+resContent.id);
  return resContent.id
}

/**
 * Request Brevo API to update campaign's data
 */
function updateCampaign(){
  updateCampaignHtml()
  //updateCampaignSubject()
  let options = getBrevoRequestOptions()
  options.method = 'PUT';

  let response = UrlFetchApp.fetch('https://api.brevo.com/v3/emailCampaigns/'+getCampaignId(), options);
  //Logger.log('reponse serveur : '+response.getResponseCode())

  /*
  TODO - request error handler
  */
  
}

/**
 * regenerate html and store it in document's properties
 */
function updateCampaignHtml(){
  updateCampaignConf({'htmlContent' : ConvertGoogleDocToCleanHtml()})
}


/**
 * display campaign name to user
 */
function menuDisplayCampaignName(){
  DocumentApp.getUi().alert('le nom de la campagne est : '+getCampaignConf('name'));
}


/**
 * 
 * @returns {string} the campaign's number 
 */
function getCampaignNumber(){
  let num = Number(documentProperties.getProperty('campaignNumber'))
  //Logger.log('campaignNumber = '+ num)
  num = num ? num : 0
  return num
}

/**
 * display campaign's number to user
 */
function menuDisplayCampaignNumber(){
  DocumentApp.getUi().alert('le numéro de la campagne est : '+getCampaignNumber())
}

/**
 * incremant campaign number 
 * called by createCampaign()
 */
function incrementCampaignNumber(){
  let num = Number(getCampaignNumber())
  //Logger.log('campaign number = '+num)
  //Logger.log('campaign number typeof= '+typeof num)
  num++
  setCampaignNumber(num)
  //documentProperties.setProperty('campaignNumber',num.toString())
}

/**
 * for debugging purpose
 */
function clearCampaignNumber() {
  documentProperties.deleteProperty('campaignNumber')
}

// clear campaign folders properties
function clearCampainFoldersIds(){
  documentProperties.deleteProperty('campaignFolderId')
  documentProperties.deleteProperty('imagesCampaignFolderId')
}

/**
 * delete all configurations props and reset to default
 */
function clearCampaignConfiguration(){
  documentProperties.deleteProperty('campaignConf')
  getCampaignConf()
  //Logger.log('campaignConf = '+documentProperties.getProperty('campaignConf'))
}

/**
 * prompt user to set the campaign number
 */
function menuPromptSetCampaignNumber(){
  var response = DocumentApp.getUi().prompt('Modifier le numéro de la campagne','Numéro',DocumentApp.getUi().ButtonSet.OK_CANCEL);
    if (response.getSelectedButton() == DocumentApp.getUi().Button.OK) { 
      setCampaignNumber(response.getResponseText())
    }
}

/**
 * set the campaign number
 * @param {number | string} number 
 * @returns 
 */

function setCampaignNumber(number) {
  documentProperties.setProperty('campaignNumber', number)
  updateCampaignName()
  updateCampaignSubject()
  updateDocTitle()
  updateCampaignFolders()
  return number
}

/**
 * request brevo to check campaing status
 */
function menuCheckCampaignStatus() {
  var options = getBrevoRequestOptions()
  options.method = "GET";
  options.muteHttpExceptions = true
  options.payload = null
  var capaignId = getCampaignId()
  var url = `https://api.brevo.com/v3/emailCampaigns/${capaignId}`
  
  // get campaign report
  let response = UrlFetchApp.fetch(url, brevoRequestOptions);
  //Logger.log('reponse serveur code : '+response.getResponseCode())
  //Logger.log('reponse serveur texte : '+response.getContentText())
  
  let status = JSON.parse(response.getContentText()).status
  DocumentApp.getUi().alert(status)
}

function updateCampaignConf(campaignConfToUpdate){
  //Logger.log('updateCampaignConf --------------')
  let currentConf = getCampaignConf()
  let updatedConf = {...currentConf, ...campaignConfToUpdate}
  //Logger.log('updatedConf.htmlContent = '+updatedConf.htmlContent)
  documentProperties.setProperty('campaignConf',JSON.stringify(updatedConf))
}

/**
 * get total campaign configuration 
 * or a single prop if 'name' is passed
 * 
 * @param {string} name 
 * @returns *
 */
function getCampaignConf(name = null){
  let campaignConf;

  // return confi
  if(documentProperties.getProperty('campaignConf') != null){
    //Logger.log('campaignConf exist');
    campaignConf = JSON.parse(documentProperties.getProperty('campaignConf'))

  }else{
    //Logger.log("campaignConf doesn't exist")
    campaignConf = defaultCampaignConf;
    campaignConf.sender.name = campainSenderName
    campaignConf.sender.email = campainSenderEmail
    campaignConf.replyTo = campainSenderEmail
    campaignConf.toField = testCampaignToEmail
    //campaignConf.htmlContent = ConvertGoogleDocToCleanHtml()
    documentProperties.setProperty('campaignConf',JSON.stringify(campaignConf))
  }
  
  //Logger.log("campaignConf = "+typeof campaignConf)
  if (name) {
    return  campaignConf[name]
  } else {
    return campaignConf;
  }
  
}

/**
 * return brevo request configuration 
 * with merged campaign configuration
 * 
 * @returns {object}
 */
function getBrevoRequestOptions(){
  var campaingConf = getCampaignConf()
  campaingConf.htmlContent = ConvertGoogleDocToCleanHtml()
  brevoRequestOptions.payload = JSON.stringify(campaingConf)
  brevoRequestOptions.headers['api-key'] = brevoApiKey
  return brevoRequestOptions
}

/**
 * propmt user for the campaign date 'YYY-MM-DD'
 * @returns {string}
 */
function menuPromptSetCampaignDate(){
  
  var campaignDateResponse = DocumentApp.getUi().prompt('Entrez la date d\'expedition de la campagne')

  if (campaignDateResponse.getSelectedButton() == DocumentApp.getUi().Button.OK) { 
    setCampaignDate(campaignDateResponse.getResponseText())
    return campaignDateResponse.getResponseText()
  }
}

/**
 * set campaign sending date
 * 
 * @param {string} dateStr format 'YYYY-MM-DD'
 */
function setCampaignDate(dateStr) {
  documentProperties.setProperty('date',dateStr)
  updateCampaignName()
  updateCampaignFolders()
  updateDocTitle()
  
}

/**
 * return the campaign sending date
 * @returns {string} date 'YYYY-MM-DD'
 */
function getCampaignDate(){
  return documentProperties.getProperty('date')
}

/**
 * update the brevo campaign name 
 * called after setCampaignDate or setCapaignNumber
 */
function updateCampaignName(){
  updateCampaignConf({'name': `news - ${getCampaignDate()} - n°${getCampaignNumber()}` })
}

/**
 * create campaign's Gdrive folders 
 * 
 * 
 * two nested folders are created for each campaign il the archived campaigns forlder
 * the archived campaigns folder id is store in the archivedCampaignsFolderId const
 * 
 * archived campaign folder/YYYY-MM-DD -> campaign root folder where the Gdoc will be archived
 * archived campaign folder/YYYY-MM-DD/fichiers liés -> for images and other docs related to the campaign
 * 
 * @param {string} name the campaign sending date 'YYYY-MM-DD'
 */
function updateCampaignFolders() {  
  var folderName = "n°"+getCampaignNumber()+" - "+getCampaignDate()
  // if the campaign folders have already been created update the name
  
  DriveApp.getFolderById(documentProperties.getProperty('campaignFolderId')).setName(folderName)

}

/**
 * update campaign's Gdrive folders
 */
function createCampaignFolders() {
  var folderName = "n°" + getCampaignNumber() + " - " + getCampaignDate()
  var campaignsFolder = DriveApp.getFolderById(archivedCampaignsFolderId);
  var campaignFolder = campaignsFolder.createFolder(folderName)
  documentProperties.setProperty("campaignFolderId",campaignFolder.getId())
  var imageCampaignFolder = campaignFolder.createFolder("fichiers liés")
  documentProperties.setProperty("imagesCampaignFolderId",imageCampaignFolder.getId())
}


function displayCampaignDate(){
  DocumentApp.getUi().alert('le nom de la campagne est : '+documentProperties.getProperty('date'));
}

/*function getCampaignSubject(){
  let subject = "Lettre d'information de Dieulefit n°"+documentProperties.getProperty('campaignNumber');
  //Logger.log('subject = '+subject)
  return subject;
}*/


/**
 * update the campaign subject 
 * this fonction is called by setCampaignNumber() and 
 */
function updateCampaignSubject(){
  let subject = "Lettre d'information de Dieulefit n°"+getCampaignNumber();
  //Logger.log('subject = '+subject)
  updateCampaignConf({"subject" : subject})
}

function getCampaignSubject(){
  let campaignConf = getCampaignConf()
  //Logger.log('campaign subject = '+ campaignConf.subject)
  return campaignConf.subject
}

/**
 * return the Brevo campaign id
 * 
 * @returns {number}
 */
function getCampaignId(){
  let id = documentProperties.getProperty('campaignId')
  //Logger.log('campaign id = '+id)
  return id
}

/**
 * display campaign id to user
 */
function menuDisplayCampaignId(){
   DocumentApp.getUi().alert("Id de la campagne : "+getCampaignId())
}

/**
 * save the campaign id
 * 
 * @param {string | number} id 
 * @returns {strign} id
 */
function setCampaignId(id){
  documentProperties.setProperty('campaignId',id != null ? id : '17')
  return documentProperties.getProperty('campaignId')
}

/**
 * send test email of the campaign with brevo
 * 
 */
function menuSendTestWithBrevo(){
  sendTestWithBrevo()
  DocumentApp.getUi().alert('Le test a bien été envoyé')
  
}

function sendTestWithBrevo(){
  updateCampaign()
  let options = brevoRequestOptions
  options.method = 'POST';
  options.payload = JSON.stringify({
    "emailTo": [
      "mancini.christophe@gmail.com"
    ]
  })
  var responseSendTest = UrlFetchApp.fetch('https://api.brevo.com/v3/emailCampaigns/'+getCampaignId()+'/sendTest', options);
  //var responseSendTestContent = JSON.parse(responseSendTest.getContentText());
  //Logger.log('rep send test code = '+responseSendTest.getResponseCode())
  //Logger.log('rep send test text = '+responseSendTest.getContentText())
}