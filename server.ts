/// <reference path="src/store.ts" />
/// <reference path="src/models.ts" />
/// <reference path="src/storeSetup.ts" />
/// <reference path="node_modules/vectorx/vector.ts" />
/// <reference path="node_modules/eventsystemx/EventSystem.ts" />
/// <reference path="serverutils.ts" />




var myws = require('ws');
var express = require('express')
var socket 
var app = express()


app.use(express.static('./'))

app.listen(8000, () => {
    console.log('listening')
})

const wss = new myws.Server({ port: 8080 });
 
wss.on('connection', function connection(ws) {
    var wsbox = new WsBox(ws)
    var player = new Player()
    player.wsbox = wsbox
    gamedb.players.add(player)

    wsbox.socket.addEventListener('close',() => {
        gamedb.players.delete(player.id)
        updateClients()
    })
    
    wsbox.listen('endturn',data => onEndTurn.trigger(data,null))
    wsbox.listen('start',data => entiregame())
    wsbox.listen('reset',data => onReset.trigger(data,null))
    wsbox.listen('endturn',data => onEndTurn.trigger(data,null))
    wsbox.listen('discover',data => onDiscover.trigger(data,null))
    wsbox.listen('playcard',data => onPlayCard.trigger(data,null))
    
    
    

    updateClients()
});

var gamedb = genGameDB()


var onPlayCard = new EventSystem<{playerid:number,handindex:number}>()
var onEndTurn = new EventSystem<{playerid:number}>()
var onStart = new EventSystem<{playerid:number}>()
var onReset = new EventSystem<{playerid:number}>()
var onDiscover = new EventSystem<{playerid:number,discoverindex:number}>()

function updateClients(){
    for(var player of gamedb.players.list()){
        player.wsbox.send('update',{
            playerid:player.id,
            gamedb:gamedb.serialize()
        })
    }
}

function chooseRoles(){
    var roleReference = [0,1,2,3,4,5,6,7]
    shuffle(roleReference)
}

async function discover(player:Player,options:DiscoverOption[]):Promise<number>{
    player.isDiscovering = true
    player.discoverOptions = options
    updateClients()
    return new Promise((res,rej) => {
        onDiscover.listenOnce(data => {
            if(data.playerid == player.id){
                player.isDiscovering = false
                player.discoverOptions = []
                res(data.discoverindex)
            }
        })
    })
}

async function discoverRoles(player:Player,roles:Role[]):Promise<Role>{
    return roles[await discover(player,roles.map(r => new DiscoverOption(r.image,r.name,0,r.color,'')))]
}

async function discoverCards(player:Player,cards:Card[]):Promise<Card>{
    return cards[await discover(player,cards.map(c => new DiscoverOption(c.image,c.name,0, gamedb.roles.get(c.role).color,'')))]
}

async function discoverPlayers(player:Player,players:Player[]):Promise<Player>{
    return players[await discover(player,players.map(p => new DiscoverOption(0,p.name,0,'','')))]
}

async function discoverOptions(player:Player,options:string[]):Promise<number>{
    return discover(player,options.map(o => new DiscoverOption(0,'',0,'',o)))
}

async function discoverOtherPlayers(player:Player):Promise<Player>{
    return discoverPlayers(player,gamedb.players.list().filter(p => p.id != player.id))
}

function shuffle<T>(array:T[]):T[]{
    var m = array.length, i;
    while (m) {
      i = Math.floor(Math.random() * m--);
      swap(array,i,m)
    }
    return array;
}

async function mulligan(playerid:number){

}

function countBuildingIncome(player:Player){
    return player.buildings.reduce((prev,cur) => {
        return prev + (gamedb.roles.get(gamedb.cards.get(cur).role).player == player.id ? 1 : 0)
    },0)
}


function countScores(firstPlayerId:number,players:Player[]){
    return players.map((player) => {
        var buildingscore = player.buildings.reduce((score,cardid) => {
            var building = gamedb.cards.get(cardid)
            return score + building.points
        },0)

        var uniqueresults = [
            player.buildings.findIndex((bid) => {
                return  gamedb.cards.get(bid).role == 0
            }),
            player.buildings.findIndex((bid) => {
                return  gamedb.cards.get(bid).role == 1
            }),
            player.buildings.findIndex((bid) => {
                return  gamedb.cards.get(bid).role == 2
            }),
            player.buildings.findIndex((bid) => {
                return  gamedb.cards.get(bid).role == 3
            }),
            player.buildings.findIndex((bid) => {
                return  gamedb.cards.get(bid).isAnyRole
            }),
        ]
        var uniquescore = uniqueresults.findIndex(res => res == -1) == -1 ? 0 : 3
        var firstscore = player.id == firstPlayerId ? 4 : 0
        var secondscore = player.buildings.length >= 8 ? 2 : 0
        return buildingscore + uniquescore + firstscore + secondscore
    })
}

async function entiregame(){
    //setup money
    gamedb.crownWearer = randomInt(0,gamedb.players.map.size)
    shuffle(gamedb.deck)
    gamedb.players.list().forEach(p => {
        p.money = 2
        p.hand = p.hand.concat(gamedb.deck.splice(0,4))
    })
    gamedb.playerTurn = randomInt(0,gamedb.players.map.size)
    
    while(gamedb.firstFinishedPlayer == null){
        await round()
        gamedb.playerTurn = (gamedb.playerTurn + 1) % gamedb.players.map.size
    }
    var scores = countScores(gamedb.firstFinishedPlayer,gamedb.players.list())
    var winner = gamedb.players.list()[findBestIndex(scores,s => s)]
}

