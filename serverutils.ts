function findAndDelete(arr:any[],item:any){
    arr.splice(arr.findIndex(v => v == item),1)
}

function random(min: number, max: number){
    return Math.random() * (max - min) + min
}

function randomInt(min: number, max: number){
    return Math.floor(random(min,max))
}

function swap<T>(arr:T[],a:number = 0,b:number = 1){
    var temp = arr[a];
    arr[a] = arr[b];
    arr[b] = temp;
}

function findBestIndex<T>(arr:T[],cb:(o:T) => number){
    if(arr.length == 0){
        return -1
    }
    if(arr.length == 1){
        return 0
    }
    var besti:number = 0
    var bestscore:number = cb(arr[0])

    for(var i = 1; i < arr.length; i++){
        var cscore = cb(arr[i])
        if(cscore > bestscore){
            besti = i
            bestscore = cscore
        }
    }
    return besti
}

function contains<T>(arr:T[],obj:T){
    return arr.findIndex(v => v == obj) != -1
}

class WsBox{
    socket: WebSocket;

    constructor(ws){
        this.socket = ws
        this.socket.addEventListener('open', () => {

        })

        this.socket.addEventListener('close', () => {
            
        })
    }

    send(type:string,data:any){
        this.socket.send(JSON.stringify({
            type:type,
            data:data,
        }))
    }

    listen(type:string,cb:(data:any) => void){
        this.socket.addEventListener('message',e => {
            var res = JSON.parse(e.data)
            if(res.type == type){
                cb(res.data)
            }
        })
    }
}