var mediaQueries = `
@media screen and (max-width: 600px) {
    .flex-element {
        width: 100% !important;
        margin-left: 0 !important;
    }
}`

var style =`
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

.centrer {
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
#content ul {
    font-family: georgia;
    margin-bottom: 15px
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

var styleArr

function processStyles() {
  
  style = style.replaceAll(/\n\s*/g, "",)
  style = style.replaceAll("\n", "",)
  //console.log(style)
  styleArr = [...style.matchAll(/([^\{]*)\{([^\}]*)\}/g)]
  styleArr = styleArr.map(m => {
    return o = {
      definition: m[1].split(',')
      //  .map(a => a.trim())
      ,
      styles : m[2]
    }
  })
  console.log(styleArr)
}


function getStyles(definition) {
  var styles = styleArr.filter(m => m.definition.match(definition))
                      .map(m => m.styles)
                      .join(";")
  return `style="${styles}"`
}


//console.log(styleArr.filter(m => m.definition.match("#content ol")).map(m => m.styles).join(";"))

processStyles()
function processeHTML(){
  var html = `
  <div ${getStyles("#content")}>
  `
}
// processeHTML()

//console.log(html)