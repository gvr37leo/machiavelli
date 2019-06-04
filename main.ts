/// <reference path="src/utils.ts" />
/// <reference path="node_modules/vectorx/vector.ts" />
/// <reference path="node_modules/eventsystemx/EventSystem.ts" />
/// <reference path="src/card.ts" />
/// <reference path="src/projectutils.ts" />


var crret = createCanvas(500,500)
var canvas = crret.canvas
var ctxt = crret.ctxt

var roles:Role[] = [
    new Role('moordenaar','white',0),
    new Role('dief','white',0),
    new Role('magier','white',0),
    new Role('koning','yellow',0),
    new Role('prediker','blue',0),
    new Role('koopman','green',0),
    new Role('bouwmeester','white',0),
    new Role('condotierre','red',0),
]

var players:Player[] = [
    new Player(0,0),
    new Player(0,1),
    new Player(0,2),
    new Player(0,3),
]

var cards:Card[] = [
    new Card(3,3,'jachtslot'),//5
    new Card(3,4,'slot'),//4
    new Card(3,5,'paleis'),//3
    
    new Card(4,1,'tempel'),//3
    new Card(4,2,'kerk'),//3
    new Card(4,3,'abdij'),//3
    new Card(4,4,'kathedraal'),//2

    new Card(5,1,'taveerne'),//5
    new Card(5,2,'gildehuis'),//3
    new Card(5,2,'markt'),//4
    new Card(5,3,'handelshuis'),//3
    new Card(5,4,'haven'),//3
    new Card(5,5,'raadhuis'),//2

    new Card(7,1,'wachttoren'),//3
    new Card(7,2,'kerker'),//3
    new Card(7,3,'toernooiveld'),//3
    new Card(7,5,'vesting'),//2

    new Card(0,2,'hof der wonderen'),//1 bij winnen telt hof der wonderen voor kleur naar keuze
    new Card(0,3,'verdedigingstoren'),//2 kan niet vernietigd worden door de condotierre
    new Card(0,5,'laboratorium'),//1 ruil 1 kaart voor 1 goudstuk
    new Card(0,5,'smederij'),//1 optie om 2 kaarten te kpoen voor 3 goudstukken
    new Card(0,5,'observatorium'),//1 bij inkomsten discover 3 kaarten ipv 2
    new Card(0,5,'kerkhof'),//1 mag voor 1 goudstuk ht door de condotierre vernietigde gebouw kopen(mits niet condotierre)
    new Card(0,6,'bibliotheek'),//1 bij inkomstenfase mag je beide kaarten houden van de discover
    new Card(0,6,'school voor magiers'),//1  1 goudstuk voog koning,prediker,koopman of codotierre
    new Card(0,6,'drakenburcht'),//1   8 punten waard ipv 6
    new Card(0,6,'universiteit'),//1   8 punten waard ipv 6
]

loadImages([])

function genCards(card,amount){
    var res = []
    for(var i = 0; i < amount;i++){
        res.push(Object.assign({},card))
    }
    return res
}

var game = new Game()
game.crownWearer = 0
game.deck = cards.map((c,i) => i)

function renderPlayerPerspective(ctxt:CanvasRenderingContext2D,player:Player){

    ctxt.fillText(player.money as any,10,10)
    if(game.crownWearer == player.id){
        ctxt.fillRect(10,10,10,10)
    }
    
    for(var cardid of player.hand){
        renderCard(ctxt,cards[cardid],new Vector(0,0))
    }

    for(var buildingid of player.buildings){
        renderCard(ctxt,cards[buildingid],new Vector(0,0))
    }

    for(var opponent of players.filter(p => p.id != player.id)){
        ctxt.fillText(player.money as any,10,10)
        ctxt.fillRect(10,10,10,10)
        ctxt.fillText(player.hand.length as any,10,10)

        for(var buildingid of opponent.buildings){
            renderCard(ctxt,cards[buildingid],new Vector(0,0))
        }
    }
}

