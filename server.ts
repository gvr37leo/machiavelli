/// <reference path="src/store.ts" />
/// <reference path="src/models.ts" />
/// <reference path="src/storeSetup.ts" />
/// <reference path="node_modules/vectorx/vector.ts" />
/// <reference path="src/EventSystem.ts" />
/// <reference path="serverutils.ts" />



class CPromise<T>{
    res:EventSystem<T>
    constructor(public func:(res:EventSystem<T>) => void){

    }

    call(){
        this.func(this.res)
    }

    then(cb:(val:T,old:T) => void){
        this.res.listen(cb)
    }
}




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
    wsbox.listen('start',data => new CPromise<void>(entiregame))
    wsbox.listen('reset',data => onReset.trigger(data,null))
    wsbox.listen('endturn',data => onEndTurn.trigger(data,null))
    wsbox.listen('discover',data => onDiscover.trigger(data,null))
    wsbox.listen('playcard',data => onPlayCard.trigger(data,null))
    wsbox.listen('toggleselect',data => onToggleSelection.trigger(data,null))
    wsbox.listen('confirmselect',data => onConfirmSelection.trigger(data,null))
    
    
    
    

    updateClients()
});

var gamedb = genGameDB()


var onPlayCard = new EventSystem<{playerid:number,handindex:number}>()
var onEndTurn = new EventSystem<{playerid:number}>()
var onStart = new EventSystem<{playerid:number}>()
var onReset = new EventSystem<{playerid:number}>()
var onDiscover = new EventSystem<{playerid:number,discoverindex:number}>()
var onToggleSelection = new EventSystem<{playerid:number,selectedIndex:number}>()
var onConfirmSelection = new EventSystem<{playerid:number}>()

// var gamestartEvent = new EventSystemVoid()
// var gameendEvent = new EventSystemVoid()
var roundstartEvent = new EventSystemVoid()
var roundendEvent = new EventSystemVoid()
var roleturnBox = new Box<Role>(null)



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

async function select(player:Player,options:DiscoverOption[],discoverDescription:string):Promise<number[]>{
    player.isSelecting = true
    player.selectOptions = options
    player.discoverDescription = discoverDescription
    updateClients()
    return new Promise((res,rej) => {
        var onSelectionListener = data => {
            if(data.playerid == player.id){
                player.selectOptions[data.selectedIndex].selected = !player.selectOptions[data.selectedIndex].selected
                updateClients()
            }
        }
        onToggleSelection.listen(onSelectionListener)

        onConfirmSelection.listenOnce(data => {
            if(data.playerid == player.id){
                onToggleSelection.deafen(onSelectionListener)
                player.isSelecting = false
                var result = player.selectOptions.map((option,i) => option.selected ? i : -1).filter(v => v != -1)
                player.selectOptions = []
                player.selectOptions = []
                player.discoverDescription = ''
                res(result)
            }
        })
    })
}

async function selectCards(player:Player,cards:Card[],discoverDescription:string):Promise<number[]>{
    return select(player,cards.map(c => new DiscoverOption(c.image,c.name,c.cost, gamedb.roles.get(c.role).color,'',true)),discoverDescription)
}

async function discover(player:Player,options:DiscoverOption[],discoverDescription:string):Promise<number>{
    player.isDiscovering = true
    player.discoverOptions = options
    player.discoverDescription = discoverDescription
    updateClients()
    return new Promise((res,rej) => {
        onDiscover.listenOnce(data => {
            if(data.playerid == player.id){
                player.isDiscovering = false
                player.discoverOptions = []
                player.discoverDescription = ''
                res(data.discoverindex)
            }
        })
    })
}

async function discoverRoles(player:Player,roles:Role[],discoverDescription:string):Promise<Role>{
    return roles[await discover(player,roles.map(r => new DiscoverOption(r.image,r.name,0,r.color,'',true)),discoverDescription)]
}

async function discoverCards(player:Player,cards:Card[],discoverDescription:string):Promise<Card>{
    return cards[await discover(player,cards.map(c => new DiscoverOption(c.image,c.name,c.cost, gamedb.roles.get(c.role).color,'',true)),discoverDescription)]
}

async function discoverPlayers(player:Player,players:Player[],discoverDescription:string):Promise<Player>{
    return players[await discover(player,players.map(p => new DiscoverOption(0,p.name,0,'','',true)),discoverDescription)]
}

