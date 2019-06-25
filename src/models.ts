/// <reference path="store.ts" />


class GameDB{
    roles:Store<Role> = new Store()
    players:Store<Player> = new Store()
    cards:Store<Card> = new Store()
    crownWearer:number = 0
    deck:number[] = []
    murderedRole:number = 0
    burgledRole:number = 0
    firstFinishedPlayer:number = null
    playerTurn:number

    serialize(){

        return {
            roles:this.roles.list(),
            players:this.players.list().map(p => p.serialize()),
            cards:this.cards.list(),
            crownWearer:this.crownWearer,
            deck:this.deck,
            murderedRole:this.murderedRole,
            burgledRole:this.burgledRole,
            firstFinishedPlayer:this.firstFinishedPlayer,
            playerTurn:this.playerTurn,
        }
    }

}

class Role{
    id:number
    player:number
    constructor(public name:string,public color:string,public image:number,){

    }
}

class Player{
    id:number
    name:string
    hand:number[] = []
    buildings:number[] = []
    wsbox:WsBox
    money:number = 0

    isDiscoveringRoles:boolean = false
    discoverRoles:number[] = []
    isDiscoveringPlayers:boolean = false
    discoverPlayers:number[] = []
    isDiscoveringCards:boolean = false
    discoverCards:number[] = []

    constructor(){

    }

    serialize(){
        return {
            id:this.id,
            name:this.name,
            hand:this.hand,
            buildings:this.buildings,
            isDiscoveringRoles:this.isDiscoveringRoles,
            discoverRoles:this.discoverRoles,
            isDiscoveringPlayers:this.isDiscoveringPlayers,
            discoverPlayers:this.discoverPlayers,
            isDiscoveringCards:this.isDiscoveringCards,
            discoverCards:this.discoverCards,
            money:this.money,
        }
    }
}

class Card{
    id:number
    points:number
    effect
    image:number
    isAction:boolean = false
    isAnyRole:boolean  = false
    constructor(public role:number,public cost:number,public name:string){

    }
}