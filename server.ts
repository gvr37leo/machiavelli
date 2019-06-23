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
    var player = new Player(0,0)
    player.wsbox = wsbox
    gamedb.players.add(player)

    wsbox.socket.addEventListener('close',() => {
        gamedb.players.delete(player.id)
        updateClients()
    })
    
    wsbox.listen('endturn',data => onEndTurn.trigger(data,null))
    wsbox.listen('start',data => onStart.trigger(data,null))
    wsbox.listen('reset',data => onReset.trigger(data,null))
    wsbox.listen('endturn',data => onEndTurn.trigger(data,null))
    

    updateClients()
});

var gamedb = genGameDB()


var onPlayCard = new EventSystem<{playerid:number,handindex:number}>()
var onEndTurn = new EventSystem<{playerid:number}>()
var onStart = new EventSystem<{playerid:number}>()
var onReset = new EventSystem<{playerid:number}>()
var onDiscoverRole = new EventSystem<{playerid:number,roleindex:number}>()
var onDiscoverPlayer = new EventSystem<{playerid:number,playerindex:number}>()
var onDiscoverCard = new EventSystem<{playerid:number,cardindex:number}>()

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



async function discoverRoles(player:Player,roles:Role[]):Promise<Role>{
    player.isDiscoveringRoles = true
    player.discoverRoles = roles.map(r => r.id)
    return new Promise((res,rej) => {
        onDiscoverRole.listen(data => {
            if(data.playerid == player.id){
                player.isDiscoveringRoles = false
                var discoveredRole = player.discoverRoles[data.roleindex]
                player.discoverRoles = []
                res(gamedb.roles.get(discoveredRole))
            }
        })

    })
}

async function discoverCards(player:Player,cards:Card[]):Promise<Card>{
    player.isDiscoveringCards = true
    player.discoverCards = cards.map(r => r.id)
    return new Promise((res,rej) => {
        onDiscoverCard.listen(data => {
            if(data.playerid == player.id){
                player.isDiscoveringCards = false
                var discoveredCard = player.discoverCards[data.cardindex]
                player.discoverCards = []
                res(gamedb.cards.get(discoveredCard))
            }
        })

    })
}

async function discoverPlayers(player:Player,players:Player[]):Promise<Player>{
    player.isDiscoveringPlayers = true
    player.discoverPlayers = players.map(r => r.id)
    return new Promise((res,rej) => {
        onDiscoverPlayer.listen(data => {
            if(data.playerid == player.id){
                player.isDiscoveringPlayers = false
                var discoveredRole = player.discoverPlayers[data.playerindex]
                player.discoverPlayers = []
                res(gamedb.players.get(discoveredRole))
            }
        })

    })
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

function mulligan(playerid:number){

}

function countBuildingIncome(player:Player){
    return player.buildings.reduce((prev,cur) => {
        return prev + (gamedb.cards.get(cur).role == player.role ? 1 : 0)
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
    countScores(gamedb.firstFinishedPlayer,gamedb.players.list())
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
    await discoverRoles(gamedb.players.get(gamedb.playerTurn),roledeck.map(rid => gamedb.roles.get(rid)))


    roledeck.push(3)
    shuffle(roledeck)
    for(var i = 0;roledeck.length > 1; i++){
        var role = await discoverRoles(null,roledeck.map(rid => gamedb.roles.get(rid)))
        findAndDelete(roledeck,role.id)
        gamedb.players.get(i).role = role.id
    }

    for(var player of gamedb.players.list()){
        await playerTurn(player)
    }
}

async function playerTurn(player:Player){
    player.money += 2
    // inkomsten of kaarten trekken


    if(player.role == 0){//moordenaar
        gamedb.murderedRole = (await discoverRoles(player,[1,2,3,4,5,6,7].map(rid => gamedb.roles.get(rid)))).id
    }
    if(player.role == 1){//dief
        gamedb.burgledRole = (await discoverRoles(player,[2,3,4,5,6,7].map(rid => gamedb.roles.get(rid)))).id
    }
    if(player.role == 2){//magier
        var swapPlayer:Player = await discoverOtherPlayers(player);
        [player.hand,swapPlayer.hand] = [swapPlayer.hand,player.hand]
        // mulligan(player.id)

    }
    if(player.role == 3){//koning
        gamedb.crownWearer = player.id
        player.money += countBuildingIncome(player)
    }
    if(player.role == 4){//prediker
        player.money += countBuildingIncome(player)
    }
    if(player.role == 5){//koopman
        player.money++
        player.money += countBuildingIncome(player)
    }
    if(player.role == 6){//bouwmeester
        //trek 2 kaarten
        //build 2 buildings
    }

    if(player.role == 7){//condotierre
        player.money += countBuildingIncome(player)
        discoverOtherPlayers(player).then(chosenPlayer => {
            discoverCards(player,chosenPlayer.buildings.map(bid => gamedb.cards.get(bid))).then(chosenBuilding => {
                player.money -= chosenBuilding.cost - 1
                findAndDelete(player.buildings,chosenBuilding)
            })
        })
    }

    await new Promise((res,rej) => {
        onEndTurn.listen(p => {
            if(p.playerid == player.id){
                res()
            }
        })
    })
    //build buildings and end turn
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