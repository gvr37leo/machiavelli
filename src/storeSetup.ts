/// <reference path="models.ts" />
/// <reference path="store.ts" />





function genGameDB(){
    var gamedb = new GameDB()

    gamedb.roles.addList([
        new Role('moordenaar','white',1),
        new Role('dief','white',2),
        new Role('magier','white',3),
        new Role('koning','yellow',4),
        new Role('prediker','blue',5),
        new Role('koopman','green',6),
        new Role('bouwmeester','white',7),
        new Role('condotierre','red',8),
    ])

    gamedb.players.addList([])

    function genCards(card,amount){
        var res = []
        for(var i = 0; i < amount;i++){
            res.push(Object.assign({},card))
        }
        return res
    }

    gamedb.cards.addList(genCards(new Card(3,3,'jachtslot',9),5))
    gamedb.cards.addList(genCards(new Card(3,4,'slot',10),4))
    gamedb.cards.addList(genCards(new Card(3,5,'paleis',11),3))
    gamedb.cards.addList(genCards(new Card(4,1,'tempel',12),3))
    gamedb.cards.addList(genCards(new Card(4,2,'kerk',13),3))
    gamedb.cards.addList(genCards(new Card(4,3,'abdij',14),3))
    gamedb.cards.addList(genCards(new Card(4,4,'kathedraal',15),2))
    gamedb.cards.addList(genCards(new Card(5,1,'taveerne',16),5))
    gamedb.cards.addList(genCards(new Card(5,2,'gildehuis',17),3))
    gamedb.cards.addList(genCards(new Card(5,2,'markt',18),4))
    gamedb.cards.addList(genCards(new Card(5,3,'handelshuis',19),3))
    gamedb.cards.addList(genCards(new Card(5,4,'haven',20),3))
    gamedb.cards.addList(genCards(new Card(5,5,'raadhuis',21),2))
    gamedb.cards.addList(genCards(new Card(7,1,'wachttoren',22),3))
    gamedb.cards.addList(genCards(new Card(7,2,'kerker',23),3))
    gamedb.cards.addList(genCards(new Card(7,3,'toernooiveld',24),3))
    gamedb.cards.addList(genCards(new Card(7,5,'vesting',25),2))
    gamedb.cards.addList(genCards(new Card(0,2,'hof der wonderen',26),1))
    gamedb.cards.addList(genCards(new Card(0,3,'verdedigingstoren',27),2))
    gamedb.cards.addList(genCards(new Card(0,5,'laboratorium',28),1))
    gamedb.cards.addList(genCards(new Card(0,5,'smederij',29),1))
    gamedb.cards.addList(genCards(new Card(0,5,'observatorium',30),1))
    gamedb.cards.addList(genCards(new Card(0,5,'kerkhof',31),1))
    gamedb.cards.addList(genCards(new Card(0,6,'bibliotheek',32),1))
    gamedb.cards.addList(genCards(new Card(0,6,'school voor magiers',33),1))
    gamedb.cards.addList(genCards(new Card(0,6,'drakenburcht',34),1))
    gamedb.cards.addList(genCards(new Card(0,6,'universiteit',35),1))

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
