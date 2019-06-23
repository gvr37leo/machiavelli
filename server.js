var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class Store {
    constructor() {
        this.map = new Map();
        this.idcounter = 0;
    }
    add(obj) {
        obj['id'] = this.idcounter;
        this.map.set(obj['id'], obj);
        this.idcounter++;
        return obj;
    }
    addList(arr) {
        return arr.map(obj => this.add(obj));
    }
    delete(id) {
        return this.map.delete(id);
    }
    get(id) {
        return this.map.get(id);
    }
    list() {
        return Array.from(this.map.values());
    }
}
/// <reference path="store.ts" />
class GameDB {
    constructor() {
        this.roles = new Store();
        this.players = new Store();
        this.cards = new Store();
        this.crownWearer = 0;
        this.deck = [];
        this.murderedRole = 0;
        this.burgledRole = 0;
        this.firstFinishedPlayer = null;
    }
    serialize() {
        return {
            roles: this.roles.list(),
            players: this.players.list().map(p => p.serialize()),
            cards: this.cards.list(),
            crownWearer: this.crownWearer,
            deck: this.deck,
            murderedRole: this.murderedRole,
            burgledRole: this.burgledRole,
            firstFinishedPlayer: this.firstFinishedPlayer,
            playerTurn: this.playerTurn,
        };
    }
}
class Role {
    constructor(name, color, image) {
        this.name = name;
        this.color = color;
        this.image = image;
    }
}
class Player {
    constructor(money, role) {
        this.money = money;
        this.role = role;
        this.hand = [];
        this.buildings = [];
        this.isDiscoveringRoles = false;
        this.discoverRoles = [];
        this.isDiscoveringPlayers = false;
        this.discoverPlayers = [];
        this.isDiscoveringCards = false;
        this.discoverCards = [];
    }
    serialize() {
        return {
            id: this.id,
            name: this.name,
            hand: this.hand,
            buildings: this.buildings,
            isDiscoveringRoles: this.isDiscoveringRoles,
            discoverRoles: this.discoverRoles,
            isDiscoveringPlayers: this.isDiscoveringPlayers,
            discoverPlayers: this.discoverPlayers,
            isDiscoveringCards: this.isDiscoveringCards,
            discoverCards: this.discoverCards,
            money: this.money,
            role: this.role,
        };
    }
}
class Card {
    constructor(role, cost, name) {
        this.role = role;
        this.cost = cost;
        this.name = name;
        this.isAction = false;
        this.isAnyRole = false;
    }
}
/// <reference path="models.ts" />
/// <reference path="store.ts" />
function genGameDB() {
    var gamedb = new GameDB();
    gamedb.deck = gamedb.cards.list().map((c, i) => i);
    gamedb.roles.addList([
        new Role('moordenaar', 'white', 0),
        new Role('dief', 'white', 1),
        new Role('magier', 'white', 2),
        new Role('koning', 'yellow', 3),
        new Role('prediker', 'blue', 4),
        new Role('koopman', 'green', 5),
        new Role('bouwmeester', 'white', 6),
        new Role('condotierre', 'red', 7),
    ]);
    gamedb.players.addList([]);
    function genCards(card, amount) {
        var res = [];
        for (var i = 0; i < amount; i++) {
            res.push(Object.assign({}, card));
        }
        return res;
    }
    gamedb.cards.addList([
        new Card(3, 3, 'jachtslot'),
        new Card(3, 4, 'slot'),
        new Card(3, 5, 'paleis'),
        new Card(4, 1, 'tempel'),
        new Card(4, 2, 'kerk'),
        new Card(4, 3, 'abdij'),
        new Card(4, 4, 'kathedraal'),
        new Card(5, 1, 'taveerne'),
        new Card(5, 2, 'gildehuis'),
        new Card(5, 2, 'markt'),
        new Card(5, 3, 'handelshuis'),
        new Card(5, 4, 'haven'),
        new Card(5, 5, 'raadhuis'),
        new Card(7, 1, 'wachttoren'),
        new Card(7, 2, 'kerker'),
        new Card(7, 3, 'toernooiveld'),
        new Card(7, 5, 'vesting'),
        new Card(0, 2, 'hof der wonderen'),
        new Card(0, 3, 'verdedigingstoren'),
        new Card(0, 5, 'laboratorium'),
        new Card(0, 5, 'smederij'),
        new Card(0, 5, 'observatorium'),
        new Card(0, 5, 'kerkhof'),
        new Card(0, 6, 'bibliotheek'),
        new Card(0, 6, 'school voor magiers'),
        new Card(0, 6, 'drakenburcht'),
        new Card(0, 6, 'universiteit'),
    ]);
    for (var i = 17; i < 27; i++) {
        gamedb.cards.get(i).isAnyRole = true;
    }
    return gamedb;
}
class Vector {
    constructor(...vals) {
        this.vals = vals;
    }
    map(callback) {
        for (var i = 0; i < this.vals.length; i++) {
            callback(this.vals, i);
        }
        return this;
    }
    mul(v) {
        return this.map((arr, i) => arr[i] *= v.vals[i]);
    }
    div(v) {
        return this.map((arr, i) => arr[i] /= v.vals[i]);
    }
    add(v) {
        return this.map((arr, i) => arr[i] += v.vals[i]);
    }
    sub(v) {
        return this.map((arr, i) => arr[i] -= v.vals[i]);
    }
    scale(s) {
        return this.map((arr, i) => arr[i] *= s);
    }
    length() {
        var sum = 0;
        this.map((arr, i) => sum += arr[i] * arr[i]);
        return Math.pow(sum, 0.5);
    }
    normalize() {
        return this.scale(1 / this.length());
    }
    to(v) {
        return v.c().sub(this);
    }
    lerp(v, weight) {
        return this.c().add(this.to(v).scale(weight));
    }
    c() {
        return Vector.fromArray(this.vals.slice());
    }
    overwrite(v) {
        return this.map((arr, i) => arr[i] = v.vals[i]);
    }
    dot(v) {
        var sum = 0;
        this.map((arr, i) => sum += arr[i] * v.vals[i]);
        return sum;
    }
    loop(callback) {
        var counter = this.c();
        counter.vals.fill(0);
        while (counter.compare(this) == -1) {
            callback(counter);
            if (counter.incr(this)) {
                break;
            }
        }
    }
    compare(v) {
        for (var i = this.vals.length - 1; i >= 0; i--) {
            if (this.vals[i] < v.vals[i]) {
                continue;
            }
            else if (this.vals[i] == v.vals[i]) {
                return 0;
            }
            else {
                return 1;
            }
        }
        return -1;
    }
    incr(comparedTo) {
        for (var i = 0; i < this.vals.length; i++) {
            if ((this.vals[i] + 1) < comparedTo.vals[i]) {
                this.vals[i]++;
                return false;
            }
            else {
                this.vals[i] = 0;
            }
        }
        return true;
    }
    project(v) {
        return v.c().scale(this.dot(v) / v.dot(v));
    }
    get(i) {
        return this.vals[i];
    }
    set(i, val) {
        this.vals[i] = val;
    }
    get x() {
        return this.vals[0];
    }
    get y() {
        return this.vals[1];
    }
    get z() {
        return this.vals[2];
    }
    set x(val) {
        this.vals[0] = val;
    }
    set y(val) {
        this.vals[1] = val;
    }
    set z(val) {
        this.vals[2] = val;
    }
    draw(ctxt) {
        var width = 10;
        var halfwidth = width / 2;
        ctxt.fillRect(this.x - halfwidth, this.y - halfwidth, width, width);
    }
    cross(v) {
        var x = this.y * v.z - this.z * v.y;
        var y = this.z * v.x - this.x * v.z;
        var z = this.x * v.y - this.y * v.x;
        return new Vector(x, y, z);
    }
    static fromArray(vals) {
        var x = new Vector();
        x.vals = vals;
        return x;
    }
    loop2d(callback) {
        var counter = new Vector(0, 0);
        for (counter.x = 0; counter.x < this.x; counter.x++) {
            for (counter.y = 0; counter.y < this.y; counter.y++) {
                callback(counter);
            }
        }
    }
    loop3d(callback) {
        var counter = new Vector(0, 0, 0);
        for (counter.x = 0; counter.x < this.x; counter.x++) {
            for (counter.y = 0; counter.y < this.y; counter.y++) {
                for (counter.z = 0; counter.z < this.z; counter.z++) {
                    callback(counter);
                }
            }
        }
    }
}
// (window as any).devtoolsFormatters = [
//     {
//         header: function(obj, config){
//             if(!(obj instanceof Vector)){
//                 return null
//             }
//             if((obj.vals.length == 2)){
//                 return ["div",{style:""}, `x:${obj.x} y:${obj.y}`]
//             }
//             if((obj.vals.length == 3)){
//                 return ["div",{style:""}, `x:${obj.x} y:${obj.y} z:${obj.z}`]
//             }
//         },
//         hasBody: function(obj){
//             return false
//         },
//     }
// ]
class Box {
    constructor(value) {
        this.isSet = false;
        this.onchange = new EventSystem();
        this.value = value;
        this.onClear = new EventSystemVoid();
    }
    get() {
        return this.value;
    }
    set(value, silent = false) {
        this.oldValue = this.value;
        this.value = value;
        if (this.oldValue != value || !this.isSet) {
            this.isSet = true;
            if (!silent) {
                this.onchange.trigger(this.value, this.oldValue);
            }
        }
    }
    clear() {
        this.isSet = false;
        this.set(null);
        this.onClear.trigger();
    }
    boxtrigger() {
        this.onchange.trigger(this.value, this.oldValue);
    }
}
class EventSystem {
    constructor() {
        this.callbacks = [];
    }
    listen(callback) {
        this.callbacks.push(callback);
    }
    listenOnce(callback) {
        var proxy = (val, old) => {
            callback(val, old);
            findAndDelete(this.callbacks, proxy);
        };
        this.callbacks.push(proxy);
    }
    deafen(callback) {
        this.callbacks.splice(this.callbacks.findIndex(v => v === callback), 1);
    }
    trigger(value, old) {
        for (var callback of this.callbacks) {
            callback(value, old);
        }
    }
}
class EventSystemVoid {
    constructor() {
        this.callbacks = [];
    }
    listen(callback) {
        this.callbacks.push(callback);
    }
    deafen(callback) {
        this.callbacks.splice(this.callbacks.findIndex(v => v === callback), 1);
    }
    trigger() {
        for (var callback of this.callbacks) {
            callback();
        }
    }
}
class ObjectBox {
    constructor(val) {
        this.isSet = false;
        this.val = val;
    }
    get(selector) {
        return selector(this.val).get();
    }
    set(selector, val) {
        var old = selector(this.val);
        old.set(val);
        if (old.get() != val || !this.isSet) {
            this.isSet = true;
            this.onChange.trigger();
        }
    }
}
class PEvent {
    constructor(val) {
        this.val = val;
        this.handled = false;
    }
    static create(handled, val) {
        var e = new PEvent(val);
        e.handled = handled;
        return e;
    }
}
class PBox {
    constructor(val) {
        this.onchange = new EventSystem();
        this.isProtected = false;
        this.box = new Box(val);
        this.box.onchange.listen((val, old) => {
            this.onchange.trigger(PEvent.create(this.isProtected, val), null);
        });
    }
    get() {
        return this.box.value;
    }
    set(v) {
        this.box.set(v);
    }
    setHP(handled, val) {
        this.setProtected(PEvent.create(handled, val));
    }
    setProtected(e) {
        if (!e.handled) {
            e.handled = true;
            this.setS(e);
        }
    }
    setS(e) {
        this.isProtected = e.handled;
        this.box.set(e.val);
        this.isProtected = false;
    }
}
function findAndDelete(arr, item) {
    arr.splice(arr.findIndex(v => v == item), 1);
}
function random(min, max) {
    return Math.random() * (max - min) + min;
}
function randomInt(min, max) {
    return Math.floor(random(min, max));
}
function swap(arr, a = 0, b = 1) {
    var temp = arr[a];
    arr[a] = arr[b];
    arr[b] = temp;
}
class WsBox {
    constructor(ws) {
        this.socket = ws;
        this.socket.addEventListener('open', () => {
        });
        this.socket.addEventListener('close', () => {
        });
    }
    send(type, data) {
        this.socket.send(JSON.stringify({
            type: type,
            data: data,
        }));
    }
    listen(type, cb) {
        this.socket.addEventListener('message', e => {
            var res = JSON.parse(e.data);
            if (res.type == type) {
                cb(res.data);
            }
        });
    }
}
/// <reference path="src/store.ts" />
/// <reference path="src/models.ts" />
/// <reference path="src/storeSetup.ts" />
/// <reference path="node_modules/vectorx/vector.ts" />
/// <reference path="node_modules/eventsystemx/EventSystem.ts" />
/// <reference path="serverutils.ts" />
var myws = require('ws');
var express = require('express');
var socket;
var app = express();
app.use(express.static('./'));
app.listen(8000, () => {
    console.log('listening');
});
const wss = new myws.Server({ port: 8080 });
wss.on('connection', function connection(ws) {
    var wsbox = new WsBox(ws);
    var player = new Player(0, 0);
    player.wsbox = wsbox;
    gamedb.players.add(player);
    wsbox.socket.addEventListener('close', () => {
        gamedb.players.delete(player.id);
        updateClients();
    });
    wsbox.listen('endturn', data => onEndTurn.trigger(data, null));
    wsbox.listen('start', data => onStart.trigger(data, null));
    wsbox.listen('reset', data => onReset.trigger(data, null));
    wsbox.listen('endturn', data => onEndTurn.trigger(data, null));
    updateClients();
});
var gamedb = genGameDB();
var onPlayCard = new EventSystem();
var onEndTurn = new EventSystem();
var onStart = new EventSystem();
var onReset = new EventSystem();
var onDiscoverRole = new EventSystem();
var onDiscoverPlayer = new EventSystem();
var onDiscoverCard = new EventSystem();
function updateClients() {
    for (var player of gamedb.players.list()) {
        player.wsbox.send('update', {
            playerid: player.id,
            gamedb: gamedb.serialize()
        });
    }
}
function chooseRoles() {
    var roleReference = [0, 1, 2, 3, 4, 5, 6, 7];
    shuffle(roleReference);
}
function discoverRoles(player, roles) {
    return __awaiter(this, void 0, void 0, function* () {
        player.isDiscoveringRoles = true;
        player.discoverRoles = roles.map(r => r.id);
        return new Promise((res, rej) => {
            onDiscoverRole.listen(data => {
                if (data.playerid == player.id) {
                    player.isDiscoveringRoles = false;
                    var discoveredRole = player.discoverRoles[data.roleindex];
                    player.discoverRoles = [];
                    res(gamedb.roles.get(discoveredRole));
                }
            });
        });
    });
}
function discoverCards(player, cards) {
    return __awaiter(this, void 0, void 0, function* () {
        player.isDiscoveringCards = true;
        player.discoverCards = cards.map(r => r.id);
        return new Promise((res, rej) => {
            onDiscoverCard.listen(data => {
                if (data.playerid == player.id) {
                    player.isDiscoveringCards = false;
                    var discoveredCard = player.discoverCards[data.cardindex];
                    player.discoverCards = [];
                    res(gamedb.cards.get(discoveredCard));
                }
            });
        });
    });
}
function discoverPlayers(player, players) {
    return __awaiter(this, void 0, void 0, function* () {
        player.isDiscoveringPlayers = true;
        player.discoverPlayers = players.map(r => r.id);
        return new Promise((res, rej) => {
            onDiscoverPlayer.listen(data => {
                if (data.playerid == player.id) {
                    player.isDiscoveringPlayers = false;
                    var discoveredRole = player.discoverPlayers[data.playerindex];
                    player.discoverPlayers = [];
                    res(gamedb.players.get(discoveredRole));
                }
            });
        });
    });
}
function discoverOtherPlayers(player) {
    return __awaiter(this, void 0, void 0, function* () {
        return discoverPlayers(player, gamedb.players.list().filter(p => p.id != player.id));
    });
}
function shuffle(array) {
    var m = array.length, i;
    while (m) {
        i = Math.floor(Math.random() * m--);
        swap(array, i, m);
    }
    return array;
}
function mulligan(playerid) {
}
function countBuildingIncome(player) {
    return player.buildings.reduce((prev, cur) => {
        return prev + (gamedb.cards.get(cur).role == player.role ? 1 : 0);
    }, 0);
}
function countScores(firstPlayerId, players) {
    return players.map((player) => {
        var buildingscore = player.buildings.reduce((score, cardid) => {
            var building = gamedb.cards.get(cardid);
            return score + building.points;
        }, 0);
        var uniqueresults = [
            player.buildings.findIndex((bid) => {
                return gamedb.cards.get(bid).role == 0;
            }),
            player.buildings.findIndex((bid) => {
                return gamedb.cards.get(bid).role == 1;
            }),
            player.buildings.findIndex((bid) => {
                return gamedb.cards.get(bid).role == 2;
            }),
            player.buildings.findIndex((bid) => {
                return gamedb.cards.get(bid).role == 3;
            }),
            player.buildings.findIndex((bid) => {
                return gamedb.cards.get(bid).isAnyRole;
            }),
        ];
        var uniquescore = uniqueresults.findIndex(res => res == -1) == -1 ? 0 : 3;
        var firstscore = player.id == firstPlayerId ? 4 : 0;
        var secondscore = player.buildings.length >= 8 ? 2 : 0;
        return buildingscore + uniquescore + firstscore + secondscore;
    });
}
function entiregame() {
    return __awaiter(this, void 0, void 0, function* () {
        //setup money
        gamedb.crownWearer = randomInt(0, gamedb.players.map.size);
        shuffle(gamedb.deck);
        gamedb.players.list().forEach(p => {
            p.money = 2;
            p.hand = p.hand.concat(gamedb.deck.splice(0, 4));
        });
        gamedb.playerTurn = randomInt(0, gamedb.players.map.size);
        while (gamedb.firstFinishedPlayer == null) {
            yield round();
            gamedb.playerTurn = (gamedb.playerTurn + 1) % gamedb.players.map.size;
        }
        countScores(gamedb.firstFinishedPlayer, gamedb.players.list());
    });
}
function round() {
    return __awaiter(this, void 0, void 0, function* () {
        var roledeck = [0, 1, 2, 4, 5, 6, 7];
        shuffle(roledeck);
        if (gamedb.players.map.size == 4) {
            roledeck.splice(0, 1);
            roledeck.splice(0, 1);
        }
        else if (gamedb.players.map.size == 5) {
            roledeck.splice(0, 1);
        }
        roledeck.splice(0, 1); //await/coroutine show this role to the king
        yield discoverRoles(gamedb.players.get(gamedb.playerTurn), roledeck.map(rid => gamedb.roles.get(rid)));
        roledeck.push(3);
        shuffle(roledeck);
        for (var i = 0; roledeck.length > 1; i++) {
            var role = yield discoverRoles(null, roledeck.map(rid => gamedb.roles.get(rid)));
            findAndDelete(roledeck, role.id);
            gamedb.players.get(i).role = role.id;
        }
        for (var player of gamedb.players.list()) {
            yield playerTurn(player);
        }
    });
}
function playerTurn(player) {
    return __awaiter(this, void 0, void 0, function* () {
        player.money += 2;
        // inkomsten of kaarten trekken
        if (player.role == 0) {
            gamedb.murderedRole = (yield discoverRoles(player, [1, 2, 3, 4, 5, 6, 7].map(rid => gamedb.roles.get(rid)))).id;
        }
        if (player.role == 1) {
            gamedb.burgledRole = (yield discoverRoles(player, [2, 3, 4, 5, 6, 7].map(rid => gamedb.roles.get(rid)))).id;
        }
        if (player.role == 2) {
            var swapPlayer = yield discoverOtherPlayers(player);
            [player.hand, swapPlayer.hand] = [swapPlayer.hand, player.hand];
            // mulligan(player.id)
        }
        if (player.role == 3) {
            gamedb.crownWearer = player.id;
            player.money += countBuildingIncome(player);
        }
        if (player.role == 4) {
            player.money += countBuildingIncome(player);
        }
        if (player.role == 5) {
            player.money++;
            player.money += countBuildingIncome(player);
        }
        if (player.role == 6) {
            //trek 2 kaarten
            //build 2 buildings
        }
        if (player.role == 7) {
            player.money += countBuildingIncome(player);
            discoverOtherPlayers(player).then(chosenPlayer => {
                discoverCards(player, chosenPlayer.buildings.map(bid => gamedb.cards.get(bid))).then(chosenBuilding => {
                    player.money -= chosenBuilding.cost - 1;
                    findAndDelete(player.buildings, chosenBuilding);
                });
            });
        }
        yield new Promise((res, rej) => {
            onEndTurn.listen(p => {
                if (p.playerid == player.id) {
                    res();
                }
            });
        });
        //build buildings and end turn
    });
}
//round
//leg x van de 8 kaarten open op tafel (niet de koning)
//2-3|4|5|6-7
// 0  2 1  0
//koning pakt bovenste kaart van de stapel en legt deze gedekt naast de 3 open kaarten
//pak kaart en geef door aan de volgende speler
//leg het laatste karakter gedekt op tafel
//turn
//inkomstenfase
//2 goud of discover 2 kaarten
//bouwfase
//bouw 1 gebouw
//mag geen duplicaten bouwen
//karaktereigenschap mag elk moment in een speler zijn beurt gebruikt worden
//spel is afgelopen als een speler 8 gebouwen heeft
//maak ronde af
//winnaar
//puntenwaarde van alle gebouwen
//3 punten als je een gebouw van elke kleur hebt
//4 punten voor eerste speler met 8 gebouwen
//2 punten voor spelers die nog net 8 gebouwen hebben kunnen krijgen 
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsic3JjL3N0b3JlLnRzIiwic3JjL21vZGVscy50cyIsInNyYy9zdG9yZVNldHVwLnRzIiwibm9kZV9tb2R1bGVzL3ZlY3RvcngvdmVjdG9yLnRzIiwibm9kZV9tb2R1bGVzL2V2ZW50c3lzdGVteC9FdmVudFN5c3RlbS50cyIsInNlcnZlcnV0aWxzLnRzIiwic2VydmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUE7SUFLSTtRQUhBLFFBQUcsR0FBaUIsSUFBSSxHQUFHLEVBQUUsQ0FBQTtRQUM3QixjQUFTLEdBQUcsQ0FBQyxDQUFBO0lBSWIsQ0FBQztJQUVELEdBQUcsQ0FBQyxHQUFLO1FBQ0wsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUE7UUFDMUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQzNCLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQTtRQUNoQixNQUFNLENBQUMsR0FBRyxDQUFBO0lBQ2QsQ0FBQztJQUVELE9BQU8sQ0FBQyxHQUFPO1FBQ1gsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUE7SUFDeEMsQ0FBQztJQUVELE1BQU0sQ0FBQyxFQUFTO1FBQ1osTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFBO0lBQzlCLENBQUM7SUFFRCxHQUFHLENBQUMsRUFBUztRQUNULE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQTtJQUMzQixDQUFDO0lBRUQsSUFBSTtRQUNBLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQTtJQUN4QyxDQUFDO0NBQ0o7QUMvQkQsaUNBQWlDO0FBR2pDO0lBQUE7UUFDSSxVQUFLLEdBQWUsSUFBSSxLQUFLLEVBQUUsQ0FBQTtRQUMvQixZQUFPLEdBQWlCLElBQUksS0FBSyxFQUFFLENBQUE7UUFDbkMsVUFBSyxHQUFlLElBQUksS0FBSyxFQUFFLENBQUE7UUFDL0IsZ0JBQVcsR0FBVSxDQUFDLENBQUE7UUFDdEIsU0FBSSxHQUFZLEVBQUUsQ0FBQTtRQUNsQixpQkFBWSxHQUFVLENBQUMsQ0FBQTtRQUN2QixnQkFBVyxHQUFVLENBQUMsQ0FBQTtRQUN0Qix3QkFBbUIsR0FBVSxJQUFJLENBQUE7SUFrQnJDLENBQUM7SUFmRyxTQUFTO1FBRUwsTUFBTSxDQUFDO1lBQ0gsS0FBSyxFQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFO1lBQ3ZCLE9BQU8sRUFBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUNuRCxLQUFLLEVBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUU7WUFDdkIsV0FBVyxFQUFDLElBQUksQ0FBQyxXQUFXO1lBQzVCLElBQUksRUFBQyxJQUFJLENBQUMsSUFBSTtZQUNkLFlBQVksRUFBQyxJQUFJLENBQUMsWUFBWTtZQUM5QixXQUFXLEVBQUMsSUFBSSxDQUFDLFdBQVc7WUFDNUIsbUJBQW1CLEVBQUMsSUFBSSxDQUFDLG1CQUFtQjtZQUM1QyxVQUFVLEVBQUMsSUFBSSxDQUFDLFVBQVU7U0FDN0IsQ0FBQTtJQUNMLENBQUM7Q0FFSjtBQUVEO0lBRUksWUFBbUIsSUFBVyxFQUFRLEtBQVksRUFBUSxLQUFZO1FBQW5ELFNBQUksR0FBSixJQUFJLENBQU87UUFBUSxVQUFLLEdBQUwsS0FBSyxDQUFPO1FBQVEsVUFBSyxHQUFMLEtBQUssQ0FBTztJQUV0RSxDQUFDO0NBQ0o7QUFFRDtJQWNJLFlBQW1CLEtBQVksRUFBUSxJQUFXO1FBQS9CLFVBQUssR0FBTCxLQUFLLENBQU87UUFBUSxTQUFJLEdBQUosSUFBSSxDQUFPO1FBWGxELFNBQUksR0FBWSxFQUFFLENBQUE7UUFDbEIsY0FBUyxHQUFZLEVBQUUsQ0FBQTtRQUd2Qix1QkFBa0IsR0FBVyxLQUFLLENBQUE7UUFDbEMsa0JBQWEsR0FBWSxFQUFFLENBQUE7UUFDM0IseUJBQW9CLEdBQVcsS0FBSyxDQUFBO1FBQ3BDLG9CQUFlLEdBQVksRUFBRSxDQUFBO1FBQzdCLHVCQUFrQixHQUFXLEtBQUssQ0FBQTtRQUNsQyxrQkFBYSxHQUFZLEVBQUUsQ0FBQTtJQUkzQixDQUFDO0lBRUQsU0FBUztRQUNMLE1BQU0sQ0FBQztZQUNILEVBQUUsRUFBQyxJQUFJLENBQUMsRUFBRTtZQUNWLElBQUksRUFBQyxJQUFJLENBQUMsSUFBSTtZQUNkLElBQUksRUFBQyxJQUFJLENBQUMsSUFBSTtZQUNkLFNBQVMsRUFBQyxJQUFJLENBQUMsU0FBUztZQUN4QixrQkFBa0IsRUFBQyxJQUFJLENBQUMsa0JBQWtCO1lBQzFDLGFBQWEsRUFBQyxJQUFJLENBQUMsYUFBYTtZQUNoQyxvQkFBb0IsRUFBQyxJQUFJLENBQUMsb0JBQW9CO1lBQzlDLGVBQWUsRUFBQyxJQUFJLENBQUMsZUFBZTtZQUNwQyxrQkFBa0IsRUFBQyxJQUFJLENBQUMsa0JBQWtCO1lBQzFDLGFBQWEsRUFBQyxJQUFJLENBQUMsYUFBYTtZQUNoQyxLQUFLLEVBQUMsSUFBSSxDQUFDLEtBQUs7WUFDaEIsSUFBSSxFQUFDLElBQUksQ0FBQyxJQUFJO1NBQ2pCLENBQUE7SUFDTCxDQUFDO0NBQ0o7QUFFRDtJQU9JLFlBQW1CLElBQVcsRUFBUSxJQUFXLEVBQVEsSUFBVztRQUFqRCxTQUFJLEdBQUosSUFBSSxDQUFPO1FBQVEsU0FBSSxHQUFKLElBQUksQ0FBTztRQUFRLFNBQUksR0FBSixJQUFJLENBQU87UUFGcEUsYUFBUSxHQUFXLEtBQUssQ0FBQTtRQUN4QixjQUFTLEdBQVksS0FBSyxDQUFBO0lBRzFCLENBQUM7Q0FDSjtBQ3BGRCxrQ0FBa0M7QUFDbEMsaUNBQWlDO0FBTWpDO0lBQ0ksSUFBSSxNQUFNLEdBQUcsSUFBSSxNQUFNLEVBQUUsQ0FBQTtJQUN6QixNQUFNLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFFakQsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUM7UUFDakIsSUFBSSxJQUFJLENBQUMsWUFBWSxFQUFDLE9BQU8sRUFBQyxDQUFDLENBQUM7UUFDaEMsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFDLE9BQU8sRUFBQyxDQUFDLENBQUM7UUFDMUIsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFDLE9BQU8sRUFBQyxDQUFDLENBQUM7UUFDNUIsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFDLFFBQVEsRUFBQyxDQUFDLENBQUM7UUFDN0IsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFDLE1BQU0sRUFBQyxDQUFDLENBQUM7UUFDN0IsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFDLE9BQU8sRUFBQyxDQUFDLENBQUM7UUFDN0IsSUFBSSxJQUFJLENBQUMsYUFBYSxFQUFDLE9BQU8sRUFBQyxDQUFDLENBQUM7UUFDakMsSUFBSSxJQUFJLENBQUMsYUFBYSxFQUFDLEtBQUssRUFBQyxDQUFDLENBQUM7S0FDbEMsQ0FBQyxDQUFBO0lBRUYsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUE7SUFFMUIsa0JBQWtCLElBQUksRUFBQyxNQUFNO1FBQ3pCLElBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQTtRQUNaLEdBQUcsQ0FBQSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxFQUFDLENBQUMsRUFBRSxFQUFDLENBQUM7WUFDM0IsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBQyxJQUFJLENBQUMsQ0FBQyxDQUFBO1FBQ3BDLENBQUM7UUFDRCxNQUFNLENBQUMsR0FBRyxDQUFBO0lBQ2QsQ0FBQztJQUVELE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDO1FBQ2pCLElBQUksSUFBSSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsV0FBVyxDQUFDO1FBQ3pCLElBQUksSUFBSSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsTUFBTSxDQUFDO1FBQ3BCLElBQUksSUFBSSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsUUFBUSxDQUFDO1FBRXRCLElBQUksSUFBSSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsUUFBUSxDQUFDO1FBQ3RCLElBQUksSUFBSSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsTUFBTSxDQUFDO1FBQ3BCLElBQUksSUFBSSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsT0FBTyxDQUFDO1FBQ3JCLElBQUksSUFBSSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsWUFBWSxDQUFDO1FBRTFCLElBQUksSUFBSSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsVUFBVSxDQUFDO1FBQ3hCLElBQUksSUFBSSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsV0FBVyxDQUFDO1FBQ3pCLElBQUksSUFBSSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsT0FBTyxDQUFDO1FBQ3JCLElBQUksSUFBSSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsYUFBYSxDQUFDO1FBQzNCLElBQUksSUFBSSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsT0FBTyxDQUFDO1FBQ3JCLElBQUksSUFBSSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsVUFBVSxDQUFDO1FBRXhCLElBQUksSUFBSSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsWUFBWSxDQUFDO1FBQzFCLElBQUksSUFBSSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsUUFBUSxDQUFDO1FBQ3RC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QUssQ0FBQyxDQUFRO1FBQ1YsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUE7SUFDM0MsQ0FBQztJQUVELE1BQU07UUFDRixJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUE7UUFDWCxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUMzQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUMsR0FBRyxDQUFDLENBQUE7SUFDNUIsQ0FBQztJQUVELFNBQVM7UUFDTCxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUE7SUFDeEMsQ0FBQztJQUVELEVBQUUsQ0FBQyxDQUFRO1FBQ1AsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDMUIsQ0FBQztJQUVELElBQUksQ0FBQyxDQUFRLEVBQUMsTUFBYTtRQUN2QixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFBO0lBQ2pELENBQUM7SUFFRCxDQUFDO1FBQ0csTUFBTSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFBO0lBQzlDLENBQUM7SUFFRCxTQUFTLENBQUMsQ0FBUTtRQUNkLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFDLENBQUMsRUFBRSxFQUFF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SSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUN2QixDQUFDO0lBRUQsR0FBRyxDQUFDLENBQVEsRUFBQyxHQUFVO1FBQ25CLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO0lBQ3RCLENBQUM7SUFFRCxJQUFJLENBQUM7UUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUN2QixDQUFDO0lBRUQsSUFBSSxDQUFDO1FBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDdkIsQ0FBQztJQUVELElBQUksQ0FBQztRQUNELE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQ3ZCLENBQUM7SUFFRCxJQUFJLENBQUMsQ0FBQyxHQUFHO1FBQ0wsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7SUFDdEIsQ0FBQztJQUVELElBQUksQ0FBQyxDQUFDLEdBQUc7UUFDTCxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtJQUN0QixDQUFDO0lBRUQsSUFBSSxDQUFDLENBQUMsR0FBRztRQUNMLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO0lBQ3RCLENBQUM7SUFFRCxJQUFJLENBQUMsSUFBNkI7UUFDOUIsSUFBSSxLQUFLLEdBQUcsRUFBRSxDQUFBO1FBQ2QsSUFBSSxTQUFTLEdBQUcsS0FBSyxHQUFHLENBQUMsQ0FBQTtRQUN6QixJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsU0FBUyxFQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsU0FBUyxFQUFDLEtBQUssRUFBQyxLQUFLLENBQUMsQ0FBQTtJQUNwRSxDQUFDO0lBRUQsS0FBSyxDQUFDLENBQVE7UUFDVixJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMs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QyxHQUFHLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFBO1lBQzNDLENBQUMsQ0FBQztZQUNGLE1BQU0sQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUU7Z0JBQy9CLE1BQU0sQ0FBRSxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFBO1lBQzNDLENBQUMsQ0FBQztZQUNGLE1BQU0sQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUU7Z0JBQy9CLE1BQU0sQ0FBRSxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFBO1lBQzNDLENBQUMsQ0FBQztZQUNGLE1BQU0sQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUU7Z0JBQy9CLE1BQU0sQ0FBRSxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFBO1lBQzNDLENBQUMsQ0FBQztZQUNGLE1BQU0sQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUU7Z0JBQy9CLE1BQU0sQ0FBRSxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUE7WUFDM0MsQ0FBQyxDQUFDO1NBQ0wsQ0FBQTtRQUNELElBQUksV0FBVyxHQUFHLGFBQWEsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDekUsSUFBSSxVQUFVLEdBQUcsTUFBTSxDQUFDLEVBQUUsSUFBSSxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFB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