function renderCard(ctxt:CanvasRenderingContext2D,card:Card,pos:Vector){
    ctxt.fillRect(pos.x,pos.y,50,100)
    ctxt.fillText(card.cost as any,pos.x,pos.y)
    ctxt.fillStyle = roles[card.role].color
    ctxt.fillRect(pos.x,pos.y,10,10)
    ctxt.fillText(card.name,pos.x,pos.y)
}

function renderRoleCard(ctxt:CanvasRenderingContext2D,role:Role,pos:Vector){

}

function renderPlayerCard(ctxt:CanvasRenderingContext2D,player:Player,pos:Vector){

}

function chooseRoles(){
    var roleReference = [0,1,2,3,4,5,6,7]
    shuffle(roleReference)
}

function discover(renderers:((pos:Vector) => void)[]):Promise<number>{
    //render
    //wait for click
    //return index
    return null
}

async function discoverRoles(roles:Role[]):Promise<Role>{
    return roles[await discover(roles.map(role => function(pos){
        renderRoleCard(ctxt,role,pos)
    }))]
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
    return discoverPlayers(players.filter(p => p.id != blackPlayer.id).map(p => p))
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

function countBuildingIncome(playerid:number){
    var player = players[playerid]
    return player.buildings.reduce((prev,cur) => {
        return prev + (cards[cur].role == player.role ? 1 : 0)
    },0)
}

function turn(playerid){
    var player = players[playerid]

    for(var player of players){
        takePlayerTurn(playerid)
    }
    //build
    //special skill
}

async function takePlayerTurn(playerid){
    var player = players[playerid]
    player.money += 2
    if(player.role == 0){//moordenaar
        game.murderedRole = (await discoverRoles([1,2,3,4,5,6,7].map(rid => roles[rid]))).id
    }
    if(player.role == 1){//dief
        game.burgledRole = (await discoverRoles([2,3,4,5,6,7].map(rid => roles[rid]))).id
    }
    if(player.role == 2){//magier
        var swapPlayer:Player = await discoverOtherPlayers(playerid);
        [player.hand,swapPlayer.hand] = [swapPlayer.hand,player.hand]
        // mulligan(player.id)

    }
    if(player.role == 3){//koning
        game.crownWearer = playerid
        player.money += countBuildingIncome(playerid)
    }
    if(player.role == 4){//prediker
        player.money += countBuildingIncome(playerid)
    }
    if(player.role == 5){//koopman
        player.money++
        player.money += countBuildingIncome(playerid)
    }
    if(player.role == 6){//bouwmeester
        //trek 2 kaarten
        //build 2 buildings
        
    }
    if(player.role == 7){//condotierre
        player.money += countBuildingIncome(playerid)
        discoverOtherPlayers(playerid).then(chosenPlayer => {
            discoverCards(chosenPlayer.buildings.map(bid => cards[bid])).then(chosenBuilding => {
                player.money -= chosenBuilding.cost - 1
                findAndDelete(player.buildings,chosenBuilding)
            })
        })
        

    }
}

loop((dt) => {
    ctxt.clearRect(0,0,500,500)

    renderPlayerPerspective(ctxt,players[0])
})

function countScores(firstPlayerId:number,playerids:number[]){
    return playerids.map((id) => {
        var score = 0
        var player = players[id] 
        var buildingscore = player.buildings.reduce((score,cardid) => {
            var building = cards[cardid]
            return score + building.points
        },0)

        var uniqueresults = [
            player.buildings.findIndex((bid) => {
                return cards[bid].role == 0
            }),
            player.buildings.findIndex((bid) => {
                return cards[bid].role == 1
            }),
            player.buildings.findIndex((bid) => {
                return cards[bid].role == 2
            }),
            player.buildings.findIndex((bid) => {
                return cards[bid].role == 3
            }),
            player.buildings.findIndex((bid) => {
                return cards[bid].isAnyRole
            }),
        ]
        var uniquescore = uniqueresults.findIndex(res => res == -1) == -1 ? 0 : 3
        var firstscore = id == firstPlayerId ? 4 : 0
        var secondscore = player.buildings.length >= 8 ? 2 : 0
        return buildingscore + uniquescore + firstscore + secondscore
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
