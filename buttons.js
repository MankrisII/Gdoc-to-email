/*
Buttons are links with specials css styles that must be treated specially at render
To remeber what element with linkUrl property is a button, the url his stored in the 
document property 'buttons' as an array of strings

*/

/**
 * return array of urls
 * @returns {array} 
 * 
 * Buttons
 */

function getButtons() {
  let buttons;

  if(documentProperties.getProperty('buttons') != null){
    //Logger.log('buttons not empty');
    buttons = JSON.parse(documentProperties.getProperty('buttons'))

  }else{
    //Logger.log("buttons doesn't exist")
    buttons = [];
    documentProperties.setProperty('buttons',JSON.stringify(buttons))
  }
  
  //Logger.log("campaignConf = "+typeof campaignConf)
  return buttons;
}

/**
 * 
 * @param {Item} item 
 * @returns {boolean}
 */
function isButton(item) {
  if (item.getLinkUrl && item.getLinkUrl()) {
    let url = item.getLinkUrl()
    let buttons = getButtons();
    return buttons.includes(url)
  } else {
    return false
  }
}

function isDefaultButton(item) {
  if (isButton(item) && defaltButtonsUrls.includes(item.getLinkUrl())) {
    return true
  } else {
    return false
  }
}

/**
 *
 * clear document property 'buttons'
 * set the defaults button that remains over campaigns
 *
 */
function clearButtons(){
  documentProperties.deleteProperty('buttons')
  documentProperties.setProperty('buttons',JSON.stringify(defaltButtonsUrls))
}

/**
 * 
 * action trigered by user action in the custom menu
 * ask user for url
 * add convert selected paragraph to button 
 * store url in document property 'bottons'
 */
function menuAddButton() {
  var cursor = DocumentApp.getActiveDocument().getCursor();
  if (!cursor) return DocumentApp.getUi().alert('Vous devez positionner le curseur sur un texte.');

  var element = cursor.getElement()
  var type = element.getType().toString();
  var id = 0
  
  while(element.getType() != DocumentApp.ElementType.PARAGRAPH || id > 10){
    element = element.getParent()
    type = element.getType().toString();
    id ++
  }

  //prompt for url
  var response = DocumentApp.getUi().prompt('Adresse du lien','URL',DocumentApp.getUi().ButtonSet.OK_CANCEL);
  if (response.getSelectedButton() != DocumentApp.getUi().Button.OK) { 
    return;
  }
  var url = formatAssetsUrl(response.getResponseText())
  
  //stylized the element
  element.setLinkUrl(url)
  element.setAlignment(DocumentApp.HorizontalAlignment.CENTER)
  element.setBackgroundColor("#FFA000")
  element.setBold(true)
  element.setForegroundColor("#ffffff") 
  element.setUnderline(false)

  // save url
  let buttons = getButtons()
  buttons.push(url)
  documentProperties.setProperty('buttons',JSON.stringify(buttons))
}

