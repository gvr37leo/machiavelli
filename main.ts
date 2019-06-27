/// <reference path="src/utils.ts" />
/// <reference path="node_modules/vectorx/vector.ts" />
/// <reference path="node_modules/eventsystemx/EventSystem.ts" />
/// <reference path="src/projectutils.ts" />
/// <reference path="src/models.ts" />
/// <reference path="src/storeSetup.ts" />
/// <reference path="templates/card.js" />
/// <reference path="templates/opponent.js" />
/// <reference path="templates/board.js" />
/// <reference path="src/wsBox.ts" />


var playerid;
var ws = new WsBox('ws://localhost:8080')
ws.listen('update',updatedata => {
    playerid = updatedata.playerid
    renderPlayerPerspective(updatedata.gamedb,updatedata.gamedb.players.find(p => p.id == updatedata.playerid))
})
var images = [
    '/res/persoon.png',
    '/res/moordenaar.png',
    '/res/dief.png',
    '/res/magier.png',
    '/res/koning.png',
    '/res/prediker.png',
    '/res/koopman.png',
    '/res/bouwmeester.png',
    '/res/condotierre.png',
    '/res/jachtslot.png',
    '/res/slot.png',
    '/res/paleis.png',
    '/res/tempel.png',
    '/res/kerk.png',
    '/res/abdij.png',
    '/res/kathedraal.png',
    '/res/taveerne.png',
    '/res/gildehuis.png',
    '/res/markt.png',
    '/res/handelshuis.png',
    '/res/haven.png',
    '/res/raadhuis.png',
    '/res/wachttoren.png',
    '/res/kerker.png',
    '/res/toernooiveld.png',
    '/res/vesting.png',
    '/res/hofderwonderen.png',
    '/res/verdedigingstoren.png',
    '/res/laboratorium.png',
    '/res/smederij.png',
    '/res/observatorium.png',
    '/res/kerkhof.png',
    '/res/bibliotheek.png',
    '/res/schoolvoormagiers.png',
    '/res/drakenburcht.png',
    '/res/universiteit.png',
]

function endturn(playerid){
    ws.send('endturn',{playerid})
}

function start(){
    ws.send('start',{})
}

function reset(){
    ws.send('reset',{})
}

function playcard(cardindex){
    ws.send('playcard',{
        playerid,
        cardindex,
    })
}

function discovered(discoverindex){
    ws.send('discover',{
        playerid,
        discoverindex,
    })
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
    var discoverContainer = boardelement.querySelector('#discoverContainer')
    endturnbutton.addEventListener('click',() => endturn(player.id))
    
    
    if(player.isDiscovering){
        for(var option of player.discoverOptions){
            discoverContainer.append(genDiscoverOptionCard(option))
        }
    }
    Array.from(discoverContainer.children).forEach((el,i) => {
        el.addEventListener('click',e => {
            discovered(i)
        })
    })
    

    crownicon.style.visibility = 'hidden'
    if(gamedb.crownWearer == player.id){
        crownicon.style.visibility = 'visible'
    }
    
    for(let i = 0; i < player.hand.length; i++){
        var cardid = player.hand[i]
        var card = gamedb.cards.find(c => c.id == cardid)
        var cardelement = genCardHtml(gamedb,card)
        cardelement.addEventListener('click',e => {
            playcard(i)
        })
        hand.append(cardelement)
    }

    for(var buildingid of player.buildings){
        var building = gamedb.cards.find(c => c.id == buildingid)
        board.append(genCardHtml(gamedb,building))
    }

    var opponents = gamedb.players.filter(p => p.id != player.id)
    for(var opponent of opponents){
        opponentcontainer.append(genOpponentHtml(gamedb,opponent))
    }
    
}

function genCardHtml(gamedb,card:Card){
    return genDiscoverOptionCard(new DiscoverOption(0,card.name,card.cost,gamedb.roles.find(r => r.id == card.role).color,''))
}

function genDiscoverOptionCard(d:DiscoverOption){
    var cardelement = string2html(cardhtml)
    var name = cardelement.querySelector('#name')
    var cost = cardelement.querySelector('#cost')
    var color = cardelement.querySelector('#color') as HTMLElement
    var description = cardelement.querySelector('#description')
    name.innerHTML = d.name
    cost.innerHTML = d.cost as any
    color.style.backgroundColor = d.color
    description.innerHTML = d.description
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

