
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

    isDiscoveringRoles:boolean = false
    roles:number[] = []
    isDiscoveringPlayers:boolean = false
    players:number[] = []
    isDiscoveringCards:boolean = false
    cards:number[] = []

    constructor(public money:number,public role:number,){

    }
}

class Card{
    hitbox:Rect = new Rect(new Vector(0,0),new Vector(0,0))
    id:number
    points:number
    effect
    image:number
    isAction:boolean = false
    isAnyRole:boolean  = false
    constructor(public role:number,public cost:number,public name:string){

    }
}