async function discoverOptions(player:Player,options:string[],discoverDescription:string):Promise<number>{
    return discover(player,options.map(o => new DiscoverOption(0,'',0,'',o,true)),discoverDescription)
}

async function discoverOtherPlayers(player:Player,discoverDescription:string):Promise<Player>{
    return discoverPlayers(player,gamedb.players.list().filter(p => p.id != player.id),discoverDescription)
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
        var secondscore = (player.buildings.length >= 8 && player.id != firstPlayerId)  ? 2 : 0
        return buildingscore + uniquescore + firstscore + secondscore
    })
}

//discover event player.isDiscovering
//select event player.isSelecting
//rolepick/playerpickturn

//gamestart event
//roundstart event
//rolestart event(role) en roleturnchangeevent

//------------------game flow---------------------
//|||||||||||||||||||||||||||||||||||
//|||||||||||||||||||||||||||||||||||
//|||||||||||||||||||||||||||||||||||
//|||||||||||||||||||||||||||||||||||
//|||||||||||||||||||||||||||||||||||


function entiregame(res:EventSystem<void>){
    shuffle(gamedb.deck)
    gamedb.players.list().forEach(p => {
        p.money = 2
        p.hand = p.hand.concat(gamedb.deck.splice(0,4))
    })
    gamedb.crownWearer = randomInt(0,gamedb.players.map.size)

    
    roundstartEvent.trigger()
    roundendEvent.listen(() => {
        if(gamedb.firstFinishedPlayer == null){
            res.trigger()
            var scores = countScores(gamedb.firstFinishedPlayer,gamedb.players.list())
            var winner = gamedb.players.list()[findBestIndex(scores,s => s)]//bij meerdere gelijke scores wint de speler met de hoogste gebouwen puntenwaarde
        }else{
            roundstartEvent.trigger()
        }
    })
}

//-----------------------------------
roundstartEvent.listen(() => {
    gamedb.roles.list().forEach(r => r.player = null)
    gamedb.murderedRole = null
    gamedb.burgledRole = null
    gamedb.roleTurn = null
    gamedb.playerTurn = null
    var roledeck = [0,1,2,4,5,6,7]
    shuffle(roledeck)
    if(gamedb.players.map.size == 4){
        gamedb.discardedRoles = roledeck.splice(0,2)
    }else if(gamedb.players.map.size == 5){
        gamedb.discardedRoles = roledeck.splice(0,1)
    }
    roledeck.push(3)
    shuffle(roledeck)

    gamedb.kingshownRole = roledeck.splice(0,1)[0]

    async function pickrole(player:Player, roledeck:number[]){
        gamedb.playerTurn = player.id
        var role = await discoverRoles(player,roledeck.map(rid => gamedb.roles.get(rid)),'kies een rol om te spelen')
        role.player = player.id
        findAndDelete(roledeck,role.id)
        return role
    }

    if([2,3].findIndex(v => v == gamedb.players.map.size) != -1){
        await pickrole(gamedb.players.get(gamedb.crownWearer),roledeck)
    }

    for(var i = gamedb.crownWearer + 1;roledeck.length > 1; i++){
        let player = gamedb.players.list()[i % gamedb.players.map.size]
        await pickrole(player,roledeck)
        if(gamedb.players.map.size == 7 && roledeck.length == 1){
            let lastplayer = gamedb.players.list()[(i + 1) % gamedb.players.map.size]
            roledeck.push(gamedb.kingshownRole)
            pickrole(lastplayer,roledeck)
        }
    }


    for(var role of gamedb.roles.list()){//hier gaat iets fout met loops, moet vervangen worden met roleturn start en end
        
        
    }
    var pro = new CPromise<Role>(roleturn)
    pro.then((val,old) => {
        let player = gamedb.players.get(role.player)
        if(player != null && gamedb.murderedRole != role.id){
            
            
        }
    })


})


