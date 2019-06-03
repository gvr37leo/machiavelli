/// <reference path="src/utils.ts" />
/// <reference path="node_modules/vectorx/vector.ts" />
/// <reference path="node_modules/eventsystemx/EventSystem.ts" />
/// <reference path="src/card.ts" />


var crret = createCanvas(500,500)
var canvas = crret.canvas
var ctxt = crret.ctxt

var roles:Role[] = [
    new Role('moordenaar','white',0),
    new Role('dief','white',0),
    new Role('magier','white',0),
    new Role('koning','white',0),
    new Role('prediker','white',0),
    new Role('koopman','white',0),
    new Role('bouwmeester','white',0),
    new Role('condotierre','white',0),
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

    new Card(0,2,'hof der wonderen'),//1
    new Card(0,3,'verdedigingstoren'),//2
    new Card(0,5,'laboratorium'),//1
    new Card(0,5,'smederij'),//1
    new Card(0,5,'observatorium'),//1
    new Card(0,5,'kerkhof'),//1
    new Card(0,6,'bibliotheek'),//1
    new Card(0,6,'school voor magiers'),//1
    new Card(0,6,'drakenburcht'),//1
    new Card(0,6,'universiteit'),//1
]

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

function renderPlayerPerspective(playerid:number){
    //money
    //crown
    //hand
    //buildings
    
    //other players
    //money
    //handcount
    //buildings
}

function renderCard(card,pos){
    //image
    //cost
    //color
    //name
}

function chooseRoles(){
    var roleReference = [0,1,2,3,4,5,6,7]
    shuffle(roleReference)
}

function discoverRoles(roles:number[]):Promise<number>{
    return null
}

function discoverCards(cards:number[]):Promise<number>{
    return null
}

function discoverOtherPlayers(blackPlayer:number):Promise<number>{
    return null
}


function discoverPlayers(players:number[]):Promise<number>{
    return null
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
        game.murderedRole = await discoverRoles([1,2,3,4,5,6,7])
    }
    if(player.role == 1){//dief
        game.burgledRole = await discoverRoles([2,3,4,5,6,7])
    }
    if(player.role == 2){//magier
        //switch cards with other player
        var swapPlayerId = await discoverOtherPlayers(playerid)
        var temp = player.hand
        player.hand = players[swapPlayerId].hand
        players[swapPlayerId].hand = temp
        mulligan(player.id)

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
        discoverOtherPlayers(playerid).then(pid => {
            var chosenPlayer = players[pid]
            discoverCards(chosenPlayer.buildings).then(chosenBuilding => {
                var building = cards[chosenBuilding]
                player.money -= building.cost - 1
                findAndDelete(player.buildings,chosenBuilding)
            })
        })
        

    }
}

loop((dt) => {
    ctxt.clearRect(0,0,500,500)

    ctxt.fillRect(10,10,10,10)
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
