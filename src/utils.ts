

function map(val1: number, start1: number, stop1: number, start2: number, stop2: number): number{
    return start2 + (stop2 - start2) * ((val1 - start1) / (stop1 - start1))
}

function inRange(min: number, max: number, value: number):boolean{
    if(min > max){
        var temp = min;
        min = max;
        max = temp;
    }
    return value <= max && value >= min;
}

function min(a: number, b: number): number{
    if(a < b)return a;
    return b;
}

function max(a: number, b: number): number{
    if(a > b)return a;
    return b;
}

function clamp(val: number, min: number, max: number): number{
    return this.max(this.min(val, max), min)
}

function rangeContain(a1: number, a2: number, b1: number, b2: number):boolean{//as in does a enclose b----- so returns true if b is smaller in all ways
    return max(a1, a2) >= max(b1, b2) && min(a1,a2) <= max(b1,b2);
}

function createNDimArray<T>(dimensions: number[], fill:(pos:Vector) => T) {
    if (dimensions.length > 0) {
        function helper(dimensions) {
            var dim = dimensions[0];
            var rest = dimensions.slice(1);
            var newArray = new Array();
            for (var i = 0; i < dim; i++) {
                newArray[i] = helper(rest);
            }
            return newArray;
        }
        var array = helper(dimensions);
        var looper = new Vector(0, 0);
        looper.vals = dimensions;
        looper.loop((pos) => {
            setElement(array, pos.vals, fill(pos));
        });
        return array;
    }
    else {
        return undefined;
    }
}

function getElement<T>(array:T[], indices:number[]):T {
    if (indices.length == 0) {
        return null;
    }
    else {
        return getElement(array[indices[0]] as any, indices.slice(1));
    }
}

function setElement<T>(array:T[], pos:number[], val:T) {
    if (pos.length == 1) {
        array[pos[0]] = val;
    }
    else {
        setElement(array[pos[0]] as any, pos.slice(1), val);
    }
}

function getMousePos(canvas:HTMLCanvasElement, evt:MouseEvent) {
    var rect = canvas.getBoundingClientRect();
    return new Vector(evt.clientX - rect.left, evt.clientY - rect.top)
}

function createCanvas(x: number, y: number){
    var canvas = document.createElement('canvas')
    canvas.width = x;
    canvas.height = y;
    document.body.appendChild(canvas)
    var ctxt = canvas.getContext('2d')
    return {ctxt:ctxt,canvas:canvas};
}

function random(min: number, max: number){
    return Math.random() * (max - min) + min
}

function randomSpread(center: number, spread: number){
    var half = spread / 2
    return random(center - half, center + half)
}

var lastUpdate = Date.now();
function loop(callback){
    var now = Date.now()
    callback(now - lastUpdate)
    lastUpdate = now
    requestAnimationFrame(() => {
        loop(callback)
    })
}

function mod(number: number, modulus: number){
    return ((number%modulus)+modulus)%modulus;
}

function* iter(n){
    var i = 0;
    while(i < n)yield i++;
}

var keys = {}

document.addEventListener('keydown', (e) => {
    keys[e.keyCode] = true
})

document.addEventListener('keyup', (e) => {
    keys[e.keyCode] = false
})

function getMoveInput():Vector{
    var dir = new Vector(0,0)
    if(keys[37] || keys[65])dir.x--//left
    if(keys[38] || keys[87])dir.y++//up
    if(keys[39] || keys[68])dir.x++//right
    if(keys[40] || keys[83])dir.y--//down
    return dir;
}

function getMoveInputYFlipped():Vector{
    var input = getMoveInput()
    input.y *= -1
    return input
}

function getFiles(strings:string[]){
    var promises = []
    for(var string of strings){
        var promise = fetch(string)
        .then(resp => resp.text())
        .then(text => text)
        promises.push(promise)
    }
    return Promise.all(promises)
}

function findbestIndex<T>(list:T[], evaluator:(T) => number):number {
    if (list.length < 1) {
        return -1;
    }
    var bestIndex = 0;
    var bestscore = evaluator(list[0])
    for (var i = 1; i < list.length; i++) {
        var score = evaluator(list[i])
        if (score > bestscore) {
            bestscore = score
            bestIndex = i
        }
    }
    return bestIndex
}

function createAndAppend(element: HTMLElement, html: string): HTMLElement {
    var result = string2html(html);
    element.appendChild(result)
    return result;
}

function string2html(string): HTMLElement {
    var div = document.createElement('div')
    div.innerHTML = string;
    return div.children[0] as HTMLElement;
}

