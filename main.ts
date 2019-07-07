/// <reference path="src/utils.ts" />
/// <reference path="node_modules/vectorx/vector.ts" />
/// <reference path="src/EventSystem.ts" />
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
    '/res/person.png',
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
    '/res/cards.png',
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

function playcard(handindex){
    ws.send('playcard',{
        playerid,
        handindex,
    })
}

function discovered(discoverindex){
    ws.send('discover',{
        playerid,
        discoverindex,
    })
}

function select(selectedIndices){
    ws.send('select',{
        playerid,
        selectedIndices,
    })
}

function toggleSelect(selectindex){
    ws.send('toggleselect',{
        playerid,
        selectindex,
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
    var hand = boardelement.querySelector('#hand')
    var coins = boardelement.querySelector('#coins')
    var hand = boardelement.querySelector('#hand')
    var discoverContainer = boardelement.querySelector('#discoverContainer')
    var selectContainer = boardelement.querySelector('#selectContainer')
    var discoverabsdiv = boardelement.querySelector('#discoverabsdiv') as HTMLElement
    var selectabsdiv = boardelement.querySelector('#selectabsdiv') as HTMLElement
    var inactiveroles = boardelement.querySelector('#inactiveroles') as HTMLElement
    var currentRoleTurn = boardelement.querySelector('#currentRoleTurn') as HTMLElement
    
    
    //set endturnbutton to in/active
    //highlight who's turn it is
    //show roles of people who have taken their turn
    //show the role that is currently playing

    var discoverdescription = boardelement.querySelector('#discoverdescription')
    var selectdescription = boardelement.querySelector('#selectdescription')
    var ownroles = boardelement.querySelector('#ownroles')
    var murderedrole = boardelement.querySelector('#murderedrole')
    var muggedrole = boardelement.querySelector('#muggedrole')
    if(player.isDiscovering == false){
        discoverabsdiv.style.visibility = 'hidden'
    }
    if(player.isSelecting == false){
        selectabsdiv.style.visibility = 'hidden'
    }
    
    
    discoverdescription.innerHTML = player.discoverDescription
    selectdescription.innerHTML = player.discoverDescription
    endturnbutton.addEventListener('click',() => endturn(player.id))
    coins.innerHTML = player.money as any
    
    if(player.isDiscovering){
        for(var option of player.discoverOptions){
            discoverContainer.append(genDiscoverOptionCard(option))
        }
    }
    if(player.isSelecting){
        for(var option of player.selectOptions){
            selectContainer.append(genSelectionOptionCard(option,0))
        }
        selectContainer.querySelector('#confirmbutton').addEventListener('click',() => {
            select(player.selectOptions.map((o,i) => o.selected ? i : -1).filter(v => v != -1))
        })
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

    for(var role of gamedb.roles){
        if(role.player == player.id){
            ownroles.append(genRoleHtml(gamedb,role))
        }
    }

    for(var roleid of gamedb.discardedRoles){
        inactiveroles.append(genRoleHtml(gamedb,findbyid(gamedb.roles,roleid)))
    }

    if(gamedb.murderedRole != null){
        var role = findbyid(gamedb.roles,gamedb.murderedRole)
        murderedrole.append(genRoleHtml(gamedb,role))
    }

    if(gamedb.burgledRole != null){
        var role = findbyid(gamedb.roles,gamedb.burgledRole)
        muggedrole.append(genRoleHtml(gamedb,role))
    }

    if(gamedb.roleTurn != null){
        var role = findbyid(gamedb.roles,gamedb.roleTurn)
        var rolehtml = genRoleHtml(gamedb,role)
        currentRoleTurn.append(rolehtml)
        if(role.player == player.id){
            rolehtml.classList.add('animcolor')
        }

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
    return genDiscoverOptionCard(new DiscoverOption(card.image,card.name,card.cost,gamedb.roles.find(r => r.id == card.role).color,'',true))
}

function genRoleHtml(gamedb,role:Role){
    return genDiscoverOptionCard(new DiscoverOption(role.image,role.name,0,role.color,'',true))
}

function genDiscoverOptionCard(d:DiscoverOption){
    var cardelement = string2html(cardhtml)
    var name = cardelement.querySelector('#name')
    var cost = cardelement.querySelector('#cost')
    var color = cardelement.querySelector('#color') as HTMLElement
    var description = cardelement.querySelector('#description')
    var img = cardelement.querySelector('img')
    img.src = images[d.image]
    name.innerHTML = d.name
    cost.innerHTML = d.cost as any
    color.style.backgroundColor = d.color
    description.innerHTML = d.description
    return cardelement
}

function genSelectionOptionCard(d:DiscoverOption,index){
    var cardelement = genDiscoverOptionCard(d)
    if(d.selected == false){
        cardelement.style.backgroundColor = 'grey'
    }
    cardelement.addEventListener('click',() => {
        toggleSelect(index)
    })
    return cardelement
}

function genOpponentHtml(gamedb,player:Player){
    var opponentelement = string2html(opponenthtml)
    var crown = opponentelement.querySelector('#crownicon') as HTMLElement
    var handsize = opponentelement.querySelector('#handsize')
    var moneycounter = opponentelement.querySelector('#moneycounter')
    var board = opponentelement.querySelector('#board')
    var playingroles = opponentelement.querySelector('#playingroles')
    crown.style.visibility = 'hidden'
    if(player.id == gamedb.crownWearer){
        crown.style.visibility = 'visible'
    }

    handsize.innerHTML = player.hand.length as any
    moneycounter.innerHTML = player.money as any

    for(var buildingid of player.buildings){
        var building = findbyid(gamedb.cards, buildingid)
        board.append(genCardHtml(gamedb,building))
    }

    for(var i = 0; i <= gamedb.roleTurn; i++){
        var role:Role = findbyid(gamedb.roles,i)
        if(role.player == player.id){
            playingroles.append(genRoleHtml(gamedb,role))
        }
    }

    return opponentelement
}

function findbyid(arr:any[],id:number){
    return arr.find(obj => obj.id == id)
}