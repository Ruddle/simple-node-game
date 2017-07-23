
var Game = require("./game.js")
var Const = require("./const.js")
var WebSocketServer = require('uws').Server;
var wss = new WebSocketServer({ host: "0.0.0.0", port: 3001 });
console.log('starting backend');

function onMessage(message) {
    console.log('received: ' + message);
}

let id = 0
let clients = {}
let map = { axes: [{ x: 50, y: 50, vx: 0, vy: 0, tickToRun: 0, from: 0 }] }

wss.on('connection', function (ws) {
    id++;
    const localId = id
    console.log("connection from " + localId)
    clients[localId] = { ws: ws, rclicks: [], clicks: [], mouse: {}, player: Game.newPlayer(localId) }
    clients[localId].player.alive = false
    ws.on('message', msg => {
        let command = JSON.parse(msg)
        if (command.click !== undefined)
            clients[localId].clicks.push(command.click)
        if (command.rclick !== undefined)
            clients[localId].rclicks.push(command.rclick)
        if (command.mouse !== undefined)
            clients[localId].mouse = command.mouse
        if (command.restart !== undefined) {
            clients[localId].player = Game.newPlayer()
            console.log("restart for " + localId)
        }

    }
    );
    ws.on('close', (err) => {
        console.log("close from " + localId)
        delete clients[localId]
    })
});

let updater = () => {
    setTimeout(updater, 16)
    let newFrame = { players: {}, axes: [] }
    Object.keys(clients).forEach(function (key) {
        let client = clients[key]
        let player = client.player

        if (player.alive) {
            if (client.mouse.x !== undefined) {
                let command = client.mouse
                //  console.log("command from " + key + " : " + command.x)
                let tx = command.x
                let ty = command.y
                let xToTx = tx - player.x
                let yToTy = ty - player.y
                let length = Math.sqrt(xToTx * xToTx + yToTy * yToTy)
                if (length < 100) length = 100
                let dirX = xToTx / length
                let dirY = yToTy / length

                player.vx += dirX * 0.5
                player.vy += dirY * 0.5
                player.vx *= 0.90
                player.vy *= 0.90
                player.lastCommands = [command]
            }

            client.clicks.forEach(click => {
                if (player.axe > 0) {
                    let tx = click.x
                    let ty = click.y
                    let xToTx = tx - player.x
                    let yToTy = ty - player.y
                    let length = Math.sqrt(xToTx * xToTx + yToTy * yToTy)
                    if (length < 100) length = 100
                    let dirX = xToTx / length
                    let dirY = yToTy / length
                    let speedX = player.vx + dirX * 5
                    let speedY = player.vy + dirY * 5
                    let newAxe = { x: player.x, y: player.y, vx: speedX, vy: speedY, tickToRun: 50, from: key }
                    map.axes.push(newAxe)
                    player.axe -= 1
                }
            })
            client.clicks = []

            if(player.tickToBoost > 0)
            player.tickToBoost = parseInt( player.tickToBoost -1)

            if( player.tickToBoost===undefined)  player.tickToBoost = 0
            client.rclicks.forEach(rclick => {
                console.log("RCLICK " + player.tickToBoost)
                if (player.tickToBoost == 0) {
                    console.log("Boost")
                    player.tickToBoost = 100
                    player.vx *= 5
                    player.vy *= 5
                }
            })
            client.rclicks = []

            player.x += player.vx
            player.y += player.vy


            let newAxe = []
            map.axes.forEach(axe => {
                if (axe.from != key) {
                    let tx = axe.x
                    let ty = axe.y
                    let xToTx = tx - player.x
                    let yToTy = ty - player.y
                    let length = Math.sqrt(xToTx * xToTx + yToTy * yToTy)
                    if (length < Const.playerRadius + Const.bulletRadius) {
                        if (axe.tickToRun != 0)
                            player.alive = false
                        else
                            player.axe += 1
                    }
                    else
                        newAxe.push(axe)
                }
                else
                    newAxe.push(axe)
            })

            map.axes = newAxe
            newFrame.players[key] = player
        }
    });

    while (map.axes.length < 10) {
        let newAxe = { x: Math.random() * 1920, y: Math.random() * 1080, vx: 0, vy: 0, tickToRun: 0, from: 0 }
        map.axes.push(newAxe)
    }

    map.axes.forEach(axe => {
        if (axe.tickToRun > 0) {
            axe.x += axe.vx
            axe.y += axe.vy
            axe.tickToRun -= 1
            if (axe.tickToRun == 0)
                axe.from = 0
        }

        newFrame.axes.push(axe)
    })

    Object.keys(clients).forEach(function (key) {
        newFrame.me = key
        clients[key].ws.send(JSON.stringify(newFrame))
    });
}
updater()
