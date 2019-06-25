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
    wsbox.listen('discover', data => onDiscover.trigger(data, null));
    updateClients();
});
var gamedb = genGameDB();
var onPlayCard = new EventSystem();
var onEndTurn = new EventSystem();
var onStart = new EventSystem();
var onReset = new EventSystem();
var onDiscover = new EventSystem();
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
            onDiscover.listen(data => {
                if (data.playerid == player.id) {
                    player.isDiscoveringRoles = false;
                    var discoveredRole = player.discoverRoles[data.discoverindex];
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
            onDiscover.listen(data => {
                if (data.playerid == player.id) {
                    player.isDiscoveringCards = false;
                    var discoveredCard = player.discoverCards[data.discoverindex];
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
            onDiscover.listen(data => {
                if (data.playerid == player.id) {
                    player.isDiscoveringPlayers = false;
                    var discoveredRole = player.discoverPlayers[data.discoverindex];
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
        if (player.role == 0) { //moordenaar
            gamedb.murderedRole = (yield discoverRoles(player, [1, 2, 3, 4, 5, 6, 7].map(rid => gamedb.roles.get(rid)))).id;
        }
        if (player.role == 1) { //dief
            gamedb.burgledRole = (yield discoverRoles(player, [2, 3, 4, 5, 6, 7].map(rid => gamedb.roles.get(rid)))).id;
        }
        if (player.role == 2) { //magier
            var swapPlayer = yield discoverOtherPlayers(player);
            [player.hand, swapPlayer.hand] = [swapPlayer.hand, player.hand];
            // mulligan(player.id)
        }
        if (player.role == 3) { //koning
            gamedb.crownWearer = player.id;
            player.money += countBuildingIncome(player);
        }
        if (player.role == 4) { //prediker
            player.money += countBuildingIncome(player);
        }
        if (player.role == 5) { //koopman
            player.money++;
            player.money += countBuildingIncome(player);
        }
        if (player.role == 6) { //bouwmeester
            //trek 2 kaarten
            //build 2 buildings
        }
        if (player.role == 7) { //condotierre
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsic3JjL3N0b3JlLnRzIiwic3JjL21vZGVscy50cyIsInNyYy9zdG9yZVNldHVwLnRzIiwibm9kZV9tb2R1bGVzL3ZlY3RvcngvdmVjdG9yLnRzIiwibm9kZV9tb2R1bGVzL2V2ZW50c3lzdGVteC9FdmVudFN5c3RlbS50cyIsInNlcnZlcnV0aWxzLnRzIiwic2VydmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUEsTUFBTSxLQUFLO0lBS1A7UUFIQSxRQUFHLEdBQWlCLElBQUksR0FBRyxFQUFFLENBQUE7UUFDN0IsY0FBUyxHQUFHLENBQUMsQ0FBQTtJQUliLENBQUM7SUFFRCxHQUFHLENBQUMsR0FBSztRQUNMLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFBO1FBQzFCLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBQyxHQUFHLENBQUMsQ0FBQTtRQUMzQixJQUFJLENBQUMsU0FBUyxFQUFFLENBQUE7UUFDaEIsT0FBTyxHQUFHLENBQUE7SUFDZCxDQUFDO0lBRUQsT0FBTyxDQUFDLEdBQU87UUFDWCxPQUFPLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUE7SUFDeEMsQ0FBQztJQUVELE1BQU0sQ0FBQyxFQUFTO1FBQ1osT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQTtJQUM5QixDQUFDO0lBRUQsR0FBRyxDQUFDLEVBQVM7UUFDVCxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFBO0lBQzNCLENBQUM7SUFFRCxJQUFJO1FBQ0EsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMs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SyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxXQUFXLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQzNELE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLE1BQU0sQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDdEQsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsUUFBUSxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUN4RCxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxRQUFRLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQ3hELE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLE1BQU0sQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDdEQsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsT0FBTyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUN2RCxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxZQUFZLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQzVELE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLFVBQVUsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDMUQsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsV0FBVyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUMzRCxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxPQUFPLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQ3ZELE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLGFBQWEsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDN0QsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsT0FBTyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUN2RCxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxVQUFVLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQzFELE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLFlBQVksQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDNUQsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsUUFBUSxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUN4RCxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFB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