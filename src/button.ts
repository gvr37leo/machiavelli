class Button{
    
    onClick:EventSystem<Vector> = new EventSystem()

    constructor(public hitbox:Rect,public text:string){
        
    }

    listen2document(canvas){
        document.body.addEventListener('click',e => {
            var pos = getMousePos(canvas,e)
            if(this.hitbox.collidePoint(pos)){
                this.onClick.trigger(pos,null)
            }
        })
    }

    sendClick(pos:Vector){
        if(this.hitbox.collidePoint(pos)){
                this.onClick.trigger(pos,null)
            }
    }

    draw(ctxt:CanvasRenderingContext2D){
        ctxt.fillStyle = 'black'
        this.hitbox.draw(ctxt)

        ctxt.textAlign = 'center'
        ctxt.textBaseline = 'middle'
        ctxt.fillStyle = 'white'
        var center = this.hitbox.getPoint(new Vector(0.5,0.5))
        ctxt.fillText(this.text,center.x,center.y)
    }


}