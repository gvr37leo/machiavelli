function loadImages(urls:string[]):Promise<HTMLImageElement[]>{
    var promises:Promise<HTMLImageElement>[] = []

    for(var url of urls){
        promises.push(new Promise((res,rej) => {
            var image = new Image()
            image.onload = e => {
                res(image)     
            }
            image.src = url
        }))
    }

    return Promise.all(promises)
}

class ClickManager{
    rects:Map<Rect,(pos:Vector) => void> = new Map()

    startListeningToDocument(){
        document.addEventListener('mousedown',e => {
            this.click(getMousePos(canvas,e))
        })
    }

    click(pos:Vector){
        for(var pair of this.rects.entries()){
            if(pair[0].collidePoint(pos)){
                pair[1](pos)
                break
            }
        }
    }

    listen(rect:Rect,cb:(pos:Vector) => void){
        this.rects.set(rect,cb)
    }

    delisten(rect:Rect){
        this.rects.delete(rect)
    }
}

function randomInt(min:number,max:number){
    return Math.floor(random(min,max))
}