//------------------------------------------------------
//listen to roleturnchange
function roleturn(res:EventSystem<Role>){
    gamedb.roleTurn = role.id
    var buildlimit = 1
    if(gamedb.burgledRole == role.id){
        var burgeldrole = gamedb.roles.get(gamedb.burgledRole)
        var diefplayer = gamedb.players.get(gamedb.roles.get(RoleId.dief).player)
        var burgledplayer = gamedb.players.get(burgeldrole.player)
        diefplayer.money += burgledplayer.money
        burgledplayer.money = 0
    }

    var player = gamedb.players.get(role.player)
    var filterDiscardedRoles = rid => !contains(gamedb.discardedRoles,rid) 
    var filterOwnRole = rid => gamedb.roles.get(rid).player != role.player
    if(RoleId.moordenaar == role.id){//moordenaar
        gamedb.murderedRole = (await discoverRoles(player,[1,2,3,5,6,7].filter(filterDiscardedRoles).filter(filterOwnRole).map(rid => gamedb.roles.get(rid)),'kies iemand om te vermoorden')).id
    }
    if(RoleId.dief == role.id){//dief
        gamedb.burgledRole = (await discoverRoles(player,[2,3,4,5,6,7].filter(filterDiscardedRoles).filter(filterOwnRole).filter(rid => rid != gamedb.murderedRole).map(rid => gamedb.roles.get(rid)),'kies iemand om te bestelen')).id
    }
    if(RoleId.magier == role.id){//magier
        
        if(gamedb.players.map.size > 1){
            if(await discoverOptions(player,['swap','mulligan'],'swap met een andere speler of ruil met het dek') == 0){
                var swapPlayer:Player = await discoverOtherPlayers(player,'kies om een speler om mee van kaarten te ruilen');
                [player.hand,swapPlayer.hand] = [swapPlayer.hand,player.hand]
            }else{
                var selectedcardsindices:number[] = await selectCards(player,player.hand.map(cid => gamedb.cards.get(cid)), 'selecteer kaarten om te ruilen')
                var deckcards = gamedb.deck.splice(0,selectedcardsindices.length)
                selectedcardsindices.forEach((hid,i) => {
                    player.hand[hid] = deckcards[i]
                });
            }
        }

    }
    if(RoleId.koning == role.id){//koning
        gamedb.crownWearer = player.id
        player.money += countBuildingIncome(player)
    }
    if(RoleId.prediker == role.id){//prediker
        player.money += countBuildingIncome(player)
    }
    if(RoleId.koopman == role.id){//koopman
        player.money++
        player.money += countBuildingIncome(player)
    }
    if(RoleId.bouwmeester == role.id){//bouwmeester
        buildlimit += 2
        player.hand = player.hand.concat(gamedb.deck.splice(0,2))
    }

    if(RoleId.condotierre == role.id){//condotierre
        player.money += countBuildingIncome(player)
        if(gamedb.players.map.size > 1){
            discoverOtherPlayers(player,'kies een speler om een van zijn gebouwen te verbranden').then(chosenPlayer => {
                discoverCards(player,chosenPlayer.buildings.map(bid => gamedb.cards.get(bid)),'kies een gebouw om te verbranden').then(chosenBuilding => {
                    player.money -= chosenBuilding.cost - 1
                    findAndDelete(chosenPlayer.buildings,chosenBuilding)
                })
            })
        }
    }

    var decision = await discoverOptions(player,['2 goudstukken', 'kaarten trekken'],'geld of kaarten')
    if(decision == 0){
        player.money += 2
    }else{
        var card = await discoverCards(player, gamedb.deck.splice(0,2).map(cid => gamedb.cards.get(cid)),'kies een kaart')
        player.hand.push(card.id)
    }
    
    var onPlayCardcb = (data:{playerid:number,handindex:number}) => {
        let card = gamedb.cards.get(player.hand[data.handindex])
        var cardIsntInPlayYet = player.buildings.findIndex(cid => gamedb.cards.get(cid).image == card.image) == -1
        
        if(data.playerid == player.id && buildlimit > 0 && card.cost <= player.money && cardIsntInPlayYet){
            player.money -= card.cost
            buildlimit--
            
            player.buildings.push(player.hand.splice(data.handindex,1)[0])//eerst duplicate building check
            if(player.buildings.length >= 8 && gamedb.firstFinishedPlayer == null){
                gamedb.firstFinishedPlayer = player.id
            }
            updateClients()
        }
    }
    onPlayCard.listen(onPlayCardcb)
    updateClients()
    onEndTurn.listenOnce(p => {
        if(p.playerid == player.id){
            onPlayCard.deafen(onPlayCardcb)
        }
    })
})