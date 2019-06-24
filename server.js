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
    gamedb.cards.addList(genCards(new Card(3, 3, 'jachtslot'), 5));
    gamedb.cards.addList(genCards(new Card(3, 4, 'slot'), 4));
    gamedb.cards.addList(genCards(new Card(3, 5, 'paleis'), 3));
    gamedb.cards.addList(genCards(new Card(4, 1, 'tempel'), 3));
    gamedb.cards.addList(genCards(new Card(4, 2, 'kerk'), 3));
    gamedb.cards.addList(genCards(new Card(4, 3, 'abdij'), 3));
    gamedb.cards.addList(genCards(new Card(4, 4, 'kathedraal'), 2));
    gamedb.cards.addList(genCards(new Card(5, 1, 'taveerne'), 5));
    gamedb.cards.addList(genCards(new Card(5, 2, 'gildehuis'), 3));
    gamedb.cards.addList(genCards(new Card(5, 2, 'markt'), 4));
    gamedb.cards.addList(genCards(new Card(5, 3, 'handelshuis'), 3));
    gamedb.cards.addList(genCards(new Card(5, 4, 'haven'), 3));
    gamedb.cards.addList(genCards(new Card(5, 5, 'raadhuis'), 2));
    gamedb.cards.addList(genCards(new Card(7, 1, 'wachttoren'), 3));
    gamedb.cards.addList(genCards(new Card(7, 2, 'kerker'), 3));
    gamedb.cards.addList(genCards(new Card(7, 3, 'toernooiveld'), 3));
    gamedb.cards.addList(genCards(new Card(7, 5, 'vesting'), 2));
    gamedb.cards.addList(genCards(new Card(0, 2, 'hof der wonderen'), 1));
    gamedb.cards.addList(genCards(new Card(0, 3, 'verdedigingstoren'), 2));
    gamedb.cards.addList(genCards(new Card(0, 5, 'laboratorium'), 1));
    gamedb.cards.addList(genCards(new Card(0, 5, 'smederij'), 1));
    gamedb.cards.addList(genCards(new Card(0, 5, 'observatorium'), 1));
    gamedb.cards.addList(genCards(new Card(0, 5, 'kerkhof'), 1));
    gamedb.cards.addList(genCards(new Card(0, 6, 'bibliotheek'), 1));
    gamedb.cards.addList(genCards(new Card(0, 6, 'school voor magiers'), 1));
    gamedb.cards.addList(genCards(new Card(0, 6, 'drakenburcht'), 1));
    gamedb.cards.addList(genCards(new Card(0, 6, 'universiteit'), 1));
    // bij winnen telt hof der wonderen voor kleur naar keuze
    // kan niet vernietigd worden door de condotierre
    // ruil 1 kaart voor 1 goudstuk
    //  optie om 2 kaarten te kpoen voor 3 goudstukken
    //  bij inkomsten discover 3 kaarten ipv 2
    //  mag voor 1 goudstuk ht door de condotierre vernietigde gebouw kopen(mits niet condotierre)
    //  bij inkomstenfase mag je beide kaarten houden van de discover
    //    1 goudstuk voog koning,prediker,koopman of codotierre
    // 8 punten waard ipv 6
    //  8 punten waard ipv 6
    gamedb.deck = gamedb.cards.list().map((c, i) => i);
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
    wsbox.listen('start', data => entiregame());
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
        updateClients();
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
        updateClients();
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
        updateClients();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsic3JjL3N0b3JlLnRzIiwic3JjL21vZGVscy50cyIsInNyYy9zdG9yZVNldHVwLnRzIiwibm9kZV9tb2R1bGVzL3ZlY3RvcngvdmVjdG9yLnRzIiwibm9kZV9tb2R1bGVzL2V2ZW50c3lzdGVteC9FdmVudFN5c3RlbS50cyIsInNlcnZlcnV0aWxzLnRzIiwic2VydmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUE7SUFLSTtRQUhBLFFBQUcsR0FBaUIsSUFBSSxHQUFHLEVBQUUsQ0FBQTtRQUM3QixjQUFTLEdBQUcsQ0FBQyxDQUFBO0lBSWIsQ0FBQztJQUVELEdBQUcsQ0FBQyxHQUFLO1FBQ0wsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUE7UUFDMUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQzNCLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQTtRQUNoQixNQUFNLENBQUMsR0FBRyxDQUFBO0lBQ2QsQ0FBQztJQUVELE9BQU8sQ0FBQyxHQUFPO1FBQ1gsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUE7SUFDeEMsQ0FBQztJQUVELE1BQU0sQ0FBQyxFQUFTO1FBQ1osTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFBO0lBQzlCLENBQUM7SUFFRCxHQUFHLENBQUMsRUFBUztRQUNULE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQTtJQUMzQixDQUFDO0lBRUQsSUFBSTtRQUNBLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUks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QUFPLENBQUMsUUFBUSxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsV0FBVyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUMzRCxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxNQUFNLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQ3RELE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLFFBQVEsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDeEQsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsUUFBUSxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUN4RCxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxNQUFNLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQ3RELE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLE9BQU8sQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDdkQsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsWUFBWSxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUM1RCxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxVQUFVLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQzFELE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLFdBQVcsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDM0QsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsT0FBTyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUN2RCxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxhQUFhLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQzdELE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLE9BQU8sQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDdkQsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsVUFBVSxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUMxRCxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxZQUFZLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQzVELE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLFFBQVEsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDeEQsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsY0FBYyxD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QUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFBO0lBQ3BCLENBQUM7SUFFRCxHQUFHLENBQUMsUUFBd0M7UUFDeEMsR0FBRyxDQUFBLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBQyxDQUFDO1lBQ3RDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3pCLENBQUM7UUFDRCxNQUFNLENBQUMsSUFBSSxDQUFBO0lBQ2YsQ0FBQztJQUVELEdBQUcsQ0FBQyxDQUFRO1FBQ1IsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQ25ELENBQUM7SUFFRCxHQUFHLENBQUMsQ0FBUTtRQUNSLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUNuRCxDQUFDO0lBRUQsR0FBRyxDQUFDLENBQVE7UUFDUixNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDbkQsQ0FBQztJQUVELEdBQUcsQ0FBQyxDQUFRO1FBQ1IsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFD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LEdBQUcsQ0FBQyxDQUFRO1FBQ1IsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDdkIsQ0FBQztJQUVELEdBQUcsQ0FBQyxDQUFRLEVBQUMsR0FBVTtRQUNuQixJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtJQUN0QixDQUFDO0lBRUQsSUFBSSxDQUFDO1FBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDdkIsQ0FBQztJQUVELElBQUksQ0FBQztRQUNELE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQ3ZCLENBQUM7SUFFRCxJQUFJLENBQUM7UUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUN2QixDQUFDO0lBRUQsSUFBSSxDQUFDLENBQUMsR0FBRztRQUNMLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO0lBQ3RCLENBQUM7SUFFRCxJQUFJLENBQUMsQ0FBQyxHQUFHO1FBQ0wsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7SUFDdEIsQ0FBQztJQUVELElBQUksQ0FBQyxDQUFDLEdBQUc7UUFDTCxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtJQUN0QixDQUFDO0lBRUQsSUFBSSxDQUFDLElBQTZCO1FBQzlCLElBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQTtRQUNkLElBQUksU0FBUyxHQUFHLEtBQUssR0FBRyxDQUFDLENBQUE7UUFDekIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLFNBQVMsRUFBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLFNBQVMsRUFBQyxLQUFLLEVBQUMsS0FBSyxDQUFDLENBQUE7SUFDcEUsQ0FBQztJQUVELEtBQUssQ0FBQyxDQUFRO1FBQ1YsSUFBSSxD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QUFDLEdBQUcsRUFBRSxFQUFFO2dCQUMvQixNQUFNLENBQUUsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQTtZQUMzQyxDQUFDLENBQUM7WUFDRixNQUFNLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO2dCQUMvQixNQUFNLENBQUUsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQTtZQUMzQyxDQUFDLENBQUM7WUFDRixNQUFNLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO2dCQUMvQixNQUFNLENBQUUsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQTtZQUMzQyxDQUFDLENBQUM7WUFDRixNQUFNLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO2dCQUMvQixNQUFNLENBQUUsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQTtZQUMzQyxDQUFDLENBQUM7WUFDRixNQUFNLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO2dCQUMvQixNQUFNLENBQUUsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFBO1lBQzNDLENBQUMsQ0FBQztTQUNMLENBQUE7UUFDRCxJQUFJLFdBQVcsR0FBRyxhQUFhLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3pFLElBQUksVUFBVSxHQUFHLE1BQU0s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