async function round(){

    var roledeck = [0,1,2,4,5,6,7]
    shuffle(roledeck)
    if(gamedb.players.map.size == 4){
        roledeck.splice(0,1)
        roledeck.splice(0,1)
    }else if(gamedb.players.map.size == 5){
        roledeck.splice(0,1)
    }

    roledeck.splice(0,1)//await/coroutine show this role to the king
    var kingrole = await discoverRoles(gamedb.players.get(gamedb.playerTurn),roledeck.map(rid => gamedb.roles.get(rid)))


    roledeck.push(3)
    shuffle(roledeck)

    gamedb.roles.list().forEach(r => r.player = null)
    for(var i = 1;roledeck.length > 1; i++){
        var player = gamedb.players.list()[i % gamedb.players.map.size]
        var role = await discoverRoles(player,roledeck.map(rid => gamedb.roles.get(rid)))
        findAndDelete(roledeck,role.id)
        role.player = player.id
    }

    for(var player of gamedb.players.list()){
        await playerTurn(player)
    }
}

async function playerTurn(player:Player){
    
    var buildlimit = 1
    

    if(gamedb.roles.get(0).player == player.id){//moordenaar
        gamedb.murderedRole = (await discoverRoles(player,[1,2,3,4,5,6,7].map(rid => gamedb.roles.get(rid)))).id
    }
    if(gamedb.roles.get(1).player == player.id){//dief
        gamedb.burgledRole = (await discoverRoles(player,[2,3,4,5,6,7].map(rid => gamedb.roles.get(rid)))).id
    }
    if(gamedb.roles.get(2).player == player.id){//magier
        if(gamedb.players.map.size > 1){
            var swapPlayer:Player = await discoverOtherPlayers(player);
            [player.hand,swapPlayer.hand] = [swapPlayer.hand,player.hand]
        }
        // mulligan(player.id)

    }
    if(gamedb.roles.get(3).player == player.id){//koning
        gamedb.crownWearer = player.id
        player.money += countBuildingIncome(player)
    }
    if(gamedb.roles.get(4).player == player.id){//prediker
        player.money += countBuildingIncome(player)
    }
    if(gamedb.roles.get(5).player == player.id){//koopman
        player.money++
        player.money += countBuildingIncome(player)
    }
    if(gamedb.roles.get(6).player == player.id){//bouwmeester
        buildlimit = 2
        //trek 2 kaarten
        //build 2 buildings
    }

    if(gamedb.roles.get(7).player == player.id){//condotierre
        player.money += countBuildingIncome(player)
        if(gamedb.players.map.size > 1){
            discoverOtherPlayers(player).then(chosenPlayer => {
                discoverCards(player,chosenPlayer.buildings.map(bid => gamedb.cards.get(bid))).then(chosenBuilding => {
                    player.money -= chosenBuilding.cost - 1
                    findAndDelete(player.buildings,chosenBuilding)
                })
            })
        }
    }

    var decision = await discoverOptions(player,['2 goudstukken', 'kaarten trekken'])
    if(decision == 0){
        player.money += 2
    }else{
        var card = await discoverCards(player, gamedb.deck.splice(0,2).map(cid => gamedb.cards.get(cid)))
        player.hand.push(card.id)
    }
    
    //build buildings and end turn
    //listen for playcard event
    var onPlayCardcb = (data:{playerid:number,handindex:number}) => {
        if(data.playerid == player.id && buildlimit > 0){
            buildlimit--
            
            player.buildings.push(player.hand.splice(data.handindex,1)[0])//eerst duplicate building check
            if(player.buildings.length >= 8 && gamedb.firstFinishedPlayer == null){
                gamedb.firstFinishedPlayer = player.id
            }
        }
    }
    onPlayCard.listen(onPlayCardcb)
    updateClients()
    await new Promise((res,rej) => {
        onEndTurn.listenOnce(p => {
            if(p.playerid == player.id){
                onPlayCard.deafen(onPlayCardcb)
                res()
            }
        })
    })
    
}





//round
//leg x van de 8 kaarten open op tafel (niet de koning)
//2-3|4|5|6-7
// 0  2 1  0

//koning pakt bovenste kaart van de stapel en legt deze gedekt naast de 3 open kaarten
//pak kaart en geef door aan de volgende speler
//leg het laatste karakter gedekt op tafel

//turn
//inkomstenfase
//2 goud of discover 2 kaarten
//bouwfase
//bouw 1 gebouw
//mag geen duplicaten bouwen
//karaktereigenschap mag elk moment in een speler zijn beurt gebruikt worden

//spel is afgelopen als een speler 8 gebouwen heeft
//maak ronde af

//winnaar
//puntenwaarde van alle gebouwen
//3 punten als je een gebouw van elke kleur hebt
//4 punten voor eerste speler met 8 gebouwen
//2 punten voor spelers die nog net 8 gebouwen hebben kunnen krijgen