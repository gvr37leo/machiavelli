var express = require('express')
var app = express()

app.use(express.static('./'))

app.listen(8000, () => {
    console.log('listening')
})

function playcard(handindex){

}

function endturn(){

}

function chooseDiscover(discoverindex){

}