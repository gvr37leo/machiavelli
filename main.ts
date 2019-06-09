/// <reference path="src/utils.ts" />
/// <reference path="node_modules/vectorx/vector.ts" />
/// <reference path="node_modules/eventsystemx/EventSystem.ts" />
/// <reference path="src/card.ts" />
/// <reference path="src/projectutils.ts" />
/// <reference path="src/rect.ts" />
/// <reference path="src/store.ts" />
/// <reference path="src/storeSetup.ts" />
/// <reference path="src/button.ts" />


var canvassize = new Vector(1000,500)
var crret = createCanvas(canvassize.x,canvassize.y)
var canvas = crret.canvas
var ctxt = crret.ctxt
ctxt.font = "16px Arial";
var clickManager = new ClickManager()
var cardSize = new Vector(80,100)
var endturnButton = new Button(Rect.fromWidthHeight(100,50,new Vector(600,200)),'end turn')
endturnButton.listen2document(canvas)
clickManager.startListeningToDocument()
loadImages([])

function genCards(card,amount){
    var res = []
    for(var i = 0; i < amount;i++){
        res.push(Object.assign({},card))
    }
    return res
}

gamedb.deck = gamedb.cards.list().map((c,i) => i)

function renderPlayerPerspective(ctxt:CanvasRenderingContext2D,player:Player){
    endturnButton.draw(ctxt)

    ctxt.fillStyle = 'black'
    ctxt.fillText(player.money as any,130,350)
    if(gamedb.crownWearer == player.id){
        ctxt.fillStyle = 'yellow'
        ctxt.fillRect(130,320,10,10)
    }
    
    for(var i = 0; i < player.hand.length; i++){
        var cardid = player.hand[i]
        renderCard(ctxt,gamedb.cards.get(cardid),new Vector(150 + i * (cardSize.x + 10),350))
    }

    for(var buildingid of player.buildings){
        renderCard(ctxt,gamedb.cards.get(buildingid),new Vector(0,0))
    }

    var opponents = gamedb.players.list().filter(p => p.id != player.id)
    for(var i = 0; i < opponents.length; i++){
        var pos = new Vector(100 + i * (cardSize.x + 10),100)
        var opponent = opponents[i]

        ctxt.fillStyle = 'black'
        ctxt.fillText(player.money as any, pos.x, pos.y)

        if(opponent.id == gamedb.crownWearer){
            ctxt.fillStyle = 'yellow'//crown
            ctxt.fillRect(pos.x, pos.y - 20,10,10)
        }

        ctxt.fillStyle = 'black'
        ctxt.fillText(player.hand.length as any,pos.x, pos.y + 10)

        for(var buildingid of opponent.buildings){
            renderCard(ctxt,gamedb.cards.get(buildingid),pos)
        }
    }
}

function renderCard(ctxt:CanvasRenderingContext2D,card:Card,pos:Vector){
    ctxt.fillStyle = 'grey'
    ctxt.fillRect(pos.x,pos.y,cardSize.x,cardSize.y)//image

    ctxt.fillStyle = 'black'
    ctxt.fillText(card.cost as any,pos.x,pos.y)

    
    ctxt.fillStyle = card.isAnyRole ? 'purple' : gamedb.roles.get(card.role).color
    
    ctxt.fillRect(pos.x,pos.y,10,10)//rolecolor

    ctxt.fillStyle = 'black'
    ctxt.fillText(card.name,pos.x,pos.y + cardSize.y - 10)
}

function renderRoleCard(ctxt:CanvasRenderingContext2D,role:Role,pos:Vector){
    ctxt.fillStyle = 'gray'
    ctxt.fillRect(pos.x,pos.y,50,100)//image

    ctxt.fillStyle = 'black'
    ctxt.fillText(role.name as any,pos.x,pos.y)

    ctxt.fillStyle = role.color
    ctxt.fillRect(pos.x,pos.y,10,10)//rolecolor
}

function renderPlayerCard(ctxt:CanvasRenderingContext2D,player:Player,pos:Vector){
    ctxt.fillRect(pos.x,pos.y,50,100)
    ctxt.fillText(player.money as any,pos.x,pos.y)
    ctxt.fillText(player.hand.length as any,pos.x,pos.y)
}

function chooseRoles(){
    var roleReference = [0,1,2,3,4,5,6,7]
    shuffle(roleReference)
}

function discover(renderers:((pos:Vector) => void)[]):Promise<number>{
    return new Promise((res,rej) => {
        var hitboxes = []
        for(let i = 0; i < renderers.length; i++){
            var renderer = renderers[i]
            var topleft = new Vector(100 + 100 * i,200)
            var hitbox = new Rect(topleft,topleft.c().add(cardSize))
            hitboxes.push(hitbox)
            clickManager.listen(hitbox,pos => {
                hitboxes.forEach(h => clickManager.delisten(h))
                res(i)
            })
        }
    })
}

async function discoverRoles(roles:Role[]):Promise<Role>{
    // var renderers = []
    var role = roles[await discover(roles.map(role => function(pos){
        var renderer = gamedb.renderers.add(ctxt => {
            renderRoleCard(ctxt,role,pos)
        })
        // renderers.push(renderer)
    }))]
    // renderers.forEach(r => gamedb.renderers.delete(r.id))
    return role
}

async function discoverCards(cards:Card[]):Promise<Card>{
    return cards[await discover(cards.map(c => function(pos){
        renderCard(ctxt,c,pos)
    }))]
}

async function discoverPlayers(players:Player[]):Promise<Player>{
    return players[await discover(players.map(player => function(pos){
        renderPlayerCard(ctxt,player,pos)
    }))]
}

function discoverOtherPlayers(blackPlayer:Player):Promise<Player>{
    return discoverPlayers(gamedb.players.list().filter(p => p.id != blackPlayer.id).map(p => p))
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
    await discoverRoles(roledeck.map(rid => gamedb.roles.get(rid)))


    roledeck.push(3)
    shuffle(roledeck)
    for(var i = 0;roledeck.length > 1; i++){
        var role = await discoverRoles(roledeck.map(rid => gamedb.roles.get(rid)))
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
        gamedb.murderedRole = (await discoverRoles([1,2,3,4,5,6,7].map(rid => gamedb.roles.get(rid)))).id
    }
    if(player.role == 1){//dief
        gamedb.burgledRole = (await discoverRoles([2,3,4,5,6,7].map(rid => gamedb.roles.get(rid)))).id
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
            discoverCards(chosenPlayer.buildings.map(bid => gamedb.cards.get(bid))).then(chosenBuilding => {
                player.money -= chosenBuilding.cost - 1
                findAndDelete(player.buildings,chosenBuilding)
            })
        })
    }

    await new Promise((res,rej) => {
        endturnButton.onClick.listenOnce(() => res())
    })
    //build buildings and end turn
}

entiregame()

loop((dt) => {
    ctxt.clearRect(0,0,canvassize.x,canvassize.y)

    renderPlayerPerspective(ctxt,gamedb.players.get(gamedb.playerTurn))
    gamedb.renderers.list().forEach(r => r(ctxt))
})



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
