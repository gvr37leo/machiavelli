class GameDB{
    roles:Store<Role> = new Store()
    players:Store<Player> = new Store()
    cards:Store<Card> = new Store()
    renderers:Store<(ctxt:CanvasRenderingContext2D) => void> = new Store()
    crownWearer:number = 0
    deck:number[] = []
    murderedRole:number = 0
    burgledRole:number = 0
    firstFinishedPlayer:number = null
    playerTurn:number

}
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

gamedb.players.addList([
    new Player(0,0),
    new Player(0,1),
    new Player(0,2),
    new Player(0,3),
])

gamedb.cards.addList([
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
])

for(var i = 17; i < 27; i++){
    gamedb.cards.get(i).isAnyRole = true
}