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

function randomInt(min:number,max:number){
    return Math.floor(random(min,max))
}