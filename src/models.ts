/// <reference path="store.ts" />


class GameDB{
    roles:Store<Role> = new Store()
    players:Store<Player> = new Store()
    cards:Store<Card> = new Store()
    crownWearer:number = 0
    deck:number[] = []
    murderedRole:number = null
    burgledRole:number = null
    firstFinishedPlayer:number = null
    discardedRoles:number[] = []
    kingshownRole:number = null


    playerTurn:number = null//use for gamestate
    roleTurn:number = null//use for gamestate
    //how to handle activating all the different roles when handling game progress through state instead of async functions
    //giving money
    //giving cards
    //playerturn en roleturn changelisteners?

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
            discardedRoles:this.discardedRoles,
            kingshownRole:this.kingshownRole,
            playerTurn:this.playerTurn,
            roleTurn:this.roleTurn,
        }
    }

}

class Role{
    id:number
    player:number
    constructor(public name:string,public color:string,public image:number){

    }
}

class DiscoverOption{
    constructor(
        public image:number,
        public name:string,
        public cost:number,
        public color:string,
        public description:string,
        public selected:boolean,
    ){

    }
}

class Player{
    id:number
    name:string
    hand:number[] = []
    buildings:number[] = []
    wsbox:WsBox
    money:number = 0

    isDiscovering:boolean = false
    discoverOptions:DiscoverOption[] = []
    discoverDescription:string = ''

    isSelecting:boolean = false
    selectOptions:DiscoverOption[] = []


    constructor(){

    }

    serialize(){
        return {
            id:this.id,
            name:this.name,
            hand:this.hand,
            buildings:this.buildings,
            isDiscovering:this.isDiscovering,
            discoverOptions:this.discoverOptions,
            money:this.money,
            discoverDescription:this.discoverDescription,
            isSelecting:this.isSelecting,
            selectOptions:this.selectOptions,
        }
    }
}

class Card{
    id:number
    points:number
    
    isAction:boolean = false
    isAnyRole:boolean  = false
    constructor(public role:number,public cost:number,public name:string,public image:number){

    }
}