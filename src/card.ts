class Database{

}

class Game{
    crownWearer:number
    deck
    murderedRole:number
    burgledRole:number
    firstFinishedPlayer:number
}

class Role{
    id:number
    constructor(public name:string,public color:string,public image:number,){

    }
}

class Player{
    id:number
    name:string
    hand:number[] = []
    buildings:number[] = []
    constructor(public money:number,public role:number,){

    }
}

class Card{
    id:number
    points:number
    effect
    image:number
    isAction:boolean
    isAnyRole:boolean
    constructor(public role:number,public cost:number,public name:string,){

    }
}