/// <reference path="src/utils.ts" />
/// <reference path="node_modules/vectorx/vector.ts" />
/// <reference path="node_modules/eventsystemx/EventSystem.ts" />
/// <reference path="src/projectutils.ts" />
/// <reference path="src/models.ts" />
/// <reference path="src/storeSetup.ts" />
/// <reference path="templates/card.js" />
/// <reference path="templates/opponent.js" />
/// <reference path="templates/board.js" />

class WsBox{
    socket: WebSocket;

    constructor(url:string){
        this.socket = new WebSocket(url)
        this.socket.addEventListener('open', () => {

        })

        this.socket.addEventListener('close', () => {

        })
    }

    send(type:string,data:any){
        this.socket.send(JSON.stringify({
            type:type,
            data:data,
        }))
    }

    listen(type:string,cb:(data:any) => void){
        this.socket.addEventListener('message',e => {
            var res = JSON.parse(e.data)
            if(res.type == type){
                cb(res.data)
            }
        })
    }
}
var playerid;
var ws = new WsBox('ws://localhost:8080')
ws.listen('update',updatedata => {
    playerid = updatedata.playerid
    renderPlayerPerspective(updatedata.gamedb,updatedata.gamedb.players.find(p => p.id == updatedata.playerid))
})

function endturn(){
    ws.send('endturn',{})
}

function start(){

}

function reset(){

}

function renderPlayerPerspective(gamedb,player:Player){

    var boardelement = string2html(boardhtml)
    var app = document.querySelector('#app') as HTMLElement
    emptyElement(app)
    app.append(boardelement)
    var endturnbutton = boardelement.querySelector('#endturnbutton')
    var crownicon = boardelement.querySelector('#crownicon') as HTMLElement
    var opponentcontainer = boardelement.querySelector('#opponentcontainer')
    var board = boardelement.querySelector('#board')
    var money = boardelement.querySelector('#money')
    var hand = boardelement.querySelector('#hand')
    var coins = boardelement.querySelector('#coins')
    var hand = boardelement.querySelector('#hand')

    crownicon.style.visibility = 'hidden'
    if(gamedb.crownWearer == player.id){
        crownicon.style.visibility = 'visible'
    }
    
    for(var cardid of player.hand){
        var card = gamedb.cards.get(cardid)
        hand.append(genCardHtml(gamedb,card))
    }

    for(var buildingid of player.buildings){
        var building = gamedb.cards.get(buildingid)
        board.append(genCardHtml(gamedb,building))
    }

    var opponents = gamedb.players.filter(p => p.id != player.id)
    for(var opponent of opponents){
        opponentcontainer.append(genOpponentHtml(gamedb,opponent))
    }
    
}

function genCardHtml(gamedb,card:Card){

    var cardelement = string2html(cardhtml)
    var name = cardelement.querySelector('#name')
    var cost = cardelement.querySelector('#cost')
    var color = cardelement.querySelector('#color') as HTMLElement
    name.innerHTML = card.name
    cost.innerHTML = card.cost as any
    color.style.backgroundColor = gamedb.roles.get(card.role).color
    return cardelement
}

function genOpponentHtml(gamedb,player:Player){
    var opponentelement = string2html(opponenthtml)
    var crown = opponentelement.querySelector('#crownicon') as HTMLElement
    var handsize = opponentelement.querySelector('#handsize')
    var moneycounter = opponentelement.querySelector('#moneycounter')
    var board = opponentelement.querySelector('#board')
    crown.style.visibility = 'hidden'
    if(player.id == gamedb.crownWearer){
        crown.style.visibility = 'visible'
    }

    handsize.innerHTML = player.hand.length as any
    moneycounter.innerHTML = player.money as any

    for(var buildingid of player.buildings){
        var building = gamedb.cards.get(buildingid)
        board.append(genCardHtml(gamedb,building))
    }

    return opponentelement
}

