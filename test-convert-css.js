var mediaQueries = `
@media screen and (max-width: 600px) {
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
    margin-bottom: 15px;
}

#content li {
    margin-bottom: 0px;
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
function processStyles() {
    stylesObj = {} 
    // delete all EOL folowed by white spaces
    stylesStr = styles.replaceAll(/\n\s*/g, "",)
    // delete all EOL
    stylesStr = stylesStr.replaceAll("\n", "",)
    //console.log(style)
    //explode styles strings into an array
    let styleArr = [...stylesStr.matchAll(/([^\{]*)\{([^\}]*)\}/g)]
    
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
    console.log(stylesObj)
   
}

function normalizedStyleName(name) {
    return name.trim().replaceAll(' ','_')
}

function getStyles(name) {
    if (!stylesObj) {
        processStyles()
    }
    let styles = ''
    for (let n in arguments) {
        styles += stylesObj[normalizedStyleName(arguments[n])]
    }
    return `style="${styles}"`
}

//processStyles()
function processeHTML(){
  return `
  <div  ${getStyles('#content ul')}>
  `
}
console.log(processeHTML())

