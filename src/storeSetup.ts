/// <reference path="models.ts" />
/// <reference path="store.ts" />





function genGameDB(){
    var gamedb = new GameDB()

    gamedb.roles.addList([
        new Role('moordenaar','white',0),
        new Role('dief','white',1),
        new Role('magier','white',2),
        new Role('koning','yellow',3),
        new Role('prediker','blue',4),
        new Role('koopman','green',5),
        new Role('bouwmeester','white',6),
        new Role('condotierre','red',7),
    ])

    gamedb.players.addList([])

    function genCards(card,amount){
        var res = []
        for(var i = 0; i < amount;i++){
            res.push(Object.assign({},card))
        }
        return res
    }

    gamedb.cards.addList(genCards(new Card(3,3,'jachtslot'),5))
    gamedb.cards.addList(genCards(new Card(3,4,'slot'),4))
    gamedb.cards.addList(genCards(new Card(3,5,'paleis'),3))
    gamedb.cards.addList(genCards(new Card(4,1,'tempel'),3))
    gamedb.cards.addList(genCards(new Card(4,2,'kerk'),3))
    gamedb.cards.addList(genCards(new Card(4,3,'abdij'),3))
    gamedb.cards.addList(genCards(new Card(4,4,'kathedraal'),2))
    gamedb.cards.addList(genCards(new Card(5,1,'taveerne'),5))
    gamedb.cards.addList(genCards(new Card(5,2,'gildehuis'),3))
    gamedb.cards.addList(genCards(new Card(5,2,'markt'),4))
    gamedb.cards.addList(genCards(new Card(5,3,'handelshuis'),3))
    gamedb.cards.addList(genCards(new Card(5,4,'haven'),3))
    gamedb.cards.addList(genCards(new Card(5,5,'raadhuis'),2))
    gamedb.cards.addList(genCards(new Card(7,1,'wachttoren'),3))
    gamedb.cards.addList(genCards(new Card(7,2,'kerker'),3))
    gamedb.cards.addList(genCards(new Card(7,3,'toernooiveld'),3))
    gamedb.cards.addList(genCards(new Card(7,5,'vesting'),2))
    gamedb.cards.addList(genCards(new Card(0,2,'hof der wonderen'),1))
    gamedb.cards.addList(genCards(new Card(0,3,'verdedigingstoren'),2))
    gamedb.cards.addList(genCards(new Card(0,5,'laboratorium'),1))
    gamedb.cards.addList(genCards(new Card(0,5,'smederij'),1))
    gamedb.cards.addList(genCards(new Card(0,5,'observatorium'),1))
    gamedb.cards.addList(genCards(new Card(0,5,'kerkhof'),1))
    gamedb.cards.addList(genCards(new Card(0,6,'bibliotheek'),1))
    gamedb.cards.addList(genCards(new Card(0,6,'school voor magiers'),1))
    gamedb.cards.addList(genCards(new Card(0,6,'drakenburcht'),1))
    gamedb.cards.addList(genCards(new Card(0,6,'universiteit'),1))

    // bij winnen telt hof der wonderen voor kleur naar keuze
    // kan niet vernietigd worden door de condotierre
    // ruil 1 kaart voor 1 goudstuk
    //  optie om 2 kaarten te kpoen voor 3 goudstukken
    //  bij inkomsten discover 3 kaarten ipv 2
    //  mag voor 1 goudstuk ht door de condotierre vernietigde gebouw kopen(mits niet condotierre)
    //  bij inkomstenfase mag je beide kaarten houden van de discover
        //    1 goudstuk voog koning,prediker,koopman of codotierre
        // 8 punten waard ipv 6
        //  8 punten waard ipv 6




    gamedb.deck = gamedb.cards.list().map((c,i) => i)

    for(var i = 17; i < 27; i++){
        gamedb.cards.get(i).isAnyRole = true
    }
    return gamedb
}
