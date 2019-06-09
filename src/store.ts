class Store<T>{

    map:Map<number,T> = new Map()
    idcounter = 0

    constructor(){

    }

    add(obj:T){
        obj['id'] = this.idcounter
        this.map.set(obj['id'],obj)
        this.idcounter++
        return obj
    }

    addList(arr:T[]):T[]{
        return arr.map(obj => this.add(obj))
    }

    delete(id:number){
        return this.map.delete(id)
    }

    get(id:number){
        return this.map.get(id)
    }

    list(){
        return Array.from(this.map.values())
    }
}