function emptyElement(element:HTMLElement){
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

function line(ctxt:CanvasRenderingContext2D,a:Vector,b:Vector){
    ctxt.beginPath()
    ctxt.moveTo(a.x,a.y)
    ctxt.lineTo(b.x,b.y)
    ctxt.stroke()
}

function lerp(a:number,b:number,r:number):number{
    return a + to(a,b) * r
}

function to(a:number,b:number):number{
    return b - a;
}

function swap<T>(arr:T[],a:number = 0,b:number = 1){
    var temp = arr[a];
    arr[a] = arr[b];
    arr[b] = temp;
}

class RNG{
    public mod:number = 4294967296
    public multiplier:number = 1664525
    public increment:number = 1013904223

    constructor(public seed:number){

    }

    next(){
        this.seed = (this.multiplier * this.seed + this.increment) % this.mod
        return this.seed
    }
}

function last<T>(arr:T[]):T{
    return arr[arr.length - 1]
}

function findAndDelete(arr:any[],item:any){
    arr.splice(arr.findIndex(v => v == item),1)
}

class StopWatch{

    starttimestamp = Date.now()
    pausetimestamp = Date.now()
    pausetime = 0
    paused = true

    get():number{
        var currentamountpaused = 0
        if(this.paused){
            currentamountpaused = to(this.pausetimestamp,Date.now())
        }
        return to(this.starttimestamp, Date.now()) - (this.pausetime + currentamountpaused)
    }



    start(){
        this.paused = false
        this.starttimestamp = Date.now()
        this.pausetime = 0
    }

    continue(){
        if(this.paused){
            this.paused = false
            this.pausetime += to(this.pausetimestamp, Date.now())
        }
    }

    pause(){
        if(this.paused == false){
            this.paused = true
            this.pausetimestamp = Date.now()
        }
    }

    reset(){
        this.paused = true
        this.starttimestamp = Date.now()
        this.pausetimestamp = Date.now()
        this.pausetime = 0
    }
}

class Table<T>{
    columns: Column<T>[];
    orderDesc:Box<boolean>;
    orderedColumn:Box<number>;

    element: HTMLTableElement;
    head: HTMLTableSectionElement;
    body: HTMLTableSectionElement;
    headerRows:HTMLTableRowElement[] = []
    

    constructor(columns:Column<T>[]){
        this.columns = columns
        this.element = string2html(`
            <table class="table table-bordered table-striped">
                <thead>
                </thead>
                <tbody></tbody>
            </table>`) as HTMLTableElement
        this.head = this.element.querySelector('thead')
        this.body = this.element.querySelector('tbody')
        this.addHeader()
    }

    addHeader(){
        for(var header of this.columns[0].headerRenderers){
            var row = document.createElement('tr')
            this.headerRows.push(row)
            this.head.appendChild(row)
        }

        for(var column of this.columns){
            for(let i = 0; i < column.headerRenderers.length; i++){
                var headerRenderer = column.headerRenderers[i]
                var cell = this.createTableHeadCell(this.headerRows[i])
                cell.appendChild(headerRenderer())
            }
        }
    }

    load(objects:T[]){
        this.body.innerHTML = ''
        for(let i = 0; i < objects.length; i++){
            var object = objects[i]
            var row = document.createElement('tr')
            this.body.appendChild(row)            
            for(var column of this.columns){
                var cell = document.createElement('td')
                row.appendChild(cell)
                cell.appendChild(column.renderer(object, i))
            }
        }
    }

    private createTableHeadCell(row){
        var td = document.createElement('th')
        row.appendChild(td)
        return td
    }

}

class Column<T>{
    renderer:(obj:T, i:number) => HTMLElement
    headerRenderers:(() => HTMLElement)[]

    constructor(headerRenderers:(() => HTMLElement)[], renderer:(obj:T, i:number) => HTMLElement){
        this.headerRenderers = headerRenderers
        this.renderer = renderer
    }
}

class Router{

    listeners:RouteRegistration[] = []

    constructor(){
        
    }

    listen(regex:RegExp, listener:(string:RegExpExecArray) => void){
        this.listeners.push(new RouteRegistration(regex,listener))
    }

    trigger(string:string){
        for (var routeRegistration of this.listeners) {
            var result = routeRegistration.regex.exec(string)
            if(result != null){
                routeRegistration.listener(result)
                break
            }
        }
    }

    pushTrigger(url:string){
        window.history.pushState(null,null,url)
        this.trigger(url)
    }
}

class RouteRegistration{
    
    regex:RegExp
    listener:(string:RegExpExecArray) => void

    constructor(regex:RegExp, listener:(string:RegExpExecArray) => void){
        this.regex = regex
        this.listener = listener
    }
}

class Rule{

    constructor(public message:string,public cb:() => boolean){

    }
}

class Ability{
    // ammo:number = 1
    // maxammo:number = 1

    cooldown:number = 1000
    lastfire = Date.now()
    rules:Rule[] = [
        new Rule('not ready yet',() => (this.lastfire + this.cooldown) < Date.now())
    ]

    onCastFinished = new EventSystemVoid()

    

    constructor(public cb:() => void){

    }


    tryfire(){
        if(this.rules.some(r => r.cb())){
            this.cb()
            this.lastfire = Date.now()
        }
            
    }
}

enum AnimType{once,repeat,pingpong,extend}

class Anim{
    animType:AnimType = AnimType.once
    reverse:boolean = false
    duration:number = 1000
    stopwatch:StopWatch = new StopWatch()


    path:Vector[] = []
    begin:number = 0
    end:number = 1

    constructor(){

    }

    get():number{
        var cycles = this.stopwatch.get() / this.duration

        switch (this.animType) {
            case AnimType.once:
                return clamp(lerp(this.begin,this.end,cycles),this.begin,this.end) 
            case AnimType.repeat:
                return lerp(this.begin,this.end,mod(cycles,1))
            case AnimType.pingpong:
                
                var pingpongcycle = mod(cycles, 2)
                if(pingpongcycle <= 1){
                    return lerp(this.begin,this.end,pingpongcycle)
                }else{
                    return lerp(this.end,this.begin,pingpongcycle - 1)
                }

            case AnimType.extend:
                var distPerCycle = to(this.begin,this.end)
                return Math.floor(cycles) * distPerCycle + lerp(this.begin,this.end,mod(cycles,1))
        }
    }
}
